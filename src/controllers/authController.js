const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");

async function register(req,res,next){
  try{
    const {name,email,password,role="student"} = req.body;
    if(!name || !email || !password || !["student","company"].includes(role))
      return res.status(400).json({error:"VALIDATION_ERROR",message:"name, email, password and valid role are required."});
    const hash = await bcrypt.hash(password,12);
    const result = await query(
      `INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4)
       RETURNING id,name,email,role`,[name,email.toLowerCase(),hash,role]
    );
    res.status(201).json({user:result.rows[0]});
  }catch(err){
    if(err.code==="23505") return res.status(409).json({error:"EMAIL_EXISTS",message:"Email already registered."});
    next(err);
  }
}

async function login(req,res,next){
  try{
    const {email,password}=req.body;
    const result=await query(`SELECT * FROM users WHERE email=$1`,[String(email||"").toLowerCase()]);
    if(!result.rowCount || !(await bcrypt.compare(password,result.rows[0].password_hash)))
      return res.status(401).json({error:"INVALID_CREDENTIALS",message:"Invalid email or password."});
    const user=result.rows[0];
    const token=jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN || "2h", issuer:"talentbridge"});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
  }catch(err){next(err);}
}

module.exports={register,login};
