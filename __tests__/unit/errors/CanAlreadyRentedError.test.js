const CarAlreadyRentedError = require("../../../app/errors/CarAlreadyRentedError");

describe("CarAlreadyRentedError", () => {
  describe("details", () => {
    test("Should return car object when error is called.", () => {
      const car = {
        name: "Toyota GT86"
      };

      const err = new CarAlreadyRentedError(car);

      expect(err.details).toEqual({ car });
    });
  });
});