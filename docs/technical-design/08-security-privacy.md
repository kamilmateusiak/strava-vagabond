# Security & Privacy

> **Document Focus**: Data protection, GDPR compliance, security architecture, and privacy by design principles. For system architecture and API design, see [Architecture Design](04-architecture-design.md) and [API Design](06-api-design.md).

## Overview

This section defines the security and privacy measures for the Strava Vagabond application, ensuring compliance with GDPR and other relevant regulations while protecting sensitive user data, particularly GPS coordinates and activity patterns.

## Data Classification & Sensitivity

### **High Sensitivity Data**

#### **GPS Route Data**
- **Risk Level**: High
- **Sensitivity**: Reveals movement patterns, home/work locations, daily routines
- **Protection Required**: Encryption at rest, secure transmission, strict access controls
- **Example**: GPS coordinates showing route from home to work, cycling patterns

#### **Activity Patterns**
- **Risk Level**: High
- **Sensitivity**: Reveals lifestyle, fitness habits, social patterns
- **Protection Required**: Anonymization where possible, access logging
- **Example**: Cycling frequency, preferred routes, time patterns

#### **User Authentication Data**
- **Risk Level**: High
- **Sensitivity**: Strava access tokens, refresh tokens, API credentials
- **Protection Required**: Encryption at rest, secure key management
- **Example**: Strava OAuth tokens for continuous API access

### **Medium Sensitivity Data**

#### **User Preferences**
- **Risk Level**: Medium
- **Sensitivity**: Email notification settings, app preferences
- **Protection Required**: Access controls, data minimization
- **Example**: Email frequency preferences, notification settings

#### **Analytics Data**
- **Risk Level**: Medium
- **Sensitivity**: Route uniqueness scores, discovery statistics
- **Protection Required**: Aggregation where possible, user isolation
- **Example**: Percentage of new routes discovered, total distance

### **Low Sensitivity Data**

#### **App Usage Data**
- **Risk Level**: Low
- **Sensitivity**: Login timestamps, feature usage
- **Protection Required**: Basic access controls, minimal retention
- **Example**: Last login time, features accessed

## GDPR Compliance

### **Legal Basis for Processing**

#### **Consent (Primary Basis)**
- **User Consent**: Explicit consent for data processing during OAuth
- **Granular Consent**: Separate consent for different data processing activities
- **Withdrawal**: Easy mechanism to withdraw consent
- **Documentation**: Clear record of consent given

#### **Legitimate Interest (Secondary Basis)**
- **Service Provision**: Processing necessary for app functionality
- **Route Analysis**: Core feature requiring historical data
- **Email Notifications**: Service improvement and user engagement

### **Data Subject Rights**

#### **Right to Access**
```json
// API endpoint for data export
GET /v1/users/data-export
Response: Complete user data in structured format
```

#### **Right to Rectification**
```json
// API endpoint for data correction
PUT /v1/users/me
Request: Updated user information
Response: Confirmation of changes
```

#### **Right to Erasure (Right to be Forgotten)**
```json
// API endpoint for data deletion
DELETE /v1/users/me
Response: Complete data deletion confirmation
```

#### **Right to Data Portability**
```json
// API endpoint for data export
GET /v1/users/data-export
Response: Machine-readable format (JSON, GPX)
```

#### **Right to Restrict Processing**
```json
// API endpoint for processing preferences
POST /v1/users/restrict-processing
Request: Data retention and notification preferences
Response: Confirmation of preference updates
```

**Note**: Users can control data retention periods and email notifications. Core functionality (route analysis, GPS processing) cannot be disabled as it's essential for the app to work.

### **Data Processing Principles**

#### **Lawfulness, Fairness, and Transparency**
- **Clear Privacy Policy**: Explain what data we collect and why
- **User Notification**: Inform users of data processing activities
- **Consent Management**: Clear consent mechanisms and withdrawal

#### **Purpose Limitation**
- **Primary Purpose**: Route uniqueness analysis and discovery
- **Secondary Purpose**: Service improvement and user engagement
- **No Third-Party Sharing**: Data not shared with external parties

#### **Data Minimization**
- **Essential Data Only**: Store only data necessary for core functionality
- **Route Fingerprinting**: Use compressed representations instead of full GPS
- **Metadata Cleanup**: Remove unnecessary Strava metadata

#### **Accuracy**
- **Data Validation**: Validate GPS data quality and accuracy
- **User Correction**: Allow users to correct inaccurate data
- **Automated Checks**: Implement data quality monitoring

