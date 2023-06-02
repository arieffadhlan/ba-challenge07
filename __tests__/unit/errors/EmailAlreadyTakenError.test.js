const EmailAlreadyTakenError = require("../../../app/errors/EmailAlreadyTakenError");

describe("EmailAlreadyTakenError", () => {
  describe("details", () => {
    test("Should return email object when error is called.", () => {
      const email = "johndoe@mail.com"
      const err = new EmailAlreadyTakenError(email);

      expect(err.details).toEqual({ email });
    });
  });
});