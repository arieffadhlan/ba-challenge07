const request = require("supertest");
const app = require("../../app");
const { User } = require("../../app/models");

const mockRegisterCredentials = {
  name: "John Doe",
  email: "johndoe@mail.com",
  password: "johndoe_password"
};

const mockLoginCredentials = {
  email: "johndoe@mail.com",
  password: "johndoe_password"
};

describe("GET /v1/auth/whoami", () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post("/v1/auth/register")
      .set("Content-Type", "application/json")
      .send(mockRegisterCredentials);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await User.destroy({
      where: { email: mockRegisterCredentials.email },
    });
  });

  test("Should return status code 401 with user data.", async () => {
    const res = await request(app)
      .get("/v1/auth/whoami")
      .set("Content-Type", "application/json")
      .set("authorization", `Bearer ${token}`)

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", "name", "email", "image");
  });
});

describe("POST /v1/auth/register", () => {
  afterAll(async () => {
    await User.destroy({
      where: { email: mockRegisterCredentials.email },
    });
  });

  test("Should return status code 201 with accessToken if register has been successful.",
    async () => {
      const res = await request(app)
        .post("/v1/auth/register")
        .set("Content-Type", "application/json")
        .send(mockRegisterCredentials);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
    }
  );

  test("Should return status code 422 with error if email already taken.",
    async () => {
      const res = await request(app)
        .post("/v1/auth/register")
        .set("Content-Type", "application/json")
        .send(mockRegisterCredentials);
      
      expect(res.statusCode).toBe(422);
      expect(res.body).toHaveProperty("error");
    }
  );
});

describe("POST /v1/auth/login", () => {
  beforeAll(async () => {
    const res = await request(app)
      .post("/v1/auth/register")
      .set("Content-Type", "application/json")
      .send(mockRegisterCredentials);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await User.destroy({
      where: { email: mockRegisterCredentials.email },
    });
  });

  test("Should return status code 201 with accessToken if login has been successful.",
    async () => {
      const res = await request(app)
        .post("/v1/auth/login")
        .set("Content-Type", "application/json")
        .send(mockLoginCredentials);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
    }
  );
});