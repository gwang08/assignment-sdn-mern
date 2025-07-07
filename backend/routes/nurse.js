var express = require("express");
var router = express.Router();
const NurseController = require("../controllers/nurseController");
const { authenticateMedicalStaff } = require("../middleware/auth"); // Import the JWT medical staff authentication middleware

/**
 * @swagger
 * components:
 *  schemas:
 *    MedicalEvent:
 *      type: object
 *      required:
 *        - student
 *        - created_by
 *        - event_type
 *        - description
 *        - severity
 *      properties:
 *        _id:
 *          type: string
 *          description: Auto-generated MongoDB ID
 *        student:
 *          type: string
 *          description: Reference to student ID
 *        created_by:
 *          type: string
 *          description: Reference to medical staff ID
 *        event_type:
 *          type: string
 *          enum: [Accident, Fever, Injury, Epidemic, Other]
 *          description: Type of medical event
 *        description:
 *          type: string
 *          description: Detailed description of the event
 *        severity:
 *          type: string
 *          enum: [Low, Medium, High, Emergency]
 *          description: Severity level of the event
 *        status:
 *          type: string
 *          enum: [Open, In Progress, Resolved, Referred to Hospital]
 *          description: Current status of the event
 *        symptoms:
 *          type: array
 *          items:
 *            type: string
 *          description: List of symptoms observed
 *        occurred_at:
 *          type: string
 *          format: date-time
 *          description: When the event occurred
 *        resolved_at:
 *          type: string
 *          format: date-time
 *          description: When the event was resolved
 *        treatment_notes:
 *          type: string
 *          description: Notes on treatment provided
 *        medications_administered:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              dosage:
 *                type: string
 *              time:
 *                type: string
 *                format: date-time
 *              administered_by:
 *                type: string
 *                description: Reference to medical staff ID
 *        parent_notified:
 *          type: object
 *          properties:
 *            status:
 *              type: boolean
 *              default: false
 *            time:
 *              type: string
 *              format: date-time
 *            method:
 *              type: string
 *        follow_up_required:
 *          type: boolean
 *          default: false
 *        follow_up_notes:
 *          type: string
 *      example:
 *        _id: "60d2fb7e1234567890123460"
 *        student: "60d2fb7e1234567890123457"
 *        created_by: "60d2fb7e1234567890123456"
 *        event_type: "Fever"
 *        description: "Student had a temperature of 38.5°C"
 *        severity: "Medium"
 *        status: "Open"
 *        symptoms: ["High temperature", "Headache"]
 *        occurred_at: "2025-06-25T08:30:00Z"
 *        treatment_notes: "Given paracetamol and rested"
 *        parent_notified: { status: true, time: "2025-06-25T08:45:00Z", method: "Phone call" }
 *        follow_up_required: false
 */

// Apply JWT authentication middleware to all routes
router.use(authenticateMedicalStaff);

/* Dashboard Routes */
router.get("/", NurseController.getDashboard);

/**
 * @swagger
 * /nurse/medical-events:
 *   get:
 *     summary: Retrieve all medical events
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medical events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicalEvent'
 *       500:
 *         description: Server error
 */
router.get("/medical-events", NurseController.getMedicalEvents);

/**
 * @swagger
 * /nurse/medical-events:
 *   post:
 *     summary: Create a new medical event
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - event_type
 *               - description
 *               - severity
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *               event_type:
 *                 type: string
 *                 enum: [Accident, Fever, Injury, Epidemic, Other]
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High, Emergency]
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               treatment_notes:
 *                 type: string
 *               follow_up_required:
 *                 type: boolean
 *               follow_up_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medical event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalEvent'
 *       400:
 *         description: Invalid input
 */
router.post("/medical-events", NurseController.createMedicalEvent);

/**
 * @swagger
 * /nurse/medical-events/{eventId}:
 *   get:
 *     summary: Get a specific medical event by ID
 *     tags: [Nurse]
 *     security:
 *       - nurseAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the medical event
 *     responses:
 *       200:
 *         description: Medical event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalEvent'
 *       404:
 *         description: Medical event not found
 */
router.get("/medical-events/:eventId", NurseController.getMedicalEvent);

/**
 * @swagger
 * /nurse/medical-events/{eventId}:
 *   put:
 *     summary: Update a medical event
 *     tags: [Nurse]
 *     security:
 *       - nurseAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the medical event
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_type:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *               status:
 *                 type: string
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               treatment_notes:
 *                 type: string
 *               follow_up_required:
 *                 type: boolean
 *               follow_up_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated medical event
 *       404:
 *         description: Medical event not found
 */
router.put("/medical-events/:eventId", NurseController.updateMedicalEvent);

