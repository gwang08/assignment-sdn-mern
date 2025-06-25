# Using Swagger UI for API Documentation and Testing

This guide will help you navigate and use the Swagger UI interface for exploring and testing the School Health Management System API.

## Accessing Swagger UI

1. Start the application server:

   ```bash
   npm start
   ```

2. Open your web browser and navigate to:

   ```
   http://localhost:3000/api-docs
   ```

## Overview of Swagger UI

The Swagger UI page is divided into several sections:

1. **Top bar**: Contains authentication button
2. **API endpoints**: Grouped by tags (Authentication, Nurse, Parent, etc.)
3. **Models**: Shows the data structure schemas

## Authentication in Swagger UI

All protected endpoints require JWT authentication. Follow these steps to authenticate:

### Step 1: Register a User

1. Expand the **Authentication** section
2. Find the `/auth/register` endpoint
3. Click "Try it out"
4. Provide registration details for either a parent or medical staff:

   ```json
   {
     "userData": {
       "username": "parent_user",
       "password": "secure_password",
       "first_name": "John",
       "last_name": "Doe",
       "email": "john.doe@example.com",
       "phone_number": "1234567890"
     },
     "userType": "parent"
   }
   ```

5. Click "Execute"

### Step 2: Login to Get a JWT Token

1. Find the `/auth/login` endpoint
2. Click "Try it out"
3. Enter your login credentials:

   ```json
   {
     "username": "parent_user",
     "password": "secure_password",
     "userType": "parent"
   }
   ```

4. Click "Execute"
5. Copy the JWT token from the response body (it will be under `data.token`)

### Step 3: Authorize with the JWT Token

1. Click the "Authorize" button at the top of the page
2. In the "jwtAuth (apiKey)" section, enter your JWT token in the "Value" field
3. Click "Authorize"
4. Click "Close"

You are now authenticated! All API calls will include your JWT token.

## Testing API Endpoints

### Parent Endpoints

With your parent JWT token authorized:

1. Expand the **Parent** section
2. Choose an endpoint like `/parent/students`
3. Click "Try it out"
4. Click "Execute"

### Nurse Endpoints

With a medical staff JWT token authorized:

1. Expand the **Nurse** section
2. Choose an endpoint like `/nurse/students`
3. Click "Try it out"
4. Enter any necessary parameters
5. Click "Execute"

## Common Authentication Issues

If you get a 401 (Unauthorized) or 403 (Forbidden) response, check:

1. Your token may have expired (tokens expire after 24 hours)
2. You might be using the wrong user type for the endpoint
3. The token might not be properly formatted in the authorization header

## Response Codes

- **200/201**: Successful request
- **400**: Bad request (validation error)
- **401**: Not authenticated
- **403**: Not authorized (authenticated but don't have permission)
- **404**: Resource not found
- **500**: Server error
