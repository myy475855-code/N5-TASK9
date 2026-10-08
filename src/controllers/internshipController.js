const {query}=require("../config/db");
const {assertPostingLimit,closeExpiredInternships}=require("../services/businessRules");

async function list(req,res,next){
  try{
    await closeExpiredInternships();
    const result=await query(
      `SELECT i.*,u.name AS company_name
       FROM internships i JOIN users u ON u.id=i.company_id
       ORDER BY i.created_at DESC`);
    res.json(result.rows);
  }catch(err){next(err);}
}

async function create(req,res,next){
  try{
    const {title,description,application_deadline}=req.body;
    if(!title||!description||!application_deadline)
      return res.status(400).json({error:"VALIDATION_ERROR",message:"title, description and application_deadline are required."});
    const deadline=new Date(application_deadline);
    if(Number.isNaN(deadline.getTime()) || deadline <= new Date())
      return res.status(400).json({error:"INVALID_DEADLINE",message:"Deadline must be a future date."});

    await assertPostingLimit(req.user.id);
    const result=await query(
      `INSERT INTO internships(company_id,title,description,application_deadline,status)
       VALUES($1,$2,$3,$4,'OPEN')
       RETURNING *`,[req.user.id,title,description,deadline.toISOString()]);
    res.status(201).json(result.rows[0]);
  }catch(err){next(err);}
}

async function getOne(req,res,next){
  try{
    await closeExpiredInternships();
    const result=await query(
      `SELECT i.*,u.name AS company_name FROM internships i
       JOIN users u ON u.id=i.company_id WHERE i.id=$1`,[req.params.id]);
    if(!result.rowCount)return res.status(404).json({error:"NOT_FOUND"});
    res.json(result.rows[0]);
  }catch(err){next(err);}
}

module.exports={list,create,getOne};
