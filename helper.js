const { first, isEmpty } = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);

const operationName = (queryString, variables) => {
  console.log('queryString', queryString);
  console.log('isEmpty(variables)', isEmpty(variables));
  console.log('queryString.split(\'+\')', queryString.split('+'));
  console.log('queryString.split(\'+\').pop()', queryString.split('+').pop());
  console.log('queryString.split(\'+\').pop().split(\'{\')', queryString.split('+').pop()).split('{');
  console.log('[0]', queryString.split('+').pop()).split('{'));
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
