# Sample Data for Testing School Nurse API

## MongoDB Sample Data

You can use the following MongoDB commands to insert test data for the API testing.

### 1. Insert Sample Medical Staff (Nurse)

```javascript
db.medicalstaff.insertOne({
  _id: ObjectId("60d2fb7e1234567890123456"),
  first_name: "Mary",
  last_name: "Johnson",
  email: "mary.johnson@school.edu",
  phone_number: "1234567890",
  role: "School Nurse",
  specialization: "Pediatric Nursing",
  is_active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### 2. Insert Sample Students

```javascript
db.students.insertMany([
  {
    _id: ObjectId("60d2fb7e1234567890123457"),
    first_name: "Jane",
    last_name: "Smith",
    dateOfBirth: new Date("2015-03-15"),
    gender: "female",
    class_name: "Grade 5A",
    school_id: "S12345",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId("60d2fb7e1234567890123458"),
    first_name: "John",
    last_name: "Doe",
    dateOfBirth: new Date("2014-07-22"),
    gender: "male",
    class_name: "Grade 6B",
    school_id: "S12346",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### 3. Insert Sample Parents

```javascript
db.parents.insertMany([
  {
    _id: ObjectId("60d2fb7e1234567890123459"),
    first_name: "Sarah",
    last_name: "Smith",
    email: "sarah.smith@example.com",
    phone_number: "9876543210",
    address: "123 Main St, City",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId("60d2fb7e123456789012345a"),
    first_name: "Michael",
    last_name: "Doe",
    email: "michael.doe@example.com",
    phone_number: "8765432109",
    address: "456 Oak St, City",
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### 4. Insert Sample Student-Parent Relationships

```javascript
db.studentparents.insertMany([
  {
    student: ObjectId("60d2fb7e1234567890123457"),
    parent: ObjectId("60d2fb7e1234567890123459"),
    relationship: "Mother",
    is_emergency_contact: true,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    student: ObjectId("60d2fb7e1234567890123458"),
    parent: ObjectId("60d2fb7e123456789012345a"),
    relationship: "Father",
    is_emergency_contact: true,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### 5. Insert Sample Health Profiles

```javascript
db.healthprofiles.insertMany([
  {
    student: ObjectId("60d2fb7e1234567890123457"),
    allergies: [
      {
        name: "Peanuts",
        severity: "Severe",
        notes: "Causes rash and difficulty breathing",
      },
    ],
    chronicDiseases: [
      {
        name: "Asthma",
        diagnosedDate: new Date("2022-02-10"),
        status: "Managed",
        notes: "Uses inhaler when needed",
      },
    ],
    treatmentHistory: [
      {
        condition: "Broken arm",
        treatmentDate: new Date("2023-09-15"),
        treatment: "Cast for 6 weeks",
        outcome: "Fully healed",
      },
    ],
    vision: {
      leftEye: 1.2,
      rightEye: 1.0,
      lastCheckDate: new Date("2024-11-05"),
    },
    hearing: {
      leftEar: "Normal",
      rightEar: "Normal",
      lastCheckDate: new Date("2024-11-05"),
    },
    vaccinations: [
      {
        name: "MMR",
        date: new Date("2018-04-12"),
        nextDueDate: new Date("2025-04-12"),
        notes: "No adverse reactions",
      },
      {
        name: "DTaP",
        date: new Date("2019-06-15"),
        nextDueDate: null,
        notes: "Mild fever after vaccination",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    student: ObjectId("60d2fb7e1234567890123458"),
    allergies: [],
    chronicDiseases: [],
    treatmentHistory: [],
    vision: {
      leftEye: 0.8,
      rightEye: 0.9,
      lastCheckDate: new Date("2024-10-20"),
    },
    hearing: {
      leftEar: "Normal",
      rightEar: "Mild Loss",
      lastCheckDate: new Date("2024-10-20"),
    },
    vaccinations: [
      {
        name: "MMR",
        date: new Date("2017-07-22"),
        nextDueDate: new Date("2024-07-22"),
        notes: "",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### 6. Insert Sample Medical Events

```javascript
db.medicalevents.insertMany([
  {
    student: ObjectId("60d2fb7e1234567890123457"),
    created_by: ObjectId("60d2fb7e1234567890123456"),
    event_type: "Fever",
    description: "Student had a temperature of 38°C during PE class",
    severity: "Medium",
    status: "Resolved",
    symptoms: ["High temperature", "Fatigue"],
    occurred_at: new Date("2025-06-20T10:15:00"),
    resolved_at: new Date("2025-06-20T12:30:00"),
    treatment_notes: "Given paracetamol and rested in nurse's office",
    medications_administered: [
      {
        name: "Paracetamol",
        dosage: "250mg",
        time: new Date("2025-06-20T10:30:00"),
        administered_by: ObjectId("60d2fb7e1234567890123456"),
      },
    ],
    parent_notified: {
      status: true,
      time: new Date("2025-06-20T10:45:00"),
      method: "Phone call",
    },
    follow_up_required: false,
    follow_up_notes: "",
    createdAt: new Date("2025-06-20T10:15:00"),
    updatedAt: new Date("2025-06-20T12:30:00"),
  },
  {
    student: ObjectId("60d2fb7e1234567890123458"),
    created_by: ObjectId("60d2fb7e1234567890123456"),
    event_type: "Injury",
    description: "Student fell during recess and scraped knee",
    severity: "Low",
    status: "Resolved",
    symptoms: ["Abrasion on right knee", "Minor pain"],
    occurred_at: new Date("2025-06-22T11:20:00"),
    resolved_at: new Date("2025-06-22T11:45:00"),
    treatment_notes: "Cleaned wound with antiseptic and applied bandage",
    medications_administered: [],
    parent_notified: {
      status: true,
      time: new Date("2025-06-22T11:50:00"),
      method: "SMS",
    },
    follow_up_required: false,
    follow_up_notes: "",
    createdAt: new Date("2025-06-22T11:20:00"),
    updatedAt: new Date("2025-06-22T11:45:00"),
  },
]);
```

## API Testing Flow

1. Get all students
2. Pick a student ID
3. Create a medical event for that student
4. Use the returned event ID in the subsequent requests
5. Update the event details
6. Add medication to the event
7. Update parent notification status
8. Mark the event as resolved
9. Verify the final state matches what you expect
