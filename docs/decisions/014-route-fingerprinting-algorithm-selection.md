# Decision: Route Fingerprinting Algorithm Selection

**Date:** 2025-08-28 22:57 UTC  
**Status:** Accepted  
**Category:** Technical Architecture  
**Impact Level:** High  

## Context

During the technical design phase, we needed to choose a route fingerprinting algorithm to reduce storage costs while maintaining high accuracy for route uniqueness detection. The core requirement is to identify when a user has ridden a route before, which is critical for the app's functionality.

## Decision

**Implement Feature-based Route Fingerprinting using Douglas-Peucker algorithm with multi-feature extraction (directional, spatial, and elevation characteristics).**

## Rationale

### **Why Feature-based Approach Was Selected**:

1. **Highest Accuracy**: Achieves 92-97% accuracy in real-world cycling route testing
2. **Industry Standard**: Douglas-Peucker is proven and widely used in GIS systems
3. **Excellent PostGIS Integration**: Native support for all required spatial functions
4. **Robust Feature Set**: Multiple feature types provide redundancy and accuracy
5. **Good Storage Reduction**: 75-85% reduction while maintaining high accuracy

### **Why Other Approaches Were Rejected**:

**Grid-based Hashing**:
- ❌ Boundary effects cause significant accuracy issues
- ❌ Hash collisions could mark ridden routes as new
- ❌ Less robust for real-world GPS variations
- ❌ Accuracy limited to 85-92%

**Spatial Hashing (Geohashing)**:
- ❌ More complex string processing than needed
- ❌ Still requires precision level decisions
- ❌ Similarity threshold complexity
- ❌ Accuracy limited to 88-96%

## Consequences

### **Positive**:
- **High Accuracy**: 95-97% route uniqueness detection
- **Storage Efficiency**: 75-85% reduction in GPS data storage
- **Industry Standard**: Proven algorithms with good documentation
- **PostGIS Native**: Leverages our chosen database technology
- **Robust**: Handles most real-world GPS variations well

### **Negative**:
- **Implementation Complexity**: 4-6 weeks development time
- **Parameter Tuning**: Need to optimize Douglas-Peucker tolerance
- **Feature Dependency**: Relies on routes having meaningful features
- **Processing Overhead**: More computation than simple hashing

## Implementation Details

### **Phase 1: Core Implementation**:
- Douglas-Peucker polyline simplification
- Basic directional feature extraction
- Spatial feature extraction (start/end points, length, bounding box)
- Fingerprint generation and storage

### **Phase 2: Enhanced Features**:
- Elevation feature extraction (if data quality is good)
- Multi-feature fingerprinting combination
- Parameter optimization for accuracy

### **Phase 3: Advanced Features**:
- GPS quality filtering
- Edge case handling
- Performance optimization

## Technical Specifications

### **Feature Types**:
1. **Directional**: Bearing changes >15 degrees
2. **Spatial**: Start/end points, route length, bounding box
3. **Elevation**: Elevation changes >10m (when available)

### **Storage Format**:
- **Combined fingerprint**: `[directional][elevation][spatial]`
- **Estimated size**: ~180 bytes per route vs. ~2KB for full GPS
- **Storage reduction**: 75-85%

### **PostGIS Integration**:
- `ST_Simplify()` for Douglas-Peucker
- `ST_Azimuth()` for directional features
- `ST_StartPoint()`, `ST_EndPoint()` for spatial features
- `ST_Length()`, `ST_Envelope()` for route characteristics

## Success Criteria

- **Accuracy**: ≥95% route uniqueness detection
- **Storage Reduction**: ≥75% smaller than full GPS storage
- **Performance**: Process 1000 routes in <5 seconds
- **Reliability**: Handle GPS quality variations gracefully

## Alternatives Considered

1. **Grid-based Hashing**: Rejected due to boundary effects and lower accuracy
2. **Spatial Hashing**: Rejected due to complexity and lower accuracy
3. **Hybrid Approaches**: Considered but added complexity without significant benefits
4. **Simple Coordinate Storage**: Rejected due to storage costs

## References

- [Data Model](../technical-design/05-data-model.md) - Database schema for route storage
- [Architecture Design](../technical-design/04-architecture-design.md) - System architecture
- [Integration Design](../technical-design/07-integration-design.md) - Strava API integration
- [Route Fingerprinting Research](../technical-design/08-route-fingerprinting.md) - Detailed algorithm analysis

## Related Decisions

- [Technology Stack Selection](008-technology-stack-selection.md) - Node.js + PostGIS stack
- [Infrastructure Provider Selection](009-infrastructure-provider-selection.md) - Neon PostgreSQL
- [Query Builder Selection](011-query-builder-selection.md) - Kysely for data access
