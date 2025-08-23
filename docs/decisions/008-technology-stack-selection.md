# Decision: Technology Stack Selection - Option 5 Hybrid Monolith

**Date:** 2025-08-23 10:30 UTC  
**Status:** Accepted  
**Category:** Architecture  

## Context

After evaluating 6 different implementation options (monolithic JavaScript, microservices with AWS SQS + Golang, event-driven architecture, serverless, hybrid monolith, and Kubernetes), we needed to select the optimal technology stack that balances learning value, complexity, performance, and cost for a personal project.

## Decision

**Select Option 5: Hybrid Monolith with Internal Queues using the following technology stack:**

### **Core Technologies**
- **Backend Framework**: Node.js + Express/Fastify
- **Queue Management**: Bull + Upstash Redis (serverless)
- **Database**: Neon PostgreSQL + PostGIS (serverless)
- **Background Processing**: Node.js worker threads
- **Deployment**: Vercel, Railway, or DigitalOcean

### **Key Infrastructure Choices**
- **Redis Provider**: Upstash (serverless) over traditional Redis hosting
- **Database Provider**: Neon PostgreSQL over Vercel Postgres and alternatives
- **Architecture Pattern**: Hybrid monolith with internal queues over microservices

## Consequences

### **Positive Outcomes**
1. **Cost Efficiency**: $5.20-41/month vs. $35-105/month traditional setup
2. **Zero Infrastructure**: No database or Redis server management required
3. **Advanced Capabilities**: Full PostGIS support for spatial route analysis
4. **Learning Value**: Queue patterns, worker threads, PostGIS integration
5. **Migration Path**: Easy evolution to microservices with Golang later

### **Trade-offs**
1. **Complexity**: More complex than simple monolith, less than microservices
2. **Vendor Dependencies**: Reliance on Upstash and Neon services
3. **Performance**: Good enough for 2000+ activities, not enterprise-scale
4. **Local Development**: Requires Redis and PostgreSQL setup locally

## Alternatives Considered

### **Alternative 1: Monolithic JavaScript (Option 1)**
- **Approach**: Single Node.js service with direct database access
- **Pros**: Simplest implementation, familiar patterns
- **Cons**: No async processing, poor webhook responsiveness
- **Decision**: Rejected due to lack of async capabilities

### **Alternative 2: Microservices + AWS SQS + Golang (Option 2)**
- **Approach**: Distributed system with AWS infrastructure
- **Pros**: Excellent scalability, performance, learning opportunities
- **Cons**: Complex local setup, higher cost, over-engineering for personal project
- **Decision**: Rejected in favor of simpler, cost-effective solution

### **Alternative 3: Event-Driven Architecture (Option 3)**
- **Approach**: Event sourcing with message brokers
- **Pros**: Advanced patterns, excellent scalability
- **Cons**: High complexity, overkill for current requirements
- **Decision**: Rejected due to unnecessary complexity

### **Alternative 4: Serverless Architecture (Option 4)**
- **Approach**: AWS Lambda + DynamoDB + S3
- **Pros**: Zero infrastructure, auto-scaling
- **Cons**: Vendor lock-in, cold starts, complex local development
- **Decision**: Rejected due to AWS dependency and local development challenges

### **Alternative 6: Kubernetes + Container Orchestration (Option 6)**
- **Approach**: Full container orchestration with service mesh
- **Pros**: Industry standard, excellent scalability
- **Cons**: Highest complexity, overkill for personal project
- **Decision**: Rejected due to excessive complexity

## Implementation Notes

### **Technology Rationale**
- **Node.js**: Your existing expertise, excellent ecosystem for APIs
- **Bull + Upstash**: Built-in DLQ, retry logic, job monitoring
- **Neon PostgreSQL**: Full PostGIS support, database branching, serverless
- **Worker Threads**: CPU-intensive route analysis without blocking main thread

### **Cost Analysis**
- **Development**: $0/month (both services free)
- **Production Budget**: $7/month (Neon free + Upstash $2 + hosting $5)
- **Production Performance**: $41/month (Neon $19 + Upstash $2 + hosting $20)
- **Traditional Alternative**: $35-105/month
- **Monthly Savings**: $30-100/month

### **Migration Strategy**
- **Phase 1**: Monolith with internal queues (current)
- **Phase 2**: Extract route analyzer to Golang service
- **Phase 3**: Full microservices architecture

## References

- [Implementation Options Analysis](../technical-design/03-implementation-options.md)
- [Architecture Design Document](../technical-design/04-architecture-design.md)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

## Related Decisions

- [Event-Driven Architecture](010-event-driven-architecture.md) - Built on this technology stack choice
- [Document Separation of Concerns](007-document-separation-of-concerns.md) - Influenced documentation structure