#### **Storage Limitation**
- **Retention Policy**: Clear data retention periods
- **Automatic Cleanup**: Automated deletion of old data
- **User Control**: Users can request immediate deletion

#### **Integrity and Confidentiality**
- **Data Encryption**: Encrypt sensitive data at rest and in transit
- **Access Controls**: Strict access controls and authentication
- **Audit Logging**: Comprehensive logging of data access

## Security Architecture

### **Database Security**

#### **Encryption at Rest**
- **Neon PostgreSQL**: AES-256 encryption for data at rest (automatic)
- **All Data Encrypted**: Strava tokens, user preferences, and all other data automatically encrypted
- **No Manual Encryption**: Neon handles encryption keys and rotation automatically
- **Security Level**: Enterprise-grade AES-256 encryption with automatic key management

**Note**: Neon provides comprehensive encryption by default. No additional encryption extensions or manual key management required. All sensitive data (Strava tokens, user preferences, GPS coordinates) are automatically encrypted at rest.

#### **Encryption in Transit**
- **TLS 1.3**: All database connections use TLS encryption
- **Connection Security**: Enforce secure connections only
- **Certificate Validation**: Validate SSL certificates

#### **Access Controls**
- **Row-Level Security**: Users can only access their own data
- **Connection Limits**: Restrict database connections per user
- **IP Restrictions**: Limit database access to application servers

```sql
-- Row-level security for user data
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_routes_policy ON routes
  FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);
```

### **API Security**

#### **Authentication**
- **JWT Tokens**: Secure, stateless authentication
- **Token Expiration**: Short-lived tokens (1 hour)
- **Secure Storage**: Tokens stored securely in client applications

#### **Authorization**
- **Scope-based Access**: Fine-grained permissions for different endpoints
- **User Isolation**: Users can only access their own data
- **Resource Ownership**: Validate resource ownership for all requests

```json
// JWT token structure
{
  "sub": "user-uuid",
  "iat": 1640995200,
  "exp": 1640998800,
  "scope": "routes:read activities:read profile:write",
  "strava_id": "12345"
}
```

#### **Rate Limiting**
- **Endpoint-specific Limits**: Different limits for different endpoint types
- **User-based Limits**: Per-user rate limiting
- **IP-based Limits**: Additional protection against abuse

```json
// Rate limiting configuration
{
  "auth": "5 requests per minute per IP",
  "user": "100 requests per 15 minutes per user",
  "strava": "50 requests per 15 minutes per user",
  "routes": "200 requests per 15 minutes per user",
  "analytics": "100 requests per 15 minutes per user"
}
```

#### **Input Validation**
- **Schema Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Prevention**: Sanitize all user inputs

### **Infrastructure Security**

#### **Neon PostgreSQL Security**
- **Compliance**: SOC 2 Type II, GDPR, HIPAA compliant
- **Encryption**: AES-256 encryption at rest and in transit
- **Access Control**: IP allowlisting, connection encryption
- **Backup Security**: Encrypted backups with access controls

#### **Upstash Redis Security**
- **Encryption**: TLS encryption in transit
- **Access Control**: Token-based authentication
- **Network Security**: VPC isolation and private networking
- **Compliance**: SOC 2 Type II compliant

#### **Application Security**
- **Environment Variables**: Secure configuration management
- **Secret Management**: Use environment-based secrets
- **Dependency Security**: Regular security updates and scanning
- **Container Security**: Secure Docker configurations

## Privacy by Design

### **Data Minimization**

#### **GPS Data Processing**
- **Route Fingerprinting**: Store compressed fingerprints instead of full coordinates
- **Selective Storage**: Only store coordinates needed for analysis
- **Metadata Cleanup**: Remove unnecessary Strava metadata

#### **User Data Collection**
- **Essential Fields Only**: Collect only data necessary for functionality
- **Optional Features**: Make additional data collection optional
- **Default Settings**: Privacy-friendly default configurations

### **Purpose Limitation**

#### **Clear Data Usage**
- **Privacy Policy**: Explicit explanation of data usage
- **User Consent**: Granular consent for different purposes
- **No Secondary Use**: Data not used for purposes beyond core functionality

#### **Data Processing Transparency**
- **Processing Logs**: Log all data processing activities
- **User Dashboard**: Show users what data is processed
- **Audit Trail**: Maintain comprehensive audit logs

### **User Control**

#### **Data Access**
- **User Dashboard**: Complete view of stored data
- **Data Export**: Download data in machine-readable format
- **Data Correction**: Easy mechanism to correct inaccurate data

#### **Data Deletion**
- **Account Deletion**: Complete data removal on account deletion
- **Selective Deletion**: Delete specific data types
- **Deletion Confirmation**: Confirm complete data removal

