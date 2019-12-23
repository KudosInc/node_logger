const { print } = require('graphql');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ queryString, parsedQuery, variables }) {
      const query = (queryString || print(parsedQuery)).replace(extraSpacesNewLineRemovalRegexp, ' ');
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
