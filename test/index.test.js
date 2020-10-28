
const logger = require('../index');

describe('index.test.js', () => {
  const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
  describe('logger.info', () => {
    it('it should output with correct level', () => {
      logger.info('blob');
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"level":"info"'));
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"severity":"info"'));
    });
    it('it should output message', () => {
      logger.info('anything');
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"message":"anything"'));
    });
    it('it should include timestamp', () => {
      logger.info('anything');
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"timestamp":'));
    });
    it('it should include any extra info', () => {
      logger.info('anything', { extra: 'info' });
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"extra":"info"'));
    });
  });

  describe('logger.warn', () => {
    it('it should output with correct level', () => {
      logger.warn('blob');
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"level":"warning"'));
    });
  });

  describe('output', () => {
    it('should not log if message is excluded', () => {
      logger.info('jwt expired');
      expect(consoleLogMock).toHaveBeenCalledTimes(0);
    });
  });
});
