var express = require("express")
var router = express.Router()
const MedicalStaff = require("../models/user/medicalStaff")
const NurseController = require("../controllers/nurseController")

// Middleware to check if user is medical staff
const checkMedicalStaff = async (req, res, next) => {
    const nurseId = req.headers["nurse-id"] || req.query.nurseId

    if (!nurseId) {
        return res.status(401).json({ error: "Nurse authentication required" })
    }

    try {
        const nurse = await MedicalStaff.findById(nurseId)
        if (!nurse || !nurse.is_active) {
            return res.status(401).json({ error: "Invalid nurse credentials" })
        }
        req.nurse = nurse
        next()
    } catch (error) {
        res.status(500).json({ error: "Authentication error" })
    }
}

// Apply middleware to all routes
router.use(checkMedicalStaff)

/* Dashboard Routes */
router.get("/", NurseController.getDashboard)

/* Medical Events Management Routes */
router.get("/medical-events", NurseController.getMedicalEvents)
router.post("/medical-events", NurseController.createMedicalEvent)

/* Medicine & Supplies Management Routes */
router.get("/medicine-requests", NurseController.getMedicineRequests)
router.get("/medicine-inventory", NurseController.getMedicineInventory)

/* Vaccination Management Routes */
router.get("/vaccination-campaigns", NurseController.getVaccinationCampaigns)
router.post("/vaccination-campaigns", NurseController.createVaccinationCampaign)
router.get("/vaccination-campaigns/:campaignId/results", NurseController.getVaccinationResults)
router.post("/vaccination-campaigns/:campaignId/results", NurseController.createVaccinationResult)

/* Periodic Health Check Management Routes */
router.get("/health-check-campaigns", NurseController.getHealthCheckCampaigns)
router.post("/health-check-campaigns", NurseController.createHealthCheckCampaign)
router.get("/health-check-campaigns/:campaignId/results", NurseController.getHealthCheckResults)
router.post("/health-check-campaigns/:campaignId/results", NurseController.createHealthCheckResult)

/* Consultation Management Routes */
router.get("/consultations", NurseController.getConsultations)

/* Student Health Records Management Routes */
router.get("/students", NurseController.getStudents)
router.get("/students/:studentId/health-profile", NurseController.getStudentHealthProfile)
router.put("/students/:studentId/health-profile", NurseController.updateStudentHealthProfile)
router.get("/students/:studentId/medical-history", NurseController.getStudentMedicalHistory)

module.exports = router
