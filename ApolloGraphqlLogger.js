const helper = require('./helper');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ request: { query, variables, operationName } }) {
      const {
        query: parsedQuery, action, gqlVerb,
      } = helper.parseGraphQLQuery(query, operationName);
      logger.graphqlRequest({
        query: parsedQuery,
        variables,
        action,
        gqlVerb,
      });
    }

    // eslint-disable-next-line class-methods-use-this
    willSendResponse({ graphqlResponse }) {
      logger.graphqlResponse(graphqlResponse);
    }
  }
  return BasicLogging;
};
