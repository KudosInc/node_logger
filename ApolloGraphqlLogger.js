const helper = require('./helper');

module.exports = (logger) => {
  const BasicLogging = {
    requestDidStart({ request: { query, variables } }) {
      const {
        query: parsedQuery, action, gqlVerb,
      } = helper.parseGraphQLQuery(query, variables);
      logger.graphqlRequest({
        query: parsedQuery,
        variables,
        action,
        gqlVerb,
      });
      return {
        willSendResponse({ response }) {
          logger.graphqlResponse(response);
        },
      };
    },
  };
  return BasicLogging;
};