/**
 * @swagger
 * /nurse/medical-events/{eventId}/resolve:
 *   put:
 *     summary: Mark a medical event as resolved
 *     tags: [Nurse]
 *     security:
 *       - nurseAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the medical event
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               treatment_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resolved medical event
 *       404:
 *         description: Medical event not found
 */
router.put("/medical-events/:eventId/resolve", NurseController.resolveEvent);

/**
 * @swagger
 * /nurse/medical-events/{eventId}/medications:
 *   post:
 *     summary: Add medication to a medical event
 *     tags: [Nurse]
 *     security:
 *       - nurseAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the medical event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dosage
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated medical event with new medication
 *       404:
 *         description: Medical event not found
 */
router.post(
  "/medical-events/:eventId/medications",
  NurseController.addMedication
);

/**
 * @swagger
 * /nurse/medical-events/{eventId}/notify-parent:
 *   put:
 *     summary: Update parent notification status
 *     tags: [Nurse]
 *     security:
 *       - nurseAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the medical event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *               method:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated medical event with notification status
 *       404:
 *         description: Medical event not found
 */
router.put(
  "/medical-events/:eventId/notify-parent",
  NurseController.updateParentNotification
);

/* Medicine & Supplies Management Routes */
router.get("/medicine-requests", NurseController.getMedicineRequests);
router.get("/medicine-inventory", NurseController.getMedicineInventory);
router.put("/medicine-requests/:requestId/status", NurseController.updateMedicineRequestStatus);

/* General Campaign Management Routes */
router.get("/campaigns", authenticateMedicalStaff, NurseController.getCampaigns);
router.post("/campaigns", authenticateMedicalStaff, NurseController.createCampaign);
router.put("/campaigns/:campaignId", authenticateMedicalStaff, NurseController.updateCampaign);
router.get("/campaigns/:campaignId/consents", authenticateMedicalStaff, NurseController.getCampaignConsents);
router.get("/campaigns/:campaignId/results", authenticateMedicalStaff, NurseController.getCampaignResults);
router.post("/campaign-results", authenticateMedicalStaff, NurseController.submitCampaignResult);
router.get("/consultation-schedules", NurseController.getConsultationSchedules);
router.post("/consultation-schedules/check-overlap", authenticateMedicalStaff, NurseController.checkConsultationOverlap);

/* Vaccination Management Routes */
router.get("/vaccination-campaigns", NurseController.getVaccinationCampaigns);
router.post(
  "/vaccination-campaigns",
  NurseController.createVaccinationCampaign
);
router.put(
  "/vaccination-campaigns/:campaignId/status",
  NurseController.updateCampaignStatus
);
router.get(
  "/vaccination-campaigns/:campaignId/results",
  NurseController.getVaccinationResults
);
router.post(
  "/vaccination-campaigns/:campaignId/results",
  NurseController.createVaccinationResult
);
router.get(
  "/vaccination-campaigns/:campaignId/list",
  NurseController.getVaccinationList
);
router.post(
  "/vaccination-campaigns/:campaignId/record",
  NurseController.recordVaccination
);
router.post(
  "/vaccination-campaigns/:campaignId/create-consents",
  NurseController.createConsentNotificationsForCampaign
);
router.put(
  "/vaccination-results/:resultId/follow-up",
  NurseController.updateVaccinationFollowUp
);
router.get(
  "/vaccination-statistics",
  NurseController.getVaccinationStatistics
);

/* Periodic Health Check Management Routes */
router.get("/health-check-campaigns", NurseController.getHealthCheckCampaigns);
router.post(
  "/health-check-campaigns",
  NurseController.createHealthCheckCampaign
);
router.get(
  "/health-check-campaigns/:campaignId/results",
  NurseController.getHealthCheckResults
);
router.post(
  "/health-check-campaigns/:campaignId/results",
  NurseController.createHealthCheckResult
);

/* Consultation Management Routes */
router.get("/consultations", NurseController.getConsultations);
router.post("/consultation-schedules", authenticateMedicalStaff, NurseController.createConsultationSchedule);

/* Medical Staff Management Routes */
router.get("/medical-staff", NurseController.getMedicalStaff);

/* Student-Parent Relations Routes */
router.get("/student-parent-relations", authenticateMedicalStaff, NurseController.getStudentParentRelations);

/* Student Health Records Management Routes */
router.get("/students", authenticateMedicalStaff, NurseController.getStudents);
router.get(
  "/students/:studentId/health-profile",
  NurseController.getStudentHealthProfile
);
router.put(
  "/students/:studentId/health-profile",
  NurseController.updateStudentHealthProfile
);
router.get(
  "/students/:studentId/medical-history",
  NurseController.getStudentMedicalHistory
);

module.exports = router;
