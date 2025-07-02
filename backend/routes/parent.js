var express = require("express");
var router = express.Router();
const parentController = require("../controllers/parentController");
const { authenticateParent } = require("../middleware/auth"); // Import the parent authentication middleware

/**
 * Parent Routes
 *
 * AUTHENTICATION NOTE:
 * All parent routes should be protected with authenticateParent middleware.
 * This ensures that only authenticated parents can access these endpoints.
 *
 * All routes use JWT authentication instead of parent ID in URL. The parent ID is
 * automatically extracted from the JWT token in the authentication middleware.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthProfile:
 *       type: object
 *       properties:
 *         student:
 *           type: string
 *           description: Reference to student ID
 *         allergies:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [Mild, Moderate, Severe]
 *               notes:
 *                 type: string
 *         chronicDiseases:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               diagnosedDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Active, Managed, Resolved]
 *               notes:
 *                 type: string
 *         vision:
 *           type: object
 *           properties:
 *             leftEye:
 *               type: number
 *             rightEye:
 *               type: number
 *             lastCheckDate:
 *               type: string
 *               format: date
 *         hearing:
 *           type: object
 *           properties:
 *             leftEar:
 *               type: string
 *               enum: [Normal, Mild Loss, Moderate Loss, Severe Loss]
 *             rightEar:
 *               type: string
 *               enum: [Normal, Mild Loss, Moderate Loss, Severe Loss]
 *             lastCheckDate:
 *               type: string
 *               format: date
 *
 *     MedicineRequest:
 *       type: object
 *       required:
 *         - student
 *         - created_by
 *         - startDate
 *         - endDate
 *         - medicines
 *       properties:
 *         student:
 *           type: string
 *           description: Reference to student ID
 *         created_by:
 *           type: string
 *           description: Reference to parent ID
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         medicines:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               notes:
 *                 type: string
 */

/**
 * @swagger
 * /parent/profile:
 *   get:
 *     summary: Get authenticated parent profile
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent profile data
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Parent not found
 */
router.get("/profile", authenticateParent, parentController.getParentProfile);

/**
 * @swagger
 * /parent/students:
 *   get:
 *     summary: Get students related to authenticated parent
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of related students
 *       401:
 *         description: Not authenticated
 */
router.get(
  "/students",
  authenticateParent,
  parentController.getRelatedStudents
);

/**
 * @swagger
 * /parent/students/{studentId}/health-profile:
 *   get:
 *     summary: Get student health profile
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Student health profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthProfile'
 *       403:
 *         description: Not authorized to access this student's data
 *       404:
 *         description: Health profile not found
 */
router.get(
  "/students/:studentId/health-profile",
  authenticateParent,
  parentController.getStudentHealthProfile
);

/**
 * @swagger
 * /parent/students/{studentId}/health-profile:
 *   put:
 *     summary: Update student health profile
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthProfile'
 *     responses:
 *       200:
 *         description: Updated health profile
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to update this student's data
 */
router.put(
  "/students/:studentId/health-profile",
  authenticateParent,
  parentController.updateHealthProfile
);

/**
 * @swagger
 * /parent/students/{studentId}/medicine-requests:
 *   post:
 *     summary: Create medicine request for a student
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - medicines
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - dosage
 *                     - frequency
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created medicine request
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to create medicine requests for this student
 */
router.post(
  "/students/:studentId/medicine-requests",
  authenticateParent,
  parentController.createMedicineRequest
);

/**
 * @swagger
 * /parent/medicine-requests:
 *   get:
 *     summary: Get all medicine requests created by authenticated parent
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medicine requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicineRequest'
 */
router.get(
  "/medicine-requests",
  authenticateParent,
  parentController.getMedicineRequests
);

/**
 * @swagger
 * /parent/students/{studentId}/medicine-requests:
 *   get:
 *     summary: Get medicine requests for a specific student
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: List of student-specific medicine requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicineRequest'
 *       403:
 *         description: Not authorized to access this student's data
 */
router.get(
  "/students/:studentId/medicine-requests",
  authenticateParent,
  parentController.getMedicineRequests
);

/**
 * @swagger
 * /parent/students/{studentId}/medical-events:
 *   get:
 *     summary: Get medical events for a student
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: List of medical events for the student
 */
router.get(
  "/students/:studentId/medical-events",
  authenticateParent,
  parentController.getMedicalEvents
);

/**
 * @swagger
 * /parent/campaigns:
 *   get:
 *     summary: Get campaigns for authenticated parent's students
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get("/campaigns", authenticateParent, parentController.getCampaigns);

/**
 * @swagger
 * /parent/students/{studentId}/campaigns/{campaignId}/consent:
 *   put:
 *     summary: Update campaign consent
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *       - in: path
 *         name: campaignId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the campaign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Approved, Declined]
 *                 description: Consent status
 *               notes:
 *                 type: string
 *                 description: Optional notes
 *     responses:
 *       200:
 *         description: Updated consent
 *       403:
 *         description: Not authorized to update consent for this student
 */
router.put(
  "/students/:studentId/campaigns/:campaignId/consent",
  authenticateParent,
  parentController.updateCampaignConsent
);

/**
 * @swagger
 * /parent/students/{studentId}/campaign-results:
 *   get:
 *     summary: Get campaign results for a student
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: List of campaign results for the student
 */
router.get(
  "/students/:studentId/campaign-results",
  authenticateParent,
  parentController.getCampaignResults
);

/**
 * @swagger
 * /parent/consultation-schedules:
 *   get:
 *     summary: Get consultation schedules for authenticated parent
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of consultation schedules
 */
router.get(
  "/consultation-schedules",
  authenticateParent,
  parentController.getConsultationSchedules
);

/**
 * @swagger
 * /parent/student-link/request:
 *   post:
 *     summary: Request to link with a student
 *     description: Parents can request to be linked with a student with specific fields
 *     tags: [Parent]
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
 *               - relationship
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The ID of the student to link with
 *                 example: "60d21b4667d0d8992e610c85"
 *               relationship:
 *                 type: string
 *                 description: The relationship between parent and student
 *                 example: "Father"
 *               is_emergency_contact:
 *                 type: boolean
 *                 description: Whether the parent is an emergency contact
 *                 example: true
 *               notes:
 *                 type: string
 *                 description: Additional notes to help verify the relationship
 *                 example: "I am the biological father of the student"
 *     responses:
 *       201:
 *         description: Link request submitted successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.post(
  "/student-link/request",
  authenticateParent,
  parentController.requestStudentLink
);

/**
 * @swagger
 * /parent/student-link/requests:
 *   get:
 *     summary: Get link requests status
 *     description: Parents can check the status of their student link requests
 *     tags: [Parent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of link requests
 *       500:
 *         description: Server error
 */
router.get(
  "/student-link/requests",
  authenticateParent,
  parentController.getLinkRequests
);

module.exports = router;
