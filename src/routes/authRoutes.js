const router = require("express").Router();
const c = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiters");
router.post("/register", c.register);
router.post("/login", loginLimiter, c.login);
module.exports = router;
