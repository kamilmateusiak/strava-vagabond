# Linear Integration and Branch Naming Convention

## Decision

**Date**: 2025-08-29  
**Status**: Accepted  
**Type**: Development Process  

## Context

The project requires a structured approach to task management and version control integration. We need to establish:
1. How tasks are managed during development
2. How version control branches are created and named
3. Integration between task management and code development

## Decision

### Task Management
- **Tool**: Linear app for task management
- **Integration**: GitHub integration already configured
- **Task Source**: 74 initial development tasks exported from implementation plan to CSV and imported into Linear

### Branch Naming Convention
- **Format**: `identifier-title`
- **Pattern**: `str-{task-number}-{kebab-case-title}`
- **Examples**:
  - `str-1-project-setup-repository`
  - `str-9-strava-oauth-implementation`
  - `str-16-database-schema-implementation`
  - `str-30-route-fingerprinting-algorithm`

### Development Workflow
1. **Task Selection**: Pick task from Linear
2. **Branch Creation**: Create feature branch using the naming convention
3. **Development**: Implement the feature/task
4. **Integration**: Link commits/PRs to Linear tasks via GitHub integration
5. **Completion**: Mark task as done in Linear when merged

## Rationale

### Linear Integration Benefits
- **Centralized Task Management**: Single source of truth for all development work
- **GitHub Integration**: Automatic linking between code changes and tasks
- **Progress Tracking**: Clear visibility into project completion status
- **Team Coordination**: Future-proof for potential team expansion

### Branch Naming Benefits
- **Clear Identification**: Easy to see which task a branch relates to
- **Consistent Format**: Standardized naming across all development work
- **Task Traceability**: Direct link between branch names and Linear task identifiers
- **Clean History**: Organized git history that maps to project management

### Workflow Benefits
- **Structured Development**: Each feature gets dedicated attention
- **Progress Visibility**: Clear mapping between code changes and project milestones
- **Quality Control**: Smaller, focused changes that are easier to review
- **Rollback Capability**: Granular control over feature deployment

## Consequences

### Positive
- **Organized Development**: Clear structure for development work
- **Progress Tracking**: Easy to see project completion status
- **Future Scalability**: Process works for both solo and team development
- **Professional Standards**: Enterprise-level development practices

### Considerations
- **Branch Management**: Need to clean up feature branches after merge
- **Task Granularity**: Some tasks may be too large and need breaking down
- **Integration Setup**: Ensure GitHub-Linear integration is properly configured

## Implementation Notes

- **Initial Setup**: 74 tasks already imported into Linear with STR prefix
- **Branch Creation**: Use `git checkout -b str-{number}-{title}` format
- **Task Linking**: GitHub integration should automatically link commits to Linear tasks
- **Branch Cleanup**: Delete feature branches after successful merge to main

## Related Decisions

- [013-minimal-frontend-oauth-requirement.md](./013-minimal-frontend-oauth-requirement.md) - OAuth implementation approach
- [014-route-fingerprinting-algorithm-selection.md](./014-route-fingerprinting-algorithm-selection.md) - Route analysis implementation
