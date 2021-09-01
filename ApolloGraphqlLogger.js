const helper = require('./helper');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ request: { query, variables, operationName } }) {
      console.log('params', params);
      const { query: parsedQuery } = helper.parseGraphQLQuery(query, operationName);
      console.log('query', query);
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
