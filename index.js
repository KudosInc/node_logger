const { getOr } = require('lodash/fp');
const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');
const moment = require('moment');
const httpContext = require('express-http-context');

const MESSAGE = Symbol.for('message');

const EXLUDE_FROM_LOG_PATTERN = new RegExp(/health_check/);

const formats = (info) => {
  if (getOr('', 'meta.req.url', info).match(EXLUDE_FROM_LOG_PATTERN)) {
    return {};
  }
  const string = JSON.stringify(info);
  const obj = JSON.parse(string);
  const requestId = httpContext.get('request_id');
  const logstashOutput = {
    request_id: requestId,
    '@timestamp': moment().format(),
    message: obj.message,
    '@version': '1',
    severity: obj.level,
  };
  const json = Object.assign(logstashOutput, info);
  const message = {};
  message[MESSAGE] = JSON.stringify(json);
  return Object.assign({}, message, info);
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
    headers.request_id = req.headers['x-request-id'];
    headers.status = res.statusCode;
    headers.request = req.url;
    return headers;
  }, {});
}

const logger = expressWinston.logger({
  winstonInstance: winstonLogger,
  requestFilter: customRequestFilter,
  responseFilter: customResponseFilter,
  dynamicMeta: getPersonalizedFields,
});

module.exports = { logger, log };
