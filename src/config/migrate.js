require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "../../migrations/001_initial.sql"), "utf8");
  await pool.query(sql);
  console.log("Migration complete.");
  await pool.end();
})().catch(async err => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
