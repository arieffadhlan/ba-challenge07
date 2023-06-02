const dayjs = require('dayjs');
const CarController = require("../../../app/controllers/CarController");
const { CarAlreadyRentedError } = require('../../../app/errors');
const { Op } = require('sequelize');

const mockCar = {
  'id': 1,
  'name': 'Toyota GT86',
  'price': 500000,
  'size': 'MEDIUM',
  'image': 'https://images.unsplash.com/photo-1656337043211-15eae0dcaf63?fit=crop&h=600&w=600&s',
  'isCurrentlyRented': false,
  'createdAt': new Date(),
  'updatedAt': new Date(),
  'userCar': null,
}

const mockUserCar = {
  id: 1,
  userId: 1,
  carId: 1,
  rentStartedAt: null,
  rentEndedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CarController", () => {
  const carModel = {};
  const userCarModel = {};
  const controller = new CarController({ carModel, userCarModel, dayjs });
  
  describe("handleListCars", () => {
    test("Should return status code 200 with list cars and meta object if successful getting data.",
      async () => {
        const req = { query: {} };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        const carList = new Array(10).fill(mockCar).map((mockCarItem, index) => ({
          ...mockCarItem,
          id: index + 1
        }));

        controller.carModel.findAll = jest.fn().mockResolvedValue(carList);
        controller.carModel.count = jest.fn().mockResolvedValue(carList.length);

        await controller.handleListCars(req, res);
        const pagination = controller.buildPaginationObject(req, carList.length);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          cars: carList,
          meta: {
            pagination
          },
        });
      }
    );
  });

  describe("handleGetCar", () => {
    test("Should return status code 200 with car data if successful getting data.",
      async () => {
        const req = { params: { id: 1} };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        controller.carModel.findByPk = jest.fn().mockResolvedValue(mockCar);

        await controller.handleGetCar(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockCar);
      }
    );
  });

  describe("handleCreateCar", () => {
    test("Should return status code 201 with car data if successful created car.",
      async () => {
        const req = {
          body: {
            name: mockCar.name,
            price: mockCar.price,
            size: mockCar.size,
            image: mockCar.image,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        controller.carModel.create = jest.fn().mockResolvedValue(mockCar);

        await controller.handleCreateCar(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCar);
      }
    );

    test("Should return status code 422 with error if there is an error.",
      async () => {
        const req = {
          body: {
            name: mockCar.name,
            price: mockCar.price,
            size: mockCar.size,
            image: mockCar.image,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const err = new Error("There is an error.");

        controller.carModel.create = jest.fn().mockRejectedValue(err);

        await controller.handleCreateCar(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          error: {
            name: err.name,
            message: err.message,
          },
        });
      }
    );
  });

  describe("handleRentCar", () => {
    test("Should return status code 201 with user car data if successful renting a car.",
      async () => {
        const rentStartedAt = new Date();
        const rentEndedAt = dayjs(rentStartedAt).add(1, "day");
        const req = {
          body: { rentStartedAt, rentEndedAt: null },
          params: { id: 1 },
          user: { id: 1 }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        controller.carModel.findByPk = jest.fn().mockResolvedValue(mockCar);
        controller.userCarModel.findOne = jest.fn().mockResolvedValue(null);
        controller.userCarModel.create = jest.fn().mockResolvedValue({
          ...mockUserCar,
          rentStartedAt,
          rentEndedAt
        });

        await controller.handleRentCar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          ...mockUserCar,
          rentStartedAt,
          rentEndedAt,
        });
      }
    );

    test("Should return status code 422 with error if car already rented.",
      async () => {
        const rentStartedAt = new Date();
        const req = {
          body: { rentStartedAt, rentEndedAt: null },
          params: { id: 1 },
          user: { id: 1 }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        controller.carModel.findByPk = jest.fn().mockResolvedValue(mockCar);
        controller.userCarModel.findOne = jest.fn().mockResolvedValue(mockCar);

        await controller.handleRentCar(req, res, next);
        const err = new CarAlreadyRentedError(mockCar);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(err);
      }
    );

    test("Should proceed to error handling if there is an error.",
      async () => {
        const rentStartedAt = new Date();
        const req = {
          body: { rentStartedAt, rentEndedAt: null },
          params: { id: 1 },
          user: { id: 1 }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        controller.carModel.findByPk = jest.fn().mockRejectedValue(
          new Error("There is an error.")
        );

        await controller.handleRentCar(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    );
  });

  describe("handleUpdateCar", () => {
    test("Should return status code 200 with car data if successful updated car.",
      async () => {
        const req = {
          body: {
            name: mockCar.name,
            price: mockCar.price,
            size: mockCar.size,
            image: mockCar.image,
            isCurrentlyRented: mockCar.isCurrentlyRented
          },
          params: { id: 1 }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };

        controller.carModel.findByPk = jest.fn().mockResolvedValue(mockCar);
        controller.carModel.update = jest.fn();

        await controller.handleUpdateCar(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(controller.carModel.update).toHaveBeenCalledWith(
          req.body, {where: {id: req.params.id}}
        );
      }
    );

    test("Should return status code 422 with error if there is an error.",
      async () => {
        const req = {
          body: {
            name: mockCar.name,
            price: mockCar.price,
            size: mockCar.size,
            image: mockCar.image,
            isCurrentlyRented: mockCar.isCurrentlyRented
          },
          params: { id: 1 }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const err = new Error("There is an error.");

        controller.carModel.findByPk = jest.fn().mockRejectedValue(err);

        await controller.handleUpdateCar(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
          error: {
            name: err.name,
            message: err.message,
          },
        });
      }
    );
  });

  describe("handleDeleteCar", () => {
    test("Should return status code 204 if successful deleted car.",
      async () => {
        const req = { params: { id: 1 } };
        const res = {
          status: jest.fn().mockReturnValue({
            end: jest.fn()
          })
        };

        controller.carModel.destroy = jest.fn().mockResolvedValue(1);

        await controller.handleDeleteCar(req, res);

        expect(controller.carModel.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
      }
    );
  });

  describe("getCarFromRequest", () => {
    test("Should return car data from given request param id.",
      () => {
        const req = { params: { id: 1 } };
        
        controller.carModel.findByPk = jest.fn().mockReturnValue(mockCar);

        const car = controller.getCarFromRequest(req);
        expect(car).toEqual(mockCar);
      }
    );
  });

  describe("getListQueryFromRequest", () => {
    test("Should return query object based on request.",
      () => {
        const availableAt = new Date();
        const req = {
          query: { size: 5, availableAt }
        };

        controller.userCarModel = {}
        const query = controller.getListQueryFromRequest(req);

        expect(query).toEqual({
          include: {
            model: {},
            as: "userCar",
            required: false,
            where: {
              rentEndedAt: {
                [Op.gte]: availableAt,
              },
            },
          },
          where: { size: 5 },
          limit: 10,
          offset: controller.getOffsetFromRequest(req)
        });
      }
    );
  });
});