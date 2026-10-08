require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("./db");

(async () => {
  const passwordHash = await bcrypt.hash("Student123!", 12);
  const companyHash = await bcrypt.hash("Company123!", 12);
  const adminHash = await bcrypt.hash("Admin123!", 12);

  const student = await pool.query(
    `INSERT INTO users (name,email,password_hash,role)
     VALUES ($1,$2,$3,'student')
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
     RETURNING id`, ["Demo Student","student@example.com",passwordHash]
  );
  const company = await pool.query(
    `INSERT INTO users (name,email,password_hash,role)
     VALUES ($1,$2,$3,'company')
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
     RETURNING id`, ["Demo Company","company@example.com",companyHash]
  );
  await pool.query(
    `INSERT INTO users (name,email,password_hash,role)
     VALUES ($1,$2,$3,'admin')
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name`,
    ["Demo Admin","admin@example.com",adminHash]
  );

  await pool.query(`DELETE FROM internships WHERE company_id=$1`, [company.rows[0].id]);
  await pool.query(
    `INSERT INTO internships(company_id,title,description,application_deadline,status)
     VALUES($1,$2,$3,NOW()+INTERVAL '14 days','OPEN')`,
    [company.rows[0].id,"Backend Developer Intern","Work on REST APIs, databases and testing."]
  );

  console.log("Seed complete.");
  await pool.end();
})().catch(async err => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
