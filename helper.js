const { first } = require('lodash/fp');

const extraSpacesNewLineRemovalRegexp = new RegExp(/(\r\n|\n|\r|\s\s+)/gm);
const QUERY_MUTATION_PATTERN = new RegExp(/query|mutation/);
const QUERY_ACTION_PATTERN = new RegExp(/^\s*\w+\s+(\w+)/);


const parseGraphQLQuery = (queryString, operationName) => {
  const query = queryString.replace(extraSpacesNewLineRemovalRegexp, ' ');
  const match = QUERY_ACTION_PATTERN.exec(query);
  const action = operationName || match ? match[1] : 'no action';
  const gqlVerb = first(query.match(QUERY_MUTATION_PATTERN));

  console.log('gqlVerb', gqlVerb);

  return { query, action, gqlVerb };
};

module.exports = {
  parseGraphQLQuery,
};
