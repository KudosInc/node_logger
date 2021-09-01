const helper = require('./helper');

module.exports = (logger) => {
  const BasicLogging = {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ request }) {
      console.log('!!!!!', request);
      const { query, variables, operationName } = request;
      const {
        query: parsedQuery, action, gqlVerb,
      } = helper.parseGraphQLQuery(query, operationName);
      logger.graphqlRequest({
        query: parsedQuery,
        variables,
        action,
        gqlVerb,
      });
      return {
        // eslint-disable-next-line class-methods-use-this
        willSendResponse({ response }) {
          logger.graphqlResponse(response);
        },
      };
    },
  };
  return BasicLogging;
};
