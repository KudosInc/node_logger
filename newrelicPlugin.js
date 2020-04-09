const newrelic = require('newrelic');
const { print } = require('graphql');

const {
  first,
} = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);
const QUERY_ACTION_PATTERN = new RegExp(/(?<=\{[ ]+)[A-Za-z0-9]+/);

module.exports = () => {
  class NewRelicPlugin {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ queryString, parsedQuery, context, operationName }) {
      const query = (queryString || print(parsedQuery)).replace(extraSpacesNewLineRemovalRegexp, ' ');
      const action = first(query.match(QUERY_ACTION_PATTERN));
      const gqlVerb = first(query.match(QUERY_MUTATION_PATTERN));

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
  }
  return NewRelicPlugin;
};
