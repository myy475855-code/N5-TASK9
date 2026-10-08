const crypto=require("crypto");
const {query}=require("../config/db");
const {assertApplicationOpen}=require("../services/businessRules");
const {sendEmail}=require("../services/emailService");

async function create(req,res,next){
  try{
    const internship=await assertApplicationOpen(req.body.internship_id);
    const existing=await query(
      `SELECT id FROM applications WHERE internship_id=$1 AND student_id=$2`,
      [internship.id,req.user.id]);
    if(existing.rowCount)
      return res.status(409).json({error:"ALREADY_APPLIED",message:"You have already applied to this internship."});

    const result=await query(
      `INSERT INTO applications(internship_id,student_id,status)
       VALUES($1,$2,'PENDING')
       RETURNING *`,[internship.id,req.user.id]);
    const app=result.rows[0];

    const student=await query(`SELECT name,email FROM users WHERE id=$1`,[req.user.id]);
    const emailResult=await sendEmail({
      to:student.rows[0].email,
      subject:`Application received — ${internship.title}`,
      html:`<h2>Application received</h2><p>Hello ${student.rows[0].name},</p><p>Your application for <strong>${internship.title}</strong> has been received.</p><p>Status: <strong>PENDING</strong></p>`,
      idempotencyKey:crypto.createHash("sha256").update(`application-submitted:${app.id}`).digest("hex")
    });

    res.status(201).json({application:app,email:emailResult});
  }catch(err){next(err);}
}

async function mine(req,res,next){
  try{
    const result=await query(
      `SELECT a.*,i.title,i.application_deadline,u.name AS company_name
       FROM applications a
       JOIN internships i ON i.id=a.internship_id
       JOIN users u ON u.id=i.company_id
       WHERE a.student_id=$1 ORDER BY a.created_at DESC`,[req.user.id]);
    res.json(result.rows);
  }catch(err){next(err);}
}

async function companyApplications(req,res,next){
  try{
    const result=await query(
      `SELECT a.*,i.title,u.name AS student_name,u.email AS student_email
       FROM applications a
       JOIN internships i ON i.id=a.internship_id
       JOIN users u ON u.id=a.student_id
       WHERE i.company_id=$1 ORDER BY a.created_at DESC`,[req.user.id]);
    res.json(result.rows);
  }catch(err){next(err);}
}

async function updateStatus(req,res,next){
  try{
    const allowed=["UNDER_REVIEW","ACCEPTED","REJECTED"];
    const {status}=req.body;
    if(!allowed.includes(status))
      return res.status(400).json({error:"INVALID_STATUS",message:"Status must be UNDER_REVIEW, ACCEPTED or REJECTED."});

    const result=await query(
      `SELECT a.*,i.title,i.company_id,u.email AS student_email,u.name AS student_name
       FROM applications a
       JOIN internships i ON i.id=a.internship_id
       JOIN users u ON u.id=a.student_id
       WHERE a.id=$1`,[req.params.id]);
    if(!result.rowCount)return res.status(404).json({error:"NOT_FOUND"});
    const application=result.rows[0];
    if(application.company_id !== req.user.id)
      return res.status(403).json({error:"FORBIDDEN",message:"Only the owning company can change this application."});

    const updated=await query(
      `UPDATE applications SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status,req.params.id]);

    const emailResult=await sendEmail({
      to:application.student_email,
      subject:`Application update — ${application.title}`,
      html:`<h2>Application status updated</h2><p>Hello ${application.student_name},</p><p>Your application for <strong>${application.title}</strong> is now <strong>${status}</strong>.</p>`,
      idempotencyKey:crypto.createHash("sha256").update(`application-status:${application.id}:${status}`).digest("hex")
    });

    res.json({application:updated.rows[0],email:emailResult});
  }catch(err){next(err);}
}

module.exports={create,mine,companyApplications,updateStatus};
