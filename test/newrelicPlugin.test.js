const NewrelicPlugin = require('../newrelicPlugin');

const newrelicExtension = new NewrelicPlugin();

describe('isExcludedError', () => {
  describe('with a valid regular expression', () => {
    test('returns true for messages matching the regular expression', () => {
      const configString = '(Invalid email or password)|(Unauthorized access)|(HttpError 400)';
      const regex = new RegExp(configString);
      expect(newrelicExtension.isExcludedError('Invalid email or password.', regex)).toBe(true);
      expect(newrelicExtension.isExcludedError(' Unauthorized access ', regex)).toBe(true);
      expect(newrelicExtension.isExcludedError(' HttpError 400 ', regex)).toBe(true);
    });

    test('returns false for messages that do not match the regular expression', () => {
      const configString = '(Invalid email or password)|(Unauthorized access)|(HttpError 400)';
      const regex = new RegExp(configString);
      expect(newrelicExtension.isExcludedError('An error message', regex)).toBe(false);
    });
  });

  describe('with an empty string', () => {
    test('returns true all the time', () => {
      const configString = '';
      const regex = new RegExp(configString);
      expect(newrelicExtension.isExcludedError('An error message', regex)).toBe(true);
    });
  });

  describe('with the default exclude errors regex', () => {
    test('returns false all the time', () => {
      const regex = new RegExp(newrelicExtension.defaultExcludeErrorsRegex());
      expect(newrelicExtension.isExcludedError('An error message', regex)).toBe(false);
    });
  });
});
