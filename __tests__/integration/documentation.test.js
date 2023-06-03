require("dotenv").config();
const request = require("supertest");
const app = require("../../app");

describe("Swagger Documentation", () => {
    it("Should return status code 200 with swagger docs", async () => {
        let res = await request(app).get("/documentation.json");
        expect(res.statusCode).toBe(200);
    });
});