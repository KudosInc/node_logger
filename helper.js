const { first, isEmpty } = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);

const operationName = (queryString, variables) => {
  if (isEmpty(variables)) return queryString.split('+').pop().split('{')[0];
  return queryString.split('+').pop().split('(')[0];
};

const parseGraphQLQuery = (queryString, variables) => {
  const action = operationName(queryString, variables);
  const query = queryString ? queryString.replace(extraSpacesNewLineRemovalRegexp, ' ') : '';
  const gqlVerb = first(query.match(QUERY_MUTATION_PATTERN));

  return { query, action, gqlVerb };
};

module.exports = {
  parseGraphQLQuery,
};
