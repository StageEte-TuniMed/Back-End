// Test Authentication Endpoints
// This file contains examples of how to test the authentication endpoints

const testEndpoints = {
  // Test user registration
  register: {
    method: "POST",
    url: "/api/auth/register",
    body: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "Password123",
      phone: "+1234567890",
      role: "PATIENT",
      medicalHistory: "No known allergies",
    },
  },

  // Test doctor registration
  registerDoctor: {
    method: "POST",
    url: "/api/auth/register",
    body: {
      name: "Dr. Jane Smith",
      email: "jane.smith@example.com",
      password: "Password123",
      phone: "+1234567891",
      role: "DOCTOR",
      specialty: "Cardiology",
    },
  },

  // Test user login
  login: {
    method: "POST",
    url: "/api/auth/login",
    body: {
      email: "john.doe@example.com",
      password: "Password123",
    },
  },

  // Test logout (requires Bearer token in Authorization header)
  logout: {
    method: "POST",
    url: "/api/auth/logout",
    headers: {
      Authorization: "Bearer YOUR_TOKEN_HERE",
    },
  },

  // Test token refresh
  refresh: {
    method: "POST",
    url: "/api/auth/refresh",
    body: {
      token: "YOUR_TOKEN_HERE",
    },
  },

  // Test forgot password
  forgotPassword: {
    method: "POST",
    url: "/api/auth/forgot-password",
    body: {
      email: "john.doe@example.com",
    },
  },

  // Test reset password
  resetPassword: {
    method: "POST",
    url: "/api/auth/reset-password",
    body: {
      token: "RESET_TOKEN_HERE",
      newPassword: "NewPassword123",
    },
  },

  // Test email verification
  verifyEmail: {
    method: "GET",
    url: "/api/auth/verify-email/VERIFICATION_TOKEN_HERE",
  },
};

// Usage examples with curl commands:

/*
# Register a new patient
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password123",
    "phone": "+1234567890",
    "role": "PATIENT",
    "medicalHistory": "No known allergies"
  }'

# Register a new doctor
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "password": "Password123",
    "phone": "+1234567891",
    "role": "DOCTOR",
    "specialty": "Cardiology"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123"
  }'

# Logout (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer TOKEN"

# Forgot password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'

# Reset password (replace TOKEN with actual reset token)
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN",
    "newPassword": "NewPassword123"
  }'

# Verify email (replace TOKEN with actual verification token)
curl -X GET http://localhost:3000/api/auth/verify-email/TOKEN
*/

module.exports = testEndpoints;
