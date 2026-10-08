const cron=require("node-cron");
const {closeExpiredInternships}=require("../services/businessRules");

function startDeadlineJob(){
  cron.schedule("* * * * *",async()=>{
    try{await closeExpiredInternships();}
    catch(err){console.error("[DEADLINE JOB]",err);}
  });
}
module.exports={startDeadlineJob};
