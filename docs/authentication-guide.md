# Authentication Guide for School Health Management System

This guide explains how authentication works in the School Health Management System and how to properly implement it across the application.

> **For Quick Testing:** See the [Authentication Quick Start Guide](./authentication-quickstart.md) to quickly set up test users and test the authentication system.

## Authentication Flow

1. **User Registration**: Users (parents, medical staff) register through `/auth/register` endpoint
2. **User Login**: Users log in through `/auth/login` endpoint and receive a JWT token
3. **Token Usage**: The JWT token must be included in the `x-auth-token` header for authenticated requests
4. **Protected Routes**: All routes in `parent.js` and `nurse.js` are protected with respective middleware

## Authentication Middleware

The system uses the following middleware for authentication:

- `authenticateParent`: For parent routes
- `authenticateMedicalStaff`: For medical staff (nurse) routes
- `authenticateAny`: For routes that allow any authenticated user type

## Implementation Details

### Parent and Staff Models

Both the Parent and MedicalStaff models include `password` fields that are properly hashed during registration:

```javascript
// From parent.js model
password: {
  type: String,
  required: true,
}

// From medicalStaff.js model
password: {
  type: String,
  required: true,
}
```

### Authentication Service

The `authService.js` provides the following functions:

1. **register(userData, userType)**: Registers a new user with a hashed password
2. **login(username, password, userType)**: Authenticates a user and returns a JWT token
3. **verifyToken(token)**: Verifies a JWT token and returns the user data
4. **changePassword(userId, userType, currentPassword, newPassword)**: Changes a user's password

### Using Authentication in Routes

Example for parent routes:

```javascript
router.get(
  "/students/:studentId/health-profile",
  authenticateParent,
  parentController.getStudentHealthProfile
);
```

Example for nurse routes:

```javascript
router.post(
  "/medical-events",
  authenticateMedicalStaff,
  NurseController.createMedicalEvent
);
```

## Testing Authentication

1. Register a user via the `/auth/register` endpoint
2. Login via the `/auth/login` endpoint to get a token
3. Include the token in the `x-auth-token` header for subsequent requests

## Security Best Practices

1. Always use HTTPS in production
2. Set appropriate token expiration times (currently 24 hours)
3. Never expose passwords or tokens in logs or error messages
4. Use proper error handling for authentication failures
5. Regularly audit authentication code for security issues
