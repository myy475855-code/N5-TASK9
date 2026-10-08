require("dotenv").config();
const { Pool } = require("pg");

if (process.env.NODE_ENV === "test") {
  const { pool } = require("../../tests/testDb");
  module.exports = { query: (text, params) => pool.query(text, params), pool };
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 });
  module.exports = { query: (text, params) => pool.query(text, params), pool };
}
