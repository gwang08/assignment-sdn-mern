var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");
require("dotenv").config();

// Import Swagger configuration
const swagger = require("./swagger");
const initializeAdmin = require("./utils/initializeAdmin");

// User Models
const User = require("./models/user/user");
const StudentParent = require("./models/user/studentParent");

// Health Models
const HealthProfile = require("./models/healthProfile");

// Campaign Models
const Campaign = require("./models/campaign/campaign");
const CampaignResult = require("./models/campaign/campaignResult");
const CampaignConsent = require("./models/campaign/campaignConsent");
const ConsultationSchedule = require("./models/campaign/consultationSchedule");

const mongoUrl =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/assigment-sdn";

// Mongoose connection
mongoose
  .connect(mongoUrl)
  .then(async (db) => {
    console.log("✅ MongoDB Connection Success");
    console.log(`📁 Connected to database: ${db.connection.name}`);

    // Initialize admin manager
    await initializeAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var nurseRouter = require("./routes/nurse");
var parentRouter = require("./routes/parent"); // Add the parent router
var authRouter = require("./routes/auth"); // Add the auth router for authentication
var adminRouter = require("./routes/admin"); // Add the admin router

var app = express();

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3001", // Allow requests from frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"], // Allowed headers
    credentials: true, // Allow cookies and credentials
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Setup Swagger
app.use("/api-docs", swagger.serve, swagger.setup);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/nurse", nurseRouter);
app.use("/parent", parentRouter); // Use the parent router
app.use("/auth", authRouter); // Add authentication routes
app.use("/admin", adminRouter); // Use the admin router

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler - returns JSON
app.use(function (err, req, res, next) {
  const statusCode = err.status || 500;
  const errorResponse = {
    success: false,
    message: err.message || "Server error",
  };

  // Include stack trace in development
  if (req.app.get("env") === "development") {
    errorResponse.stack = err.stack;
  }

  // Return JSON error response
  res.status(statusCode).json(errorResponse);
});

module.exports = app;
