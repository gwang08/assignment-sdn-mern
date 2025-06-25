const authService = require("../services/authService");

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { userData, userType } = req.body;

      // Validate required fields based on user type
      const requiredFields = {
        parent: [
          "first_name",
          "last_name",
          "username",
          "password",
          "email",
          "phone_number",
        ],
        medicalStaff: [
          "first_name",
          "last_name",
          "username",
          "password",
          "email",
          "phone_number",
          "role",
        ],
        student: ["first_name", "last_name", "class_name"],
      };

      const missingFields = requiredFields[userType]?.filter(
        (field) => !userData[field]
      );

      if (missingFields?.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const user = await authService.register(userData, userType);

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === 11000) {
        // MongoDB duplicate key error
        return res.status(400).json({
          success: false,
          message: "Username or email already exists",
        });
      }

      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Login a user
   */
  async login(req, res) {
    try {
      const { username, password, userType } = req.body;

      if (!username || !password || !userType) {
        return res.status(400).json({
          success: false,
          message: "Please provide username, password, and user type",
        });
      }

      const result = await authService.login(username, password, userType);

      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      // Handle authentication errors
      if (
        error.message === "User not found" ||
        error.message === "Invalid credentials"
      ) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res) {
    try {
      // User is already available in req due to authenticate middleware
      res.status(200).json({ success: true, data: req.user });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide current and new password",
        });
      }

      await authService.changePassword(
        req.user._id,
        req.userType,
        currentPassword,
        newPassword
      );

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);

      if (error.message === "Current password is incorrect") {
        return res.status(400).json({ success: false, message: error.message });
      }

      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

module.exports = new AuthController();
