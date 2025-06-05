var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
require("dotenv").config();

// User Models
const Student = require("./models/user/student");
const StudentParent = require("./models/user/studentParent");
const Parent = require("./models/user/parent");
const MedicalStaff = require("./models/user/medicalStaff");

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
  .then((db) => {
    console.log("✅ MongoDB Connection Success");
    console.log(`📁 Connected to database: ${db.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
