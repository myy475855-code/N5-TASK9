const { query } = require("../config/db");

async function closeExpiredInternship(id){
  await query(
    `UPDATE internships
     SET status='CLOSED', updated_at=NOW()
     WHERE id=$1 AND status='OPEN' AND application_deadline <= NOW()`, [id]
  );
}

async function closeExpiredInternships(){
  const result = await query(
    `UPDATE internships
     SET status='CLOSED', updated_at=NOW()
     WHERE status='OPEN' AND application_deadline <= NOW()
     RETURNING id`
  );
  if(result.rowCount) console.log(`[DEADLINE] closed ${result.rowCount} internship(s)`);
  return result.rowCount;
}

async function assertPostingLimit(companyId){
  const result = await query(
    `SELECT COUNT(*)::int AS count
     FROM internships
     WHERE company_id=$1 AND status='OPEN' AND application_deadline > NOW()`,
    [companyId]
  );
  const limit = Math.max(1, Number(process.env.MAX_ACTIVE_POSTINGS || 5));
  if(result.rows[0].count >= limit){
    const err = new Error("Maximum active posting limit reached.");
    err.code = "POSTING_LIMIT_REACHED";
    err.status = 409;
    throw err;
  }
}

async function assertApplicationOpen(internshipId){
  await closeExpiredInternship(internshipId);
  const result = await query(`SELECT * FROM internships WHERE id=$1`,[internshipId]);
  if(!result.rowCount){
    const err = new Error("Internship not found.");
    err.code="NOT_FOUND"; err.status=404; throw err;
  }
  const internship = result.rows[0];
  if(internship.status !== "OPEN" || new Date(internship.application_deadline) <= new Date()){
    const err = new Error("This internship is no longer accepting applications.");
    err.code="APPLICATION_DEADLINE_PASSED"; err.status=409; throw err;
  }
  return internship;
}

module.exports = {closeExpiredInternships, assertPostingLimit, assertApplicationOpen};
