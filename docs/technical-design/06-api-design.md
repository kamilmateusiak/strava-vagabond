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

> **Critical for Backend Service**: Refresh tokens are essential for continuous operation. Since this is a backend service that processes Strava webhooks autonomously, users cannot re-authenticate when tokens expire. Automatic token refresh ensures the app remains functional 24/7 without user intervention.

### **Authentication Flow**
1. **Strava OAuth**: User authorizes via Strava
2. **Token Exchange**: Exchange Strava code for access token + refresh token
3. **User Creation**: Create or update user in our system with encrypted Strava tokens
4. **JWT Generation**: Generate JWT for API access
5. **Token Refresh**: Background job automatically refreshes Strava tokens before expiration

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

#### **POST /auth/refresh**
**Description**: Refresh JWT token

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**:
```json
{
  "access_token": "new-jwt-token",
  "expires_in": 3600
}
```

### **2. User Management Endpoints**

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
    "email_notifications": true,
    "theme": "dark"
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
    "email_notifications": false,
    "theme": "light"
  }
}
```

**Response**: Updated user object (same as GET /users/me)

#### **DELETE /users/me**
**Description**: Delete user account and all data

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**: `204 No Content`

### **3. Strava Integration Endpoints**

#### **POST /strava/sync**
**Description**: Trigger manual sync of Strava activities

**Headers**: `Authorization: Bearer <jwt-token>`

**Request**:
```json
{
  "sync_type": "full" // "full" | "recent" | "since_date"
}
```

**Response**:
```json
{
  "sync_id": "sync-uuid",
  "status": "started",
  "estimated_activities": 1500,
  "estimated_duration": "PT2H30M"
}
```

#### **GET /strava/sync/{sync_id}**
**Description**: Get sync status and progress

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**:
```json
{
  "sync_id": "sync-uuid",
  "status": "processing", // "started" | "processing" | "completed" | "failed"
  "progress": {
    "total_activities": 1500,
    "processed": 750,
    "percentage": 50
  },
  "started_at": "2024-01-15T10:30:00Z",
  "estimated_completion": "2024-01-15T13:00:00Z"
}
```

#### **GET /strava/activities**
**Description**: List user's Strava activities

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `type`: Activity type filter (e.g., "Ride", "Run")
- `since`: Filter activities since date (ISO 8601)
- `until`: Filter activities until date (ISO 8601)

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

#### **GET /routes/{route_id}/map**
**Description**: Get route map data (GeoJSON)

**Headers**: `Authorization: Bearer <jwt-token>`

**Response**: GeoJSON FeatureCollection with route geometry

### **5. Analytics Endpoints**

#### **GET /analytics/summary**
**Description**: Get user's route discovery summary

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `since`: Start date for analysis (ISO 8601)
- `until`: End date for analysis (ISO 8601)

**Response**:
```json
{
  "period": {
    "since": "2024-01-01T00:00:00Z",
    "until": "2024-01-31T23:59:59Z"
  },
  "summary": {
    "total_activities": 45,
    "total_distance_km": 1250.5,
    "total_elevation_m": 18500,
    "total_time_hours": 85.5,
    "new_routes_discovered": 23,
    "average_uniqueness_score": 0.78
  },
  "monthly_trends": [
    {
      "month": "2024-01",
      "activities": 45,
      "new_routes": 23,
      "uniqueness_score": 0.78
    }
  ]
}
```

#### **GET /analytics/leaderboard**
**Description**: Get route discovery leaderboard (if multi-user)

**Headers**: `Authorization: Bearer <jwt-token>`

**Query Parameters**:
- `period`: Time period (e.g., "month", "year", "all_time")
- `limit`: Top N users (default: 10, max: 50)

**Response**:
```json
{
  "period": "month",
  "leaderboard": [
    {
      "user_id": "user-uuid",
      "strava_id": "12345",
      "new_routes": 45,
      "total_distance_km": 850.2,
      "uniqueness_score": 0.92
    }
  ]
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
- **Token Refresh**: No limits - required for continuous access

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

## Testing & Documentation

### **API Testing**
- **Postman Collection**: Complete endpoint testing
- **Integration Tests**: Automated API testing
- **Load Testing**: Performance validation
- **Security Testing**: Authentication and authorization

### **Documentation**
- **OpenAPI 3.0**: Machine-readable API specification
- **Interactive Docs**: Swagger UI for testing
- **Code Examples**: Node.js, Python, cURL examples
- **SDK**: Official client libraries

## Security Considerations

### **Authentication**
- **JWT Tokens**: Secure, stateless authentication
- **Token Refresh**: Automatic token renewal
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
