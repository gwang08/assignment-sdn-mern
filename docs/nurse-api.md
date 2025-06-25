# Nurse API Documentation

This document outlines the available API endpoints for school nurse users in the School Health Management System.

## Base URL

`/nurse`

## Authentication

All endpoints require JWT authentication using the `x-auth-token` header. The token is obtained by logging in through the `/auth/login` endpoint with medical staff credentials.

## Endpoints

### Dashboard

- **URL:** `/`
- **Method:** `GET`
- **Description:** Returns dashboard data for the nurse.
- **Success Response:**
  - **Code:** 200
  - **Content:** JSON object with nurse information, recent events, and dashboard statistics.

### Medical Events Management

#### Get Medical Events

- **URL:** `/medical-events`
- **Method:** `GET`
- **Description:** Retrieves a list of medical events.
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of medical events with populated student and creator information.

#### Create Medical Event

- **URL:** `/medical-events`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "studentId": "60d2fb7e1234567890123457",
    "event_type": "FEVER",
    "description": "Student arrived with a temperature of 38.5°C",
    "severity": "MEDIUM",
    "symptoms": ["High temperature", "Headache"],
    "treatment_notes": "Given paracetamol and rested",
    "parent_notified": {
      "status": true,
      "method": "Phone call"
    },
    "follow_up_required": false
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created medical event object.
- **Error Response:**
  - **Code:** 400
  - **Content:** `{ error: "Failed to create medical event", details: "Error message" }`

#### Get Medical Event by ID

- **URL:** `/medical-events/:eventId`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Medical event details with populated references.
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ error: "Medical event not found" }`

#### Update Medical Event

- **URL:** `/medical-events/:eventId`
- **Method:** `PUT`
- **Request Body:**
  ```json
  {
    "severity": "HIGH",
    "symptoms": ["High temperature", "Headache", "Vomiting"],
    "treatment_notes": "Updated treatment notes"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated medical event object.
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ error: "Medical event not found" }`

#### Resolve Medical Event

- **URL:** `/medical-events/:eventId/resolve`
- **Method:** `PUT`
- **Request Body:**
  ```json
  {
    "treatment_notes": "Temperature returned to normal after medication"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated medical event with status "Resolved" and resolution timestamp.
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ error: "Medical event not found" }`

#### Add Medication

- **URL:** `/medical-events/:eventId/medications`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "name": "Paracetamol",
    "dosage": "500mg",
    "time": "2025-06-25T10:30:00"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated medical event with new medication.
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ error: "Medical event not found" }`

#### Update Parent Notification

- **URL:** `/medical-events/:eventId/notify-parent`
- **Method:** `PUT`
- **Request Body:**
  ```json
  {
    "status": true,
    "method": "SMS"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated medical event with notification details.
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ error: "Medical event not found" }`

### Medicine & Supplies Management

#### Get Medicine Requests

- **URL:** `/medicine-requests`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of medicine requests with populated information.

#### Get Medicine Inventory

- **URL:** `/medicine-inventory`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Aggregated medicine inventory data.

### Student Health Records Management

#### Get Students

- **URL:** `/students`
- **Method:** `GET`
- **Query Parameters:**
  - `search`: Optional search term for first or last name.
  - `class_name`: Optional filter for class.
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of students matching the query.

#### Get Student Health Profile

- **URL:** `/students/:studentId/health-profile`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Health profile details for the student.
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ error: "Health profile not found" }`

#### Update Student Health Profile

- **URL:** `/students/:studentId/health-profile`
- **Method:** `PUT`
- **Request Body:** Health profile update data.
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated health profile.

#### Get Student Medical History

- **URL:** `/students/:studentId/medical-history`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Object containing medical events, medicine requests, and campaign results for the student.

## Testing

For detailed testing instructions and sample data, refer to:

- [Nurse API Testing Guide](./nurse-api-testing.md)
- [Nurse API Test Data](./nurse-api-test-data.md)
- [Postman Collection for Testing](./nurse-api-postman.json) (Import this file into Postman)

## Models

For detailed information about the data models, including the MedicalEvent schema, refer to the corresponding model files in the `models` directory.
