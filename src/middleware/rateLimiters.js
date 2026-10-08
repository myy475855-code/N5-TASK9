const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX || 5),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test" && process.env.TEST_RATE_LIMIT !== "true",
  message: { error: "RATE_LIMITED", message: "Too many login attempts. Please try again later." }
});

module.exports = { loginLimiter };
