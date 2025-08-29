# Observability

> **Document Focus**: Monitoring, metrics, alerting strategy, and operational visibility. For system architecture and security, see [Architecture Design](04-architecture-design.md) and [Security & Privacy](08-security-privacy.md).

## Overview

This section defines the observability strategy for the Strava Vagabond application, focusing on simple but effective monitoring, meaningful metrics, and actionable alerting. The approach prioritizes practical operational visibility over complex monitoring infrastructure.

## Monitoring Philosophy

### **Simple but Effective**
- **Avoid over-engineering**: Focus on essential monitoring needs
- **Leverage built-in tools**: Use provider monitoring when available
- **Actionable insights**: Monitor what you can actually fix
- **Personal app scale**: Appropriate complexity for single-user application

### **Critical First Approach**
- **Start with essentials**: App health, critical failures, core functionality
- **Add incrementally**: Expand monitoring based on actual needs
- **Focus on reliability**: Ensure app works before optimizing performance
- **User experience**: Monitor what affects the user's ability to use the app

## Monitoring Scope

### **1. Application Health Monitoring**

#### **Core Application Metrics**
- **App Status**: Is the application running and responding?
- **API Health**: Are endpoints accessible and functional?
- **Database Connectivity**: Can the app connect to Neon PostgreSQL?
- **Redis Connectivity**: Can the app connect to Upstash Redis?

#### **Health Check Endpoints**
```json
// GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "strava_api": "accessible"
  }
}

// GET /health/detailed
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": {
    "status": "connected",
    "response_time_ms": 45,
    "active_connections": 2
  },
  "redis": {
    "status": "connected",
    "response_time_ms": 12,
    "queue_length": 5
  },
  "strava_api": {
    "status": "accessible",
    "rate_limit_remaining": 85,
    "rate_limit_reset": "2024-01-15T11:00:00Z"
  }
}
```

### **2. Business Logic Monitoring**

#### **Route Analysis Metrics**
- **Processing Success Rate**: Percentage of routes successfully analyzed
- **Processing Time**: How long route analysis takes
- **New Routes Discovered**: Count of new routes per time period
- **Fingerprint Generation**: Success rate of route fingerprinting

#### **Strava Integration Metrics**
- **Webhook Processing**: Success rate of Strava webhook handling
- **API Rate Limiting**: Strava API usage and remaining quota
- **Token Refresh Success**: Success rate of automatic token refresh
- **Activity Sync Status**: Status of activity synchronization

#### **User Experience Metrics**
- **Email Delivery Success**: Success rate of notification emails
- **Route Uniqueness Accuracy**: Validation of route uniqueness detection
- **App Response Times**: API endpoint performance
- **Error Rates**: User-facing error frequency

### **3. Infrastructure Monitoring**

#### **Neon PostgreSQL Monitoring**
- **Connection Status**: Database connectivity health
- **Query Performance**: Response times for key queries
- **Storage Usage**: Database size and growth trends
- **Active Connections**: Connection pool utilization

#### **Upstash Redis Monitoring**
- **Connection Status**: Redis connectivity health
- **Queue Performance**: Job processing rates and delays
- **Memory Usage**: Redis memory consumption
- **Queue Lengths**: Number of pending jobs

#### **Application Server Monitoring**
- **Memory Usage**: Node.js memory consumption
- **CPU Usage**: Application server performance
- **Process Health**: Application process status
- **Error Logs**: Application error frequency and types

## Metrics Collection

### **Application-Level Metrics**

#### **Custom Metrics**
```javascript
// Route analysis metrics
const routeMetrics = {
  routesProcessed: 0,
  routesSuccessful: 0,
  routesFailed: 0,
  averageProcessingTime: 0,
  newRoutesDiscovered: 0
};

// Strava integration metrics
const stravaMetrics = {
  webhooksReceived: 0,
  webhooksProcessed: 0,
  apiCallsMade: 0,
  rateLimitHits: 0,
  tokenRefreshes: 0
};

// User experience metrics
const userMetrics = {
  emailsSent: 0,
  emailsDelivered: 0,
  apiRequests: 0,
  averageResponseTime: 0
};
```

