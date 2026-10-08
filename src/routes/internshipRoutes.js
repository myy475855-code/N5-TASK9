const router=require("express").Router();
const c=require("../controllers/internshipController");
const {authenticate,authorize}=require("../middleware/auth");
router.get("/",c.list);
router.get("/:id",c.getOne);
router.post("/",authenticate,authorize("company"),c.create);
module.exports=router;
