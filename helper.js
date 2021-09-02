const { first, isEmpty } = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);

const operationName = (queryString, variables) => {
  console.log('queryString', queryString);
  console.log('isEmpty(variables)', isEmpty(variables));
  if (isEmpty(variables)) return queryString.split('{')[1];
  return queryString.split('{')[1].split('(')[0];
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