#### **Performance Metrics**
- **API Response Times**: Per-endpoint performance tracking
- **Database Query Times**: Slow query identification
- **Memory Usage**: Application memory consumption trends
- **Error Rates**: Application error frequency and types

### **Infrastructure Metrics**

#### **Provider Monitoring**
- **Neon Dashboard**: Built-in PostgreSQL monitoring
- **Upstash Dashboard**: Built-in Redis monitoring
- **Application Logs**: Structured logging for analysis
- **Health Checks**: Automated health monitoring

#### **Custom Dashboards**
- **Simple Metrics**: Basic performance and health indicators
- **Business KPIs**: Route discovery and user engagement metrics
- **Operational Status**: System health and error rates
- **Trend Analysis**: Performance and usage trends over time

## Alerting Strategy

### **Alert Categories**

#### **Critical Alerts (Immediate Action Required)**
- **App Down**: Application not responding or crashed
- **Database Unavailable**: Cannot connect to Neon PostgreSQL
- **Redis Unavailable**: Cannot connect to Upstash Redis
- **Strava API Failure**: Critical Strava integration issues
- **High Error Rate**: Significant increase in application errors

#### **Warning Alerts (Attention Required)**
- **High Memory Usage**: Application memory consumption >80%
- **Slow Response Times**: API response times >5 seconds
- **Queue Backlog**: Redis queue length >100 jobs
- **Rate Limit Warning**: Strava API rate limit <20 remaining
- **Storage Warning**: Database storage >80% capacity

#### **Info Alerts (Awareness Only)**
- **New Route Discovered**: User found new cycling route
- **Email Sent**: Notification email delivered successfully
- **Token Refreshed**: Strava token automatically renewed
- **Backup Completed**: Database backup finished successfully

### **Alert Channels**

#### **Primary Notifications**
- **Email Alerts**: Critical and warning alerts
- **Application Logs**: All alerts logged for review
- **Health Dashboard**: Visual status indicators

#### **Escalation Strategy**
- **Immediate**: Critical alerts sent immediately
- **Delayed**: Warning alerts sent within 15 minutes
- **Batch**: Info alerts sent in daily summary

### **Alert Configuration**

#### **Critical Alerts**
```javascript
// App health monitoring
if (!appHealthy) {
  sendAlert('CRITICAL', 'Application is down', {
    timestamp: new Date(),
    status: appStatus,
    lastCheck: lastHealthCheck
  });
}

// Database connectivity
if (!databaseConnected) {
  sendAlert('CRITICAL', 'Database connection failed', {
    timestamp: new Date(),
    error: databaseError,
    retryCount: retryAttempts
  });
}
```

#### **Warning Alerts**
```javascript
// Memory usage warning
if (memoryUsage > 80) {
  sendAlert('WARNING', 'High memory usage', {
    timestamp: new Date(),
    usage: `${memoryUsage}%`,
    threshold: '80%'
  });
}

// Queue backlog warning
if (queueLength > 100) {
  sendAlert('WARNING', 'Queue backlog detected', {
    timestamp: new Date(),
    queueLength: queueLength,
    threshold: 100
  });
}
```

## Logging Strategy

### **PII Protection in Logs**

#### **Critical Requirement**
**All logs must be free of Personally Identifiable Information (PII) to comply with GDPR and protect user privacy.**

#### **PII Data to Never Log**:
- **Personal Information**: Names, email addresses, phone numbers
- **GPS Coordinates**: Exact latitude/longitude from user routes
- **Strava Tokens**: Access tokens, refresh tokens, API credentials
- **User Preferences**: Email settings, personal cycling data
- **Activity Details**: Specific route names, personal activity descriptions
- **Timestamps**: Exact times that could reveal user patterns

