function errorHandler(err,req,res,next){
  console.error(`[ERROR] ${new Date().toISOString()}`,err);
  if(res.headersSent) return next(err);
  res.status(500).json({error:"INTERNAL_SERVER_ERROR",message:"An unexpected error occurred."});
}
module.exports = errorHandler;
