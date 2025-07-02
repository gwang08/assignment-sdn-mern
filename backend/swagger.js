const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School Health Management System API",
      version: "1.0.0",
      description:
        "API documentation for the School Health Management System. This system provides endpoints for parent and school nurse interaction with student health records.\n\n" +
        "## Authentication\n\n" +
        "All endpoints are protected by JWT Bearer authentication. To access them:\n\n" +
        "1. Login via the `/auth/login` endpoint to get a JWT token\n" +
        "2. Include the token in the Authorization header using the Bearer scheme for all subsequent API calls\n" +
        "   Example: `Authorization: Bearer your.jwt.token`\n\n" +
        "## Registration Rules\n\n" +
        "- Only parents can register through the public `/auth/register` endpoint\n" +
        "- All other user accounts (students, medical staff, admins) must be created by an authorized admin\n" +
        "- Admins have full access to manage students, parents, and medical staff",
      contact: {
        name: "School Health Management Team",
        email: "support@schoolhealth.example.com",
        url: "https://schoolhealth.example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "{protocol}://{host}:{port}",
        description: "Custom server",
        variables: {
          protocol: {
            enum: ["http", "https"],
            default: "http",
          },
          host: {
            default: "localhost",
          },
          port: {
            default: "3000",
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: [
            "username",
            "password",
            "role",
            "first_name",
            "last_name",
            "gender",
          ],
          properties: {
            _id: {
              type: "string",
              description: "User ID",
              example: "60d21b4667d0d8992e610c85",
            },
            username: {
              type: "string",
              description: "Username for login",
              example: "jsmith",
            },
            password: {
              type: "string",
              description: "Password (hashed, not returned in responses)",
              example: "hashedpassword123",
            },
            role: {
              type: "string",
              enum: ["parent", "student", "medicalStaff", "admin"],
              description: "Role of the user",
              example: "parent",
            },
            email: {
              type: "string",
              description:
                "Email address (required for all roles except student)",
              example: "john.smith@example.com",
            },
            phone_number: {
              type: "string",
              description:
                "Phone number (required for all roles except student)",
              example: "123-456-7890",
            },
            // Student-specific fields
            class_name: {
              type: "string",
              description: "Class name (required for student role)",
              example: "5A",
            },
            // Medical staff-specific fields
            staff_role: {
              type: "string",
              enum: ["Nurse", "Doctor", "Healthcare Assistant"],
              description: "Specific role for medical staff",
              example: "Nurse",
            },
            // Admin has no special fields
            // All admin functionality is controlled by the 'role' field being set to 'admin'
            is_active: {
              type: "boolean",
              description: "Whether the user is active",
              example: true,
            },
            last_login: {
              type: "string",
              format: "date-time",
              description: "Last login timestamp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Account last update timestamp",
            },
          },
        },
        Person: {
          type: "object",
          required: ["first_name", "last_name", "gender"],
          properties: {
            first_name: {
              type: "string",
              description: "First name of the person",
              example: "John",
            },
            last_name: {
              type: "string",
              description: "Last name of the person",
              example: "Smith",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              description: "Gender of the person",
              example: "male",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
              description: "Date of birth in ISO 8601 format",
              example: "2000-01-01",
            },
            address: {
              type: "object",
              properties: {
                street: {
                  type: "string",
                  example: "123 Main Street",
                },
                city: {
                  type: "string",
                  example: "Springfield",
                },
                state: {
                  type: "string",
                  example: "IL",
                },
                postal_code: {
                  type: "string",
                  example: "62704",
                },
                country: {
                  type: "string",
                  example: "USA",
                },
              },
            },
            is_active: {
              type: "boolean",
              default: true,
              description: "Whether the user account is active",
              example: true,
            },
          },
        },
        Parent: {
          allOf: [
            {
              $ref: "#/components/schemas/Person",
            },
            {
              type: "object",
              required: ["username", "password", "phone_number", "email"],
              properties: {
                username: {
                  type: "string",
                  description: "Unique username for login",
                  example: "parent_john",
                },
                password: {
                  type: "string",
                  format: "password",
                  description: "User password (will be hashed)",
                  example: "SecureP@ss123",
                },
                phone_number: {
                  type: "string",
                  description: "Contact phone number",
                  example: "555-123-4567",
                },
                email: {
                  type: "string",
                  format: "email",
                  description: "Email address",
                  example: "john.smith@example.com",
                },
              },
            },
          ],
        },
        Student: {
          allOf: [
            {
              $ref: "#/components/schemas/Person",
            },
            {
              type: "object",
              required: ["class_name"],
              properties: {
                class_name: {
                  type: "string",
                  description: "Name/ID of student's class",
                  example: "Class 5A",
                },
              },
            },
          ],
        },
        MedicalStaff: {
          allOf: [
            {
              $ref: "#/components/schemas/Person",
            },
            {
              type: "object",
              required: [
                "username",
                "password",
                "phone_number",
                "email",
                "role",
              ],
              properties: {
                username: {
                  type: "string",
                  description: "Unique username for login",
                  example: "nurse_sarah",
                },
                password: {
                  type: "string",
                  format: "password",
                  description: "User password (will be hashed)",
                  example: "StaffP@ss789",
                },
                phone_number: {
                  type: "string",
                  description: "Contact phone number",
                  example: "555-987-6543",
                },
                email: {
                  type: "string",
                  format: "email",
                  description: "Email address",
                  example: "sarah.jones@school.edu",
                },
                role: {
                  type: "string",
                  enum: ["medicalStaff"],
                  description: "User role (must be medicalStaff)",
                  example: "medicalStaff",
                  default: "medicalStaff",
                },
                staff_role: {
                  type: "string",
                  enum: ["Nurse", "Doctor", "Healthcare Assistant"],
                  description: "Specific medical staff role",
                  example: "Nurse",
                },
              },
            },
          ],
        },
        RegistrationRequest: {
          type: "object",
          required: ["userData", "userType"],
          description:
            "Note: Public registration is only available for parents. Other user types must be created by an authorized admin.",
          properties: {
            userData: {
              $ref: "#/components/schemas/Parent",
            },
            userType: {
              type: "string",
              enum: ["parent"],
              description:
                "Type of user account to create (maps to the role field in the unified User model). Only 'parent' is allowed for public registration.",
              example: "parent",
              default: "parent",
            },
          },
        },
        RegistrationResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              oneOf: [
                { $ref: "#/components/schemas/Parent" },
                { $ref: "#/components/schemas/Student" },
                { $ref: "#/components/schemas/MedicalStaff" },
              ],
            },
          },
        },
        StudentParentRequest: {
          type: "object",
          required: ["studentId", "relationship"],
          properties: {
            studentId: {
              type: "string",
              description: "ID of the student to link",
              example: "60d21b4667d0d8992e610c85",
            },
            relationship: {
              type: "string",
              description: "Type of relationship between parent and student",
              example: "Father",
            },
            is_emergency_contact: {
              type: "boolean",
              description: "Whether the parent is an emergency contact",
              default: false,
              example: true,
            },
            notes: {
              type: "string",
              description: "Additional notes about the relationship",
              example: "Biological father with shared custody",
            },
          },
        },
        StudentParentResponse: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "ID of the link request",
              example: "60d21b4667d0d8992e610c86",
            },
            student: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "60d21b4667d0d8992e610c85",
                },
                first_name: {
                  type: "string",
                  example: "Emma",
                },
                last_name: {
                  type: "string",
                  example: "Smith",
                },
                class_name: {
                  type: "string",
                  example: "Class 5A",
                },
              },
            },
            parent: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "60d21b4667d0d8992e610c87",
                },
                first_name: {
                  type: "string",
                  example: "John",
                },
                last_name: {
                  type: "string",
                  example: "Smith",
                },
                email: {
                  type: "string",
                  example: "john.smith@example.com",
                },
                phone_number: {
                  type: "string",
                  example: "555-123-4567",
                },
              },
            },
            relationship: {
              type: "string",
              example: "Father",
            },
            is_emergency_contact: {
              type: "boolean",
              example: true,
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected"],
              example: "pending",
            },
            notes: {
              type: "string",
              example: "Biological father with shared custody",
            },
            admin_notes: {
              type: "string",
              example: "Identity verified through school records",
            },
            processed_by: {
              type: "string",
              description: "ID of admin who processed the request",
              example: "60d21b4667d0d8992e610c88",
            },
            processed_at: {
              type: "string",
              format: "date-time",
              example: "2025-06-25T10:30:00Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-24T15:30:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-25T10:30:00Z",
            },
          },
        },
        Admin: {
          allOf: [
            {
              $ref: "#/components/schemas/Person",
            },
            {
              type: "object",
              required: ["username", "password", "email", "role"],
              properties: {
                username: {
                  type: "string",
                  description: "Unique username for login",
                  example: "admin_jane",
                },
                password: {
                  type: "string",
                  format: "password",
                  description: "User password (will be hashed)",
                  example: "AdminP@ss123",
                },
                email: {
                  type: "string",
                  format: "email",
                  description: "Email address",
                  example: "jane.doe@school.edu",
                },
                role: {
                  type: "string",
                  enum: ["super_admin", "student_manager"],
                  description: "Admin role type",
                  example: "super_admin",
                },
              },
            },
          ],
        },
        LinkRequestResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Link request processed successfully",
            },
            data: {
              $ref: "#/components/schemas/StudentParentResponse",
            },
          },
        },
        LinkRequestStatus: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["approved", "rejected"],
              description: "The decision on the link request",
              example: "approved",
            },
            notes: {
              type: "string",
              description: "Additional notes about the decision",
              example: "Identity verified through school records",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication information is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false,
                  },
                  message: {
                    type: "string",
                    example: "No token, authorization denied",
                  },
                },
              },
            },
          },
          ValidationError: {
            description: "Missing required fields or validation error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    message: {
                      type: "string",
                      example: "Missing required fields or invalid data",
                    },
                    errors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          field: {
                            type: "string",
                            example: "username",
                          },
                          message: {
                            type: "string",
                            example: "Username is required",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ServerError: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: false,
                    },
                    message: {
                      type: "string",
                      example: "Server error occurred",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User registration, login and authentication endpoints",
      },
      {
        name: "Admin",
        description:
          "Administrator endpoints for managing students, staff, and system settings",
      },
      {
        name: "Nurse",
        description:
          "School Nurse API endpoints for medical events, student health records, and medical campaigns",
      },
      {
        name: "Parent",
        description:
          "Parent API endpoints for student health profiles, medicine requests, and medical events",
      },
    ],
    paths: {
      "/auth/login": {
        post: {
          summary: "Login a user",
          description:
            "Authenticate a user with username and password. Returns a JWT token for subsequent API calls. The user's role is determined automatically.",
          tags: ["Authentication"],
          security: [], // No authentication required for login
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["username", "password"],
                  properties: {
                    username: {
                      type: "string",
                      description: "User's username",
                      example: "parent_user",
                    },
                    password: {
                      type: "string",
                      description: "User's password",
                      example: "SecureP@ss123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "object",
                        properties: {
                          token: {
                            type: "string",
                            description:
                              "JWT token to use for authenticated requests",
                            example:
                              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMjM0NTY3ODkwMSIsInJvbGUiOiJwYXJlbnQiLCJpYXQiOjE2MjA1MzYwMDAsImV4cCI6MTYyMDYyMjQwMH0.example-token",
                          },
                          user: {
                            type: "object",
                            properties: {
                              _id: {
                                type: "string",
                                description: "User ID",
                                example: "612345678901",
                              },
                              username: {
                                type: "string",
                                example: "parent_user",
                              },
                              first_name: {
                                type: "string",
                                example: "John",
                              },
                              last_name: {
                                type: "string",
                                example: "Doe",
                              },
                              email: {
                                type: "string",
                                example: "john.doe@example.com",
                              },
                              role: {
                                type: "string",
                                enum: [
                                  "parent",
                                  "student",
                                  "medicalStaff",
                                  "admin",
                                ],
                                example: "parent",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing username or password",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Please provide username and password",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Invalid credentials",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Server error occurred",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/register": {
        post: {
          summary: "Register a new parent user",
          description:
            "Register a new parent user account. Note: Only parent registration is allowed through this endpoint. Other user types (students, medical staff, admins) must be created by an authorized admin.",
          tags: ["Authentication"],
          security: [], // No authentication required for registration
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegistrationRequest",
                },
                examples: {
                  parent: {
                    summary: "Register a parent",
                    value: {
                      userData: {
                        first_name: "John",
                        last_name: "Smith",
                        gender: "male",
                        dateOfBirth: "1980-05-15",
                        address: {
                          street: "123 Oak Street",
                          city: "Springfield",
                          state: "IL",
                          postal_code: "62704",
                          country: "USA",
                        },
                        username: "parent_john",
                        password: "SecureP@ss123",
                        phone_number: "555-123-4567",
                        email: "john.smith@example.com",
                      },
                      userType: "parent",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User successfully registered",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RegistrationResponse",
                  },
                },
              },
            },
            400: {
              description: "Missing required fields or validation error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example:
                          "Missing required fields: first_name, last_name",
                      },
                    },
                  },
                },
              },
            },
            403: {
              description:
                "Forbidden - attempted to register a non-parent user type",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example:
                          "Only parent registration is allowed. Other user types must be created by an authorized admin.",
                      },
                    },
                  },
                },
              },
            },
            409: {
              description: "Duplicate user (username or email already exists)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Username or email already exists",
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Server error occurred",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/admin/students": {
        post: {
          summary: "Create a new student",
          description:
            "Create a new student account. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["studentData"],
                  properties: {
                    studentData: {
                      $ref: "#/components/schemas/Student",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Student created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/Student",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationError",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UnauthorizedError",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ServerError",
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Get all students",
          description:
            "Retrieve a list of all students. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of students retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Student",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/medical-staff": {
        post: {
          summary: "Create a new medical staff member",
          description:
            "Create a new medical staff account. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["staffData"],
                  properties: {
                    staffData: {
                      $ref: "#/components/schemas/MedicalStaff",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Medical staff created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/MedicalStaff",
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            409: {
              description: "Username or email already exists",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Username or email already exists",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
        get: {
          summary: "Get all medical staff",
          description:
            "Retrieve a list of all medical staff members. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of medical staff retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/MedicalStaff",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/student-parent-relations": {
        post: {
          summary: "Create a student-parent relationship",
          description:
            "Create a relationship between a student and parent. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["studentId", "parentId", "relationship"],
                  properties: {
                    studentId: {
                      type: "string",
                      description: "ID of the student",
                      example: "60d21b4667d0d8992e610c85",
                    },
                    parentId: {
                      type: "string",
                      description: "ID of the parent",
                      example: "60d21b4667d0d8992e610c87",
                    },
                    relationship: {
                      type: "string",
                      description: "Type of relationship",
                      example: "Father",
                    },
                    is_emergency_contact: {
                      type: "boolean",
                      description:
                        "Whether this parent is an emergency contact",
                      default: false,
                      example: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Relationship created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/StudentParentResponse",
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            404: {
              description: "Student or parent not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Student or parent not found",
                      },
                    },
                  },
                },
              },
            },
            409: {
              description: "Relationship already exists",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Student-parent relationship already exists",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
        get: {
          summary: "Get all student-parent relationships",
          description:
            "Retrieve a list of all student-parent relationships. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "List of relationships retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/StudentParentResponse",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/student-link/requests": {
        get: {
          summary: "Get pending parent-student link requests",
          description:
            "Get all pending link requests between parents and students. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description:
                "List of pending link requests retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/StudentParentResponse",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/student-link/requests/{requestId}": {
        put: {
          summary: "Approve or reject a student-parent link request",
          description:
            "Process a pending link request by approving or rejecting it. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "requestId",
              in: "path",
              required: true,
              description: "ID of the link request to process",
              schema: {
                type: "string",
              },
              example: "60d21b4667d0d8992e610c89",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LinkRequestStatus",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Link request processed successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LinkRequestResponse",
                  },
                },
              },
            },
            400: {
              description: "Invalid request status",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example:
                          "Invalid status. Must be either 'approved' or 'rejected'",
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            404: {
              description: "Link request not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Link request not found",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      // Dynamic path parameters
      "/admin/students/{studentId}": {
        put: {
          summary: "Update a student",
          description:
            "Update a student's information. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "studentId",
              in: "path",
              required: true,
              description: "ID of the student to update",
              schema: {
                type: "string",
              },
              example: "60d21b4667d0d8992e610c85",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Student",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Student updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/Student",
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            404: {
              description: "Student not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Student not found",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/students/{studentId}/deactivate": {
        put: {
          summary: "Deactivate a student",
          description:
            "Mark a student as inactive. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "studentId",
              in: "path",
              required: true,
              description: "ID of the student to deactivate",
              schema: {
                type: "string",
              },
              example: "60d21b4667d0d8992e610c85",
            },
          ],
          responses: {
            200: {
              description: "Student deactivated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Student deactivated successfully",
                      },
                      data: {
                        $ref: "#/components/schemas/Student",
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            404: {
              description: "Student not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Student not found",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/medical-staff/{staffId}": {
        put: {
          summary: "Update a medical staff member",
          description:
            "Update a medical staff member's information. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "staffId",
              in: "path",
              required: true,
              description: "ID of the staff member to update",
              schema: {
                type: "string",
              },
              example: "60d21b4667d0d8992e610c86",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MedicalStaff",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Medical staff updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/MedicalStaff",
                      },
                    },
                  },
                },
              },
            },
            400: { $ref: "#/components/responses/ValidationError" },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            404: {
              description: "Medical staff not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Medical staff not found",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
      "/admin/medical-staff/{staffId}/deactivate": {
        put: {
          summary: "Deactivate a medical staff member",
          description:
            "Mark a medical staff member as inactive. Only accessible by administrators.",
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "staffId",
              in: "path",
              required: true,
              description: "ID of the staff member to deactivate",
              schema: {
                type: "string",
              },
              example: "60d21b4667d0d8992e610c86",
            },
          ],
          responses: {
            200: {
              description: "Medical staff deactivated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Medical staff deactivated successfully",
                      },
                      data: {
                        $ref: "#/components/schemas/MedicalStaff",
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/UnauthorizedError" },
            404: {
              description: "Medical staff not found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                      },
                      message: {
                        type: "string",
                        example: "Medical staff not found",
                      },
                    },
                  },
                },
              },
            },
            500: { $ref: "#/components/responses/ServerError" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(options),
};
const specs = swaggerJsdoc(options);

// Setup swagger options
const swaggerOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "School Health Management API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "none",
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
  },
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, swaggerOptions),
  specs,
};
