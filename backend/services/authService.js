const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user/user");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-jwt-key";
const JWT_EXPIRES_IN = "24h";

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data
   * @param {String} userType - Type of user: 'parent', 'medicalStaff', 'student', 'admin'
   * @param {String} userRole - Optional role for the user (only for admin/staff)
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

      // Set the role in the userData
      userData.role = userType;

      // For medical staff, set staff_role if provided
      if (userType === "medicalStaff" && userRole) {
        userData.staff_role = userRole;
      }

      // Hash password
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Create new user with unified User model
      let newUser = new User(userData);
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
   * @returns {Promise<Object>} - User with token
   */
  async login(username, password) {
    try {
      // Find user with specified username regardless of role
      let user = await User.findOne({
        username,
        is_active: true,
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Update last login time
      user.last_login = new Date();
      await user.save();

      // Create token payload with user ID and role
      const tokenPayload = {
        id: user._id,
        type: user.role, // Keep 'type' for backwards compatibility
      };

      // Add role-specific information to token payload
      // Add role-specific fields to the token
      if (user.role === "medicalStaff" && user.staff_role) {
        tokenPayload.staff_role = user.staff_role;
      }

      // Create JWT token
      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // Get role-specific data before converting to plain object
      const userData = user.getRoleData();

      // Remove password if it's somehow still there
      if (userData.password) {
        delete userData.password;
      }

      return { user: userData, token };
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

      // Find user from unified User model
      const user = await User.findOne({
        _id: decoded.id,
        role: decoded.type, // Ensure the role matches the token type
      }).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is active (except admins)
      if (decoded.type !== "admin" && !user.is_active) {
        throw new Error("User account is inactive");
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
      // Find user with the specified ID and role
      const user = await User.findOne({
        _id: userId,
        role: userType,
      });

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
