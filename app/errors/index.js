const CarAlreadyRentedError = require("./CarAlreadyRentedError")
const EmailAlreadyTakenError = require("./EmailAlreadyTakenError")
const EmailNotRegisteredError = require("./EmailNotRegisteredError")
const InsufficientAccessError = require("./InsufficientAccessError");
const NotFoundError = require("./NotFoundError")
const RecordNotFoundError = require("./RecordNotFoundError")
const WrongPasswordError = require("./WrongPasswordError")

module.exports = {
  CarAlreadyRentedError,
  EmailAlreadyTakenError,
  EmailNotRegisteredError,
  InsufficientAccessError,
  NotFoundError,
  RecordNotFoundError,
  WrongPasswordError,
}
