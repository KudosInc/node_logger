const helper = require('./helper');

module.exports = (logger) => {
  const BasicLogging = {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart(requestContext) {
      console.log('REQUEST CONTEXT', requestContext);
      return {
        didResolveOperation(r) {
          console.log('!!!!!', r);
          return {
            // eslint-disable-next-line class-methods-use-this
            willSendResponse({ response }) {
              logger.graphqlResponse(response);
            },
          };
        },
      };
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
      // return {
      //   // eslint-disable-next-line class-methods-use-this
      //   willSendResponse({ response }) {
      //     logger.graphqlResponse(response);
      //   },
      // };
    },
  };
  return BasicLogging;
};
