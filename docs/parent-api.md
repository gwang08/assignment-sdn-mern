# Parent API Documentation

This document outlines the available API endpoints for parent users in the School Health Management System.

## Base URL

`/parent`

## Authentication

All endpoints require JWT authentication using the `x-auth-token` header. The token is obtained by logging in through the `/auth/login` endpoint.

## Endpoints

### Get Parent Profile

Retrieve the authenticated parent's profile information.

- **URL:** `/profile`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: { parent object } }`
- **Error Response:**
  - **Code:** 401
  - **Content:** `{ success: false, message: "No token, authorization denied" }`
  - **Code:** 404
  - **Content:** `{ success: false, message: "Parent not found" }`

### Get Related Students

Retrieve all students related to the authenticated parent.

- **URL:** `/students`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { student: { student object }, relationship: "string", is_emergency_contact: boolean } ] }`

### Get Student Health Profile

Retrieve a student's health profile.

- **URL:** `/students/:studentId/health-profile`
- **Method:** `GET`
- **URL Params:**
  - `studentId`: The ID of the student.
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: { health profile object } }`
- **Error Responses:**
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to access this student's data" }`
  - **Code:** 404
  - **Content:** `{ success: false, message: "Health profile not found" }`

### Update Student Health Profile

Update or create a student's health profile.

- **URL:** `/students/:studentId/health-profile`
- **Method:** `PUT`
- **URL Params:**
  - `studentId`: The ID of the student.
- **Request Body:**
  ```json
  {
    "allergies": [
      {
        "name": "Peanuts",
        "severity": "Severe",
        "notes": "Causes anaphylaxis"
      }
    ],
    "chronicDiseases": [
      {
        "name": "Asthma",
        "diagnosedDate": "2023-01-15",
        "status": "Managed",
        "notes": "Uses inhaler when needed"
      }
    ],
    "treatmentHistory": [
      {
        "condition": "Broken arm",
        "treatmentDate": "2024-03-10",
        "treatment": "Cast for 6 weeks",
        "outcome": "Fully healed"
      }
    ],
    "vision": {
      "leftEye": 1.2,
      "rightEye": 1.0,
      "lastCheckDate": "2024-05-20"
    },
    "hearing": {
      "leftEar": "Normal",
      "rightEar": "Normal",
      "lastCheckDate": "2024-05-20"
    },
    "vaccinations": [
      {
        "name": "MMR",
        "date": "2020-06-10",
        "nextDueDate": "2025-06-10",
        "notes": "No adverse reactions"
      }
    ]
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: { updated health profile object } }`
- **Error Responses:**
  - **Code:** 400
  - **Content:** `{ success: false, message: "Validation error details" }`
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to update this student's data" }`

### Create Medicine Request

Create a new medicine request for a student.

- **URL:** `/students/:studentId/medicine-requests`
- **Method:** `POST`
- **URL Params:**
  - `studentId`: The ID of the student.
- **Request Body:**
  ```json
  {
    "startDate": "2024-06-01",
    "endDate": "2024-06-07",
    "medicines": [
      {
        "name": "Antibiotic",
        "dosage": "5ml",
        "frequency": "Twice daily",
        "notes": "After meals"
      }
    ]
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ success: true, data: { medicine request object } }`
- **Error Responses:**
  - **Code:** 400
  - **Content:** `{ success: false, message: "Validation error details" }`
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to create medicine requests for this student" }`

### Get All Medicine Requests

Get all medicine requests created by the authenticated parent.

- **URL:** `/medicine-requests`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { medicine request objects } ] }`

### Get Student Medicine Requests

Get medicine requests for a specific student.

- **URL:** `/students/:studentId/medicine-requests`
- **Method:** `GET`
- **URL Params:**
  - `studentId`: The ID of the student.
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { medicine request objects } ] }`
- **Error Response:**
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to access this student's data" }`

### Get Student Medical Events

