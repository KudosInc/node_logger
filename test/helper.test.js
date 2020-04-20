const helper = require('../helper');

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

  test('with an action', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleQuery, '');
    expect(query).toBe('query user($userId: Int!) {  user(id: $userId) {  id,  name  }  }');
    expect(action).toBe('user');
    expect(gqlVerb).toBe('query');
  });

  test('with no action', () => {
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

  test('with a named mutation', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleMutation, '');
    expect(query).toBe('mutation addUser($userId: Int!) {  addUser(id: $userId) {  id,  name  }  }');
    expect(action).toBe('addUser');
    expect(gqlVerb).toBe('mutation');
  });

  test('with an unnamed mutation', () => {
    const { query, action, gqlVerb } = helper.parseGraphQLQuery(simpleMutation2, '');
    expect(query).toBe('mutation addUser(id:1) {  id,  name  }');
    expect(action).toBe('addUser');
    expect(gqlVerb).toBe('mutation');
  });
});
