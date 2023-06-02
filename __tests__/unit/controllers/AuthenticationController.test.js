const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthenticationController = require("../../../app/controllers/AuthenticationController");
const { EmailAlreadyTakenError, EmailNotRegisteredError, InsufficientAccessError, RecordNotFoundError, WrongPasswordError } = require("../../../app/errors");
const { Role } = require("../../../app/models");
const { JWT_SIGNATURE_KEY } = require("../../../config/application");
const User = {}

const mockUser = {
  id: 1,
  name: "John Doe",
  email: "johndoe@mail.com",
  image: "johndoe_image",
  password: "johndoe_password",
  roleId: 1,
};

const mockRole = {
  id: 1,
  name: "COSTUMER",
};

const mockUserResponse = {
  id: mockUser.id,
  name: mockUser.name,
  email: mockUser.email,
  encryptedPassword: bcrypt.hashSync(mockUser.password, 10),
  roleId: mockRole.id,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("AuthenticationController", () => {  
  const roleModel = Role;
  const userModel = User;
  const controller = new AuthenticationController({ userModel, roleModel, bcrypt, jwt });

  describe("authorize", () => {
    test("Should proceed to the next step if token and role are valid.", 
      () => {
        const token = controller.createTokenFromUser(mockUser, mockRole);
        const req = {
          headers: {
            authorization: `Bearer ${token}`,
          },
        };
        const res = jest.fn();
        const next = jest.fn();
  
        const authorizeUser = controller.authorize("COSTUMER");
        authorizeUser(req, res, next);
  
        expect(next).toHaveBeenCalled();
      }
    );

    test("Response should return status code 401 with InsufficientAccessError (access forbidden) and json containing error object (name, message, and details).", 
      () => {
        const token = controller.createTokenFromUser(mockUser, mockRole);
        const req = {
          headers: {
            authorization: `Bearer ${token}`,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
  
        const authorizeUser = controller.authorize("ADMIN");
        authorizeUser(req, res, next);
        const err = new InsufficientAccessError("COSTUMER");
  
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: {
            name: err.name,
            message: err.message,
            details: err.details || null,
          },
        });
      }
    );

    test("Response should return status code 401 with error if there is an error.", 
      () => {
        const token = controller.createTokenFromUser(mockUser, mockRole);
        const req = {
          headers: {
            authorization: `Bearer ${token}incorrect`,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
  
        const authorizeUser = controller.authorize("ADMIN");
        authorizeUser(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(401);
      }
    );
  });

  describe("handleLogin", () => {
    test("Should return status code 201 with accessToken if login has been successful.",
      async () => {
        const req = {
          body: {
            email: mockUser.email,
            password: mockUser.password
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();

        controller.userModel.findOne = jest.fn().mockResolvedValue({
          ...mockUserResponse, 
          Role: mockRole
        });

        await controller.handleLogin(req, res, next);
        const accessToken = controller.createTokenFromUser(
          {...mockUserResponse, Role: mockRole},
          mockRole
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ accessToken });
      }
    );

    test("Should proceed to error handling if there is an error.",
      async () => {
        const req = {
          body: {
            email: mockUser.email,
            password: mockUser.password
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
        
        controller.userModel.findOne = jest.fn().mockRejectedValue(
          new Error("There is an error.")
        );

        await controller.handleLogin(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    );

    test("Should return status code 404 with error if email is not registered.",
      async () => {
        const req = {
          body: {
            email: mockUser.email,
            password: mockUser.password
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
        
        controller.userModel.findOne = jest.fn().mockResolvedValue(null);

        await controller.handleLogin(req, res, next);
        const err = new EmailNotRegisteredError(mockUser.email);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(err);
      }
    );

    test("Should return status code 401 with error if password is incorrect.",
      async () => {
        const req = {
          body: {
            email: mockUser.email,
            password: "incorrect_password"
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
        
        controller.userModel.findOne = jest.fn().mockResolvedValue({
          ...mockUserResponse, 
          Role: mockRole
        });

        await controller.handleLogin(req, res, next);
        const err = new WrongPasswordError();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(err);
      }
    );
  });
  
  describe("handleRegister", () => {
    test("Should return status code 201 with accessToken if register has been successful.",
      async () => {
        const req = {
          body: {
            name: mockUser.name,
            email: mockUser.email,
            password: mockUser.password
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();

        controller.userModel.findOne = jest.fn().mockResolvedValue(null);
        controller.userModel.create = jest.fn().mockResolvedValue(mockUserResponse);
        controller.roleModel.findOne = jest.fn().mockResolvedValue(mockRole);
        
        await controller.handleRegister(req, res, next);
        const accessToken = controller.createTokenFromUser(mockUserResponse, mockRole);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ accessToken });
      }
    );

    test("Should proceed to error handling if there is an error.",
      async () => {
        const req = {
          body: {
            name: mockUser.name,
            email: mockUser.email,
            password: mockUser.password
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
        
        controller.userModel.findOne = jest.fn().mockRejectedValue(
          new Error("There is an error.")
        );

        await controller.handleRegister(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    );

    test("Should return status code 422 with error if email already taken.",
      async () => {
        const req = {
          body: {
            name: mockUser.name,
            email: mockUser.email,
            password: mockUser.password
          }
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const next = jest.fn();
        
        controller.userModel.findOne = jest.fn().mockResolvedValue(true);

        await controller.handleRegister(req, res, next);
        const err = new EmailAlreadyTakenError(mockUser.email);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(err);
      }
    );
  });
  
  describe("handleGetUser", () => {
    test("Should return status code 200 with user data.",
      async () => {
        const req = { user: mockUser };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        
        controller.userModel.findByPk = jest.fn().mockResolvedValue(mockUser);
        controller.roleModel.findByPk = jest.fn().mockResolvedValue(true);

        await controller.handleGetUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
      }
    );

    test("Should return status code 404 with error if user record is not found.",
      async () => {
        const req = { user: mockUser };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        
        controller.userModel.findByPk = jest.fn().mockResolvedValue(null);

        await controller.handleGetUser(req, res);
        const err = new RecordNotFoundError(mockUser.name);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(err);
      }
    );

    test("Should return status code 404 with error if role is not found.",
      async () => {
        const req = { user: mockUser };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        
        controller.userModel.findByPk = jest.fn().mockResolvedValue(mockUser);
        controller.roleModel.findByPk = jest.fn().mockResolvedValue(null);

        await controller.handleGetUser(req, res);
        const err = new RecordNotFoundError(mockUser.name);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(err);
      }
    );
  });

  describe("createTokenFromUser", () => {
    test("Should sign jwt and return token based on user and role", () => {
      const token = controller.createTokenFromUser(mockUser, mockRole);
      const expectedToken = jwt.sign({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
        role: {
          id: mockRole.id,
          name: mockRole.name,
        }
      }, JWT_SIGNATURE_KEY);

      expect(token).toEqual(expectedToken);
    });
  });

  describe("decodeToken", () => {
    test("Should return payload data if token is verified.", () => {
      const user = {
        id: 1,
        name: "admin",
        email: "admin@mail.com",
        image: "admin_image",
        role: {
          id: 2,
          name: "ADMIN"
        }
      };

      const token = jwt.sign(user, JWT_SIGNATURE_KEY);
      const decodeToken = controller.decodeToken(token);
      delete decodeToken["iat"];

      expect(decodeToken).toEqual(user);
    });
  });

  describe("encryptPassword", () => {
    test("Should return encrypted password.", () => {
      const encryptedPassword = controller.encryptPassword(mockUser.password);
      const comparePassword = bcrypt.compareSync(mockUser.password, encryptedPassword);
      
      expect(comparePassword).toEqual(true);
    });
  });

  describe("verifyPassword", () => {
    test("Should return true if password and encryptedPassword match.", () => {
      const encryptedPassword = bcrypt.hashSync(mockUser.password);
      const comparePassword = controller.verifyPassword(mockUser.password, encryptedPassword);
      
      expect(comparePassword).toEqual(true);
    });

    test("Should return false if password and encryptedPassword don't match.", () => {
      const encryptedPassword = bcrypt.hashSync(`${mockUser.password}_incorrect`);
      const comparePassword = controller.verifyPassword(mockUser.password, encryptedPassword);
      
      expect(comparePassword).toEqual(false);
    });
  });
});
