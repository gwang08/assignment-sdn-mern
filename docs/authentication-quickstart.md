# Authentication Quick Start Guide

This guide helps you quickly set up and test the authentication system in the School Health Management System.

## Setup Steps

1. **Install Dependencies:**

   ```
   npm install
   ```

2. **Set Environment Variables:**
   Ensure your `.env` file has the following:

   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/assigment-sdn
   PORT=3000
   JWT_SECRET=school-health-management-system-secure-jwt-secret-key-2025
   ```

3. **Create Test Users:**

   ```
   npm run seed:users
   ```

   This creates sample parents, medical staff, and students for testing.

4. **Start the Server:**

   ```
   npm start
   ```

5. **Access Swagger UI:**
   Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser.

## Test User Credentials

### Parents

- **Username:** `parent1`
- **Password:** `password123`

OR

- **Username:** `parent2`
- **Password:** `password123`

### Medical Staff

- **Username:** `nurse1`
- **Password:** `password123`

OR

- **Username:** `doctor1`
- **Password:** `password123`

## Testing Authentication

### Using Swagger UI

1. **Login:**

   - Navigate to `POST /auth/login` endpoint
   - Use one of the test credentials above
   - Example request:
     ```json
     {
       "username": "parent1",
       "password": "password123",
       "userType": "parent"
     }
     ```
   - Copy the JWT token from the response

2. **Authorize:**

   - Click the "Authorize" button at the top of the Swagger UI
   - Enter your token in the "jwtAuth" field
   - Click "Authorize"

3. **Access Protected Endpoints:**
   - Try accessing parent or nurse endpoints based on your user type

### Using Postman or Curl

**Login Request:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "parent1", "password": "password123", "userType": "parent"}'
```

**Access Protected Endpoint:**

```bash
curl -X GET http://localhost:3000/parent/YOUR_PARENT_ID \
  -H "x-auth-token: YOUR_JWT_TOKEN"
```

## Troubleshooting

**Issue:** "Cannot find module 'bcryptjs'"
**Solution:** Run `npm install bcryptjs jsonwebtoken`

**Issue:** Authentication failed
**Solution:**

- Ensure you're using the correct username, password, and userType
- Check that your JWT_SECRET in .env matches the one used by the application
- Verify token is being passed in the x-auth-token header
