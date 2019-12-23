const {
  getOr, omitBy, isEmpty, get, first, isNumber, invert,
} = require('lodash/fp');
const uuid = require('uuid/v4');
const moment = require('moment');
const ApolloGraphqlLogger = require('./ApolloGraphqlLogger');

const EXLUDE_FROM_LOG_PATTERN = new RegExp(/(health_check)|(health-check)|(graphql)/);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);
const QUERY_ACTION_PATTERN = new RegExp(/(?<=\{[ ]+)[A-Za-z0-9]+/);

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

class Logger {
  constructor() {
    this.req = null;
    this.app = null;
    this.handleRequest = this.handleRequest.bind(this);
    this.response = {};
  }

  refreshRequestId() {
    this.requestId = uuid();
  }

  appendRequestInformation() {
    this.request = {
      ...this.request,
      ip: get('ip', this.req),
      method: get('method', this.req),
      path: get('originalUrl', this.req),
    };
  }

  handleRequest(req, res, next) {
    this.req = req;
    if (this.req.url.match(EXLUDE_FROM_LOG_PATTERN) || canLog(LEVELS.info)) {
      return next();
    }
    this.refreshRequestId();
    this.build({
      message: `[${this.req.method}] ${this.req.path}`,
      severity: LEVELS.info,
    });
    this.appendRequestInformation();
    this.output();
    return next();
  }

  build(object = {}) {
    const response = {
      ...object,
      service: process.env.SERVICE_NAME,
      '@timestamp': moment().format(),
      '@version': 1 || process.env.APP_VERSION,
      action: object.action || get('route.stack[0].name', this.req),
      message: object.message,
      organization_id: this.app ? this.app.get('organization_id') : null,
      request_id: get('headers[\'x-request-id\']', this.req) || this.requestId,
      user_id: this.app ? this.app.get('user_id') : null,
    };
    this.response = {
      ...this.response,
      ...omitBy(value => !isNumber(value) && isEmpty(value), response),
    };
  }

  actAsExpressMiddleWare(app) {
    this.app = app;
    this.app.use(this.handleRequest);
  }

  graphqlExtension() {
    if (!this.extension) {
      this.extension = new (ApolloGraphqlLogger(this))();
    }
    return this.extension;
  }

  output() {
    if (!canLog(this.response.severity)) {
      return;
    }
    this.response = {
      ...this.response,
      severity: LEVEL_NUMBER_MAP[this.response.severity],
      level: LEVEL_NUMBER_MAP[this.response.severity],
    };
    console.log(JSON.stringify(this.response));
    this.response = null;
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
      variables,
    });
  }

  graphqlResponse(response) {
    if (response.errors) {
      this.build({
        severity: LEVELS.warning,
        response: response.errors[0].message,
      });
    } else if (canLog) {
      this.build({
        response: response.data,
      });
    }
    this.appendRequestInformation();
    this.output();
  }
}

module.exports = (new Logger());
