const { first, isEmpty, trim } = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = /(\r\n|\n|\r|\s\s+)/gm;
const QUERY_MUTATION_PATTERN = /query|mutation/;

const operationName = (queryString, variables) => {
  let action;
  if (isEmpty(variables)) {
    [, action] = queryString.split('{');
  } else {
    [action] = queryString.split('{')[1].split('(');
  }
  return trim(action.replace(extraSpacesNewLineRemovalRegexp, ' '));
};

const parseGraphQLQuery = (queryString, variables) => {
  const action = operationName(queryString, variables);
  const query = queryString ? queryString.replace(extraSpacesNewLineRemovalRegexp, ' ') : '';
  const gqlVerb = first(query.match(QUERY_MUTATION_PATTERN)) || 'query';

  return { query, action, gqlVerb };
};

module.exports = {
  parseGraphQLQuery,
};
