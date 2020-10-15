const {
  getOr,
  omitBy,
  isEmpty,
  get,
  isNumber,
  invert,
  now,
  omit,
} = require('lodash/fp');
const uuid = require('uuid/v4');
const moment = require('moment');
/* eslint-disable import/no-unresolved */
const newrelic = require('newrelic');
const helper = require('./helper');
const ApolloGraphqlLogger = require('./ApolloGraphqlLogger');
// See https://github.com/newrelic/newrelic-winston-logenricher-node/blob/master/lib/createFormatter.js
// for an example logger
const NewrelicPlugin = require('./newrelicPlugin');

const EXCLUDE_URLS_FROM_LOG_PATTERN = new RegExp(/(health_check)|(health-check)|(graphql)|(server-health)|(is_tango_api_up)/);
const EXCLUDE_MESSAGE_FROM_LOG_PATTERN = new RegExp(/jwt expired/);

const LEVELS = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const LEVEL_NUMBER_MAP = invert(LEVELS);

const canLog = level => getOr(LEVELS.info, `[${process.env.KUDOS_LOG_LEVEL}]`, LEVELS) >= level;
const sanitize = map => omitBy(value => !isNumber(value) && isEmpty(value), map);

let loggerInstance = null;

class Logger {
  constructor() {
    this.req = null;
    this.app = null;
    this.handleRequest = this.handleRequest.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.response = {};
    this.requestStart = null;
  }

  static new() {
    if (!loggerInstance) {
      loggerInstance = new Logger();
    }
    return loggerInstance;
  }

  refreshRequestId() {
    this.requestId = uuid();
  }

  appendRequestInformation() {
    this.build({
      http: {
        referer: this.req.headers.referer,
        method: this.req.method,
        useragent: this.req.headers['user-agent'],
        url: this.req.originalUrl,
      },
      network: {
        client: {
          ip: this.req.ip,
        },
      },
    });
  }

  handleRequest(req, res, next) {
    this.req = req;
    if (this.req.url.match(EXCLUDE_URLS_FROM_LOG_PATTERN) || !canLog(LEVELS.info)) {
      return next();
    }
    this.refreshRequestId();
    this.build({
      message: `[${this.req.method}] ${this.req.path}`,
      severity: LEVELS.info,
      status: 'OK',
    });
    this.appendRequestInformation();
    this.output();
    return next();
  }

  build(object = {}) {
    const response = {
      ...this.response,
      ...object,
      service: process.env.SERVICE_NAME,
      timestamp: moment().format(),
      version: process.env.APP_VERSION || 1,
      action: object.action || get('route.stack[0].name', this.req),
      organization_id: this.app ? this.app.get('organization_id') : null,
      request_id: get('headers[\'x-request-id\']', this.req) || this.requestId,
      user_id: this.app ? this.app.get('user_id') : null,
    };
    this.response = sanitize(response);
  }

  errorHandler(err, req, res, next) {
    this.req = req;
    this.refreshRequestId();
    this.build({
      message: `[${this.req.method}] ${this.req.path}`,
      severity: LEVELS.error,
      status: 'Error',
      error: {
        message: err.message,
        stack: err.stack,
      },
    });
    this.appendRequestInformation();
    this.output();
    return next();
  }

  applyMiddleware(app) {
    this.app = app;
    this.app.use(this.handleRequest);
    this.app.use(this.errorHandler);
  }

  graphqlExtension() {
    if (!this.extension) {
      this.extension = new (ApolloGraphqlLogger(this))();
    }
    return this.extension;
  }

  newrelicExtension() {
    if (!this._newrelicExtension) {
      this._newrelicExtension = new NewrelicPlugin();
    }
    return this._newrelicExtension;
  }

  allExpressExtensions() {
    return [
      () => this.graphqlExtension(),
      () => this.newrelicExtension(),
    ];
  }

  output() {
    if (
      !canLog(this.response.severity)
      || isEmpty(this.response.message)
      || this.response.message.match(EXCLUDE_MESSAGE_FROM_LOG_PATTERN)
    ) {
      this.response = {};
      return;
    }

    /* grab metadata from newrelic to identify entity */
    const metadata = newrelic.getLinkingMetadata(true);
    this.response = {
      ...this.response,
      severity: LEVEL_NUMBER_MAP[this.response.severity],
      level: LEVEL_NUMBER_MAP[this.response.severity],
      ...metadata,
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(this.response));
    this.response = {};
  }

  info(message, extraInfo = {}) {
    this.build({ ...extraInfo, severity: LEVELS.info, message });
    this.output();
  }

  debug(message, extraInfo = {}) {
    this.build({ ...extraInfo, severity: LEVELS.debug, message });
    this.output();
  }

  warn(message, extraInfo = {}) {
    this.build({ ...extraInfo, severity: LEVELS.warning, message });
    this.output();
  }

  error(message, e, extraInfo = {}) {
    this.build({
      message,
      severity: LEVELS.error,
      error: {
        ...extraInfo,
        message: getOr(message, 'message', e),
        stack: get('stack', e),
      },
    });
    this.output();
  }

  graphqlRequest({ query, variables }) {
    this.refreshRequestId();
    this.requestStartTime = now();
    const { action, gqlVerb } = helper.parseGraphQLQuery(query);
    this.build({
      severity: LEVELS.info,
      message: `GraphQL ${gqlVerb} ${action}`,
      action,
      query,
      variables: canLog(LEVELS.debug) || process.env.OUTPUT_MUTATION_VARIABLES ? variables : {},
    });
  }

  graphqlResponse(response) {
    const duration = Math.abs(now() - this.requestStartTime);
    if (response.errors) {
      const [error] = response.errors;
      const errorExtensions = getOr({}, 'extensions.exception.stacktrace', error);
      this.build({
        severity: LEVELS.error,
        error: {
          message: error.message,
          stack: errorExtensions.stacktrace,
          ...omit('stacktrace', errorExtensions),
        },
        duration,
      });
    } else if (canLog(LEVELS.debug)) {
      this.build({
        response: response.data,
        duration,
      });
    } else {
      this.build({
        duration,
      });
    }
    this.appendRequestInformation();
    this.output();
  }
}

module.exports = Logger.new();
