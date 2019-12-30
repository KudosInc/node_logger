const {
  getOr, omitBy, isEmpty, get, first, isNumber, invert,
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

class Logger {
  constructor() {
    this.req = null;
    this.app = null;
    this.handleRequest = this.handleRequest.bind(this);
    this.errorHandler = this.errorHandler.bind(this);
    this.response = {};
  }

  refreshRequestId() {
    this.requestId = uuid();
  }

  appendRequestInformation() {
    this.build({
      http: {
        referer: get('referrer', this.req),
        ip: get('ip', this.req),
        method: get('method', this.req),
        useragent: get('user-agent', this.req),
        url: get('originalUrl', this.req),
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

  error(message) {
    this.build({ message, severity: LEVELS.error });
    this.output();
  }

  graphqlRequest({ query, variables }) {
    this.refreshRequestId();
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
    if (response.errors) {
      this.build({
        severity: LEVELS.warning,
        response: response.errors[0].message,
      });
    } else if (canLog(LEVELS.debug)) {
      this.build({
        response: response.data,
      });
    }
    this.appendRequestInformation();
    this.output();
  }
}

module.exports = (new Logger());
