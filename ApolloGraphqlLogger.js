const helper = require('./helper');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ request: { query, variables, operationName } }) {
      const { query: parsedQuery } = helper.parseGraphQLQuery(String(query), operationName);
      console.log('parsedQuery', parsedQuery);
      console.log('variables', variables);
      logger.graphqlRequest({
        parsedQuery,
        variables,
      });
    }

    // eslint-disable-next-line class-methods-use-this
    willSendResponse({ graphqlResponse }) {
      logger.graphqlResponse(graphqlResponse);
    }
  }
  return BasicLogging;
};
