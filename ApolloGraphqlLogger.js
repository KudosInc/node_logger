const helper = require('./helper');

module.exports = (logger) => {
  const BasicLogging = {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart(requestContext) {
      const [definition] = requestContext.document.definitions;
      console.log(definition.name);
      console.log(definition.name.value);
      // console.log('!!!!!', request);
      // const { query, variables, operationName } = request;
      // const {
      //   query: parsedQuery, action, gqlVerb,
      // } = helper.parseGraphQLQuery(query, operationName);
      // console.log(getDetailsFromDocument(requestContext));
      // logger.graphqlRequest({
      //   query: parsedQuery,
      //   variables,
      //   action,
      //   gqlVerb,
      // });
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