#### **Processing Controls**
- **Email Notifications**: Users can opt out of email notifications
- **Data Retention**: Users can choose retention period (6 months, 2 years, 5 years)
- **Default Settings**: Privacy-friendly defaults (6 months retention, email notifications enabled)

## Data Retention & Lifecycle

### **Retention Policy**

#### **User Account Data**
- **Active Accounts**: Retain data based on user retention preference
- **User Retention Options**: 
  - **Minimal**: 6 months (default)
  - **Standard**: 2 years
  - **Extended**: 5 years
- **Inactive Accounts**: Delete data after 6 months of inactivity
- **Deleted Accounts**: Immediate deletion of all user data

#### **Activity Data**
- **Route Data**: Keep route fingerprints indefinitely for analysis
- **GPS Coordinates**: Compress and archive after 2 years
- **Metadata**: Clean up unnecessary metadata after 1 year

#### **System Data**
- **Logs**: Retain application logs for 90 days
- **Analytics**: Aggregate analytics data after 1 year
- **Backups**: Encrypted backups retained for 30 days

### **Data Lifecycle Management**

#### **Automated Cleanup**
- **Scheduled Jobs**: Automated cleanup of old data
- **User Notifications**: Warn users before data deletion
- **Grace Periods**: Allow users to extend retention

#### **Archive Strategy**
- **Compression**: Compress old GPS data for storage efficiency
- **Separate Storage**: Move old data to archive tables
- **Access Controls**: Maintain security for archived data

## Incident Response & Breach Notification

### **Security Incident Response**

#### **Incident Classification**
- **Low**: Minor security issues, no data exposure
- **Medium**: Potential data exposure, limited impact
- **High**: Confirmed data breach, significant impact

#### **Response Procedures**
- **Immediate Response**: Contain and assess the incident
- **Investigation**: Determine scope and impact
- **Remediation**: Fix vulnerabilities and restore security
- **Documentation**: Document incident and response

### **Breach Notification**

#### **GDPR Requirements**
- **72-Hour Rule**: Notify authorities within 72 hours
- **User Notification**: Notify affected users without undue delay
- **Documentation**: Maintain records of all breaches

#### **Notification Process**
- **Internal Escalation**: Immediate escalation to security team
- **Authority Notification**: Notify relevant data protection authority
- **User Communication**: Clear, transparent communication to users
- **Public Disclosure**: Public disclosure if required by law

## Compliance Monitoring & Auditing

### **Regular Assessments**

#### **Security Audits**
- **Annual Reviews**: Comprehensive security assessments
- **Penetration Testing**: Regular security testing
- **Vulnerability Scanning**: Automated vulnerability detection

#### **Privacy Impact Assessments**
- **New Features**: Assess privacy impact of new functionality
- **Data Processing**: Regular review of data processing activities
- **Risk Assessment**: Identify and mitigate privacy risks

### **Audit Logging**

#### **Comprehensive Logging**
- **Data Access**: Log all data access and modifications
- **User Actions**: Track user actions and consent changes
- **System Events**: Monitor system security events

#### **Log Retention**
- **Security Logs**: Retain for 1 year for compliance
- **Access Logs**: Retain for 90 days for operational purposes
- **Audit Logs**: Retain indefinitely for compliance

## Implementation Plan

### **Phase 1: Basic Security (Week 1-2)**
- Implement JWT authentication and authorization
- Verify Neon's built-in encryption is active
- Configure basic rate limiting and input validation

### **Phase 2: GDPR Compliance (Week 3-4)**
- Implement data subject rights (access, deletion, portability)
- Set up consent management and privacy policy
- Configure data retention and lifecycle management

### **Phase 3: Advanced Security (Week 5-6)**
- Implement comprehensive audit logging
- Set up security monitoring and alerting
- Conduct security testing and vulnerability assessment

### **Phase 4: Compliance Validation (Week 7-8)**
- Conduct privacy impact assessment
- Validate GDPR compliance
- Prepare compliance documentation

## Success Criteria

- **Security**: No critical security vulnerabilities
- **GDPR Compliance**: Full compliance with GDPR requirements
- **Data Protection**: All sensitive data protected by Neon's built-in encryption
- **User Control**: Users have full control over their data
- **Transparency**: Clear and transparent data processing practices

## References

- [GDPR Compliance Guide](https://gdpr.eu/)
- [Neon Security Documentation](https://neon.tech/docs/security)
- [Upstash Security Features](https://upstash.com/docs/redis/security)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)
- [OWASP Security Guidelines](https://owasp.org/)
