const Parent = require("../models/user/parent");
const Student = require("../models/user/student");
const StudentParent = require("../models/user/studentParent");
const HealthProfile = require("../models/healthProfile");
const MedicineRequest = require("../models/medicineRequest");
const MedicalEvent = require("../models/medicalEvent");
const Campaign = require("../models/campaign/campaign");
const CampaignConsent = require("../models/campaign/campaignConsent");
const CampaignResult = require("../models/campaign/campaignResult");
const ConsultationSchedule = require("../models/campaign/consultationSchedule");
const mongoose = require("mongoose");

// Helper function to check if parent is related to student
const validateParentStudent = async (parentId, studentId) => {
  const relation = await StudentParent.findOne({
    parent: parentId,
    student: studentId,
    is_active: true,
    status: "approved", // Only approved relationships are valid
  });
  return !!relation;
};

/**
 * Get parent profile
 */
exports.getParentProfile = async (req, res) => {
  try {
    // Get the parent ID from the authenticated user
    const parentId = req.user._id;

    // Parent should already be available in req.user
    // But we can fetch fresh data if needed
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, message: "Parent not found" });
    }

    return res.status(200).json({ success: true, data: parent });
  } catch (error) {
    console.error("Error fetching parent profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get related students
 */
exports.getRelatedStudents = async (req, res) => {
  try {
    const parentId = req.user._id;

    // Find only approved and active relationships
    const relationships = await StudentParent.find({
      parent: parentId,
      is_active: true,
      status: "approved",
    }).populate("student");

    if (!relationships.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const students = relationships.map((rel) => {
      return {
        student: rel.student,
        relationship: rel.relationship,
        is_emergency_contact: rel.is_emergency_contact,
      };
    });

    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching related students:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get student health profile
 */
exports.getStudentHealthProfile = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId } = req.params;

    // Verify relation
    const isRelated = await validateParentStudent(parentId, studentId);
    if (!isRelated) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student's data",
      });
    }

    const healthProfile = await HealthProfile.findOne({ student: studentId });
    if (!healthProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Health profile not found" });
    }

    return res.status(200).json({ success: true, data: healthProfile });
  } catch (error) {
    console.error("Error fetching student health profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update student health profile
 */
exports.updateHealthProfile = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId } = req.params;
    const updateData = req.body;

    // Verify relation
    const isRelated = await validateParentStudent(parentId, studentId);
    if (!isRelated) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this student's data",
      });
    }

    // Find profile or create if doesn't exist
    let healthProfile = await HealthProfile.findOne({ student: studentId });

    if (!healthProfile) {
      healthProfile = new HealthProfile({
        student: studentId,
        ...updateData,
      });
      await healthProfile.save();
    } else {
      // Update only allowed fields
      // We're using this approach to prevent overwriting the entire document
      if (updateData.allergies) healthProfile.allergies = updateData.allergies;
      if (updateData.chronicDiseases)
        healthProfile.chronicDiseases = updateData.chronicDiseases;
      if (updateData.treatmentHistory)
        healthProfile.treatmentHistory = updateData.treatmentHistory;
      if (updateData.vision) healthProfile.vision = updateData.vision;
      if (updateData.hearing) healthProfile.hearing = updateData.hearing;
      if (updateData.vaccinations)
        healthProfile.vaccinations = updateData.vaccinations;

      await healthProfile.save();
    }

    return res.status(200).json({ success: true, data: healthProfile });
  } catch (error) {
    console.error("Error updating health profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Create a medicine request
 */
exports.createMedicineRequest = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId } = req.params;
    const { startDate, endDate, medicines } = req.body;

    // Verify relation
    const isRelated = await validateParentStudent(parentId, studentId);
    if (!isRelated) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create medicine requests for this student",
      });
    }

    // Create new medicine request
    const medicineRequest = new MedicineRequest({
      student: studentId,
      created_by: parentId,
      startDate,
      endDate,
      medicines,
    });

    await medicineRequest.save();

    return res.status(201).json({ success: true, data: medicineRequest });
  } catch (error) {
    console.error("Error creating medicine request:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get parent's medicine requests for a student
 */
exports.getMedicineRequests = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId } = req.params;

    if (studentId) {
      // Case 1: Specific student requests
      const isRelated = await validateParentStudent(parentId, studentId);
      if (!isRelated) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this student's data",
        });
      }

      const requests = await MedicineRequest.find({
        student: studentId,
        created_by: parentId,
      }).sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: requests });
    } else {
      // Case 2: All related students' requests
      const relationships = await StudentParent.find({
        parent: parentId,
        is_active: true,
        status: "approved",
      });

      const studentIds = relationships.map((rel) => rel.student);

      const requests = await MedicineRequest.find({
        created_by: parentId,
        student: { $in: studentIds },
      })
        .populate("student")
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: requests });
    }
  } catch (error) {
    console.error("Error fetching medicine requests:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get medical events for a student
 */
exports.getMedicalEvents = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId } = req.params;

    // Verify relation
    const isRelated = await validateParentStudent(parentId, studentId);
    if (!isRelated) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student's data",
      });
    }

    const events = await MedicalEvent.find({ student: studentId })
      .populate("created_by")
      .sort({ occurred_at: -1 });

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching medical events:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get campaigns for parent's students
 */
