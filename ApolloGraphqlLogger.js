const helper = require('./helper');

module.exports = (logger) => {
  const BasicLogging = {
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
    },

    // eslint-disable-next-line class-methods-use-this
    willSendResponse({ response }) {
      console.log('will send response', response);
      logger.graphqlResponse(response);
    },
  };
  return BasicLogging;
};
