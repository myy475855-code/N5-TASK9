const router=require("express").Router();
const c=require("../controllers/applicationController");
const {authenticate,authorize}=require("../middleware/auth");
router.post("/",authenticate,authorize("student"),c.create);
router.get("/mine",authenticate,authorize("student"),c.mine);
router.get("/company",authenticate,authorize("company"),c.companyApplications);
router.patch("/:id/status",authenticate,authorize("company"),c.updateStatus);
module.exports=router;
