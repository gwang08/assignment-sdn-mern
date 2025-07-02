const User = require("../models/user/user");
const HealthProfile = require("../models/healthProfile");
const MedicalEvent = require("../models/medicalEvent");
const MedicineRequest = require("../models/medicineRequest");
const Campaign = require("../models/campaign/campaign");
const CampaignResult = require("../models/campaign/campaignResult");
const CampaignConsent = require("../models/campaign/campaignConsent");
const ConsultationSchedule = require("../models/campaign/consultationSchedule");
const { CAMPAIGN_TYPE, CAMPAIGN_CONSENT_STATUS } = require("../utils/enums");
const StudentParent = require("../models/user/studentParent");

// Helper function to validate a student ID
const validateStudentRole = async (studentId) => {
  if (!studentId) return null;
  return await User.findOne({ _id: studentId, role: "student" });
};

class NurseController {
  // Dashboard
  static async getDashboard(req, res, next) {
    try {
      // Return dashboard data as JSON instead of rendering a view
      const recentEvents = await MedicalEvent.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("student", "first_name last_name class_name");

      const recentRequests = await MedicineRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("student", "first_name last_name class_name");

      res.json({
        success: true,
        data: {
          nurseInfo: req.user,
          recentEvents,
          recentRequests,
          dashboardStats: {
            activeEvents: await MedicalEvent.countDocuments({ status: "Open" }),
            pendingRequests: await MedicineRequest.countDocuments({
              status: "Pending",
            }),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Medical Events Management
  static async getMedicalEvents(req, res, next) {
    try {
      const events = await MedicalEvent.find()
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name role")
        .sort({ createdAt: -1 })
        .limit(50);

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical events" });
    }
  }

  static async createMedicalEvent(req, res, next) {
    try {
      const {
        studentId,
        event_type,
        description,
        severity,
        symptoms = [],
        treatment_notes = "",
        medications_administered = [],
        parent_notified = { status: false },
        follow_up_required = false,
        follow_up_notes = "",
      } = req.body;

      // Validate that studentId corresponds to a user with student role
      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          error: "Student not found or invalid student ID",
        });
      }

      const medicalEvent = new MedicalEvent({
        student: studentId,
        created_by: req.user._id,
        event_type,
        description,
        severity,
        symptoms,
        treatment_notes,
        medications_administered,
        parent_notified,
        follow_up_required,
        follow_up_notes,
      });

      await medicalEvent.save();
      await medicalEvent.populate("student", "first_name last_name class_name");

      res.status(201).json(medicalEvent);
    } catch (error) {
      console.error("Error creating medical event:", error);
      res.status(400).json({
        error: "Failed to create medical event",
        details: error.message,
      });
    }
  }

  // Get details of a specific medical event
  static async getMedicalEvent(req, res, next) {
    try {
      const medicalEvent = await MedicalEvent.findById(req.params.eventId)
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name role")
        .populate(
          "medications_administered.administered_by",
          "first_name last_name"
        );

      if (!medicalEvent) {
        return res.status(404).json({ error: "Medical event not found" });
      }

      res.json(medicalEvent);
    } catch (error) {
      console.error("Error fetching medical event:", error);
      res.status(500).json({ error: "Failed to fetch medical event" });
    }
  }

  // Update a medical event
  static async updateMedicalEvent(req, res, next) {
    try {
      // First find the event to verify student's role before update
      const existingEvent = await MedicalEvent.findById(req.params.eventId);
      if (!existingEvent) {
        return res.status(404).json({ error: "Medical event not found" });
      }

      // Verify the student role
      const student = await User.findOne({
        _id: existingEvent.student,
        role: "student",
      });
      if (!student) {
        return res.status(404).json({
          error: "Student record is invalid or has been removed",
        });
      }

      const {
        event_type,
        description,
        severity,
        status,
        symptoms,
        treatment_notes,
        follow_up_required,
        follow_up_notes,
      } = req.body;

      const updateData = {};

      if (event_type) updateData.event_type = event_type;
      if (description) updateData.description = description;
      if (severity) updateData.severity = severity;
      if (status) updateData.status = status;
      if (symptoms) updateData.symptoms = symptoms;
      if (treatment_notes) updateData.treatment_notes = treatment_notes;
      if (follow_up_required !== undefined)
        updateData.follow_up_required = follow_up_required;
      if (follow_up_notes) updateData.follow_up_notes = follow_up_notes;

      const medicalEvent = await MedicalEvent.findByIdAndUpdate(
        req.params.eventId,
        updateData,
        { new: true }
      ).populate("student", "first_name last_name class_name");

      res.json(medicalEvent);
    } catch (error) {
      console.error("Error updating medical event:", error);
      res.status(400).json({
        error: "Failed to update medical event",
        details: error.message,
      });
    }
  }

  // Mark a medical event as resolved
  static async resolveEvent(req, res, next) {
    try {
      const { treatment_notes } = req.body;

      const medicalEvent = await MedicalEvent.findById(req.params.eventId);

      if (!medicalEvent) {
        return res.status(404).json({ error: "Medical event not found" });
      }

      medicalEvent.status = "Resolved";
      medicalEvent.resolved_at = new Date();
      if (treatment_notes) {
        medicalEvent.treatment_notes = treatment_notes;
      }

      await medicalEvent.save();
      await medicalEvent.populate("student", "first_name last_name class_name");

      res.json(medicalEvent);
    } catch (error) {
      console.error("Error resolving medical event:", error);
      res.status(400).json({ error: "Failed to resolve medical event" });
    }
  }

  // Record medication administered for a medical event
  static async addMedication(req, res, next) {
    try {
      const { name, dosage, time } = req.body;

      const medicalEvent = await MedicalEvent.findById(req.params.eventId);

      if (!medicalEvent) {
        return res.status(404).json({ error: "Medical event not found" });
      }

      medicalEvent.medications_administered.push({
        name,
        dosage,
        time: time || new Date(),
        administered_by: req.nurse._id,
      });

      await medicalEvent.save();

      res.json(medicalEvent);
    } catch (error) {
      console.error("Error adding medication:", error);
      res.status(400).json({ error: "Failed to add medication" });
    }
  }

  // Update parent notification status
  static async updateParentNotification(req, res, next) {
    try {
      const { status, method } = req.body;

      const medicalEvent = await MedicalEvent.findById(req.params.eventId);

      if (!medicalEvent) {
        return res.status(404).json({ error: "Medical event not found" });
      }

      medicalEvent.parent_notified = {
        status: status || true,
        time: new Date(),
        method: method || "Phone call",
      };

      await medicalEvent.save();

      res.json(medicalEvent);
    } catch (error) {
      console.error("Error updating parent notification:", error);
      res.status(400).json({ error: "Failed to update parent notification" });
    }
  }

  // Medicine & Supplies Management
  static async getMedicineRequests(req, res, next) {
    try {
      const requests = await MedicineRequest.find()
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medicine requests" });
    }
  }

  static async getMedicineInventory(req, res, next) {
    try {
      const inventory = await MedicineRequest.aggregate([
        { $unwind: "$medicines" },
        {
          $group: {
            _id: "$medicines.name",
            totalRequests: { $sum: 1 },
            commonDosage: { $first: "$medicines.dosage" },
            commonFrequency: { $first: "$medicines.frequency" },
          },
        },
        { $sort: { totalRequests: -1 } },
      ]);

      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory data" });
    }
  }

  // Vaccination Management
  static async getVaccinationCampaigns(req, res, next) {
    try {
      const campaigns = await Campaign.find({
        type: CAMPAIGN_TYPE.VACCINATION,
      }).sort({ date: -1 });

      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vaccination campaigns" });
    }
  }

  static async createVaccinationCampaign(req, res, next) {
    try {
      const { title, description, date, vaccineDetails } = req.body;

      const campaign = new Campaign({
        title,
        type: CAMPAIGN_TYPE.VACCINATION,
        description,
        date: new Date(date),
        vaccineDetails,
      });

      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Failed to create vaccination campaign" });
    }
  }

  static async getVaccinationResults(req, res, next) {
    try {
      const results = await CampaignResult.find({
        campaign: req.params.campaignId,
      })
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name");

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vaccination results" });
    }
  }

  static async createVaccinationResult(req, res, next) {
    try {
      const { studentId, notes } = req.body;

      // Validate student role
      const student = await validateStudentRole(studentId);
      if (!student) {
        return res.status(404).json({
          error: "Student not found or ID does not belong to a student",
        });
      }

      const result = new CampaignResult({
        campaign: req.params.campaignId,
        student: studentId,
        created_by: req.nurse._id,
        notes,
      });

      await result.save();
      await result.populate("student", "first_name last_name class_name");

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to record vaccination result" });
    }
  }

  // Periodic Health Check Management
  static async getHealthCheckCampaigns(req, res, next) {
    try {
      const campaigns = await Campaign.find({
        type: CAMPAIGN_TYPE.CHECKUP,
      }).sort({ date: -1 });

      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health check campaigns" });
    }
  }

  static async createHealthCheckCampaign(req, res, next) {
    try {
      const { title, description, date } = req.body;

      const campaign = new Campaign({
        title,
        type: CAMPAIGN_TYPE.CHECKUP,
        description,
        date: new Date(date),
      });

      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Failed to create health check campaign" });
    }
  }

  static async getHealthCheckResults(req, res, next) {
    try {
      const results = await CampaignResult.find({
        campaign: req.params.campaignId,
      })
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name");

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health check results" });
    }
  }

  static async createHealthCheckResult(req, res, next) {
    try {
      const { studentId, checkupDetails, notes } = req.body;

      // Validate student role
      const student = await validateStudentRole(studentId);
      if (!student) {
        return res.status(404).json({
          error: "Student not found or ID does not belong to a student",
        });
      }

      const result = new CampaignResult({
        campaign: req.params.campaignId,
        student: studentId,
        created_by: req.nurse._id,
        notes,
        checkupDetails,
      });

      await result.save();
      await result.populate("student", "first_name last_name class_name");

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to record health check result" });
    }
  }

  // Consultation Management
  static async getConsultations(req, res, next) {
    try {
      const consultations = await ConsultationSchedule.find({
        medicalStaff: req.nurse._id,
      })
        .populate("student", "first_name last_name class_name")
        .populate("attending_parent", "first_name last_name phone_number")
        .populate("campaignResult")
        .sort({ scheduledDate: 1 });

      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultations" });
    }
  }

  // Student Health Records Management
  static async getStudents(req, res, next) {
    try {
      const { search, class_name } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { first_name: { $regex: search, $options: "i" } },
          { last_name: { $regex: search, $options: "i" } },
        ];
      }

      if (class_name) {
        query.class_name = class_name;
      }

      const students = await User.find({
        ...query,
        role: "student",
      })
        .sort({ last_name: 1, first_name: 1 })
        .limit(100);

      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }

  static async getStudentHealthProfile(req, res, next) {
    try {
      const studentId = req.params.studentId;

      // Validate student role
      const student = await validateStudentRole(studentId);
      if (!student) {
        return res.status(404).json({
          error: "Student not found or ID does not belong to a student",
        });
      }

      const healthProfile = await HealthProfile.findOne({
        student: studentId,
      }).populate(
        "student",
        "first_name last_name class_name dateOfBirth gender"
      );

      if (!healthProfile) {
        return res.status(404).json({ error: "Health profile not found" });
      }

      res.json(healthProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health profile" });
    }
  }

  static async updateStudentHealthProfile(req, res, next) {
    try {
      const updateData = req.body;
      const studentId = req.params.studentId;

      // Validate student role
      const student = await validateStudentRole(studentId);
      if (!student) {
        return res.status(404).json({
          error: "Student not found or ID does not belong to a student",
        });
      }

      const healthProfile = await HealthProfile.findOneAndUpdate(
        { student: studentId },
        updateData,
        {
          new: true,
          upsert: true,
        }
      ).populate("student", "first_name last_name class_name");

      res.json(healthProfile);
    } catch (error) {
      res.status(400).json({ error: "Failed to update health profile" });
    }
  }

  static async getStudentMedicalHistory(req, res, next) {
    try {
      const studentId = req.params.studentId;

      // Validate student role
      const student = await validateStudentRole(studentId);
      if (!student) {
        return res.status(404).json({
          error: "Student not found or ID does not belong to a student",
        });
      }

      const medicalEvents = await MedicalEvent.find({
        student: studentId,
      })
        .populate("created_by", "first_name last_name role")
        .sort({ createdAt: -1 });

      const medicineRequests = await MedicineRequest.find({
        student: studentId,
      })
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      const campaignResults = await CampaignResult.find({
        student: studentId,
      })
        .populate("campaign", "title type date")
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        medicalEvents,
        medicineRequests,
        campaignResults,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical history" });
    }
  }
}

module.exports = NurseController;
