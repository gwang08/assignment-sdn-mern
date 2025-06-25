const authService = require("../services/authService");

/**
 * Authentication middleware
 * @param {Array} allowedUserTypes - Array of allowed user types
 * @returns {Function} - Express middleware function
 */
const authenticate = (allowedUserTypes = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header("x-auth-token");

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "No token, authorization denied" });
      }

      try {
        // Verify token
        const { user, decoded } = await authService.verifyToken(token);

        // Check if user type is allowed
        if (
          allowedUserTypes.length > 0 &&
          !allowedUserTypes.includes(decoded.type)
        ) {
          return res
            .status(403)
            .json({ success: false, message: "Access denied" });
        }

        // Set user in request object
        req.user = user;
        req.userType = decoded.type;
        next();
      } catch (err) {
        return res
          .status(401)
          .json({ success: false, message: "Token is not valid" });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
};

/**
 * Parent authentication middleware
 */
const authenticateParent = authenticate(["parent"]);

/**
 * Medical staff authentication middleware
 */
const authenticateMedicalStaff = authenticate(["medicalStaff"]);

/**
 * Student authentication middleware
 */
const authenticateStudent = authenticate(["student"]);

/**
 * Admin authentication middleware
 */
const authenticateAdmin = authenticate(["admin"]);

/**
 * Any authenticated user middleware
 */
const authenticateAny = authenticate([
  "parent",
  "medicalStaff",
  "student",
  "admin",
]);

module.exports = {
  authenticate,
  authenticateParent,
  authenticateMedicalStaff,
  authenticateStudent,
  authenticateAdmin,
  authenticateAny,
};
