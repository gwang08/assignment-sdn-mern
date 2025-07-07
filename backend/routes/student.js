const express = require("express");
const router = express.Router();
const {
  getStudentHealthProfile,
  getStudentMedicalEvents,
} = require("../controllers/studentController");
const { authenticateStudent } = require("../middleware/auth");

// GET /api/student/health-profile
router.get("/health-profile", authenticateStudent, getStudentHealthProfile);
router.get("/medical-events", authenticateStudent, getStudentMedicalEvents);

module.exports = router;
