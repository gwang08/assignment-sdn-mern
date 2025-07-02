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

const EVENT_TYPE = {
  ACCIDENT: "Accident",
  FEVER: "Fever",
  INJURY: "Injury",
  EPIDEMIC: "Epidemic",
  OTHER: "Other",
};

const EVENT_SEVERITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  EMERGENCY: "Emergency",
};

const EVENT_STATUS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REFERRED: "Referred to Hospital",
};

Object.freeze(GENDER);
Object.freeze(ALLERGY_SEVERITY);
Object.freeze(CHRONIC_DISEASE_STATUS);
Object.freeze(HEARING_STATUS);
Object.freeze(CAMPAIGN_TYPE);
Object.freeze(CAMPAIGN_CONSENT_STATUS);
Object.freeze(CONSULTATION_STATUS);
Object.freeze(EVENT_TYPE);
Object.freeze(EVENT_SEVERITY);
Object.freeze(EVENT_STATUS);

module.exports = {
  GENDER,
  ALLERGY_SEVERITY,
  CHRONIC_DISEASE_STATUS,
  HEARING_STATUS,
  CAMPAIGN_TYPE,
  CAMPAIGN_CONSENT_STATUS,
  CONSULTATION_STATUS,
  EVENT_TYPE,
  EVENT_SEVERITY,
  EVENT_STATUS,
};
