const NewrelicPlugin = require('../newrelicPlugin');

const newrelicExtension = new NewrelicPlugin();

describe('isExcludedError', () => {
  describe('with a valid regular expression', () => {
    test('returns true for messages matching the regular expression', () => {
      expect(newrelicExtension.isExcludedError('Invalid email or password.', /Invalid/)).toBe(true);
    });

    test('returns false for messages that do not match the regular expression', () => {
      expect(newrelicExtension.isExcludedError('An error message', /Invalid/)).toBe(false);
    });
  });

  describe('with an empty string', () => {
    test('returns true all the time', () => {
      expect(newrelicExtension.isExcludedError('An error message', '')).toBe(true);
    });
  });

  describe('with the default exclude errors regex', () => {
    test('returns false all the time', () => {
      const regex = new RegExp(newrelicExtension.defaultExcludeErrorsRegex());
      console.log(`aaaa ${regex} and ${newrelicExtension.defaultExcludeErrorsRegex()}`);
      expect(newrelicExtension.isExcludedError('An error message', regex)).toBe(false);
    });
  });
});
