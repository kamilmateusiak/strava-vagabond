# Integration Design

> **Document Focus**: Strava API integration, webhook handling, third-party service integration, and error handling strategies. For system architecture and API design, see [Architecture Design](04-architecture-design.md) and [API Design](06-api-design.md).  

## Overview

This document defines the integration strategy for external services, primarily Strava API integration, webhook handling, and internal token management. The design focuses on robust error handling, rate limiting compliance, and seamless token refresh without external API endpoints.

> **Note**: For application context and backend service characteristics, see [Problem Statement - Application Context](01-problem-statement.md#application-context).

## Strava API Integration

### **API Endpoints Used**

#### **Authentication**
- **POST** `/oauth/token` - Exchange authorization code for access/refresh tokens
- **POST** `/oauth/deauthorize` - Revoke access (user disconnects)

#### **Activities**
- **GET** `/athlete/activities` - Fetch user activities (paginated)
- **GET** `/activities/{id}` - Get specific activity details
- **GET** `/activities/{id}/export_gpx` - Export activity as GPX (if needed)

#### **User Profile**
- **GET** `/athlete` - Get current athlete information
- **GET** `/athlete/profile` - Get detailed profile information

### **Rate Limiting Compliance**

#### **Strava API Limits**
- **100 requests per 15 minutes** per user
- **1000 requests per day** per user
- **Bulk operations**: Process activities in batches of 50-100

#### **Our Rate Limiting Strategy**
- **Respect Strava Limits**: Never exceed Strava's rate limits
- **Batch Processing**: Process activities in chunks to avoid overwhelming API
- **Exponential Backoff**: Retry failed requests with increasing delays
- **Queue Management**: Use internal queues to control request timing

### **Error Handling**

#### **Common Error Responses**
```json
{
  "errors": [
    {
      "resource": "Activity",
      "field": "id",
      "code": "invalid"
    }
  ],
  "message": "Bad Request"
}
```

#### **Error Categories**
- **4xx Errors**: Client errors (bad request, unauthorized, not found)
- **5xx Errors**: Server errors (internal server error, service unavailable)
- **Rate Limit Errors**: 429 Too Many Requests
- **Token Errors**: 401 Unauthorized (expired/invalid token)

## Token Management & Refresh

### **Token Storage Strategy**

#### **Database Fields**
```sql
-- Users table
strava_access_token TEXT NOT NULL,      -- Current access token
strava_refresh_token TEXT NOT NULL,     -- Long-lived refresh token
strava_token_expires_at TIMESTAMP NOT NULL  -- When access token expires
```

#### **Token Encryption**
- **At Rest**: Encrypt tokens in database using AES-256
- **In Memory**: Decrypt only when needed for API calls
- **Key Management**: Use environment variables for encryption keys

### **Internal Token Refresh (No External Endpoint)**

#### **How It Works**
Token refresh is handled entirely internally by worker threads without exposing external API endpoints:

```javascript
// In worker thread - no HTTP endpoint needed
async function handleStravaWebhook(webhookData) {
  try {
    const activity = await stravaApi.getActivity(webhookData.activityId);
    // Process activity...
  } catch (error) {
    if (error.status === 401) {
      // Token expired - refresh internally
      const newTokens = await stravaApi.refreshTokens(user.refreshToken);
      
      // Update database directly
      await db.users.update(userId, {
        strava_access_token: newTokens.access_token,
        strava_refresh_token: newTokens.refresh_token,
        strava_token_expires_at: newTokens.expires_at
      });
      
      // Retry with new token
      const activity = await stravaApi.getActivity(webhookData.activityId, newTokens.access_token);
    }
  }
}
```

#### **Token Refresh Flow**
1. **API Call Fails**: Strava API returns 401 (token expired)
2. **Internal Refresh**: Worker thread calls Strava refresh endpoint directly
3. **Database Update**: New tokens stored in database
4. **Retry Operation**: Original API call retried with new token
5. **Continue Processing**: Normal operation resumes

#### **Benefits of Internal Approach**
- **No External Endpoints**: Token refresh doesn't expose internal operations
- **Better Performance**: No HTTP overhead for internal operations
- **More Secure**: Token refresh logic not accessible from outside
- **Simpler Architecture**: Fewer API endpoints to maintain

### **Token Expiration Handling**

#### **Proactive vs Reactive**
- **No Background Jobs**: Don't refresh tokens proactively
- **Reactive Only**: Refresh tokens only when API calls fail
- **Immediate Response**: Handle expiration in real-time during operations

#### **Fallback Strategy**
- **Refresh Token Expired**: User must re-authenticate with Strava
- **Strava API Down**: Queue operations for retry when service available
- **Database Issues**: Log errors and alert administrators

## Webhook Handling

### **Webhook Endpoint**

#### **POST /webhooks/strava**
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

#### **Webhook Verification**
- **HMAC Signature**: Verify webhook authenticity using `X-Strava-Signature`
- **Timestamp Validation**: Ensure webhook is recent (within 5 minutes)
- **User Validation**: Confirm webhook is for a registered user

### **Webhook Processing Flow**

#### **1. Webhook Reception**
```javascript
app.post('/webhooks/strava', async (req, res) => {
  // Verify webhook signature
  const isValid = verifyWebhookSignature(req);
  if (!isValid) return res.status(401).send('Invalid signature');
  
  // Extract webhook data
  const webhookData = req.body;
  
  // Queue for processing
  await activityQueue.add('process-webhook', webhookData);
  
  res.status(200).send('OK');
});
```

#### **2. Queue Processing**
```javascript
// Worker thread processes webhook
activityQueue.process('process-webhook', async (job) => {
  const webhookData = job.data;
  
  try {
    // Fetch activity from Strava
    const activity = await stravaApi.getActivity(webhookData.object_id);
    
    // Process route analysis
    const analysis = await routeAnalyzer.analyze(activity);
    
    // Store results
    await storeAnalysisResults(analysis);
    
    // Send email notification
    await emailService.sendRideSummary(activity, analysis);
    
  } catch (error) {
    if (error.status === 401) {
      // Handle token refresh (see above)
      await refreshTokensAndRetry(webhookData);
    } else {
      // Log error and move to DLQ
      throw error;
    }
  }
});
```

### **Webhook Error Handling**

#### **Retry Strategy**
- **Max Retries**: 3 attempts for webhook processing
- **Backoff Strategy**: Exponential backoff (1s, 2s, 4s)
- **Dead Letter Queue**: Failed webhooks moved to DLQ after retries

#### **Common Failure Scenarios**
- **Token Expiration**: Handled by internal refresh
- **Strava API Down**: Retry when service available
- **Database Issues**: Log and alert administrators
- **Processing Errors**: Move to DLQ for manual investigation

## Batch Processing

### **Initial Data Import**

#### **Bulk Activity Processing**
- **Batch Size**: 50-100 activities per batch
- **Processing Interval**: 2-3 minutes between batches
- **Rate Limit Compliance**: Stay well within Strava's 100/15min limit

#### **Batch Processing Flow**
```javascript
async function processBulkActivities(userId) {
  const activities = await stravaApi.getActivities(userId);
  const batches = chunk(activities, 75); // 75 activities per batch
  
  for (const batch of batches) {
    // Process batch and store results
    await processActivityBatch(userId, batch);
    
    // Wait 3 minutes before next batch (rate limit compliance)
    await delay(180000);
  }
}
```

### **Simple Processing**
- **No Complex Tracking**: Just process activities and store results
- **Rate Limit Compliance**: Stay within Strava's 100/15min limit
- **Background Operation**: User doesn't need to monitor progress

## Error Handling Strategies

### **Strava API Errors**

#### **Rate Limiting (429)**
```javascript
if (error.status === 429) {
  const retryAfter = error.headers['retry-after'] || 60;
  await delay(retryAfter * 1000);
  return retryOperation();
}
```

#### **Authentication Errors (401)**
```javascript
if (error.status === 401) {
  await refreshTokensAndRetry(operation);
}
```

#### **Server Errors (5xx)**
```javascript
if (error.status >= 500) {
  // Move to retry queue with exponential backoff
  await retryQueue.add('retry-operation', operation, {
    delay: Math.pow(2, attemptCount) * 1000
  });
}
```

### **Database Errors**

#### **Connection Issues**
- **Retry Logic**: Exponential backoff for connection failures
- **Connection Pooling**: Maintain healthy connection pool
- **Fallback**: Use read replicas if available

#### **Transaction Failures**
- **Rollback Strategy**: Automatic rollback on failures
- **Partial Success Handling**: Process successful operations, retry failed ones
- **Data Consistency**: Ensure database remains in consistent state

### **Queue Processing Errors**

#### **Job Failures**
- **Error Logging**: Detailed error information for debugging
- **Retry Logic**: Automatic retry with exponential backoff
- **Dead Letter Queue**: Failed jobs moved to DLQ for investigation

#### **Queue Monitoring**
- **Health Checks**: Monitor queue health and performance
- **Alerting**: Notify administrators of queue issues
- **Metrics**: Track queue performance and failure rates

## Integration Testing

### **Strava API Testing**

#### **Mock Strava API**
- **Development Environment**: Use mock API for testing
- **Test Data**: Realistic activity data for development
- **Error Simulation**: Test various error scenarios

#### **Integration Tests**
- **Token Refresh**: Test internal token refresh logic
- **Webhook Processing**: Test webhook handling end-to-end
- **Rate Limiting**: Test rate limit compliance
- **Error Handling**: Test various error scenarios

### **Webhook Testing**

#### **Local Testing**
- **ngrok**: Expose local server to internet for webhook testing
- **Strava Webhook Console**: Test webhook delivery
- **Signature Verification**: Test webhook authenticity checks

#### **Production Testing**
- **Webhook Monitoring**: Monitor webhook delivery success rates
- **Error Tracking**: Track webhook processing failures
- **Performance Metrics**: Monitor webhook processing times

## Security Considerations

### **Webhook Security**

#### **Signature Verification**
- **HMAC Validation**: Verify webhook authenticity
- **Secret Management**: Secure storage of webhook secrets
- **Replay Protection**: Prevent webhook replay attacks

#### **Access Control**
- **User Validation**: Ensure webhooks are for registered users
- **Rate Limiting**: Prevent webhook endpoint abuse
- **Input Validation**: Validate all webhook data

### **Token Security**

#### **Encryption**
- **At Rest**: Encrypt tokens in database
- **In Transit**: Use HTTPS for all API calls
- **Key Management**: Secure storage of encryption keys

#### **Token Rotation**
- **Regular Refresh**: Tokens refreshed when needed
- **Revocation**: Support for token revocation
- **Audit Logging**: Track all token operations

## Monitoring & Observability

### **Integration Metrics**

#### **API Performance**
- **Response Times**: Monitor Strava API response times
- **Success Rates**: Track API call success rates
- **Rate Limit Usage**: Monitor rate limit consumption

#### **Webhook Processing**
- **Processing Times**: Monitor webhook processing performance
- **Queue Depths**: Track queue lengths and processing rates
- **Error Rates**: Monitor webhook processing failures

### **Alerting**

#### **Critical Alerts**
- **API Failures**: Alert on Strava API outages
- **Token Issues**: Alert on token refresh failures
- **Queue Problems**: Alert on queue processing issues

#### **Warning Alerts**
- **Rate Limit Usage**: Warn when approaching rate limits
- **Processing Delays**: Warn on slow webhook processing
- **Error Spikes**: Warn on increased error rates

## References

- [Strava API Documentation](https://developers.strava.com/docs/)
- [Strava Webhook Guide](https://developers.strava.com/docs/webhooks/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [HMAC Authentication](https://tools.ietf.org/html/rfc2104)
