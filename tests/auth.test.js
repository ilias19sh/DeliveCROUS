const request = require("supertest");
const app = require("../main");

describe("Auth flow", () => {
  let token;

  it("register -> returns token", async () => {
    const r = await request(app).post("/register").send({
      email: "anas@test.com", password: "123456", name: "Anas"
    });
    expect(r.statusCode).toBeGreaterThanOrEqual(200);
    expect(r.statusCode).toBeLessThan(300);
    token = r.body.token;
    expect(token).toBeTruthy();
  });

  it("login -> returns token", async () => {
    const r = await request(app).post("/login").send({
      email: "anas@test.com", password: "123456"
    });
    expect(r.statusCode).toBe(200);
    expect(r.body.token).toBeTruthy();
  });

  it("profile -> requires Bearer token", async () => {
    const r = await request(app).get("/profile").set("Authorization", `Bearer ${token}`);
    expect(r.statusCode).toBe(200);
    expect(r.body).toHaveProperty("email");
  });
});
