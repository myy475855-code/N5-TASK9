const { newDb } = require("pg-mem");

const db = newDb({ autoCreateForeignKeyIndices: true });
const pg = db.adapters.createPg();
const pool = new pg.Pool();

async function setupTestDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('student','company','admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS internships (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES users(id),
      title VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      application_deadline TIMESTAMP NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      internship_id INTEGER NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','UNDER_REVIEW','ACCEPTED','REJECTED')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (internship_id, student_id)
    );
  `);
}

async function resetTestDatabase() {
  await pool.query("DELETE FROM applications; DELETE FROM internships; DELETE FROM users;");
}

module.exports = { pool, setupTestDatabase, resetTestDatabase };
