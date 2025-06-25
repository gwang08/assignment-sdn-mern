# School Nurse API Testing Guide

This document provides instructions for testing the School Nurse API endpoints related to the Medical Events management.

## Prerequisites

- Postman, Insomnia, or any API testing tool
- MongoDB running with sample data
- Node.js server running

## Authentication

For testing, you need to authenticate with JWT:

1. Obtain a JWT token by making a POST request to the login endpoint:

   ```
   POST /auth/login
   Content-Type: application/json

   {
     "username": "nurse1",
     "password": "password123",
     "userType": "medicalStaff"
   }
   ```

2. Include the returned token in all API requests as an `x-auth-token` header:
   ```
   x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 1. Medical Events Endpoints

### 1.1 Get All Medical Events

Retrieves a list of all medical events.

- **URL:** `/nurse/medical-events`
- **Method:** `GET`
- **Headers:** `x-auth-token: <your-jwt-token>`
- **Expected Response:**
  - **Status:** 200
  - **Body:** Array of medical events with student and creator information

### 1.2 Create a Medical Event

Creates a new medical event for a student.

- **URL:** `/nurse/medical-events`
- **Method:** `POST`
- **Headers:** `x-auth-token: <your-jwt-token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "studentId": "60d2fb7e1234567890123457",
    "event_type": "FEVER",
    "description": "Student arrived with a temperature of 38.5°C",
    "severity": "MEDIUM",
    "symptoms": ["High temperature", "Headache", "Fatigue"],
    "treatment_notes": "Given paracetamol and rested in the nurse's office",
    "parent_notified": {
      "status": true,
      "method": "Phone call"
    },
    "follow_up_required": false
  }
  ```
- **Expected Response:**
  - **Status:** 201
  - **Body:** The created medical event object

### 1.3 Get a Specific Medical Event

Retrieves details of a specific medical event.

- **URL:** `/nurse/medical-events/:eventId`
- **Method:** `GET`
- **Headers:** `x-auth-token: <your-jwt-token>`
- **Expected Response:**
  - **Status:** 200
  - **Body:** Medical event details with populated references

### 1.4 Update a Medical Event

Updates an existing medical event.

- **URL:** `/nurse/medical-events/:eventId`
- **Method:** `PUT`
- **Headers:** `x-auth-token: <your-jwt-token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "severity": "HIGH",
    "symptoms": ["High temperature", "Headache", "Fatigue", "Vomiting"],
    "treatment_notes": "Updated treatment notes after symptoms worsened"
  }
  ```
- **Expected Response:**
  - **Status:** 200
  - **Body:** Updated medical event object

### 1.5 Mark a Medical Event as Resolved

Resolves a medical event.

- **URL:** `/nurse/medical-events/:eventId/resolve`
- **Method:** `PUT`
- **Headers:** `x-auth-token: <your-jwt-token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "treatment_notes": "Temperature returned to normal after medication and rest"
  }
  ```
- **Expected Response:**
  - **Status:** 200
  - **Body:** Updated medical event object with status set to "Resolved"

### 1.6 Add Medication to a Medical Event

Records medication administered to a student during a medical event.

- **URL:** `/nurse/medical-events/:eventId/medications`
- **Method:** `POST`
- **Headers:** `x-auth-token: <your-jwt-token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "name": "Paracetamol",
    "dosage": "500mg",
    "time": "2025-06-25T10:30:00"
  }
  ```
- **Expected Response:**
  - **Status:** 200
  - **Body:** Updated medical event with new medication in medications_administered array

### 1.7 Update Parent Notification Status

Records that a parent has been notified about a medical event.

- **URL:** `/nurse/medical-events/:eventId/notify-parent`
- **Method:** `PUT`
- **Headers:** `x-auth-token: <your-jwt-token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "status": true,
    "method": "SMS"
  }
  ```
- **Expected Response:**
  - **Status:** 200
  - **Body:** Updated medical event with notification status

## Testing Scenarios

### Basic Flow Testing

1. Create a new medical event
2. Retrieve the created event
3. Add medication to the event
4. Update the event (e.g., add symptoms or change severity)
5. Update parent notification status
6. Mark the event as resolved
7. Verify the final state of the event

### Error Handling Testing

1. Try to create an event with missing required fields
   - Should return 400 error
2. Try to update a non-existent event
   - Should return 404 error
3. Try to access endpoints without a valid nurse-id
   - Should return 401 error

## Sample Test Data

### Students

```json
{
  "_id": "60d2fb7e1234567890123457",
  "first_name": "Jane",
  "last_name": "Smith",
  "class_name": "Grade 5A"
}
```

### Medical Staff (Nurse)

```json
{
  "_id": "60d2fb7e1234567890123456",
  "first_name": "Mary",
  "last_name": "Johnson",
  "role": "School Nurse"
}
```