#### **Safe Logging Examples**:
```json
// ❌ NEVER LOG - Contains PII
{
  "level": "INFO",
  "message": "User john.doe@email.com completed route from 37.7749,-122.4194 to 37.7849,-122.4094",
  "user_email": "john.doe@email.com",
  "start_coords": "37.7749,-122.4194",
  "end_coords": "37.7849,-122.4094"
}

// ✅ SAFE LOGGING - No PII
{
  "level": "INFO", 
  "message": "Route analysis completed successfully",
  "user_id": "user-uuid-hash",
  "route_id": "route-uuid-hash",
  "processing_time_ms": 1250,
  "uniqueness_score": 0.85,
  "new_segments": 12,
  "coordinates_hashed": "a1b2c3d4e5f6"
}
```

#### **PII Protection Strategies**:

##### **1. Data Hashing**
```javascript
// Hash sensitive identifiers
const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');
const hashedRouteId = crypto.createHash('sha256').update(routeId).digest('hex');

// Log hashed values instead of raw data
logger.info('Route processed', {
  user_id_hash: hashedUserId,
  route_id_hash: hashedRouteId,
  processing_time: processingTime
});
```

##### **2. Coordinate Anonymization**
```javascript
// Round coordinates to reduce precision (e.g., 100m grid)
const anonymizeCoordinate = (coord, precision = 0.001) => {
  return Math.round(coord / precision) * precision;
};

// Log anonymized coordinates
logger.info('Route analysis', {
  start_area: `${anonymizeCoordinate(startLat)},${anonymizeCoordinate(startLng)}`,
  end_area: `${anonymizeCoordinate(endLat)},${anonymizeCoordinate(endLng)}`,
  distance_km: distanceKm
});
```

##### **3. Token Masking**
```javascript
// Never log full tokens
logger.info('Strava token refreshed', {
  user_id_hash: hashedUserId,
  token_status: 'refreshed',
  expires_in: '6 hours',
  // ❌ NEVER: strava_token: actualToken
});
```

##### **4. User ID Anonymization**
```javascript
// Use consistent hashes for user identification
const userHash = crypto.createHash('sha256')
  .update(userId + process.env.HASH_SALT)
  .digest('hex');

// Same user always gets same hash for correlation
logger.info('User action', {
  user_hash: userHash,
  action: 'route_analysis',
  timestamp: new Date().toISOString()
});
```

#### **Log Sanitization Process**:

##### **Pre-Logging Sanitization**:
```javascript
// Sanitize data before logging
const sanitizeForLogging = (data) => {
  const sanitized = { ...data };
  
  // Remove PII fields
  delete sanitized.email;
  delete sanitized.strava_access_token;
  delete sanitized.strava_refresh_token;
  delete sanitized.first_name;
  delete sanitized.last_name;
  
  // Hash user identifiers
  if (sanitized.user_id) {
    sanitized.user_id_hash = hashUserId(sanitized.user_id);
    delete sanitized.user_id;
  }
  
  // Anonymize coordinates
  if (sanitized.coordinates) {
    sanitized.coordinates_anonymized = anonymizeCoordinates(sanitized.coordinates);
    delete sanitized.coordinates;
  }
  
  return sanitized;
};

// Use sanitized data for logging
logger.info('Route processed', sanitizeForLogging(routeData));
```

#### **Logging Middleware for Automatic PII Protection**:

##### **Middleware Architecture**:
- **Centralized PII Protection**: Single middleware layer handles all logging sanitization
- **Transparent Integration**: Developers use logger normally, middleware handles PII automatically
- **Comprehensive Coverage**: All log calls (HTTP, errors, queues, business logic) go through middleware
- **Zero Manual Effort**: No need to remember to sanitize data before logging

##### **Core Components**:

###### **1. PII Detection Engine**:
- **Field-based Detection**: Identify PII by field names (email, strava_access_token, coordinates, etc.)
- **Pattern-based Detection**: Regex patterns for emails, GPS coordinates, Strava tokens, names
- **Recursive Processing**: Handle nested objects and arrays with depth limits
- **Type Safety**: Preserve non-PII data types (numbers, booleans, safe strings)

