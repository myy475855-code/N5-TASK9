const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { issuer: "talentbridge" });
    next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid or expired token." });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "FORBIDDEN", message: "You do not have permission for this action." });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
