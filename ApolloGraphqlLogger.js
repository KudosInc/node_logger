const { print } = require('graphql');

module.exports = (logger) => {
  const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ queryString, parsedQuery, variables }) {
      const query = (queryString || print(parsedQuery)).replace(extraSpacesNewLineRemovalRegexp, ' ');
      logger.info({
        query,
        variables,
      });
    }

    // eslint-disable-next-line class-methods-use-this
    willSendResponse({ graphqlResponse }) {
      logger.debug(JSON.stringify(graphqlResponse).replace(extraSpacesNewLineRemovalRegexp, ' '));
    }
  }
  return BasicLogging;
};
