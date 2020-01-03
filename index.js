const {
  getOr, omitBy, isEmpty, get, first, isNumber, invert, now,
} = require('lodash/fp');
const uuid = require('uuid/v4');
const moment = require('moment');
const ApolloGraphqlLogger = require('./ApolloGraphqlLogger');

const EXLUDE_URLS_FROM_LOG_PATTERN = new RegExp(/(health_check)|(health-check)|(graphql)|(server-health)/);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);
const QUERY_ACTION_PATTERN = new RegExp(/(?<=\{[ ]+)[A-Za-z0-9]+/);
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
    if (this.req.url.match(EXLUDE_URLS_FROM_LOG_PATTERN) || !canLog(LEVELS.info)) {
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
      ...object,
      ...this.response,
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
      message: err.message,
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

  output() {
    if (
      !canLog(this.response.severity)
      || this.response.message.match(EXCLUDE_MESSAGE_FROM_LOG_PATTERN)
    ) {
      this.response = {};
      return;
    }
    this.response = {
      ...this.response,
      severity: LEVEL_NUMBER_MAP[this.response.severity],
      level: LEVEL_NUMBER_MAP[this.response.severity],
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(this.response));
    this.response = {};
  }

  info(message) {
    this.build({ message, severity: LEVELS.info });
    this.output();
  }

  debug(message) {
    this.build({ message, severity: LEVELS.debug });
    this.output();
  }

  error(e) {
    const message = getOr(e, 'message', e);
    this.build({ message, severity: LEVELS.error });
    this.output();
  }

  graphqlRequest({ query, variables }) {
    this.refreshRequestId();
    this.requestStartTime = now();
    const action = first(query.match(QUERY_ACTION_PATTERN));
    this.build({
      severity: LEVELS.info,
      message: `GraphQL ${first(query.match(QUERY_MUTATION_PATTERN))} ${action}`,
      action,
      query,
      variables: canLog(LEVELS.debug) || process.env.OUTPUT_MUTATION_VARIABLES ? variables : {},
    });
  }

  graphqlResponse(response) {
    const duration = Math.abs(now() - this.requestStartTime);
    if (response.errors) {
      this.build({
        severity: LEVELS.error,
        response: response.errors[0].message,
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
