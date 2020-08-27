/* eslint-disable import/no-unresolved */
const newrelic = require('newrelic');
const helper = require('./helper');

const DEFAULT_EXCLUDE_ERRORS_REGEX = '^DOES NOT MATCH ERROR MESSAGE$';
const EXCLUDE_ERRORS_FROM_NEW_RELIC = new RegExp(
  process.env.NEW_RELIC_IGNORED_ERRORS || DEFAULT_EXCLUDE_ERRORS_REGEX,
);

module.exports = class NewRelicPlugin {
  // eslint-disable-next-line class-methods-use-this
  requestDidStart({
    queryString, parsedQuery, context, operationName,
  }) {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(queryString, parsedQuery);

    newrelic.setTransactionName(`${gqlVerb} ${action}`);

    const attributes = {
      operationName,
      query,
    };
    if (context.user) {
      attributes.organization_id = context.user.org_id;
      attributes.user_id = context.user.id;
    }
    newrelic.addCustomAttributes(attributes);
  }

  // eslint-disable-next-line class-methods-use-this
  defaultExcludeErrorsRegex() {
    return DEFAULT_EXCLUDE_ERRORS_REGEX;
  }

  // eslint-disable-next-line class-methods-use-this
  isExcludedError(message, regex) {
    return message.match(regex) !== null;
  }

  // eslint-disable-next-line class-methods-use-this
  didEncounterErrors(rc) {
    if (!this.isExcludedError(rc[0].message, EXCLUDE_ERRORS_FROM_NEW_RELIC)) {
      newrelic.noticeError(rc[0]);
    }
  }
};
