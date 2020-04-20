/* eslint-disable import/no-unresolved */
const newrelic = require('newrelic');
const helper = require('./helper');

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
  didEncounterErrors(rc) {
    newrelic.noticeError(rc[0]);
  }
};
