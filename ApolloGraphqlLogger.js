const helper = require('./helper');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ query, operationName, variables }) {
      const { action } = helper.parseGraphQLQuery(query, operationName);
      console.log('query', query);
      console.log('variables', variables);
      console.log('action', action);
      logger.graphqlRequest({
        query,
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