exports.getCampaigns = async (req, res) => {
  try {
    const parentId = req.user._id;

    // Get all approved and active relationships
    const relationships = await StudentParent.find({
      parent: parentId,
      is_active: true,
      status: "approved",
    });

    const studentIds = relationships.map((rel) => rel.student);

    // Get active campaigns that apply to the student's class
    const activeStudents = await Student.find({ _id: { $in: studentIds } });
    const classNames = activeStudents.map((s) => s.class_name);

    const campaigns = await Campaign.find({
      $or: [
        { target_class: { $in: classNames } },
        { target_class: "All" },
        { target_students: { $in: studentIds } },
      ],
    }).sort({ date: 1 });

    // Get consent status for each campaign
    const campaignsWithConsent = await Promise.all(
      campaigns.map(async (campaign) => {
        const consents = await Promise.all(
          studentIds.map(async (studentId) => {
            const consent = await CampaignConsent.findOne({
              campaign: campaign._id,
              student: studentId,
            }).populate("student", "first_name last_name class_name");

            return consent
              ? {
                  student: consent.student,
                  status: consent.status,
                  date: consent.updatedAt,
                }
              : {
                  student: await Student.findById(
                    studentId,
                    "first_name last_name class_name"
                  ),
                  status: "Pending",
                  date: null,
                };
          })
        );

        return {
          ...campaign.toObject(),
          students: consents,
        };
      })
    );

    return res.status(200).json({ success: true, data: campaignsWithConsent });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update campaign consent
 */
exports.updateCampaignConsent = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId, campaignId } = req.params;
    const { status, notes } = req.body;

    // Verify relation
    const isRelated = await validateParentStudent(parentId, studentId);
    if (!isRelated) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update consent for this student",
      });
    }

    // Find or create consent record
    let consent = await CampaignConsent.findOne({
      campaign: campaignId,
      student: studentId,
    });

    if (!consent) {
      consent = new CampaignConsent({
        campaign: campaignId,
        student: studentId,
        status,
        notes,
      });
    } else {
      consent.status = status;
      consent.notes = notes;
    }

    await consent.save();
    await consent.populate("student campaign");

    return res.status(200).json({ success: true, data: consent });
  } catch (error) {
    console.error("Error updating campaign consent:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get campaign results for a student
 */
exports.getCampaignResults = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId } = req.params;

    // Verify relation
    const isRelated = await validateParentStudent(parentId, studentId);
    if (!isRelated) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this student's data",
      });
    }

    const results = await CampaignResult.find({ student: studentId })
      .populate("campaign")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching campaign results:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get consultation schedules for a parent
 */
exports.getConsultationSchedules = async (req, res) => {
  try {
    const parentId = req.user._id;

    // Find all consultations where this parent is attending
    const consultations = await ConsultationSchedule.find({
      attending_parent: parentId,
    })
      .populate("student")
      .populate("medicalStaff")
      .populate("campaignResult")
      .sort({ scheduledDate: 1 });

    return res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    console.error("Error fetching consultation schedules:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Request link with a student
 * Parents can request to be linked with a student with specific fields
 */
exports.requestStudentLink = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { studentId, relationship, is_emergency_contact, notes } = req.body;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    if (!relationship) {
      return res.status(400).json({
        success: false,
        message: "relationship is required",
      });
    }

    // Find student by ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if relation already exists
    const existingRelation = await StudentParent.findOne({
      student: student._id,
      parent: parentId,
    });

    if (existingRelation) {
      if (existingRelation.is_active) {
        return res.status(400).json({
          success: false,
          message: "You are already linked to this student",
        });
      } else {
        // Reactivate the relation and set to pending approval
        existingRelation.is_active = true;
        existingRelation.status = "pending";
        existingRelation.relationship = relationship;
        existingRelation.is_emergency_contact = is_emergency_contact;
        existingRelation.notes = notes;

        await existingRelation.save();

        return res.status(200).json({
          success: true,
          message: "Link request resubmitted and waiting for approval",
          data: existingRelation,
        });
      }
    }

    // Create new relation with pending status
    const newRelation = new StudentParent({
      student: student._id,
      parent: parentId,
      relationship: relationship || "Parent", // Default to "Parent" if not specified
      is_emergency_contact,
      is_active: true,
      status: "pending", // New status field for approval workflow
      notes, // Additional information to help verification
    });

    await newRelation.save();

    return res.status(201).json({
      success: true,
      message: "Link request submitted successfully and waiting for approval",
      data: newRelation,
    });
  } catch (error) {
    console.error("Error requesting student link:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get link requests status
 * Parents can check the status of their link requests
 */
exports.getLinkRequests = async (req, res) => {
  try {
    const parentId = req.user._id;

    const requests = await StudentParent.find({
      parent: parentId,
    }).populate("student");

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error getting link requests:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