Get medical events for a student.

- **URL:** `/students/:studentId/medical-events`
- **Method:** `GET`
- **URL Params:**
  - `studentId`: The ID of the student.
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { medical event objects } ] }`
- **Error Response:**
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to access this student's data" }`

### Get Campaigns

Get campaigns relevant to the authenticated parent's students.

- **URL:** `/campaigns`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { campaign objects with consent status } ] }`

### Update Campaign Consent

Update consent for a campaign.

- **URL:** `/students/:studentId/campaigns/:campaignId/consent`
- **Method:** `PUT`
- **URL Params:**
  - `studentId`: The ID of the student.
  - `campaignId`: The ID of the campaign.
- **Request Body:**
  ```json
  {
    "status": "Approved",
    "notes": "Optional notes"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: { consent object } }`
- **Error Response:**
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to update consent for this student" }`

### Get Campaign Results

Get campaign results for a student.

- **URL:** `/students/:studentId/campaign-results`
- **Method:** `GET`
- **URL Params:**
  - `studentId`: The ID of the student.
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { campaign result objects } ] }`
- **Error Response:**
  - **Code:** 403
  - **Content:** `{ success: false, message: "Not authorized to access this student's data" }`

### Get Consultation Schedules

Get consultation schedules for the authenticated parent.

- **URL:** `/consultation-schedules`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ success: true, data: [ { consultation schedule objects } ] }`

## Models

### Health Profile

```javascript
{
  student: ObjectId,
  allergies: [
    {
      name: String,
      severity: String, // "Mild", "Moderate", "Severe"
      notes: String
    }
  ],
  chronicDiseases: [
    {
      name: String,
      diagnosedDate: Date,
      status: String, // "Active", "Managed", "Resolved"
      notes: String
    }
  ],
  treatmentHistory: [
    {
      condition: String,
      treatmentDate: Date,
      treatment: String,
      outcome: String
    }
  ],
  vision: {
    leftEye: Number,
    rightEye: Number,
    lastCheckDate: Date
  },
  hearing: {
    leftEar: String, // "Normal", "Mild Loss", "Moderate Loss", "Severe Loss"
    rightEar: String,
    lastCheckDate: Date
  },
  vaccinations: [
    {
      name: String,
      date: Date,
      nextDueDate: Date,
      notes: String
    }
  ]
}
```

### Medicine Request

```javascript
{
  student: ObjectId,
  created_by: ObjectId, // Parent ID
  startDate: Date,
  endDate: Date,
  medicines: [
    {
      name: String,
      dosage: String,
      frequency: String,
      notes: String
    }
  ],
  status: String, // "Pending", "Approved", "Rejected", "Completed"
  approved_by: ObjectId, // Medical Staff ID
  approval_date: Date,
  notes: String
}
```

### Medical Event

```javascript
{
  student: ObjectId,
  created_by: ObjectId, // Medical Staff ID
  event_type: String, // "Accident", "Fever", "Injury", "Epidemic", "Other"
  description: String,
  severity: String, // "Low", "Medium", "High", "Emergency"
  status: String, // "Open", "In Progress", "Resolved", "Referred to Hospital"
  symptoms: [String],
  occurred_at: Date,
  resolved_at: Date,
  treatment_notes: String,
  medications_administered: [
    {
      name: String,
      dosage: String,
      time: Date,
      administered_by: ObjectId // Medical Staff ID
    }
  ],
  parent_notified: {
    status: Boolean,
    time: Date,
    method: String
  },
  follow_up_required: Boolean,
  follow_up_notes: String
}
```

### Campaign

```javascript
{
  title: String,
  description: String,
  type: String, // "Vaccination", "Checkup", "Educational", "Other"
  target_class: String, // "All" or specific class name
  target_students: [ObjectId], // Optional specific students
  date: Date,
  status: String // "Scheduled", "In Progress", "Completed", "Cancelled"
}
```
