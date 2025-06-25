const Student = require("../models/user/student")
const MedicalStaff = require("../models/user/medicalStaff")
const HealthProfile = require("../models/healthProfile")
const MedicalEvent = require("../models/medicalEvent")
const MedicineRequest = require("../models/medicineRequest")
const Campaign = require("../models/campaign/campaign")
const CampaignResult = require("../models/campaign/campaignResult")
const CampaignConsent = require("../models/campaign/campaignConsent")
const ConsultationSchedule = require("../models/campaign/consultationSchedule")
const { CAMPAIGN_TYPE, CAMPAIGN_CONSENT_STATUS } = require("../utils/enums")

class NurseController {
    // Dashboard
    static async getDashboard(req, res, next) {
        try {
            res.render("nurse/dashboard", {
                title: "School Nurse Dashboard",
                nurse: req.nurse,
            })
        } catch (error) {
            next(error)
        }
    }

    // Medical Events Management
    static async getMedicalEvents(req, res, next) {
        try {
            const events = await MedicalEvent.find()
                .populate("student", "first_name last_name class_name")
                .populate("created_by", "first_name last_name role")
                .sort({ createdAt: -1 })
                .limit(50)

            res.json(events)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch medical events" })
        }
    }

    static async createMedicalEvent(req, res, next) {
        try {
            const { studentId, event } = req.body

            const medicalEvent = new MedicalEvent({
                student: studentId,
                created_by: req.nurse._id,
                event: event,
            })

            await medicalEvent.save()
            await medicalEvent.populate("student", "first_name last_name class_name")

            res.status(201).json(medicalEvent)
        } catch (error) {
            res.status(400).json({ error: "Failed to create medical event" })
        }
    }

    // Medicine & Supplies Management
    static async getMedicineRequests(req, res, next) {
        try {
            const requests = await MedicineRequest.find()
                .populate("student", "first_name last_name class_name")
                .populate("created_by", "first_name last_name")
                .sort({ createdAt: -1 })

            res.json(requests)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch medicine requests" })
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
            ])

            res.json(inventory)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch inventory data" })
        }
    }

    // Vaccination Management
    static async getVaccinationCampaigns(req, res, next) {
        try {
            const campaigns = await Campaign.find({ type: CAMPAIGN_TYPE.VACCINATION }).sort({ date: -1 })

            res.json(campaigns)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch vaccination campaigns" })
        }
    }

    static async createVaccinationCampaign(req, res, next) {
        try {
            const { title, description, date, vaccineDetails } = req.body

            const campaign = new Campaign({
                title,
                type: CAMPAIGN_TYPE.VACCINATION,
                description,
                date: new Date(date),
                vaccineDetails,
            })

            await campaign.save()
            res.status(201).json(campaign)
        } catch (error) {
            res.status(400).json({ error: "Failed to create vaccination campaign" })
        }
    }

    static async getVaccinationResults(req, res, next) {
        try {
            const results = await CampaignResult.find({ campaign: req.params.campaignId })
                .populate("student", "first_name last_name class_name")
                .populate("created_by", "first_name last_name")

            res.json(results)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch vaccination results" })
        }
    }

    static async createVaccinationResult(req, res, next) {
        try {
            const { studentId, notes } = req.body

            const result = new CampaignResult({
                campaign: req.params.campaignId,
                student: studentId,
                created_by: req.nurse._id,
                notes,
            })

            await result.save()
            await result.populate("student", "first_name last_name class_name")

            res.status(201).json(result)
        } catch (error) {
            res.status(400).json({ error: "Failed to record vaccination result" })
        }
    }

    // Periodic Health Check Management
    static async getHealthCheckCampaigns(req, res, next) {
        try {
            const campaigns = await Campaign.find({ type: CAMPAIGN_TYPE.CHECKUP }).sort({ date: -1 })

            res.json(campaigns)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch health check campaigns" })
        }
    }

    static async createHealthCheckCampaign(req, res, next) {
        try {
            const { title, description, date } = req.body

            const campaign = new Campaign({
                title,
                type: CAMPAIGN_TYPE.CHECKUP,
                description,
                date: new Date(date),
            })

            await campaign.save()
            res.status(201).json(campaign)
        } catch (error) {
            res.status(400).json({ error: "Failed to create health check campaign" })
        }
    }

    static async getHealthCheckResults(req, res, next) {
        try {
            const results = await CampaignResult.find({ campaign: req.params.campaignId })
                .populate("student", "first_name last_name class_name")
                .populate("created_by", "first_name last_name")

            res.json(results)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch health check results" })
        }
    }

    static async createHealthCheckResult(req, res, next) {
        try {
            const { studentId, checkupDetails, notes } = req.body

            const result = new CampaignResult({
                campaign: req.params.campaignId,
                student: studentId,
                created_by: req.nurse._id,
                notes,
                checkupDetails,
            })

            await result.save()
            await result.populate("student", "first_name last_name class_name")

            res.status(201).json(result)
        } catch (error) {
            res.status(400).json({ error: "Failed to record health check result" })
        }
    }

    // Consultation Management
    static async getConsultations(req, res, next) {
        try {
            const consultations = await ConsultationSchedule.find({ medicalStaff: req.nurse._id })
                .populate("student", "first_name last_name class_name")
                .populate("attending_parent", "first_name last_name phone_number")
                .populate("campaignResult")
                .sort({ scheduledDate: 1 })

            res.json(consultations)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch consultations" })
        }
    }

    // Student Health Records Management
    static async getStudents(req, res, next) {
        try {
            const { search, class_name } = req.query
            const query = {}

            if (search) {
                query.$or = [
                    { first_name: { $regex: search, $options: "i" } },
                    { last_name: { $regex: search, $options: "i" } },
                ]
            }

            if (class_name) {
                query.class_name = class_name
            }

            const students = await Student.find(query).sort({ last_name: 1, first_name: 1 }).limit(100)

            res.json(students)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch students" })
        }
    }

    static async getStudentHealthProfile(req, res, next) {
        try {
            const healthProfile = await HealthProfile.findOne({ student: req.params.studentId }).populate(
                "student",
                "first_name last_name class_name dateOfBirth gender",
            )

            if (!healthProfile) {
                return res.status(404).json({ error: "Health profile not found" })
            }

            res.json(healthProfile)
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch health profile" })
        }
    }

    static async updateStudentHealthProfile(req, res, next) {
        try {
            const updateData = req.body

            const healthProfile = await HealthProfile.findOneAndUpdate({ student: req.params.studentId }, updateData, {
                new: true,
                upsert: true,
            }).populate("student", "first_name last_name class_name")

            res.json(healthProfile)
        } catch (error) {
            res.status(400).json({ error: "Failed to update health profile" })
        }
    }

    static async getStudentMedicalHistory(req, res, next) {
        try {
            const medicalEvents = await MedicalEvent.find({ student: req.params.studentId })
                .populate("created_by", "first_name last_name role")
                .sort({ createdAt: -1 })

            const medicineRequests = await MedicineRequest.find({ student: req.params.studentId })
                .populate("created_by", "first_name last_name")
                .sort({ createdAt: -1 })

            const campaignResults = await CampaignResult.find({ student: req.params.studentId })
                .populate("campaign", "title type date")
                .populate("created_by", "first_name last_name")
                .sort({ createdAt: -1 })

            res.json({
                medicalEvents,
                medicineRequests,
                campaignResults,
            })
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch medical history" })
        }
    }
}

module.exports = NurseController
