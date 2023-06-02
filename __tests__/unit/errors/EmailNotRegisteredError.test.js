const EmailNotRegisteredError = require("../../../app/errors/EmailNotRegisteredError");

describe("EmailNotRegisteredError", () => {
  describe("details", () => {
    test("Should return email object when error is called.", () => {
      const email = "johndoe@mail.com"
      const err = new EmailNotRegisteredError(email);

      expect(err.details).toEqual({ email });
    });
  });
});