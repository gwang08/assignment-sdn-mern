const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Parent = require("../models/user/parent");
const MedicalStaff = require("../models/user/medicalStaff");
const Student = require("../models/user/student");
const Admin = require("../models/user/admin");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-jwt-key";
const JWT_EXPIRES_IN = "24h";

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data
   * @param {String} userType - Type of user: 'parent', 'medicalStaff', 'student', 'admin'
   * @param {String} userRole - Optional role for the user (only for admin)
   * @param {Boolean} isPublicRegistration - Whether this is a public registration or admin-created
   * @returns {Promise<Object>} - Registered user
   */
  async register(
    userData,
    userType,
    userRole = null,
    isPublicRegistration = true
  ) {
    try {
      // For public registration, only allow parent registration
      if (isPublicRegistration && userType !== "parent") {
        throw new Error("Public registration is only available for parents");
      }

      // Hash password
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      let newUser;

      // Create user based on type
      switch (userType) {
        case "parent":
          newUser = new Parent(userData);
          break;
        case "medicalStaff":
          // Staff can only be created by admins, not public registration
          if (isPublicRegistration) {
            throw new Error(
              "Staff accounts can only be created by administrators"
            );
          }
          newUser = new MedicalStaff(userData);
          break;
        case "student":
          // Students can only be created by admins, not public registration
          if (isPublicRegistration) {
            throw new Error(
              "Student accounts can only be created by administrators"
            );
          }
          newUser = new Student(userData);
          break;
        case "admin":
          // Admin accounts can only be created by other admins
          if (isPublicRegistration) {
            throw new Error(
              "Admin accounts can only be created by super administrators"
            );
          }

          // Set role if provided
          if (userRole) {
            userData.role = userRole;
          }

          newUser = new Admin(userData);
          break;
        default:
          throw new Error("Invalid user type");
      }

      await newUser.save();

      // Remove password from response
      newUser = newUser.toObject();
      delete newUser.password;

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login a user
   * @param {String} username - Username
   * @param {String} password - Password
   * @param {String} userType - Type of user: 'parent', 'medicalStaff', 'student', 'admin'
   * @returns {Promise<Object>} - User with token
   */
  async login(username, password, userType) {
    try {
      let user;

      // Find user based on type
      switch (userType) {
        case "parent":
          user = await Parent.findOne({ username, is_active: true });
          break;
        case "medicalStaff":
          user = await MedicalStaff.findOne({ username, is_active: true });
          break;
        case "student":
          user = await Student.findOne({ username, is_active: true });
          break;
        case "admin":
          user = await Admin.findOne({ username });
          break;
        default:
          throw new Error("Invalid user type");
      }

      if (!user) {
        throw new Error("User not found");
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Add role to token payload for admin users
      const tokenPayload = { id: user._id, type: userType };

      if (userType === "admin") {
        tokenPayload.role = user.role;
      }

      // Create JWT token
      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // Remove password from response
      user = user.toObject();
      delete user.password;

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Promise<Object>} - Decoded token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      let user;

      // Find user based on type
      switch (decoded.type) {
        case "parent":
          user = await Parent.findById(decoded.id).select("-password");
          break;
        case "medicalStaff":
          user = await MedicalStaff.findById(decoded.id).select("-password");
          break;
        case "student":
          user = await Student.findById(decoded.id).select("-password");
          break;
        case "admin":
          user = await Admin.findById(decoded.id).select("-password");
          break;
        default:
          throw new Error("Invalid user type");
      }

      if (!user || (decoded.type !== "admin" && !user.is_active)) {
        throw new Error("User not found or inactive");
      }

      return { user, decoded };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} userType - Type of user
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>} - Success status
   */
  async changePassword(userId, userType, currentPassword, newPassword) {
    try {
      let user;

      // Find user based on type
      switch (userType) {
        case "parent":
          user = await Parent.findById(userId);
          break;
        case "medicalStaff":
          user = await MedicalStaff.findById(userId);
          break;
        case "student":
          user = await Student.findById(userId);
          break;
        default:
          throw new Error("Invalid user type");
      }

      if (!user) {
        throw new Error("User not found");
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