###### **2. Data Sanitization**:
- **Field Removal**: Replace PII fields with `[PII_REMOVED]` markers
- **Value Anonymization**: Hash user IDs consistently, reduce GPS precision to ~100m grid
- **String Sanitization**: Replace detected PII patterns with type indicators
- **Safe Fallbacks**: Handle edge cases and unknown data types gracefully

###### **3. Logger Wrapper**:
- **Transparent Interface**: Same API as original logger (info, error, warn, debug)
- **Automatic Sanitization**: All data sanitized before reaching underlying logger
- **Performance Optimized**: Sanitization happens once per log call
- **Global Availability**: Sanitized logger available throughout the application

##### **Integration Points**:

###### **1. Express.js Application**:
- **Request/Response Logging**: Automatic logging of all HTTP requests and responses
- **Error Handling**: Sanitized error logging middleware for application errors
- **Performance Tracking**: Response time and status code logging
- **User Context**: User ID hashing for request correlation

###### **2. Bull Queue System**:
- **Queue Event Logging**: All queue events (completed, failed, retrying) automatically sanitized
- **Job Processing Logs**: Success/failure logging with PII protection
- **Progress Tracking**: Processing time and result summaries without sensitive data
- **Error Reporting**: Detailed error information for debugging

###### **3. Business Logic Services**:
- **Route Analysis**: Log processing results without GPS coordinates
- **User Management**: Log user actions without personal information
- **Strava Integration**: Log API interactions without tokens or user details
- **Email Services**: Log delivery status without recipient information

##### **Implementation Strategy**:

###### **1. Development Phase**:
- **Middleware Creation**: Build PII detection and sanitization engine
- **Logger Integration**: Wrap existing logging system with sanitization layer
- **Pattern Definition**: Define comprehensive PII detection patterns
- **Testing Framework**: Create tests for all sanitization scenarios

###### **2. Integration Phase**:
- **Express Middleware**: Add logging middleware to request/response pipeline
- **Queue Integration**: Integrate with Bull queue event system
- **Service Updates**: Update all services to use sanitized logger
- **Error Handling**: Implement sanitized error logging throughout application

###### **3. Validation Phase**:
- **PII Detection Testing**: Verify all PII patterns are caught
- **Performance Testing**: Ensure minimal overhead from sanitization
- **Compliance Verification**: Confirm GDPR compliance in logging practices
- **Monitoring Setup**: Implement PII detection alerts and monitoring

##### **Testing Strategy**:

###### **1. Unit Testing**:
- **PII Detection**: Test all field patterns and regex patterns
- **Data Sanitization**: Verify PII removal and data preservation
- **Hash Consistency**: Ensure same user always gets same hash
- **Coordinate Anonymization**: Test GPS precision reduction
- **Edge Cases**: Handle null, undefined, nested objects, arrays

###### **2. Integration Testing**:
- **Logger Wrapper**: Test all logging levels (info, error, warn, debug)
- **Middleware Integration**: Verify Express.js middleware functionality
- **Queue Integration**: Test Bull queue event logging
- **Error Handling**: Ensure error logging works with sanitization

###### **3. Compliance Testing**:
- **PII Detection Coverage**: Verify all PII types are caught
- **GDPR Compliance**: Confirm no PII in final log output
- **Performance Impact**: Measure sanitization overhead
- **Memory Safety**: Test recursion limits and memory usage

##### **Benefits of Logging Middleware**:

###### **1. Automatic PII Protection**:
- **Zero Manual Effort**: All logs automatically sanitized
- **No Human Error**: Can't accidentally log PII
- **Consistent Protection**: Same rules applied everywhere
- **GDPR Compliance**: Built-in from day one

###### **2. Centralized Control**:
- **Single Source of Truth**: All PII rules in one place
- **Easy Updates**: Change PII patterns in one location
- **Consistent Behavior**: Same sanitization across all components
- **Maintainable**: Easy to add new PII detection patterns

###### **3. Performance Benefits**:
- **Efficient Processing**: Recursive sanitization with depth limits
- **Memory Safe**: Prevents infinite recursion
- **Minimal Overhead**: Sanitization happens once per log call
- **Scalable**: Handles complex nested objects efficiently

