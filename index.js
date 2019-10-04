const { getOr, first } = require('lodash/fp');
const uuid = require('uuid/v4');
const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');
const moment = require('moment');
const ApolloGraphqlLogger = require('./ApolloGraphqlLogger');

const MESSAGE = Symbol.for('message');

let requestId = null;

const EXLUDE_FROM_LOG_PATTERN = new RegExp(/(health_check)|(health-check)|(graphql)/);
const QUERY_NAME_EXTRACTION_REGEXP = new RegExp(/query ([A-Za-z_]+)/);

const formats = (info) => {
  console.log('info meta');
  console.log(info.meta);
  console.log('info meta');
  // if (getOr('', 'meta.req.url', info).match(EXLUDE_FROM_LOG_PATTERN)) {
  //   return {};
  // }
  const string = JSON.stringify(info);
  const obj = JSON.parse(string);
  let { message } = obj;
  const { query, variables } = message;
  if (query) {
    message = first(query.match(QUERY_NAME_EXTRACTION_REGEXP));
  }
  const logstashOutput = {
    request_id: requestId,
    '@timestamp': moment().format(),
    query,
    variables,
    message,
    '@version': '1',
    severity: obj.level,
  };
  const json = Object.assign(logstashOutput, info);
  const jsonString = {
    [MESSAGE]: JSON.stringify(json),
  };
  return Object.assign({}, jsonString, info);
};

const winstonLogger = createLogger({
  level: process.env.KUDOS_LOG_LEVEL,
  format: format(formats)(),
  transports: [
    new transports.Console(),
  ],
  exitOnError: false,
});

const log = createLogger({
  level: process.env.KUDOS_LOG_LEVEL,
  format: format(formats)(),
  transports: [
    new transports.Console(),
  ],
  exitOnError: false,
});

function customRequestFilter(req, propName) {
  if (propName === 'headers') {
    return Object.keys(req.headers).reduce((filteredHeaders, key) => {
      const headers = filteredHeaders;
      if (key !== 'authorization') {
        headers[key] = req.headers[key];
      }
      return headers;
    }, {});
  }
  return req[propName];
}

function customResponseFilter() {
  return undefined;
}

function getPersonalizedFields(req, res) {
  return Object.keys(req.headers).reduce((filteredHeaders) => {
    const headers = filteredHeaders;
    headers.status = res.statusCode;
    headers.request = req.url;
    headers.request_id = req.headers['x-request-id'] || req.headers['X-Request-id'];
    return headers;
  }, {});
}

const expressLogger = expressWinston.logger({
  winstonInstance: winstonLogger,
  requestFilter: customRequestFilter,
  responseFilter: customResponseFilter,
  dynamicMeta: getPersonalizedFields,
  ignoreRoute: req => req.match(EXLUDE_FROM_LOG_PATTERN),
});

const serverLogger = (app) => {
  // app.use((req, res, next) => {
  //   req.headers.request_id = uuid();
  //   return next();
  // });
  app.use(expressLogger);
  return log;
};

module.exports = {
  serverLogger,
  log,
  ApolloGraphqlLogger,
};
