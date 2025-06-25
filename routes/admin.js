var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator endpoints for managing students, staff, and system settings
 */

// Apply admin authentication middleware to all routes
router.use((req, res, next) => authenticateAdmin(req, res, next));

/**
 * @swagger
 * /admin/students:
 *   post:
 *     summary: Create a new student
 *     description: Create a new student account (admin only)
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentData
 *             properties:
 *               studentData:
 *                 $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authenticated as admin
 *       500:
 *         description: Server error
 */
router.post("/students", adminController.createStudent);

/**
 * @swagger
 * /admin/medical-staff:
 *   post:
 *     summary: Create a new medical staff member
 *     description: Create a new medical staff account (admin only)
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffData
 *             properties:
 *               staffData:
 *                 $ref: '#/components/schemas/MedicalStaff'
 *     responses:
 *       201:
 *         description: Medical staff created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Not authenticated as admin
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */
router.post("/medical-staff", adminController.createMedicalStaff);

/**
 * @swagger
 * /admin/student-parent-relations:
 *   post:
 *     summary: Create a student-parent relationship
 *     description: Create a relationship between a student and parent (admin only)
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - parentId
 *               - relationship
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *               parentId:
 *                 type: string
 *                 description: ID of the parent
 *               relationship:
 *                 type: string
 *                 description: Type of relationship (e.g., Father, Mother)
 *               is_emergency_contact:
 *                 type: boolean
 *                 description: Whether this parent is an emergency contact
 *                 default: false
 *     responses:
 *       201:
 *         description: Relationship created successfully
 *       401:
 *         description: Not authenticated as admin
 *       404:
 *         description: Student or parent not found
 *       409:
 *         description: Relationship already exists
 *       500:
 *         description: Server error
 */
router.post(
  "/student-parent-relations",
  adminController.createStudentParentRelation
);

/**
 * @swagger
 * /admin/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: List of students
 *       401:
 *         description: Not authenticated as admin
 *       500:
 *         description: Server error
 */
router.get("/students", adminController.getStudents);

/**
 * @swagger
 * /admin/medical-staff:
 *   get:
 *     summary: Get all medical staff
 *     description: Retrieve a list of all medical staff members
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: List of medical staff
 *       401:
 *         description: Not authenticated as admin
 *       500:
 *         description: Server error
 */
router.get("/medical-staff", adminController.getMedicalStaff);

/**
 * @swagger
 * /admin/student-parent-relations:
 *   get:
 *     summary: Get all student-parent relationships
 *     description: Retrieve a list of all student-parent relationships
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: List of relationships
 *       401:
 *         description: Not authenticated as admin
 *       500:
 *         description: Server error
 */
router.get(
  "/student-parent-relations",
  adminController.getStudentParentRelations
);

/**
 * @swagger
 * /admin/students/{studentId}:
 *   put:
 *     summary: Update a student
 *     description: Update a student's information
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the student to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       401:
 *         description: Not authenticated as admin
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.put("/students/:studentId", adminController.updateStudent);

/**
 * @swagger
 * /admin/medical-staff/{staffId}:
 *   put:
 *     summary: Update a medical staff member
 *     description: Update a medical staff member's information
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the staff member to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicalStaff'
 *     responses:
 *       200:
 *         description: Medical staff updated successfully
 *       401:
 *         description: Not authenticated as admin
 *       404:
 *         description: Medical staff not found
 *       500:
 *         description: Server error
 */
router.put("/medical-staff/:staffId", adminController.updateMedicalStaff);

/**
 * @swagger
 * /admin/students/{studentId}/deactivate:
 *   put:
 *     summary: Deactivate a student
 *     description: Mark a student as inactive
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the student to deactivate
 *     responses:
 *       200:
 *         description: Student deactivated successfully
 *       401:
 *         description: Not authenticated as admin
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.put(
  "/students/:studentId/deactivate",
  adminController.deactivateStudent
);

/**
 * @swagger
 * /admin/medical-staff/{staffId}/deactivate:
 *   put:
 *     summary: Deactivate a medical staff member
 *     description: Mark a medical staff member as inactive
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the staff member to deactivate
 *     responses:
 *       200:
 *         description: Medical staff deactivated successfully
 *       401:
 *         description: Not authenticated as admin
 *       404:
 *         description: Medical staff not found
 *       500:
 *         description: Server error
 */
router.put(
  "/medical-staff/:staffId/deactivate",
  adminController.deactivateMedicalStaff
);

/**
 * @swagger
 * /admin/student-link/requests:
 *   get:
 *     summary: Get pending parent-student link requests
 *     description: Get all pending link requests between parents and students
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: List of pending link requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   student:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       class_name:
 *                         type: string
 *                   parent:
 *                     type: object
 *                     properties:
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone_number:
 *                         type: string
 *                   relationship:
 *                     type: string
 *                   is_emergency_contact:
 *                     type: boolean
 *                   status:
 *                     type: string
 *                   notes:
 *                     type: string
 *       401:
 *         description: Not authenticated as admin
 *       500:
 *         description: Server error
 */
router.get("/student-link/requests", adminController.getPendingLinkRequests);

/**
 * @swagger
 * /admin/student-link/requests/{requestId}:
 *   put:
 *     summary: Approve or reject a student-parent link request
 *     description: Process a pending link request by approving or rejecting it
 *     tags: [Admin]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         description: ID of the link request
 *         required: true
 *         schema:
 *           type: string
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
 *                 description: Status decision
 *                 enum: [approved, rejected]
 *               notes:
 *                 type: string
 *                 description: Additional notes about the decision
 *     responses:
 *       200:
 *         description: Request processed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authenticated as admin
 *       404:
 *         description: Link request not found
 *       500:
 *         description: Server error
 */
router.put(
  "/student-link/requests/:requestId",
  adminController.respondToLinkRequest
);

module.exports = router;
