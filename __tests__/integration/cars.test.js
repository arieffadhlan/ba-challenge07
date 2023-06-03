const dayjs = require("dayjs");
const request = require("supertest");
const app = require("../../app");
const { Car } = require("../../app/models");

const mockCustomerRole = {
  id: 1,
  name: "CUSTOMER"
}

const mockAdminRole = {
  id: 2,
  name: "ADMIN"
}

const mockCustomer = {
  name: "Johnny",
  email: "Johnny@binar.co.id",
  password: "123456",
  roleId: mockCustomerRole.id
};

const mockAdmin = {
  name: "Marieffadhlan",
  email: "marieffadhlan@binar.co.id",
  password: "123456",
  roleId: mockAdminRole.id
};

const mockCar = {
  "name": "Toyota GT86",
  "price": 500000,
  "size": "MEDIUM",
  "image": "https://images.unsplash.com/photo-1656337043211-15eae0dcaf63?fit=crop&h=600&w=600&s",
  "isCurrentlyRented": false,
}

const mockUpdatedCar = {
  "name": "Honda Civic Type R",
  "price": 400000,
  "size": "MEDIUM",
  "image": "https://images.unsplash.com/photo-1641921965908-7134214c24ca?fit=crop&h=600&w=600&s",
  "isCurrentlyRented": false,
}

describe("GET /v1/cars", () => {
  test("Response should return status code 200 with list cars and meta object if successful getting data.",
    async () => {
      const res = await request(app).get("/v1/cars");
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("cars");
      expect(res.body).toHaveProperty("meta");
    }
  );
});

describe("POST /v1/cars", () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post("/v1/auth/login")
      .set("Content-Type", "application/json")
      .send(mockAdmin);

    token = res.body.accessToken;
  });

  test("Response should return status code 201 with car data if successful created car.",
    async () => {
      const res = await request(app)
        .post("/v1/cars")
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`)
        .send(mockCar);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id", "name", "price", "size", "image", "isCurrentlyRented");
    }
  );
});

describe("POST /v1/cars/:id/rent", () => {
  let token;
  const carId = 1;
  const rentStartedAt = new Date();
  const rentEndedAt = dayjs(rentStartedAt).add(1, "day");

  beforeAll(async () => {
    const res = await request(app)
      .post("/v1/auth/login")
      .set("Content-Type", "application/json")
      .send(mockCustomer);

    token = res.body.accessToken;
  });
  
  test("Response should return status code 201 with user car data if successful renting a car.",
    async () => {
      const res = await request(app)
        .post(`/v1/cars/${carId}/rent`)
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`)
        .send({ rentStartedAt, rentEndedAt });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id", "carId", "rentStartedAt", "rentEndedAt");
    }
  );
});

describe("GET /v1/cars/:id", () => {
  const carId = 1;

  test("Response should return car data from given request param id.", 
    async () => {
      const res = await request(app)
        .get(`/v1/cars/${carId}`)
        .set("Content-Type", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", "name", "price", "size", "image", "isCurrentlyRented");
    }
  );
});

describe("PUT /v1/cars/:id", () => {
  let token;
  const carId = 1;

  beforeAll(async () => {
    const res = await request(app)
      .post("/v1/auth/login")
      .set("Content-Type", "application/json")
      .send(mockAdmin);

    token = res.body.accessToken;
  });

  test("Response should return status code 200 with car data if successful updated car.",
    async () => {
      const res = await request(app)
        .put(`/v1/cars/${carId}`)
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`)
        .send(mockUpdatedCar);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toEqual(mockUpdatedCar.name);
      expect(res.body.price).toEqual(mockUpdatedCar.price);
      expect(res.body.size).toEqual(mockUpdatedCar.size);
      expect(res.body.image).toEqual(mockUpdatedCar.image);
    }
  );
});

describe("DELETE /v1/cars/:id", () => {
  let token;
  let car;

  beforeAll(async () => {
    car = await Car.create(mockCar);
    const res = await request(app)
      .post("/v1/auth/login")
      .set("Content-Type", "application/json")
      .send(mockAdmin);

    token = res.body.accessToken;
    return car;
  });

  test("Response should return status code 204 if successful deleted car.",
    async () => {
      const res = await request(app)
        .delete(`/v1/cars/${car.id}`)
        .set("Content-Type", "application/json")
        .set("authorization", `Bearer ${token}`);
      
      expect(res.statusCode).toBe(204);
    }
  );
});