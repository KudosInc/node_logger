const { print } = require('graphql');

module.exports = (logger) => {
  class BasicLogging {
    // eslint-disable-next-line class-methods-use-this
    requestDidStart({ queryString, parsedQuery, variables }) {
      const query = queryString || print(parsedQuery);
      logger.info(query.replace(/(\r\n|\n|\r)/gm, ' '));
      logger.info(variables);
    }

    // eslint-disable-next-line class-methods-use-this
    willSendResponse({ graphqlResponse }) {
      logger.debug(JSON.stringify(graphqlResponse, null, 2).replace(/(\r\n|\n|\r)/gm, ' '));
    }
  }
  return BasicLogging;
};
