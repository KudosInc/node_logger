const helper = require('./helper');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ queryString, parsedQuery, variables }) {
      const { query } = helper.parseGraphQLQuery(queryString, parsedQuery);
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
