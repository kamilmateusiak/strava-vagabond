# Decision: Infrastructure Provider Selection - Upstash Redis + Neon PostgreSQL

**Date:** 2025-08-23 10:45 UTC  
**Status:** Accepted  
**Category:** Architecture  

## Context

After selecting the hybrid monolith architecture, we needed to choose specific infrastructure providers for Redis (queue management) and PostgreSQL (database with PostGIS). The choice needed to balance cost, features, maintenance overhead, and suitability for a personal project.

## Decision

**Select serverless infrastructure providers for both Redis and PostgreSQL:**

### **Redis Provider: Upstash**
- **Service**: Serverless Redis with Bull queue support
- **Pricing**: Pay-per-request model ($0.20-2/month for typical usage)
- **Features**: Built-in persistence, global edge locations, TLS encryption
- **Maintenance**: Zero infrastructure management required

### **Database Provider: Neon PostgreSQL**
- **Service**: Serverless PostgreSQL with full PostGIS support
- **Pricing**: Free tier (3GB, 0.5 vCPU) to $19/month (100GB, 2 vCPU)
- **Features**: Database branching, global edge locations, automatic scaling
- **Maintenance**: Zero database server management required

## Consequences

### **Positive Outcomes**
1. **Cost Savings**: $30-100/month vs. traditional managed services
2. **Zero Maintenance**: No server setup, monitoring, or scaling required
3. **Advanced Features**: Full PostGIS support, database branching, global edge
4. **Environment Parity**: Same capabilities in development and production
5. **Automatic Scaling**: Handles traffic spikes without capacity planning

### **Trade-offs**
1. **Vendor Dependencies**: Reliance on Upstash and Neon services
2. **Local Development**: Requires Redis and PostgreSQL setup locally
3. **Feature Limitations**: Some advanced features may require paid tiers
4. **Network Latency**: Potential latency for database operations

## Alternatives Considered

### **Alternative 1: Traditional Redis Hosting**
- **Approach**: Self-hosted Redis or managed Redis services
- **Options**: DigitalOcean ($15/month), Heroku ($10-30/month), AWS ElastiCache ($15-30/month)
- **Pros**: Full control, no vendor dependencies
- **Cons**: Higher cost ($15-30/month), infrastructure management required
- **Decision**: Rejected due to cost and maintenance overhead

### **Alternative 2: Vercel Postgres**
- **Approach**: Vercel's managed PostgreSQL service
- **Pricing**: $0-20/month depending on usage
- **Pros**: Integrated with Vercel deployment, familiar ecosystem
- **Cons**: Limited storage (256MB-8GB), limited compute resources
- **Decision**: Rejected in favor of Neon's superior PostGIS capabilities

### **Alternative 3: Supabase**
- **Approach**: Full-stack backend-as-a-service
- **Pricing**: $25/month for production use
- **Pros**: Complete backend solution, excellent developer experience
- **Cons**: Higher cost, overkill for our specific needs
- **Decision**: Rejected due to cost and unnecessary features

### **Alternative 4: AWS RDS**
- **Approach**: Amazon's managed PostgreSQL service
- **Pricing**: $12-25/month for basic instances
- **Pros**: Enterprise-grade reliability, full PostgreSQL features
- **Cons**: Higher cost, AWS complexity, vendor lock-in
- **Decision**: Rejected due to cost and complexity

## Implementation Notes

### **Upstash Redis Integration**
- **Bull Queue Support**: Native integration with Node.js Bull library
- **Free Tier**: 10,000 requests/day (sufficient for 2000+ activities)
- **Storage**: 256MB (adequate for queue management)
- **Connections**: Unlimited connections, no pooling limits

### **Neon PostgreSQL Integration**
- **PostGIS Support**: Full spatial database capabilities
- **Free Tier**: 3GB storage, 0.5 vCPU, unlimited connections
- **Database Branching**: Instant copies for development and testing
- **Spatial Functions**: ST_Distance, ST_HausdorffDistance, ST_Within

### **Cost Comparison**
| Service | Traditional | Upstash + Neon | Monthly Savings |
|---------|-------------|----------------|-----------------|
| **PostgreSQL** | $15-25/month | $0-19/month | $15-25/month |
| **Redis** | $15-30/month | $0.20-2/month | $13-28/month |
| **Total** | **$30-55/month** | **$0.20-21/month** | **$30-100/month** |

### **Local Development Setup**
- **Redis**: Local Redis instance or Docker container
- **PostgreSQL**: Local PostgreSQL + PostGIS or Docker container
- **Environment Variables**: Switch between local and production services

## References

- [Architecture Design Document](../technical-design/04-architecture-design.md)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [PostGIS Spatial Functions](https://postgis.net/docs/reference.html)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

## Related Decisions

- [Technology Stack Selection](008-technology-stack-selection.md) - This decision supports the chosen technology stack
- [Event-Driven Architecture](010-event-driven-architecture.md) - Infrastructure supports the event-driven design
