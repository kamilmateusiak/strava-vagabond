# Decision: Implement Event-Driven Architecture with Bull + Redis

**Date:** 2025-08-23 11:00 UTC  
**Status:** Accepted  
**Category:** Architecture  

## Context

During the architecture design phase, we needed to decide how to handle Strava webhook processing and bulk activity analysis. The system needs to:
- Respond immediately to Strava webhooks (avoid timeouts)
- Process 2000+ historical activities without overwhelming the system
- Handle Strava API rate limits (100 requests per 15 minutes)
- Provide robust error handling and retry mechanisms
- Support future evolution to microservices

## Decision

**Implement event-driven architecture using Bull + Redis for queue management with the following characteristics:**

### **Event System Design**
- **Core Events**: `strava.activity.received`, `strava.activity.analyzed`, `strava.bulk.import.ready`
- **Supporting Events**: `strava.activity.failed`, `strava.bulk.import.completed`, `strava.email.sent`, `strava.user.connected`
- **Event Flow**: Webhook → Queue → Background Processing → Email Generation

### **Queue Configuration**
- **Activity Queue**: 2-3 workers for real-time webhook processing (high priority)
- **Bulk Queue**: 1-2 workers for background bulk processing (low priority)
- **Email Queue**: 1 worker for email generation and delivery (medium priority)

### **Processing Strategy**
- **Real-time**: Immediate webhook response, background processing
- **Bulk Processing**: Batch processing (50-100 activities) with 2-3 minute intervals
- **Rate Limiting**: Respect Strava API limits (100 requests per 15 minutes)

### **Error Handling**
- **Retry Strategy**: 3 attempts with exponential backoff (0s, 5s, 15s)
- **Dead Letter Queue**: Failed jobs moved to DLQ after 3 retries
- **Monitoring**: Track failed jobs, retry counts, and failure reasons

## Consequences

### **Positive Outcomes**
1. **Webhook Responsiveness**: Immediate response to Strava, no timeouts
2. **Rate Limit Compliance**: Controlled processing respects API constraints
3. **Error Resilience**: Robust retry logic with DLQ fallback
4. **Scalability**: Different worker pools for different workloads
5. **Future-Proof**: Easy evolution to microservices architecture

### **Trade-offs**
1. **Complexity**: Event-driven system is more complex than synchronous processing
2. **Infrastructure**: Requires Redis for queue management
3. **Debugging**: Asynchronous processing can be harder to debug
4. **Latency**: Email delivery has additional queue delay

## Alternatives Considered

### **Alternative 1: Synchronous Processing**
- **Approach**: Process webhooks synchronously, block until completion
- **Pros**: Simpler implementation, immediate results
- **Cons**: Webhook timeouts, poor user experience, Strava rate limit violations
- **Decision**: Rejected due to reliability and rate limit concerns

### **Alternative 2: Parallel Bulk Processing**
- **Approach**: Process all 2000 activities simultaneously
- **Pros**: Faster completion, simpler logic
- **Cons**: Strava API rate limit violations, potential account suspension
- **Decision**: Rejected due to API compliance requirements

### **Alternative 3: AWS SQS + Microservices**
- **Approach**: Use AWS SQS instead of Bull + Redis
- **Pros**: Managed service, enterprise-grade reliability
- **Cons**: Higher cost, AWS lock-in, overkill for personal project
- **Decision**: Rejected in favor of cost-effective Bull + Redis solution

## Implementation Notes

### **Technology Stack**
- **Queue Management**: Bull + Upstash Redis (serverless)
- **Worker Processing**: Node.js worker threads
- **Event Persistence**: Redis job storage with Bull
- **Monitoring**: Built-in Bull metrics and job tracking

### **Configuration Details**
- **Queue Priorities**: Activity (high), Email (medium), Bulk (low)
- **Worker Allocation**: Activity (2-3), Bulk (1-2), Email (1)
- **Batch Processing**: 50-100 activities per batch, 2-3 minute intervals
- **Retry Logic**: 3 attempts with exponential backoff

### **Migration Path**
- **Phase 1**: Monolith with internal queues (current)
- **Phase 2**: Extract route analyzer to Golang service
- **Phase 3**: Full microservices with shared queues

## References

- [Architecture Design Document](../technical-design/04-architecture-design.md)
- [Implementation Options Analysis](../technical-design/03-implementation-options.md)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Strava API Rate Limits](https://developers.strava.com/docs/rate-limits/)

## Related Decisions

- [Document Separation of Concerns](007-document-separation-of-concerns.md) - Influenced architecture documentation structure
- [Implementation Options](003-implementation-options.md) - Led to Option 5 (Hybrid Monolith) choice
