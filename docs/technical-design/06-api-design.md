# API Design

> **Document Focus**: REST API endpoints, request/response schemas, authentication flows, and API contracts. For system architecture and data models, see [Architecture Design](04-architecture-design.md) and [Data Model](05-data-model.md).

## Overview

This document defines the REST API design for the Strava Vagabond application. The API provides endpoints for Strava integration, route analysis, user management, and email notifications. All endpoints follow REST principles with JSON request/response formats and proper HTTP status codes.

> **Note**: For application context and backend service characteristics, see [Problem Statement - Application Context](01-problem-statement.md#application-context).

## API Base Information

- **Base URL**: Environment-based (e.g., `http://localhost:3000/v1` for development)
- **Content Type**: `application/json`
- **Authentication**: Bearer token (JWT)
- **Rate Limiting**: Endpoint-specific limits based on usage patterns
- **Versioning**: URL-based versioning (`/v1/`)

## Authentication & Authorization

### **JWT Token Structure**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "strava_id": "12345",
    "email": "user@example.com",
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

### **Strava Token Management**
- **Access Token**: Short-lived (6 hours), used for API calls
- **Refresh Token**: Long-lived, used to get new access tokens
- **Storage**: Both tokens encrypted and stored in database
- **Auto-Refresh**: Background job refreshes tokens before expiration
- **Fallback**: If refresh fails, user is prompted to re-authenticate

> **Critical for Backend Service**: Refresh tokens are essential for continuous operation. Since this is a backend service that processes Strava webhooks autonomously, users cannot re-authenticate when tokens expire. Internal token refresh ensures the app remains functional 24/7 without user intervention.

### **Authentication Flow**
1. **Strava OAuth**: User authorizes via Strava
2. **Token Exchange**: Exchange Strava code for access token + refresh token
3. **User Creation**: Create or update user in our system with encrypted Strava tokens
4. **JWT Generation**: Generate JWT for API access
5. **Token Refresh**: Worker threads refresh Strava tokens when needed during API calls

### **Complete OAuth Flow for Testing**

#### **Step 1: Create Strava Application**
1. **Go to Strava API Console**: https://developers.strava.com/console
2. **Sign in** with your Strava account
3. **Create a new application**:
   - **Application Name**: Strava Vagabond
   - **Category**: Fitness
   - **Website**: Your development URL
   - **Authorization Callback Domain**: `localhost` (for development)
4. **Note your credentials**:
   - Client ID
   - Client Secret

#### **Step 2: Start Development Server**
```bash
# Start your development server
npm run dev
# Server runs on http://localhost:3000

# Frontend pages will be available at:
# OAuth Page: http://localhost:3000/
# Callback Page: http://localhost:3000/callback
```

#### **Step 3: Test OAuth Flow**
1. **Open OAuth Page**: Navigate to `http://localhost:3000/` in your browser
2. **Click "Connect with Strava"**: This will redirect to Strava's authorization page
3. **Authorize Application**: Sign in to Strava and grant permissions
4. **Return to App**: Strava redirects back to your callback page
5. **View Success**: See confirmation that your account is connected

#### **Step 4: Get API Access Token**
After successful OAuth, you need to obtain the JWT token for API testing. Check the database directly:

```sql
-- Connect to your Neon PostgreSQL database
-- Check the users table for your JWT token
SELECT 
  id,
  strava_id,
  email,
  strava_access_token,
  strava_refresh_token,
  strava_token_expires_at,
  created_at
FROM users 
WHERE strava_id = 'your_strava_id';

-- For development, you might also want to see all users
SELECT strava_id, email, created_at FROM users;
```

**Note**: This approach is useful for:
- **Development debugging**: See exactly what's stored in the database
- **Token validation**: Verify tokens are being saved correctly
- **Data inspection**: Check user data structure and relationships
- **Troubleshooting**: Debug OAuth flow issues

#### **Step 5: Test API Access**
```bash
# Use the JWT token to test our API endpoints

# Test user profile
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:3000/v1/users/me

# Test Strava activities
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:3000/v1/strava/activities

# Test route analysis
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:3000/v1/routes
```

#### **Step 5: Verify Frontend Pages**
- **OAuth Page** (`/`): Should show Strava connection button
- **Callback Page** (`/callback`): Should handle success/error states
- **Responsive Design**: Test on mobile devices
- **Error Handling**: Test with invalid OAuth responses

#### **Development Environment Setup**
```bash
# .env file for development
STRAVA_CLIENT_ID=your_client_id_from_strava_console
STRAVA_CLIENT_SECRET=your_client_secret_from_strava_console
JWT_SECRET=your_jwt_secret_key
REDIRECT_URI=http://localhost:3000/callback

# Start your development server
npm run dev
# Server runs on http://localhost:3000

# Frontend pages will be available at:
# OAuth Page: http://localhost:3000/
# Callback Page: http://localhost:3000/callback
```

#### **Testing Different Endpoints**
```bash
# Test user profile
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:3000/v1/users/me

# Test Strava activities
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:3000/v1/strava/activities

# Test route analysis
curl -H "Authorization: Bearer <jwt_token>" \
  http://localhost:3000/v1/routes
```

## Core API Endpoints

### **1. Authentication Endpoints**

#### **POST /auth/strava/connect**
**Description**: Initiate Strava OAuth connection

**Request**:
```json
{
  "redirect_uri": "https://app.strava-vagabond.com/callback"
}
```

**Response**:
```json
{
  "auth_url": "https://www.strava.com/oauth/authorize?client_id=...",
  "state": "random-state-token"
}
```

#### **POST /auth/strava/callback**
**Description**: Handle Strava OAuth callback

**Request**:
```json
{
  "code": "strava-authorization-code",
  "state": "random-state-token"
}
```

**Response**:
```json
{
  "access_token": "jwt-token",
  "refresh_token": "jwt-refresh-token",
  "user": {
    "id": "user-uuid",
    "strava_id": "12345",
    "email": "user@example.com",
    "preferences": {}
  }
}
```



### **2. User Management Endpoints (Including GDPR Compliance)**

#### **GET /users/me**
**Description**: Get current user profile

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**:
```json
{
  "id": "user-uuid",
  "strava_id": "12345",
  "email": "user@example.com",
  "preferences": {
    "email_notifications": true
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### **PUT /users/me**
**Description**: Update user preferences

**Headers**: `Authorization: Bearer <jwt-token>`

**Request**:
```json
{
  "preferences": {
    "email_notifications": false
  }
}
```

**Response**: Updated user object (same as GET /users/me)

#### **DELETE /users/me**
**Description**: Delete user account and all data

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**: `204 No Content`

#### **GET /users/data-export**
**Description**: Export all user data for GDPR data portability

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `format`: Export format (`json` or `gpx`, default: `json`)

**Response**:
```json
{
  "user": {
    "id": "user-uuid",
    "strava_id": "12345",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "preferences": {
      "email_notifications": true
    }
  },
  "activities": [
    {
      "id": "activity-uuid",
      "strava_activity_id": "123456789",
      "name": "Morning Ride",
      "start_date": "2024-01-15T07:00:00Z",
      "distance_m": 25000,
      "total_elevation_gain_m": 450,
      "elapsed_time": 5400
    }
  ],
  "routes": [
    {
      "id": "route-uuid",
      "uniqueness_score": 0.85,
      "total_segments": 45,
      "new_segments": 38,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "exported_at": "2024-01-15T10:30:00Z",
  "format": "json"
}
```

**Note**: This endpoint provides complete data export for GDPR compliance. Users can download their data in JSON or GPX format for portability to other services.

#### **POST /users/restrict-processing**
**Description**: Control data retention and notification preferences

**Headers**: `Authorization: Bearer <jwt-token>`

**Request**:
```json
{
  "preferences": {
    "email_notifications": false,
    "data_retention": "minimal"
  }
}
```

**Response**:
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "email_notifications": false,
    "data_retention": "minimal"
  },
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Note**: This endpoint allows users to control their data retention period and email notification preferences. Core functionality (route analysis, GPS processing) cannot be disabled as it's essential for the app to work. Data retention options: "minimal" (6 months), "standard" (2 years), "extended" (5 years).

### **3. Strava Integration Endpoints**

> **Note**: Strava integration is handled automatically via webhooks for new activities and batch processing for initial historical data import. No manual sync endpoints are needed.

#### **GET /strava/activities**
**Description**: List user's Strava activities

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `since`: Filter activities since date (ISO 8601)

**Response**:
```json
{
  "activities": [
    {
      "id": "activity-uuid",
      "strava_activity_id": "123456789",
      "name": "Morning Ride",
      "type": "Ride",
      "start_date": "2024-01-15T07:00:00Z",
      "distance_m": 25000,
      "total_elevation_gain_m": 450,
      "elapsed_time": 5400,
      "moving_time": 4800,
      "metadata": {
        "average_speed": 5.2,
        "max_speed": 12.5,
        "average_watts": 180
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "pages": 75
  }
}
```

### **4. Route Analysis Endpoints**

#### **GET /routes**
**Description**: List analyzed routes for current user

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `uniqueness_score_min`: Minimum uniqueness score (0.0 - 1.0)
- `since`: Filter routes since date (ISO 8601)

**Response**:
```json
{
  "routes": [
    {
      "id": "route-uuid",
      "activity_id": "activity-uuid",
      "uniqueness_score": 0.85,
      "total_segments": 45,
      "new_segments": 38,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1200,
    "pages": 60
  }
}
```

#### **GET /routes/{route_id}**
**Description**: Get detailed route analysis

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**:
```json
{
  "id": "route-uuid",
  "activity_id": "activity-uuid",
  "uniqueness_score": 0.85,
  "total_segments": 45,
  "new_segments": 38,
  "segment_details": [
    {
      "segment_id": "segment-uuid",
      "start_point": {"lat": 52.2297, "lng": 21.0122},
      "end_point": {"lat": 52.2298, "lng": 21.0123},
      "is_new": true,
      "similarity_score": 0.0
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```




### **5. Analytics Endpoints**

#### **GET /analytics/summary**
**Description**: Get user's route discovery summary

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**: None (returns all-time summary

**Response**:
```json
{
  "summary": {
    "total_activities": 45,
    "new_routes_discovered": 23,
    "average_uniqueness_score": 0.78
  }
}
```


### **6. Email & Notifications Endpoints**

#### **GET /notifications/email-logs**
**Description**: Get email notification history

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status ("sent", "failed", "pending")

**Response**:
```json
{
  "email_logs": [
    {
      "id": "email-uuid",
      "user_id": "user-uuid",
      "type": "ride_summary",
      "status": "sent",
      "subject": "Your Ride Summary - Morning Ride",
      "sent_at": "2024-01-15T10:30:00Z",
      "metadata": {
        "activity_id": "activity-uuid",
        "uniqueness_score": 0.85
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### **POST /notifications/test-email**
**Description**: Send test email to verify configuration

**Headers**: `Authorization: Bearer <jwt-token>`

**Request**:
```json
{
  "email": "test@example.com"
}
```

**Response**:
```json
{
  "status": "sent",
  "message_id": "email-uuid"
}
```

## Error Handling

### **Standard Error Response Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req-uuid"
  }
}
```

### **HTTP Status Codes**
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

### **Error Codes**
- **AUTH_ERROR**: Authentication/authorization issues
- **VALIDATION_ERROR**: Request validation failures
- **STRAVA_ERROR**: Strava API integration errors
- **RATE_LIMIT_ERROR**: API rate limit exceeded
- **NOT_FOUND_ERROR**: Resource not found
- **INTERNAL_ERROR**: Server-side errors

## Rate Limiting

### **Rate Limit Headers**
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 185
X-RateLimit-Reset: 1640995200
X-RateLimit-Endpoint: strava_sync
```

### **Endpoint-Specific Rate Limits**

#### **Authentication Endpoints** (Unlimited)
- **OAuth Flow**: No limits - needed for user onboarding
- **Token Refresh**: No limits - required for continuous access (handled internally)

#### **User Management** (100 requests per 15 minutes)
- **Profile Updates**: Moderate frequency, user-initiated
- **Preference Changes**: Occasional updates

#### **Strava Integration** (200 requests per 15 minutes)
- **Activity Sync**: Higher limit for bulk operations
- **Initial Import**: 2000 activities need higher limits
- **Webhook Processing**: Real-time updates

#### **Route Analysis** (150 requests per 15 minutes)
- **Per-Ride Analysis**: Moderate frequency
- **Route Queries**: User exploration of routes

#### **Analytics** (50 requests per 15 minutes)
- **Summary Queries**: Occasional, not time-critical
- **Leaderboards**: Low frequency, cached results

#### **Email & Notifications** (30 requests per 15 minutes)
- **Email Logs**: Low frequency queries
- **Test Emails**: Limited to prevent abuse

### **Rate Limit Strategy**
- **Per-Endpoint Limits**: Different limits based on actual usage patterns
- **Bulk Operations**: Higher limits for legitimate bulk processing
- **Strava Constraints**: Our limits respect Strava's 100/15min API limit
- **User Experience**: Prevents frustration during initial data sync

## Webhook Endpoints

### **POST /webhooks/strava**
**Description**: Receive Strava webhook notifications

**Headers**: `X-Strava-Signature: <hmac-signature>`

**Request**: Strava webhook payload
```json
{
  "object_type": "activity",
  "object_id": 123456789,
  "aspect_type": "create",
  "updates": {},
  "owner_id": 12345,
  "subscription_id": 123456,
  "event_time": 1640995200
}
```

**Response**: `200 OK` (acknowledgment)

## API Versioning Strategy

### **Versioning Approach**
- **URL-based**: `/v1/`, `/v2/`
- **Backward Compatibility**: Maintain for at least 6 months
- **Deprecation**: Announce 3 months in advance
- **Migration Guide**: Provide for major version changes

### **Current Version**: v1
- **Stable**: Core endpoints and schemas
- **Experimental**: New features marked as beta
- **Deprecated**: Endpoints scheduled for removal

## Frontend Requirements

### **Minimal Frontend Pages**
- **OAuth Connection Page** (`/`): Simple HTML page with Strava connection button
- **Callback Page** (`/callback`): Success/error handling after Strava authorization
- **Responsive Design**: Mobile-friendly CSS layout
- **Server-Side Rendering**: Express.js templates for dynamic content

### **Frontend Implementation**
- **HTML Structure**: Semantic HTML5 with accessibility features
- **CSS Styling**: Basic responsive design using CSS Grid/Flexbox
- **No JavaScript**: Pure HTML + CSS for simplicity
- **Mobile First**: Responsive design starting from mobile breakpoints

## Testing & Documentation

### **API Testing**
- **Postman Collection**: Complete endpoint testing
- **Integration Tests**: Automated API testing
- **Load Testing**: Performance validation
- **Security Testing**: Authentication and authorization

### **Frontend Testing**
- **Browser Testing**: Test OAuth flow in different browsers
- **Mobile Testing**: Verify responsive design on mobile devices
- **OAuth Flow Testing**: End-to-end Strava connection testing
- **Error Handling**: Test various OAuth error scenarios

### **Documentation**
- **OpenAPI 3.0**: Machine-readable API specification
- **Interactive Docs**: Swagger UI for testing
- **Code Examples**: Node.js, Python, cURL examples
- **SDK**: Official client libraries

## Security Considerations

### **Authentication**
- **JWT Tokens**: Secure, stateless authentication
- **Token Refresh**: Internal token renewal by worker threads
- **Scope-based Access**: Fine-grained permissions
- **Rate Limiting**: Prevent abuse and DoS

### **Data Protection**
- **HTTPS Only**: All API communication encrypted
- **Input Validation**: Comprehensive request validation
- **SQL Injection**: Prevented via Kysely parameterization
- **XSS Protection**: Input sanitization and output encoding

### **Privacy**
- **PII Handling**: Minimal personal data collection
- **Data Retention**: Configurable retention policies
- **User Consent**: Explicit consent for data processing
- **Right to Deletion**: Complete data removal on request
