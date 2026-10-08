require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const errorHandler = require("./middleware/errors");
const { startDeadlineJob } = require("./jobs/deadlineJob");
const { corsOptions } = require("./config/security");

if (!process.env.JWT_SECRET) console.warn("WARNING: JWT_SECRET is not configured.");

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "talentbridge" }));
app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/docs", express.static(path.join(__dirname, "docs")));
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  startDeadlineJob();
}

module.exports = app;
