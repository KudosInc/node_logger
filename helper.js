const { first, isEmpty, trim } = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);

const operationName = (queryString, variables) => {
  let action;
  const query = queryString;
  if (isEmpty(variables)) {
    // eslint-disable-next-line prefer-destructuring
    action = query.split('{')[1];
  } else {
    [action] = query.split('{')[1].split('(');
  }
  return trim(action.replace(extraSpacesNewLineRemovalRegexp, ' '));
};

const parseGraphQLQuery = (queryString, variables) => {
  const action = operationName(queryString, variables);
  const query = queryString ? queryString.replace(extraSpacesNewLineRemovalRegexp, ' ') : '';
  console.log('queryString', queryString);
  console.log('query', query);
  const gqlVerb = first(query.match(QUERY_MUTATION_PATTERN));

  return { query, action, gqlVerb };
};

module.exports = {
  parseGraphQLQuery,
};
