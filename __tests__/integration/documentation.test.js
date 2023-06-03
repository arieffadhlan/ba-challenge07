require("dotenv").config();
const request = require("supertest");
const app = require("../../app");

describe("Swagger Documentation", () => {
    it("Response should return status code 200 with swagger documentation.", async () => {
        let res = await request(app).get("/documentation.json");
        expect(res.statusCode).toBe(200);
    });
});