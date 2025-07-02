var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const { authenticateAny } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT token to use for authenticated requests
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjM0NTY3ODkwMSIsInR5cGUiOiJwYXJlbnQiLCJpYXQiOjE2MjA1MzYwMDAsImV4cCI6MTYyMDYyMjQwMH0.example-token
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *       example:
 *         success: true
 *         data:
 *           token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjM0NTY3ODkwMSIsInR5cGUiOiJwYXJlbnQiLCJpYXQiOjE2MjA1MzYwMDAsImV4cCI6MTYyMDYyMjQwMH0.example-token"
 *           user:
 *             _id: "612345678901"
 *             username: "parent_user"
 *             first_name: "John"
 *             last_name: "Doe"
 *             email: "john.doe@example.com"
 *
 * tags:
 *   name: Authentication
 *   description: User authentication, registration and account management endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new parent, medical staff or student user. Different fields are required based on the user type.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userData
 *               - userType
 *             properties:
 *               userData:
 *                 type: object
 *                 required:
 *                   - username
 *                   - password
 *                   - first_name
 *                   - last_name
 *                   - email
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: Unique username for login
 *                     example: "parent_user"
 *                   password:
 *                     type: string
 *                     description: Strong password (will be hashed)
 *                     example: "SecureP@ss123"
 *                   first_name:
 *                     type: string
 *                     example: "John"
 *                   last_name:
 *                     type: string
 *                     example: "Doe"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "john.doe@example.com"
 *                   phone_number:
 *                     type: string
 *                     example: "1234567890"
 *                   role:
 *                     type: string
 *                     description: User role
 *                     enum: ["parent", "student", "medicalStaff", "admin"]
 *                     example: "parent"
 *                   staff_role:
 *                     type: string
 *                     description: Required when role is medicalStaff
 *                     enum: ["Nurse", "Doctor", "Healthcare Assistant"]
 *                     example: "Nurse"
 *                   class_name:
 *                     type: string
 *                     description: Required for student user type
 *                     example: "Class 5A"
 *               userType:
 *                 type: string
 *                 description: Type of user to create (this maps to the role field in the unified User model)
 *                 enum: ["parent"]
 *                 example: "parent"
 *                 default: "parent"
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: User data (without password)
 *       400:
 *         description: Missing required fields or duplicate user
 *       500:
 *         description: Server error
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate a user and retrieve a JWT token for subsequent API calls
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "parent_user"
 *               password:
 *                 type: string
 *                 example: "SecureP@ss123"
 *     responses:
 *       200:
 *         description: User successfully logged in with JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please provide username and password"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Fetch the currently authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "612345678901"
 *                     username:
 *                       type: string
 *                       example: "parent_user"
 *                     first_name:
 *                       type: string
 *                       example: "John"
 *                     last_name:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get("/me", authenticateAny, authController.getCurrentUser);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the current user's password (requires authentication)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 description: User's new password
 *                 example: "NewSecureP@ss456"
 *     responses:
 *       200:
 *         description: Password successfully changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Current password is incorrect"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.post("/change-password", authenticateAny, authController.changePassword);

module.exports = router;
