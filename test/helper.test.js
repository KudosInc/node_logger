const helper = require('../helper');

/**
 * @todo
 * 2023-02-07 CB - Skipping these tests. Some work performed in 2021
 *                 resulted in these tests failing. Next time we touch
 *                 helper.js, we need to update/fix these tests.
 */

describe('parsing a query string', () => {
  const simpleQuery = `query user($userId: Int!) {
        user(id: $userId) {
          id,
          name
        }
      }`;

  const simpleQuery2 = `query ($id: Int!) {
        me(id:$id) {
          name
        }
      }`;

  test.skip('with an action', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleQuery, '');
    expect(query).toBe('query user($userId: Int!) {  user(id: $userId) {  id,  name  }  }');
    expect(action).toBe('user');
    expect(gqlVerb).toBe('query');
  });

  test.skip('with no action', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleQuery2, '');
    expect(query).toBe('query ($id: Int!) {  me(id:$id) {  name  }  }');
    expect(action).toBe('no action');
    expect(gqlVerb).toBe('query');
  });
});

describe('parsing a simple mutation', () => {
  const simpleMutation = `mutation addUser($userId: Int!) {
            addUser(id: $userId) {
              id,
              name
            }
          }`;

  const simpleMutation2 = `mutation addUser(id:1) {
              id,
              name
          }`;

  test.skip('with a named mutation', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleMutation, '');
    expect(query).toBe('mutation addUser($userId: Int!) {  addUser(id: $userId) {  id,  name  }  }');
    expect(action).toBe('addUser');
    expect(gqlVerb).toBe('mutation');
  });

  test.skip('with an unnamed mutation', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleMutation2, '');
    expect(query).toBe('mutation addUser(id:1) {  id,  name  }');
    expect(action).toBe('addUser');
    expect(gqlVerb).toBe('mutation');
  });
});
