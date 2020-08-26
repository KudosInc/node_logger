const NewrelicPlugin = require('../newrelicPlugin');
const newrelicExtension = new NewrelicPlugin();

describe('isExcludedError', () => {

  describe('with a valid regular expression', () => {

    test('returns true for messages matching the regular expression', () => {
      expect(newrelicExtension.isExcludedError('Invalid email or password.', /Invalid/)).toBe(true);
    });

    test('returns false for messages that do not match the regular expression', () => {
      expect(newrelicExtension.isExcludedError('A message that does not match', /Invalid/)).toBe(false);
    });

  });

  describe('with an empty string', () => {
    test('returns true all the time', () => {
      expect(newrelicExtension.isExcludedError('A message that does not match', '')).toBe(true);
    });
  });

});
