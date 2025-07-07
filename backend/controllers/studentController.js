const HealthProfile = require("../models/healthProfile");
const MedicalEvent = require("../models/medicalEvent");
/**
 * GET /api/student/health-profile
 * Get the health profile of the currently authenticated student
 */
exports.getStudentHealthProfile = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find health profile and populate student info if needed
    const profile = await HealthProfile.findOne({ student: studentId })
      .populate('student', 'first_name last_name username class_name')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hồ sơ sức khỏe cho học sinh này.",
      });
    }

    // Format response data to match frontend expectations
    const formattedProfile = {
      _id: profile._id,
      student_id: profile.student?._id || studentId,
      student: profile.student,
      
      // Allergies - format for frontend display
      allergies: profile.allergies?.map(allergy => allergy.name) || [],
      
      // Chronic diseases - format for frontend display  
      chronic_conditions: profile.chronicDiseases?.map(disease => disease.name) || [],
      chronicDiseases: profile.chronicDiseases || [],
      
      // Medical history from treatment history
      medical_history: profile.treatmentHistory?.map(treatment => 
        `${treatment.condition} - ${treatment.treatment || 'Điều trị'} (${new Date(treatment.treatmentDate).toLocaleDateString('vi-VN')})`
      ) || [],
      treatmentHistory: profile.treatmentHistory || [],
      
      // Medications - empty array since not in current schema
      medications: [],
      
      // Vision status
      vision_status: profile.vision && (profile.vision.leftEye || profile.vision.rightEye) ? 
        `Mắt trái: ${profile.vision.leftEye || 'N/A'}/10, Mắt phải: ${profile.vision.rightEye || 'N/A'}/10` : 
        'Chưa kiểm tra',
      vision: profile.vision || {},
      
      // Hearing status
      hearing_status: profile.hearing && (profile.hearing.leftEar || profile.hearing.rightEar) ? 
        `Tai trái: ${profile.hearing.leftEar || 'N/A'}, Tai phải: ${profile.hearing.rightEar || 'N/A'}` : 
        'Chưa kiểm tra',
      hearing: profile.hearing || {},
      
      // Vaccination records
      vaccination_records: profile.vaccinations?.map(vaccination => ({
        vaccine_name: vaccination.name,
        date_administered: vaccination.date,
        dose_number: 1, 
        administered_by: 'Y tá trường', // Default
        lot_number: '',
        expiration_date: '',
        notes: vaccination.notes || ''
      })) || [],
      vaccinations: profile.vaccinations || [],
      
      // Timestamps
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    return res.status(200).json({
      success: true,
      data: formattedProfile,
      message: "Lấy hồ sơ sức khỏe thành công"
    });

  } catch (err) {
    console.error("Lỗi khi lấy hồ sơ sức khỏe học sinh:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi truy xuất hồ sơ sức khỏe.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * GET /api/student/medical-events
 * Get all medical events for the currently authenticated student
 */
exports.getStudentMedicalEvents = async (req, res) => {
  try {
    const studentId = req.user._id;

    const events = await MedicalEvent.find({ student: studentId })
      .populate("created_by", "first_name last_name role")
      .sort({ createdAt: -1 })
      .lean();

    // Format data to match FE expectation
    const formatted = events.map(event => ({
      _id: event._id,
      student_id: studentId,
      event_type: event.event_type.toLowerCase(),
      title: event.event_type === "OTHER" ? "Sự kiện khác" : `Sự kiện ${event.event_type}`,
      description: event.description || "",
      severity: event.severity.toLowerCase(),
      symptoms: event.symptoms || [],
      treatment_provided: event.treatment_notes || "",
      medications_given: (event.medications_administered || []).map(m => m.name),
      status: event.status.toLowerCase(),
      created_by: event.created_by?._id || "",
      follow_up_required: event.follow_up_required || false,
      follow_up_date: event.follow_up_notes ? new Date().toISOString() : undefined, 
      follow_up_notes: event.follow_up_notes || "",
      parent_notified: event.parent_notified?.status || false,
      notification_sent_at: event.parent_notified?.time || null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử y tế học sinh:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy lịch sử y tế.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};