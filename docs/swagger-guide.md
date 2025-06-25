# Swagger Documentation Guide

This document explains how to use the Swagger UI documentation for the School Health Management System API.

## Accessing the Documentation

1. Start the server:

   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api-docs
   ```

## Using Swagger UI

### Authentication

The API uses JWT-based authentication:

1. Login via the `/auth/login` endpoint to get a JWT token
2. In Swagger UI, click "Authorize" and enter your token in the `jwtAuth` field (x-auth-token header)
3. All authenticated endpoints will now use this token

### API Endpoints

The endpoints are organized by tags:

- **Nurse**: School nurse API endpoints
- **Parent**: Parent API endpoints

Each endpoint provides:

- Description of the endpoint
- Required parameters
- Request body schema (for POST and PUT)
- Response schema
- Example values

### Testing Endpoints

1. Click on the endpoint you want to test
2. Click "Try it out"
3. Fill in the required parameters and request body
4. Click "Execute"
5. View the response

### Response Information

Each response includes:

- Status code
- Response headers
- Response body

### Models

The documentation includes detailed models for:

- MedicalEvent
- HealthProfile
- MedicineRequest

## Sample Testing Workflow

### Nurse API Workflow:

1. Authorize with your JWT token (from `/auth/login`)
2. Use GET `/nurse/students` to find a student ID
3. Use POST `/nurse/medical-events` to create a medical event
4. Use GET `/nurse/medical-events/{eventId}` to view the created event
5. Use PUT `/nurse/medical-events/{eventId}` to update the event
6. Use POST `/nurse/medical-events/{eventId}/medications` to add medication
7. Use PUT `/nurse/medical-events/{eventId}/resolve` to resolve the event

### Parent API Workflow:

1. Authorize with your JWT token (from `/auth/login`)
2. Use GET `/parent/students` to find related students
3. Use GET `/parent/students/{studentId}/health-profile` to view a health profile
4. Use PUT `/parent/students/{studentId}/health-profile` to update the profile
5. Use POST `/parent/students/{studentId}/medicine-requests` to create a medicine request
6. Use GET `/parent/medicine-requests` to view all medicine requests

## Troubleshooting

If you encounter errors:

1. **401 Unauthorized**: Verify your JWT token is valid and not expired
2. **403 Forbidden**: Make sure you have the right permissions for the endpoint
3. **404 Not Found**: Check that the resource ID exists
4. **400 Bad Request**: Verify your request body matches the schema

## For Developers

To add new endpoints to the documentation:

1. Use JSDoc annotations in your route files
2. Follow the same format as existing annotations
3. Restart the server to see the updated documentation
