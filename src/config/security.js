require("dotenv").config();

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

module.exports = {
  allowedOrigin,
  corsOptions: {
    origin(origin, callback) {
      if (!origin || origin === allowedOrigin) return callback(null, true);
      return callback(new Error("CORS origin denied"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: false
  },
  jwtExpiresIn: "2h"
};