###### **4. Developer Experience**:
- **Transparent**: Developers use logger normally
- **No Breaking Changes**: Existing code continues to work
- **Clear Feedback**: PII detection provides helpful error messages
- **Testing Support**: Comprehensive test coverage included

##### **Post-Logging Validation**:
```javascript
// Automated PII detection in logs
const piiPatterns = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
  /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/, // GPS coordinates
  /[A-Za-z]+ [A-Za-z]+/, // Names
  /sk_[a-zA-Z0-9]+/, // Strava tokens
];

const validateLogForPII = (logEntry) => {
  const logString = JSON.stringify(logEntry);
  
  for (const pattern of piiPatterns) {
    if (pattern.test(logString)) {
      throw new Error(`PII detected in log: ${pattern.source}`);
    }
  }
  
  return true;
};
```

#### **Log Retention and PII**:

##### **Immediate PII Removal**:
- **Real-time Sanitization**: All logs sanitized before storage
- **No PII Storage**: PII never written to log files
- **Hash Consistency**: Same data always produces same hash for correlation

##### **Long-term Considerations**:
- **Log Analysis**: Can still correlate events using hashed IDs
- **Debugging**: Sufficient information for troubleshooting without PII
- **Compliance**: GDPR-compliant logging from day one

### **Structured Logging**

#### **Log Levels**
- **ERROR**: Application errors and failures
- **WARN**: Warning conditions and potential issues
- **INFO**: General application information
- **DEBUG**: Detailed debugging information

