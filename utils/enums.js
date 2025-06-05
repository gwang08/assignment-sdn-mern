const GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

const ALLERGY_SEVERITY = {
  MILD: "Mild",
  MODERATE: "Moderate",
  SEVERE: "Severe",
};

const CHRONIC_DISEASE_STATUS = {
  ACTIVE: "Active",
  MANAGED: "Managed",
  RESOLVED: "Resolved",
};

const HEARING_STATUS = {
  NORMAL: "Normal",
  MILD_LOSS: "Mild Loss",
  MODERATE_LOSS: "Moderate Loss",
  SEVERE_LOSS: "Severe Loss",
};

const CAMPAIGN_TYPE = {
  VACCINATION: "Vaccination",
  CHECKUP: "Checkup",
};

const CAMPAIGN_CONSENT_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

const CONSULTATION_STATUS = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

Object.freeze(GENDER);
Object.freeze(ALLERGY_SEVERITY);
Object.freeze(CHRONIC_DISEASE_STATUS);
Object.freeze(HEARING_STATUS);
Object.freeze(CAMPAIGN_TYPE);
Object.freeze(CAMPAIGN_CONSENT_STATUS);
Object.freeze(CONSULTATION_STATUS);

module.exports = {
  GENDER,
  ALLERGY_SEVERITY,
  CHRONIC_DISEASE_STATUS,
  HEARING_STATUS,
  CAMPAIGN_TYPE,
  CAMPAIGN_CONSENT_STATUS,
  CONSULTATION_STATUS,
};
