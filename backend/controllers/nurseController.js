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

      // ✅ Trả về với success + data
      res.json({
        success: true,
        data: events.map((event) => ({
          ...event.toObject(),
          _id: event._id.toString(),
          student: event.student?._id?.toString() || null,
          created_by: event.created_by?._id?.toString() || null,
        })),
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch medical events" });
    }
  }

  static async createMedicalEvent(req, res, next) {
    try {
      console.log("📥 req.body:", req.body);
      const {
        studentId,
        event_type,
        description,
        severity,
        symptoms = [],
        treatment_notes = "",
        medications_administered = [],
        parent_notified = { status: false },
        follow_up_required = true,
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

  static async updateMedicineRequestStatus(req, res, next) {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected", "completed"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Trạng thái không hợp lệ" });
      }

      const updatedRequest = await MedicineRequest.findByIdAndUpdate(
        requestId,
        {
          status,
          approved_at: status === "approved" ? new Date() : undefined,
          approved_by:
            status === "approved" && req.user?.name ? req.user.name : undefined,
        },
        { new: true }
      )
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name");

      if (!updatedRequest) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy yêu cầu" });
      }

      res.json({ success: true, data: updatedRequest });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
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
        campaign_type: "vaccination",
      })
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch vaccination campaigns",
      });
    }
  }

  static async createVaccinationCampaign(req, res, next) {
    try {
      const {
        title,
        description,
        start_date,
        end_date,
        target_classes,
        requires_consent,
        consent_deadline,
        instructions,
        vaccineDetails,
      } = req.body;

      const campaign = new Campaign({
        title,
        campaign_type: "vaccination",
        type: CAMPAIGN_TYPE.VACCINATION,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        date: new Date(start_date), // Add the required date field
        target_classes,
        requires_consent: requires_consent || true,
        consent_deadline: consent_deadline ? new Date(consent_deadline) : null,
        instructions,
        vaccineDetails,
        created_by: req.user._id,
        status: "draft",
      });

      await campaign.save();
      await campaign.populate("created_by", "first_name last_name");

      res.status(201).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      console.error("Error creating vaccination campaign:", error);
      res.status(400).json({
        success: false,
        error: "Failed to create vaccination campaign",
      });
    }
  }

  static async updateCampaignStatus(req, res, next) {
  try {
    const campaignId = req.params.campaignId;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["draft", "active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid status. Must be one of: draft, active, completed, cancelled",
      });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true }
    ).populate("created_by", "first_name last_name");

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    // Nếu chuyển sang active và cần consent thì tạo consent notifications
    if (status === "active" && campaign.requires_consent) {
      await NurseController.createConsentNotifications(campaign);
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Error updating campaign status:", error);
    res.status(400).json({
      success: false,
      error: "Failed to update campaign status",
    });
  }
}

  // Helper method to create consent notifications for eligible students
  static async createConsentNotifications(campaign) {
    try {
      console.log(
        `Creating consent notifications for campaign: ${campaign.title}`
      );

      // Find all eligible students based on target classes
      const eligibleStudents = await User.find({
        role: "student",
        class_name: { $in: campaign.target_classes },
      }).select("_id first_name last_name class_name");

      console.log(`Found ${eligibleStudents.length} eligible students`);

      // Check if consents already exist for this campaign
      const existingConsents = await CampaignConsent.find({
        campaign: campaign._id,
      });

      const existingStudentIds = existingConsents.map((consent) =>
        consent.student.toString()
      );

      // Filter students who don't have consent records yet
      const studentsNeedingConsent = eligibleStudents.filter(
        (student) => !existingStudentIds.includes(student._id.toString())
      );

      console.log(
        `${studentsNeedingConsent.length} students need new consent notifications`
      );

      // Create consent notifications for students who don't have them
      if (studentsNeedingConsent.length > 0) {
        const consentNotifications = studentsNeedingConsent.map((student) => ({
          campaign: campaign._id,
          student: student._id,
          status: CAMPAIGN_CONSENT_STATUS.PENDING,
        }));

        await CampaignConsent.insertMany(consentNotifications);
        console.log(
          `Created ${consentNotifications.length} consent notifications`
        );
      }

      return {
        success: true,
        created: studentsNeedingConsent.length,
        total: eligibleStudents.length,
      };
    } catch (error) {
      console.error("Error creating consent notifications:", error);
      throw error;
    }
  }

  // Manual method to create consent notifications for a campaign
  static async createConsentNotificationsForCampaign(req, res, next) {
  try {
    const { campaignId } = req.params;

    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    // Only allow consent creation for campaigns that require consent
    if (!campaign.requires_consent) {
      return res.status(400).json({
        success: false,
        error: "This campaign does not require consent",
      });
    }

    // Create consent notifications
    const result = await NurseController.createConsentNotifications(campaign);

    res.json({
      success: true,
      data: {
        campaign_id: campaign._id,
        campaign_title: campaign.title,
        ...result,
      },
      message: `Created ${result.created} new consent notifications out of ${result.total} eligible students`,
    });
  } catch (error) {
    console.error("Error creating consent notifications manually:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create consent notifications"
    });
  }
}

  static async getVaccinationList(req, res, next) {
    try {
      const campaignId = req.params.campaignId;

      // Get campaign details
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Get eligible students (based on target classes)
      const eligibleStudents = await User.find({
        role: "student",
        class_name: { $in: campaign.target_classes },
      }).select("first_name last_name class_name dateOfBirth gender");

      // Get consent status
      const consents = await CampaignConsent.find({
        campaign: campaignId,
      })
        .populate("student", "first_name last_name")
        .populate("answered_by", "first_name last_name");

      // Get vaccination results
      const results = await CampaignResult.find({
        campaign: campaignId,
      })
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name");

      // Calculate consent summary
      const consentSummary = {
        total: consents.length,
        approved: consents.filter((c) => c.status === "Approved").length,
        declined: consents.filter((c) => c.status === "Declined").length,
        pending: consents.filter((c) => c.status === "Pending").length,
      };

      res.json({
        success: true,
        data: {
          campaign,
          eligible_students: eligibleStudents,
          consents,
          vaccination_results: results,
          consent_summary: consentSummary,
          statistics: {
            total_eligible: eligibleStudents.length,
            vaccinated: results.length,
            pending: eligibleStudents.length - results.length,
          },
        },
      });
    } catch (error) {
      console.error("Error getting vaccination list:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch vaccination list",
      });
    }
  }

  static async recordVaccination(req, res, next) {
  try {
    const { campaignId } = req.params;
    const {
      student_id,
      vaccinated_at,
      vaccine_details,
      administered_by,
      side_effects,
      follow_up_required,
      follow_up_date,
      notes,
    } = req.body;

    // Validate campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (!['draft', 'active'].includes(campaign.status)) {
      return res.status(400).json({
        error: "Cannot record vaccination: Campaign must be in draft or active status"
      });
    }

    // Validate student
    const student = await validateStudentRole(student_id);
    if (!student) {
      return res.status(404).json({
        error: "Student not found or ID does not belong to a student",
      });
    }

    // Check consent status if campaign requires consent
    if (campaign.requires_consent) {
      const consent = await CampaignConsent.findOne({
        campaign: campaignId,
        student: student_id,
      });
      if (!consent || consent.status !== CAMPAIGN_CONSENT_STATUS.APPROVED) {
        return res.status(400).json({
          error: "Cannot record vaccination: Consent not approved"
        });
      }
    }

    // Create vaccination record
    const vaccinationResult = new CampaignResult({
      campaign: campaignId,
      student: student_id,
      created_by: req.user._id,
      notes,
      vaccination_details: {
        vaccinated_at: new Date(vaccinated_at),
        vaccine_details,
        administered_by,
        side_effects: side_effects || [],
        follow_up_required: follow_up_required || false,
        follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
        status: follow_up_required ? "follow_up_needed" : "completed",
      },
    });

    await vaccinationResult.save();
    await vaccinationResult.populate("student", "first_name last_name class_name");
    await vaccinationResult.populate("created_by", "first_name last_name");

    res.status(201).json({
      success: true,
      data: vaccinationResult,
      message: "Vaccination record created successfully"
    });
  } catch (error) {
    console.error("Error recording vaccination:", error);
    res.status(400).json({ error: "Failed to record vaccination" });
  }
}

  static async updateVaccinationFollowUp(req, res, next) {
    try {
      const { resultId } = req.params;
      const { follow_up_date, follow_up_notes, status, additional_actions } =
        req.body;

      const result = await CampaignResult.findById(resultId);
      if (!result) {
        return res.status(404).json({ error: "Vaccination result not found" });
      }

      // Update follow-up information
      result.vaccination_details.follow_up_date =
        follow_up_date && new Date(follow_up_date);
      result.vaccination_details.follow_up_notes =
        follow_up_notes || result.vaccination_details.follow_up_notes;
      result.vaccination_details.status =
        status || result.vaccination_details.status;
      result.vaccination_details.additional_actions =
        additional_actions || result.vaccination_details.additional_actions;
      result.vaccination_details.last_follow_up = new Date();

      await result.save();
      await result.populate("student", "first_name last_name class_name");

      res.json({
        success: true,
        data: result,
        message: "Follow-up updated successfully",
      });
    } catch (error) {
      console.error("Error updating vaccination follow-up:", error);
      res.status(400).json({ error: "Failed to update vaccination follow-up" });
    }
  }

  static async getVaccinationStatistics(req, res, next) {
    try {
      const stats = {};

      // Total vaccination campaigns
      stats.total_campaigns = await Campaign.countDocuments({
        campaign_type: "vaccination",
      });

      // Active campaigns
      stats.active_campaigns = await Campaign.countDocuments({
        campaign_type: "vaccination",
        status: "active",
      });

      // Total vaccinations this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      stats.vaccinations_this_month = await CampaignResult.countDocuments({
        createdAt: { $gte: startOfMonth },
        "vaccination_details.vaccinated_at": { $exists: true },
      });

      // Students needing follow-up
      stats.follow_up_needed = await CampaignResult.countDocuments({
        "vaccination_details.follow_up_required": true,
        "vaccination_details.status": { $ne: "completed" },
      });

      // Vaccination completion rate by campaign
      const completionRates = await Campaign.aggregate([
        { $match: { campaign_type: "vaccination", status: { $ne: "draft" } } },
        {
          $lookup: {
            from: "campaignresults",
            localField: "_id",
            foreignField: "campaign",
            as: "results",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { target_classes: "$target_classes" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$role", "student"] },
                      { $in: ["$class_name", "$$target_classes"] },
                    ],
                  },
                },
              },
            ],
            as: "eligible_students",
          },
        },
        {
          $project: {
            title: 1,
            total_eligible: { $size: "$eligible_students" },
            vaccinated: { $size: "$results" },
            completion_rate: {
              $multiply: [
                {
                  $divide: [
                    { $size: "$results" },
                    { $size: "$eligible_students" },
                  ],
                },
                100,
              ],
            },
          },
        },
      ]);

      stats.completion_rates = completionRates;

      res.json(stats);
    } catch (error) {
      console.error("Error getting vaccination statistics:", error);
      res.status(500).json({ error: "Failed to fetch vaccination statistics" });
    }
  }

  // Periodic Health Check Management
  static async getHealthCheckCampaigns(req, res, next) {
    try {
      const campaigns = await Campaign.find({
        campaign_type: "health_check",
      })
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      console.error("Error fetching health check campaigns:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch health check campaigns",
      });
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
      const consultations = await ConsultationSchedule.find()
        .populate({
          path: "campaignResult",
          populate: {
            path: "campaign",
            select: "title campaign_type",
          },
        })
        .populate("student", "first_name last_name class_name")
        .sort({ scheduledDate: 1 });

      res.json({
        success: true,
        data: consultations,
      });
    } catch (error) {
      console.error("Error fetching consultations:", error);
      res.status(500).json({ error: "Failed to fetch consultations" });
    }
  }

  static async createConsultationSchedule(req, res, next) {
    try {
      const {
        campaignResult,
        student,
        attending_parent,
        scheduledDate,
        duration = 30,
        reason,
        notes,
      } = req.body;

      // Validate required fields
      if (
        !campaignResult ||
        !student ||
        !attending_parent ||
        !scheduledDate ||
        !reason
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: campaignResult, student, attending_parent, scheduledDate, reason",
        });
      }

      const requestedDate = new Date(scheduledDate);
      const requestedEndTime = new Date(
        requestedDate.getTime() + duration * 60000
      );

      // Check for overlapping consultations before creating
      const existingOverlap = await ConsultationSchedule.findOne({
        medicalStaff: req.user.id,
        status: "Scheduled",
        $or: [
          // Case 1: Existing consultation starts before requested and ends after requested starts
          {
            scheduledDate: { $lte: requestedDate },
            $expr: {
              $gt: [
                {
                  $add: ["$scheduledDate", { $multiply: ["$duration", 60000] }],
                },
                requestedDate,
              ],
            },
          },
          // Case 2: Existing consultation starts during requested consultation
          {

  scheduledDate: { $gte: requestedDate, $lt: requestedEndTime }
},

          // Case 3: Requested consultation is completely within existing consultation
          {
            scheduledDate: { $lte: requestedDate },
            $expr: {
              $gte: [
                {
                  $add: ["$scheduledDate", { $multiply: ["$duration", 60000] }],
                },
                requestedEndTime,
              ],
            },
          },
        ],
      }).populate("student", "first_name last_name class_name");

      if (existingOverlap) {
        console.log("OVERLAP DETECTED during creation:", {
          existingStart: existingOverlap.scheduledDate,
          existingEnd: new Date(
            existingOverlap.scheduledDate.getTime() +
              existingOverlap.duration * 60000
          ),
          requestedStart: requestedDate,
          requestedEnd: requestedEndTime,
        });

        return res.status(409).json({
          success: false,
          conflict: true,
          message: "This time slot overlaps with another consultation",
          conflictingConsultation: {
            id: existingOverlap._id,
            studentName: existingOverlap.student
              ? `${existingOverlap.student.first_name} ${existingOverlap.student.last_name}`
              : "Unknown Student",
            scheduledDate: existingOverlap.scheduledDate,
            duration: existingOverlap.duration,
          },
        });
      }

      // Create consultation schedule
      const consultation = new ConsultationSchedule({
        campaignResult,
        student,
        medicalStaff: req.user.id, // Current nurse
        attending_parent,
        scheduledDate: requestedDate,
        duration,
        reason,
        notes,
      });

      await consultation.save();

      // Populate the created consultation
      const populatedConsultation = await ConsultationSchedule.findById(
        consultation._id
      )
        .populate("campaignResult")
        .populate("student", "first_name last_name class_name")
        .populate("medicalStaff", "first_name last_name")
        .populate("attending_parent", "first_name last_name");

      res.status(201).json({
        success: true,
        data: populatedConsultation,
      });
    } catch (error) {
      console.error("Error creating consultation schedule:", error);

      if (error.name === "ValidationError") {
        // Check if the error is about overlapping consultations
        if (error.message.includes("overlaps with another consultation")) {
          return res.status(409).json({
            success: false,
            conflict: true,
            error: "This time slot overlaps with another consultation",
          });
        }

        return res.status(400).json({
          success: false,
          error: "Validation error: " + error.message,
        });
      }

      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          conflict: true,
          error: "A consultation with these details already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to create consultation schedule",
      });
    }
  }

  // General Campaign Management
  static async getCampaigns(req, res, next) {
    try {
      const campaigns = await Campaign.find({
        campaign_type: CAMPAIGN_TYPE.CHECKUP,
      })
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  }

  static async createCampaign(req, res, next) {
    try {
      const {
        title,
        campaign_type,
        description,
        start_date,
        end_date,
        target_classes,
        requires_consent,
        consent_deadline,
        instructions,
        status,
      } = req.body;

      // Validate required fields
      if (!title || !campaign_type || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, campaign_type, start_date, end_date",
        });
      }

      const campaign = new Campaign({
        title,
        campaign_type,
        type:
          campaign_type === "vaccination"
            ? CAMPAIGN_TYPE.VACCINATION
            : CAMPAIGN_TYPE.CHECKUP,
        description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        date: new Date(start_date), // Set date to start_date for compatibility
        target_classes: target_classes || [],
        requires_consent: requires_consent !== false, // Default to true
        consent_deadline: consent_deadline ? new Date(consent_deadline) : null,
        instructions: instructions || "",
        created_by: req.user._id,
        status: status || "draft",
      });

      await campaign.save();
      await campaign.populate("created_by", "first_name last_name");

      res.status(201).json({ success: true, data: campaign });
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create campaign",
        error: error.message,
      });
    }
  }

  static async updateCampaign(req, res, next) {
    try {
      const { campaignId } = req.params;
      const updateData = req.body;

      const campaign = await Campaign.findByIdAndUpdate(
        campaignId,
        updateData,
        { new: true }
      ).populate("created_by", "first_name last_name");

      if (!campaign) {
        return res
          .status(404)
          .json({ success: false, message: "Campaign not found" });
      }

      res.json({ success: true, data: campaign });
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update campaign",
        error: error.message,
      });
    }
  }

  static async getCampaignConsents(req, res, next) {
    try {
      const { campaignId } = req.params;

      const consents = await CampaignConsent.find({
        campaign: campaignId,
      })
        .populate("student", "first_name last_name class_name")
        .populate("answered_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: consents,
      });
    } catch (error) {
      console.error("Error fetching campaign consents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch campaign consents",
      });
    }
  }

  static async getCampaignResults(req, res, next) {
    try {
      const { campaignId } = req.params;

      const results = await CampaignResult.find({
        campaign: campaignId,
      })
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error fetching campaign results:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch campaign results",
      });
    }
  }

  static async submitCampaignResult(req, res, next) {
    try {
      const { campaign, student, notes, vaccination_details, checkupDetails } =
        req.body;

      // Validate student
      const studentUser = await validateStudentRole(student);
      if (!studentUser) {
        return res.status(404).json({
          success: false,
          error: "Student not found or ID does not belong to a student",
        });
      }

      const result = new CampaignResult({
        campaign,
        student,
        created_by: req.user._id,
        notes,
        vaccination_details,
        checkupDetails,
      });

      await result.save();
      await result.populate("student", "first_name last_name class_name");
      await result.populate("created_by", "first_name last_name");

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error submitting campaign result:", error);
      res.status(400).json({
        success: false,
        error: "Failed to submit campaign result",
      });
    }
  }

  static async getConsultationSchedules(req, res, next) {

  try {
    const schedules = await ConsultationSchedule.find()
      .populate({
        path: "campaignResult",
        populate: {
          path: "campaign",
          select: "title campaign_type"
        }
      })
      .populate("student", "first_name last_name class_name")
      .populate("attending_parent", "first_name last_name email") // <-- thêm dòng này
      .sort({ scheduledDate: 1 });

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching consultation schedules:", error);
    res.status(500).json({ error: "Failed to fetch consultation schedules" });

  }
}
    
  static async checkConsultationOverlap(req, res, next) {
    try {
      const { scheduledDate, duration = 30 } = req.body;
      const medicalStaffId = req.user.id;

      // Validate required fields
      if (!scheduledDate) {
        return res.status(400).json({
          success: false,
          error: "scheduledDate is required",
        });
      }

      const requestedDate = new Date(scheduledDate);

      // Check if date is in future
      if (requestedDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Scheduled date must be in the future",
        });
      }

      console.log("Checking overlap for:", {
        medicalStaffId,
        requestedDate,
        duration,
        requestedEndTime: new Date(requestedDate.getTime() + duration * 60000),
      });

      // Check for overlapping consultations with same medical staff
      const requestedEndTime = new Date(
        requestedDate.getTime() + duration * 60000
      );

      const overlapping = await ConsultationSchedule.findOne({
        medicalStaff: medicalStaffId,
        status: "Scheduled", // Use the correct capitalized status value
        $or: [
          // Case 1: Existing consultation starts before requested and ends after requested starts
          {
            scheduledDate: { $lte: requestedDate },
            $expr: {
              $gt: [
                {
                  $add: ["$scheduledDate", { $multiply: ["$duration", 60000] }],
                },
                requestedDate,
              ],
            },
          },
          // Case 2: Existing consultation starts during requested consultation

         {
  scheduledDate: { $gte: requestedDate, $lt: requestedEndTime }
},

          // Case 3: Requested consultation is completely within existing consultation
          {
            scheduledDate: { $lte: requestedDate },
            $expr: {
              $gte: [
                {
                  $add: ["$scheduledDate", { $multiply: ["$duration", 60000] }],
                },
                requestedEndTime,
              ],
            },
          },
        ],
      }).populate("student", "first_name last_name class_name");

      console.log("Overlap search result:", overlapping);

      if (overlapping) {
        console.log("OVERLAP DETECTED:", {
          existingStart: overlapping.scheduledDate,
          existingEnd: new Date(
            overlapping.scheduledDate.getTime() + overlapping.duration * 60000
          ),
          requestedStart: requestedDate,
          requestedEnd: requestedEndTime,
        });

        return res.json({
          success: true,
          data: {
            hasOverlap: true,
            conflictingConsultation: {
              id: overlapping._id,
              studentName: overlapping.student
                ? `${overlapping.student.first_name} ${overlapping.student.last_name}`
                : "Unknown Student",
              scheduledDate: overlapping.scheduledDate,
              duration: overlapping.duration,
              endTime: new Date(
                overlapping.scheduledDate.getTime() +
                  overlapping.duration * 60000
              ),
            },
          },
        });
      }

      console.log("No overlap found - time slot is available");

      res.json({
        success: true,
        data: {
          hasOverlap: false,
          available: true,
        },
        message: "Time slot is available",
      });
    } catch (error) {
      console.error("Error checking consultation overlap:", error);
      res.status(500).json({
        success: false,
        error: "Failed to check consultation overlap",
      });
    }
  }

  static async getVaccinationResults(req, res, next) {
    try {
      const { campaignId } = req.params;

      const results = await CampaignResult.find({
        campaign: campaignId,
        vaccination_details: { $exists: true },
      })
        .populate("student", "first_name last_name class_name")
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error fetching vaccination results:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch vaccination results",
      });
    }
  }

  static async createVaccinationResult(req, res, next) {
    try {
      const { campaignId } = req.params;
      const {
        student,
        vaccine_name,
        dose_number,
        manufacturer,
        batch_number,
        administration_date,
        side_effects,
        notes,
      } = req.body;

      // Validate required fields
      if (!student || !vaccine_name || !dose_number || !administration_date) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: student, vaccine_name, dose_number, administration_date",
        });
      }

      const result = new CampaignResult({
        campaign: campaignId,
        student,
        created_by: req.user.id,
        vaccination_details: {
          vaccine_name,
          dose_number,
          manufacturer,
          batch_number,
          administration_date: new Date(administration_date),
          side_effects: side_effects || [],
          administered_by: req.user.id,
        },
        notes,
      });

      await result.save();

      // Populate the result
      await result.populate("student", "first_name last_name class_name");
      await result.populate("created_by", "first_name last_name");

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error creating vaccination result:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create vaccination result",
      });
    }
  }

  // Medical Staff Management
  static async getMedicalStaff(req, res, next) {
    try {
      const medicalStaff = await User.find({
        role: "medicalStaff",
      })
        .select("first_name last_name email role phone_number staff_role")
        .sort({ last_name: 1, first_name: 1 });

      res.json({
        success: true,
        data: medicalStaff,
      });
    } catch (error) {
      console.error("Error fetching medical staff:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch medical staff",
      });
    }
  }

  // Student-Parent Relations Management
  static async getStudentParentRelations(req, res, next) {
    try {
      const relations = await StudentParent.find({ is_active: true })
        .populate("student", "first_name last_name class_name")
        .populate("parent", "first_name last_name email phone_number")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: relations,
      });
    } catch (error) {
      console.error("Error fetching student-parent relations:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch student-parent relations",
      });
    }
  }

  // Student Management
  static async getStudents(req, res, next) {
    try {
      const students = await User.find({ role: "student" })
        .select("first_name last_name class_name dateOfBirth gender email")
        .sort({ class_name: 1, last_name: 1, first_name: 1 });

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch students",
      });
    }
  }

  // Student Health Profile Management
  static async getStudentHealthProfile(req, res, next) {
    try {
      const { studentId } = req.params;

      // Validate student exists
      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Student not found",
        });
      }

      // Get health profile
      const healthProfile = await HealthProfile.findOne({
        student: studentId,
      }).populate("student", "first_name last_name class_name");

      if (!healthProfile) {
        return res.status(404).json({
          success: false,
          error: "Health profile not found for this student",
        });
      }

      res.json({
        success: true,
        data: healthProfile,
      });
    } catch (error) {
      console.error("Error fetching student health profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch student health profile",
      });
    }
  }

  static async updateStudentHealthProfile(req, res, next) {
    try {
      const { studentId } = req.params;
      const updateData = req.body;

      // Validate student exists
      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Student not found",
        });
      }

      // Update or create health profile
      let healthProfile = await HealthProfile.findOneAndUpdate(
        { student: studentId },
        updateData,
        { new: true, upsert: true }
      ).populate("student", "first_name last_name class_name");

      res.json({
        success: true,
        data: healthProfile,
      });
    } catch (error) {
      console.error("Error updating student health profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update student health profile",
      });
    }
  }

  static async getStudentMedicalHistory(req, res, next) {
    try {
      const { studentId } = req.params;

      // Validate student exists
      const student = await User.findOne({ _id: studentId, role: "student" });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: "Student not found",
        });
      }

      // Get medical events for this student
      const medicalEvents = await MedicalEvent.find({ student: studentId })
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      // Get campaign results for this student
      const campaignResults = await CampaignResult.find({ student: studentId })
        .populate("campaign", "title campaign_type")
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          student,
          medicalEvents,
          campaignResults,
        },
      });
    } catch (error) {
      console.error("Error fetching student medical history:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch student medical history",
      });
    }
  }
}

module.exports = NurseController;



