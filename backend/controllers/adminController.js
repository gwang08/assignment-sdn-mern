const User = require("../models/user/user");
const StudentParent = require("../models/user/studentParent");
const HealthProfile = require("../models/healthProfile");
const bcrypt = require("bcryptjs");

class AdminController {
  /**
   * Generate a unique username for a student
   * Format: lastname + initials + ddMMyy (e.g., tannp250501 for "Nguyen Phuc Tan" born on 25/05/2001)
   * Takes last word of last name + first letter of each other word in full name + birth date
   * If duplicate exists, adds a _number suffix
   */
  static async generateUniqueUsername(firstName, lastName, dateOfBirth) {
    // Split full name into parts
    const firstNameParts = firstName.split(" ");
    const lastNameParts = lastName.split(" ");

    // Get the last word of the last name
    const actualLastName = lastNameParts[lastNameParts.length - 1];

    // Get initials from all other words (both from first name and last name)
    const otherParts = [...lastNameParts.slice(0, -1), ...firstNameParts];
    const initials = otherParts
      .map((part) => part.charAt(0).toLowerCase())
      .join("");

    // Format birth date as ddMMyy
    const birthDate = new Date(dateOfBirth);
    const day = birthDate.getDate().toString().padStart(2, "0");
    const month = (birthDate.getMonth() + 1).toString().padStart(2, "0");
    const year = birthDate.getFullYear().toString().slice(-2);

    // Create base username: lowercase of lastname + all initials + ddMMyy
    const baseUsername = `${actualLastName.toLowerCase()}${initials}${day}${month}${year}`;
    let username = baseUsername;
    let counter = 1;

    // Keep checking until we find a unique username
    while (true) {
      // Check the unified User model for any user with this username
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        return username;
      }
      username = `${baseUsername}_${counter}`;
      counter++;
    }
  }

  /**
   * Create a new student and their health profile
   */
  async createStudent(req, res) {
    try {
      const studentData = req.body;

      // Validate required fields
      const requiredFields = [
        "first_name",
        "last_name",
        "class_name",
        "gender",
        "dateOfBirth",
      ];
      const missingFields = requiredFields.filter(
        (field) => !studentData[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const lastStudent = await User.findOne({
        student_id: { $regex: /^SE17\d+$/ },
      })
        .sort({ student_id: -1 })
        .collation({ locale: "en", numericOrdering: true });

      let nextId = "SE1701";
      if (lastStudent && lastStudent.student_id) {
        const lastNumber = parseInt(
          lastStudent.student_id.replace("SE17", ""),
          10
        );
        const newNumber = lastNumber + 1;
        nextId = `SE17${String(newNumber).padStart(2, "0")}`;
      }
      studentData.student_id = nextId;
      // Generate unique username
      const username = await AdminController.generateUniqueUsername(
        studentData.first_name,
        studentData.last_name,
        studentData.dateOfBirth
      );

      // Hash the password (using username as default password)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(username, salt);

      // Add username, password and role to student data
      studentData.username = username;
      studentData.password = hashedPassword;
      studentData.role = "student";

      // Create new student using unified User model
      const student = new User(studentData);
      await student.save();

      // Create empty health profile for the student
      const healthProfile = new HealthProfile({
        student: student._id,
        allergies: [],
        chronicDiseases: [],
        treatmentHistory: [],
        vaccinations: [], // Using the correct field name from schema
      });
      await healthProfile.save();

      // Return student data along with their health profile ID
      res.status(201).json({
        success: true,
        data: {
          student,
          healthProfileId: healthProfile._id,
        },
      });
    } catch (error) {
      console.error("Create student error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Create a new medical staff member
   */
  async createMedicalStaff(req, res) {
    try {
      const staffData = req.body;

      const requiredFields = [
        "first_name",
        "last_name",
        "username",
        "password",
        "email",
        "phone_number",
        "staff_role", // ✅ đảm bảo staff_role có trong body
        "gender",
        "dateOfBirth",
      ];
      const missingFields = requiredFields.filter((field) => !staffData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(staffData.password, salt);

      const staffData_unified = {
        ...staffData,
        password: hashedPassword,
        role: "medicalStaff",
      };

      const staff = new User(staffData_unified);
      await staff.save();

      const staffResponse = staff.toObject();
      delete staffResponse.password;

      res.status(201).json({
        success: true,
        data: staffResponse,
      });
    } catch (error) {
      console.error("Create medical staff error:", error);
      if (error.code === 11000) {
        return res.status(409).json({
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
   * Create a student-parent relationship
   */
  async createStudentParentRelation(req, res) {
    try {
      const {
        studentId,
        parentId,
        relationship,
        is_emergency_contact = false,
      } = req.body;

      // Check if student exists and has the correct role
      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found or ID does not belong to a student",
        });
      }

      // Check if parent exists and has the correct role
      const parent = await User.findOne({ _id: parentId, role: "parent" });
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent not found or ID does not belong to a parent",
        });
      }

      // Check if relation already exists
      const existingRelation = await StudentParent.findOne({
        student: studentId,
        parent: parentId,
      });

      if (existingRelation) {
        return res.status(409).json({
          success: false,
          message: "Relationship already exists",
        });
      }

      // Create new relationship
      const studentParent = new StudentParent({
        student: studentId,
        parent: parentId,
        relationship,
        is_emergency_contact,
        status: "approved", // Admin-created relations are automatically approved
      });

      await studentParent.save();

      res.status(201).json({
        success: true,
        data: studentParent,
      });
    } catch (error) {
      console.error("Create student-parent relation error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Get all parents
   */
  async getParents(req, res) {
    try {
      const parents = await User.find({ role: "parent" });

      res.status(200).json({
        success: true,
        data: parents,
      });
    } catch (error) {
      console.error("Get parents error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Get all students
   */
  async getStudents(req, res) {
    try {
      const students = await User.find({ role: "student" });

      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Get students error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Get all medical staff
   */
  async getMedicalStaff(req, res) {
    try {
      const staff = await User.find({ role: "medicalStaff" }).select(
        "-password"
      ); // Exclude password field

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      console.error("Get medical staff error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Get all student-parent relationships
   */
  async getStudentParentRelations(req, res) {
    try {
      const relations = await StudentParent.find()
        .populate("student", "first_name last_name class_name")
        .populate("parent", "first_name last_name email phone_number");

      res.status(200).json({
        success: true,
        data: relations,
      });
    } catch (error) {
      console.error("Get student-parent relations error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Get all pending student-parent link requests
   */
  async getPendingLinkRequests(req, res) {
    try {
      const requests = await StudentParent.find({ status: "pending" })
        .populate("student", "first_name last_name class_name")
        .populate("parent", "first_name last_name email phone_number")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error("Get pending link requests error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Approve or reject a student-parent link request
   */
  async respondToLinkRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { status, notes } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'approved' or 'rejected'",
        });
      }

      const request = await StudentParent.findById(requestId);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Link request not found",
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `This request has already been ${request.status}`,
        });
      }

      // Update the request
      request.status = status;
      request.admin_notes = notes;
      request.processed_by = req.user._id;
      request.processed_at = new Date();

      await request.save();

      res.status(200).json({
        success: true,
        message: `Link request ${status}`,
        data: request,
      });
    } catch (error) {
      console.error("Respond to link request error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Update a student's information
   */
  async updateStudent(req, res) {
    try {
      const { studentId } = req.params;
      const updateData = req.body;

      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Update student (don't allow changing the role)
      delete updateData.role;
      Object.assign(student, updateData);
      await student.save();

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Update student error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Update a medical staff member's information
   */
  async updateMedicalStaff(req, res) {
    try {
      const { staffId } = req.params;
      const updateData = req.body;

      // Remove password from update data if present
      delete updateData.password;

      const staff = await User.findOne({ _id: staffId, role: "medicalStaff" });
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Medical staff not found",
        });
      }

      // Update staff (don't allow changing the role)
      delete updateData.role;
      // Map old 'role' field to 'staff_role' if present
      if (updateData.role) {
        updateData.staff_role = updateData.role;
        delete updateData.role;
      }
      Object.assign(staff, updateData);
      await staff.save();

      // Remove password from response
      const staffResponse = staff.toObject();
      delete staffResponse.password;

      res.status(200).json({
        success: true,
        data: staffResponse,
      });
    } catch (error) {
      console.error("Update medical staff error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Deactivate a student
   */
  async deactivateStudent(req, res) {
    try {
      const { studentId } = req.params;

      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      student.is_active = false;
      await student.save();

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Deactivate student error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Deactivate a medical staff member
   */
  async deactivateMedicalStaff(req, res) {
    try {
      const { staffId } = req.params;

      const staff = await User.findOne({ _id: staffId, role: "medicalStaff" });
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Medical staff not found",
        });
      }

      staff.is_active = false;
      await staff.save();

      // Remove password from response
      const staffResponse = staff.toObject();
      delete staffResponse.password;

      res.status(200).json({
        success: true,
        data: staffResponse,
      });
    } catch (error) {
      console.error("Deactivate medical staff error:", error);
      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }
}

module.exports = new AdminController();
