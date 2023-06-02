const ApplicationController = require("../../../app/controllers/ApplicationController");
const { NotFoundError } = require("../../../app/errors");

describe("ApplicationController", () => {
  const controller = new ApplicationController();

  describe("handleGetRoot", () => {
    test("Response should return status code 200 and json containing status and message.", 
      () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        controller.handleGetRoot(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "OK",
          message: "BCR API is up and running!",
        });
      }
    );
  });

  describe("handleNotFound", () => {
    test("Response should return status code 404 and json containing error object (name, message, and details).",
      () => {
        const req = {
          method: "GET",
          url: "/cars"
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        controller.handleNotFound(req, res);
        const err = new NotFoundError(req.method, req.url);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: {
            name: err.name,
            message: err.message,
            details: err.details,
          }
        });
      }
    );
  });

  describe("handleError", () => {
    test("Response should return status code 500 and json containing error object (name, message, and details).",
      () => {
        const req = jest.fn();
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();

        const err = new Error("There is an error.");
        controller.handleError(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: {
            name: err.name,
            message: err.message,
            details: err.details || null,
          }
        });
      }
    );
  });

  describe("getOffsetFromRequest", () => {
    test("Should return correct offset value", () => {
      const page = 1;
      const pageSize = 10;
      const req = {
        query: { page, pageSize }
      };

      const offestValue = controller.getOffsetFromRequest(req);
      const expectedOffsetValue = (page - 1) * pageSize;

      expect(offestValue).toBe(expectedOffsetValue);
    });
  });

  describe("buildPaginationObject", () => {
    test("Should return correct pagination object", () => {
      const page = 1;
      const pageSize = 10;
      const count = 20;
      const req = {
        query: { page, pageSize }
      };

      const paginationObject = controller.buildPaginationObject(req, count);
      const pageCount = Math.ceil(count / pageSize);

      expect(paginationObject).toEqual({
        page, 
        pageCount,
        pageSize,
        count
      });
    });
  });
});