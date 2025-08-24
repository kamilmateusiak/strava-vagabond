# Decision: Strava Token Management Strategy

**Date**: 2025-08-24 18:38 UTC  
**Status**: Accepted  
**Category**: Authentication & Security  
**Impact**: High  

## Context

During API design review, we identified a discrepancy between our authentication flow description and our actual data model. The API design mentioned "automatic token refresh" but our users table didn't store Strava refresh tokens, making automatic refresh impossible.

We needed to decide between two approaches:
1. **Store refresh tokens** for seamless user experience
2. **Don't store refresh tokens** and require re-authentication

## Decision

**Store Strava access tokens, refresh tokens, and expiration times in the database to enable automatic token refresh.**

## Rationale

### **Why Store Refresh Tokens:**

1. **User Experience**:
   - **Seamless Operation**: Users never need to re-authenticate with Strava
   - **Continuous Service**: App remains functional without interruption
   - **Webhook Reliability**: Strava webhooks continue working automatically

2. **Technical Benefits**:
   - **Background Refresh**: Automated token renewal before expiration
   - **API Reliability**: Consistent Strava API access
   - **Error Prevention**: Avoids token expiration failures

3. **Business Value**:
   - **User Retention**: Better experience leads to higher engagement
   - **Support Reduction**: Fewer authentication-related support requests
   - **Data Continuity**: Uninterrupted activity synchronization

### **Why Not Require Re-Authentication:**

- **Poor UX**: Users lose access to app when tokens expire
- **Webhook Failures**: Strava webhooks stop working
- **Data Gaps**: Missed activities during authentication gaps
- **User Friction**: Additional steps to continue using the app

## Consequences

### **Positive**:
- **Seamless Experience**: Users never see authentication interruptions
- **Reliable Webhooks**: Strava notifications continue working
- **Better Engagement**: App remains accessible 24/7
- **Professional Feel**: App behaves like production services

### **Negative**:
- **Security Complexity**: Need to encrypt tokens at rest
- **Background Jobs**: Additional complexity for token refresh
- **Token Storage**: More sensitive data in database
- **Failure Handling**: Need fallback if refresh fails

## Implementation Details

### **Database Changes**:
```sql
-- Added to users table
strava_access_token TEXT NOT NULL,
strava_refresh_token TEXT NOT NULL,
strava_token_expires_at TIMESTAMP NOT NULL
```

### **Security Measures**:
- **Encryption at Rest**: Tokens encrypted before database storage
- **Access Control**: Only authorized services can access tokens
- **Audit Logging**: Track token refresh operations
- **Secure Storage**: Use environment-based encryption keys

### **Background Refresh Process**:
```typescript
// Hourly background job
const refreshExpiredTokens = async () => {
  const usersWithExpiredTokens = await db
    .selectFrom('users')
    .selectAll()
    .where('strava_token_expires_at', '<', new Date(Date.now() + 3600000)) // 1 hour before expiry
    .execute();
    
  for (const user of usersWithExpiredTokens) {
    try {
      const newTokens = await stravaApi.refreshToken(user.strava_refresh_token);
      await updateUserTokens(user.id, newTokens);
    } catch (error) {
      // Log error and mark user for re-authentication
      await markUserForReAuth(user.id);
    }
  }
};
```

### **Fallback Strategy**:
- **Refresh Failure**: Mark user for re-authentication
- **Graceful Degradation**: App continues working with limited functionality
- **User Notification**: Inform user when re-authentication is needed
- **Automatic Recovery**: Retry refresh on next cycle

## Alternatives Considered

### **Option 1: Store Refresh Tokens (Chosen)**
- **Pros**: Seamless UX, reliable webhooks, professional feel
- **Cons**: Security complexity, background job complexity
- **Decision**: Accept complexity for better user experience

### **Option 2: Don't Store Refresh Tokens**
- **Pros**: Simpler implementation, less security risk
- **Cons**: Poor UX, webhook failures, user friction
- **Decision**: Rejected due to poor user experience

### **Option 3: Hybrid Approach**
- **Pros**: Balance of security and convenience
- **Cons**: More complex decision logic
- **Decision**: Overkill for our use case

## Security Considerations

### **Token Encryption**:
- **Algorithm**: AES-256-GCM for authenticated encryption
- **Key Management**: Environment-based encryption keys
- **Key Rotation**: Regular key rotation procedures
- **Access Control**: Minimal access to decryption keys

### **Token Access**:
- **Service Isolation**: Only auth service can decrypt tokens
- **Audit Logging**: Log all token access and refresh operations
- **Rate Limiting**: Prevent abuse of token refresh endpoints
- **Monitoring**: Alert on suspicious token activity

## Testing Strategy

### **Token Refresh Testing**:
- **Unit Tests**: Test encryption/decryption functions
- **Integration Tests**: Test Strava API token refresh
- **Background Job Tests**: Test automated refresh process
- **Security Tests**: Test token access controls

### **Failure Scenarios**:
- **Expired Refresh Token**: Test re-authentication flow
- **Network Failures**: Test refresh retry logic
- **Strava API Errors**: Test error handling and fallbacks
- **Database Failures**: Test token storage resilience

## Related Decisions

- [Query Builder Selection](011-query-builder-selection.md) - Database access for token storage
- [Infrastructure Provider Selection](009-infrastructure-provider-selection.md) - Database security considerations
- [Event-Driven Architecture](010-event-driven-architecture.md) - Background job implementation

## References

- [Strava API Authentication](https://developers.strava.com/docs/authentication/)
- [JWT Token Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Database Encryption Strategies](https://www.postgresql.org/docs/current/encryption-options.html)
