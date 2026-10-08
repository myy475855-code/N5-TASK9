process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-please-use-long-value";
process.env.TEST_RATE_LIMIT = "false";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";

const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { pool, setupTestDatabase, resetTestDatabase } = require("./testDb");
const { query } = require("../src/config/db");

beforeAll(setupTestDatabase);
beforeEach(resetTestDatabase);
afterAll(async () => pool.end());

async function createUser(name, email, role, password = "Password123!") {
  const hash = await bcrypt.hash(password, 10);
  const r = await query("INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id", [name,email,hash,role]);
  return r.rows[0].id;
}

async function login(email, password = "Password123!") {
  const r = await request(app).post("/api/auth/login").send({ email, password });
  return r.body.token;
}

test("register creates a student", async () => {
  const r = await request(app).post("/api/auth/register").send({ name: "Ali", email: "ali@test.com", password: "Password123!", role: "student" });
  expect(r.status).toBe(201);
  expect(r.body.user.role).toBe("student");
});

test("login returns a JWT with an authenticated user", async () => {
  await createUser("Ali", "ali@test.com", "student");
  const r = await request(app).post("/api/auth/login").send({ email: "ali@test.com", password: "Password123!" });
  expect(r.status).toBe(200);
  expect(r.body.token).toEqual(expect.any(String));
  expect(r.body.user.email).toBe("ali@test.com");
});

test("protected application route rejects unauthenticated request", async () => {
  const r = await request(app).get("/api/applications/mine");
  expect(r.status).toBe(401);
  expect(r.body.error).toBe("UNAUTHORIZED");
});

test("student cannot access company applications route", async () => {
  await createUser("Ali", "ali@test.com", "student");
  const token = await login("ali@test.com");
  const r = await request(app).get("/api/applications/company").set("Authorization", `Bearer ${token}`);
  expect(r.status).toBe(403);
});

test("company cannot update an application owned by another company", async () => {
  const company1 = await createUser("C1", "c1@test.com", "company");
  const company2 = await createUser("C2", "c2@test.com", "company");
  const student = await createUser("S", "s@test.com", "student");
  const internship = await query("INSERT INTO internships(company_id,title,description,application_deadline,status) VALUES($1,$2,$3,$4,'OPEN') RETURNING id", [company1,"Internship","desc",new Date(Date.now()+86400000)]);
  const application = await query("INSERT INTO applications(internship_id,student_id) VALUES($1,$2) RETURNING id", [internship.rows[0].id,student]);
  const token = await login("c2@test.com");
  const r = await request(app).patch(`/api/applications/${application.rows[0].id}/status`).set("Authorization", `Bearer ${token}`).send({ status: "ACCEPTED" });
  expect(r.status).toBe(403);
});

test("expired internship blocks application with 409", async () => {
  const company = await createUser("C", "c@test.com", "company");
  const student = await createUser("S", "s@test.com", "student");
  const i = await query("INSERT INTO internships(company_id,title,description,application_deadline,status) VALUES($1,$2,$3,$4,'OPEN') RETURNING id", [company,"Old","desc",new Date(Date.now()-60000)]);
  const token = await login("s@test.com");
  const r = await request(app).post("/api/applications").set("Authorization", `Bearer ${token}`).send({ internshipId: i.rows[0].id });
  expect(r.status).toBe(409);
  expect(r.body.error).toBe("APPLICATION_DEADLINE_PASSED");
});