#### **Log Format**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "Route analysis completed",
  "context": {
    "route_id": "route-uuid",
    "user_id": "user-uuid",
    "processing_time_ms": 1250,
    "uniqueness_score": 0.85,
    "new_segments": 12
  },
  "request_id": "req-12345",
  "user_id": "user-uuid"
}
```

#### **Log Categories**
- **Application Logs**: General application events
- **Security Logs**: Authentication and authorization events
- **Performance Logs**: Performance metrics and timing
- **Business Logs**: Route analysis and user activity

### **Log Storage and Retention**

#### **Storage Strategy**
- **Application Logs**: Stored in structured format
- **Error Logs**: Enhanced logging for debugging
- **Performance Logs**: Metrics and timing data
- **Audit Logs**: User actions and system changes

#### **Retention Policy**
- **Application Logs**: 30 days retention
- **Error Logs**: 90 days retention
- **Performance Logs**: 7 days retention
- **Audit Logs**: 1 year retention

## Monitoring Implementation

### **Phase 1: Basic Health Monitoring (Week 1)**

#### **Health Check Endpoints**
- **Basic Health**: `/health` endpoint for simple status
- **Detailed Health**: `/health/detailed` for comprehensive status
- **Database Health**: Database connectivity verification
- **Redis Health**: Redis connectivity verification

#### **PII Protection Setup**
- **Logging Middleware**: Implement centralized PII protection middleware
- **Automatic Sanitization**: All logs processed through PII detection engine
- **Logger Wrapper**: Wrap existing logging system with sanitization layer
- **Pattern Definition**: Define comprehensive PII detection patterns

#### **Basic Metrics**
- **Application Status**: Running/stopped status
- **Connection Health**: Database and Redis connectivity
- **Error Logging**: Basic error capture and logging
- **Health Dashboard**: Simple status display

### **Phase 2: Business Metrics (Week 2)**

#### **Route Analysis Monitoring**
- **Processing Success Rate**: Track route analysis success
- **Processing Time**: Monitor analysis performance
- **New Route Discovery**: Track unique route findings
- **Error Tracking**: Capture and log analysis failures

#### **Strava Integration Monitoring**
- **Webhook Processing**: Monitor webhook success rates
- **API Usage**: Track Strava API consumption
- **Token Management**: Monitor token refresh success
- **Rate Limiting**: Track API quota usage

### **Phase 3: Advanced Monitoring (Week 3)**

#### **Performance Monitoring**
- **Response Time Tracking**: API endpoint performance
- **Memory Usage**: Application resource consumption
- **Database Performance**: Query performance monitoring
- **Queue Performance**: Job processing metrics

#### **Alerting System**
- **Critical Alerts**: Immediate notification for failures
- **Warning Alerts**: Proactive issue identification
- **Info Alerts**: Daily summary of activities
- **Escalation Logic**: Automated alert routing

### **Phase 4: Optimization (Week 4)**

#### **Dashboard Development**
- **Real-time Status**: Live application health display
- **Performance Trends**: Historical performance data
- **Business Metrics**: Route discovery and user engagement
- **Operational Insights**: System health and efficiency

#### **Advanced Analytics**
- **Trend Analysis**: Performance and usage trends
- **Anomaly Detection**: Unusual pattern identification
- **Capacity Planning**: Resource usage forecasting
- **Optimization Insights**: Performance improvement opportunities

## Tools and Technologies

### **Built-in Monitoring**

#### **Neon PostgreSQL**
- **Dashboard**: Built-in performance monitoring
- **Metrics**: Connection, query, and storage metrics
- **Alerts**: Automated performance alerts
- **Logs**: Database operation logs

#### **Upstash Redis**
- **Dashboard**: Built-in Redis monitoring
- **Metrics**: Memory, connection, and performance metrics
- **Alerts**: Automated Redis alerts
- **Logs**: Redis operation logs

### **Custom Monitoring**

#### **Application Monitoring**
- **Health Checks**: Custom health endpoint implementation
- **Metrics Collection**: Custom metric gathering
- **Logging**: Structured application logging
- **Alerting**: Custom alert logic and notification

#### **Simple Dashboards**
- **Status Page**: Basic application status display
- **Metrics Display**: Key performance indicators
- **Log Viewer**: Application log review interface
- **Alert History**: Historical alert review

## Success Criteria

### **Monitoring Effectiveness**
- **100% Uptime Visibility**: Always know if app is running
- **Critical Issue Detection**: Identify problems within 5 minutes
- **Performance Tracking**: Monitor key performance indicators
- **Error Visibility**: Complete error logging and tracking

### **PII Protection Compliance**
- **Zero PII in Logs**: No personally identifiable information in any logs
- **GDPR Compliance**: Logging practices meet GDPR requirements
- **Data Anonymization**: All sensitive data properly anonymized
- **Audit Trail**: Sufficient information for debugging without PII exposure

### **Alerting Efficiency**
- **Critical Alerts**: Immediate notification for app failures
- **Warning Alerts**: Proactive issue identification
- **False Positive Rate**: <5% false alarm rate
- **Response Time**: Critical alerts within 1 minute

### **Operational Insights**
- **Performance Trends**: Understand app performance over time
- **Usage Patterns**: Track user engagement and activity
- **Resource Planning**: Plan capacity based on usage trends
- **Issue Prevention**: Identify and prevent problems proactively

## Implementation Considerations

### **Simplicity First**
- **Start Basic**: Implement essential monitoring first
- **Avoid Over-engineering**: Focus on practical needs
- **Leverage Built-in**: Use provider monitoring when available
- **Incremental Growth**: Add complexity based on actual needs

### **Personal App Scale**
- **Appropriate Complexity**: Monitoring suitable for single-user app
- **Cost Considerations**: Avoid expensive monitoring solutions
- **Maintenance Overhead**: Minimize ongoing monitoring maintenance
- **Practical Value**: Focus on actionable insights

### **Future Scalability**
- **Extensible Design**: Allow for monitoring expansion
- **Provider Integration**: Leverage cloud provider capabilities
- **Standard Practices**: Follow monitoring best practices
- **Documentation**: Clear monitoring setup and maintenance

## References

- [Architecture Design](../technical-design/04-architecture-design.md) - System architecture and components
- [Security & Privacy](../technical-design/08-security-privacy.md) - Security monitoring and audit logging
- [Neon Monitoring Documentation](https://neon.tech/docs/introduction/technical-preview-free-tier)
- [Upstash Redis Monitoring](https://upstash.com/docs/redis/features/monitoring)
- [Node.js Monitoring Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
