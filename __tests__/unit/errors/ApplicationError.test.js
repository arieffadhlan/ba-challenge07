const ApplicationError = require("../../../app/errors/ApplicationError");

describe('ApplicationError', () => {
  describe('details', () => {
    it('Should return empty object when error is called.', () => {
      const err = new ApplicationError();

      expect(err.details).toEqual({});
    });
  });

  describe('toJSON', () => {
    it('Should return error object when error is called.', () => {
      const err = new ApplicationError();

      expect(err.toJSON()).toEqual({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });
    });
  });
});