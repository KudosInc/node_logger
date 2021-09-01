const helper = require('./helper');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ request: { query, variables, operationName } }) {
      const { query: parsedQuery, action } = helper.parseGraphQLQuery(query, operationName);
      logger.graphqlRequest({
        parsedQuery,
        variables,
        action,
      });
    }

    // eslint-disable-next-line class-methods-use-this
    willSendResponse({ graphqlResponse }) {
      logger.graphqlResponse(graphqlResponse);
    }
  }
  return BasicLogging;
};
