# Self-Explanatory Code Principle

## Decision

**Date**: 2025-08-30 13:30 UTC  
**Status**: Accepted  
**Type**: Code Quality  

## Context

When writing code, especially with AI assistance (GitHub Copilot, Cursor, etc.), we need to establish clear principles for code quality and readability. The goal is to create code that is immediately understandable without requiring extensive comments or documentation.

## Decision

**Self-Explanatory Code**: Write code that is clear and understandable on its own, with minimal comments. Focus on descriptive variable names, clear function names, and logical structure rather than explanatory comments.

### Implementation Guidelines
1. **Descriptive Naming**: Use clear, descriptive names for variables, functions, and classes
2. **Minimal Comments**: Only add comments when the code cannot be made self-explanatory
3. **Clear Structure**: Organize code logically with clear separation of concerns
4. **Type Safety**: Use TypeScript types and interfaces to make intent clear
5. **Function Purpose**: Function names should clearly indicate what they do

### When to Use Comments
- **Complex algorithms**: When the logic is not immediately obvious
- **Business rules**: When the code implements specific business requirements
- **API documentation**: For public interfaces and endpoints
- **Workarounds**: When implementing temporary solutions or known issues

### When NOT to Use Comments
- **Obvious code**: Don't comment what the code clearly shows
- **Variable descriptions**: Use better names instead of explaining variables
- **Function descriptions**: Use descriptive function names instead
- **TODO comments**: Keep these minimal and specific

## Rationale

### Why Self-Explanatory Code is Better
- **Faster reading**: Developers can understand code without switching context
- **Easier maintenance**: Clear code is easier to modify and debug
- **Better collaboration**: Team members can work with code more efficiently
- **Reduced cognitive load**: Less mental effort to understand the codebase

### Why Minimal Comments Work
- **Comments become outdated**: Code changes but comments often don't
- **Maintenance overhead**: Comments require maintenance alongside code
- **False security**: Comments can give false confidence about code quality
- **Code duplication**: Comments often repeat what the code already shows

### AI-Generated Code Considerations
- **Copilot patterns**: AI tends to generate verbose comments
- **Code review**: Need to actively remove unnecessary comments
- **Quality focus**: Focus on code quality rather than comment quantity

## Consequences

### Positive
- **Cleaner codebase**: Less visual clutter and noise
- **Better readability**: Code is easier to scan and understand
- **Improved maintainability**: Clear code is easier to modify
- **Professional appearance**: Industry-standard approach to code quality

### Considerations
- **Initial effort**: Requires more thought in naming and structure
- **Team training**: All developers need to follow this principle
- **Code review**: Need to actively remove unnecessary comments
- **Balance**: Some comments are still necessary for complex logic

## Implementation Notes

- **Code review**: Actively remove unnecessary comments during review
- **Naming conventions**: Establish clear naming patterns for the project
- **Type definitions**: Use TypeScript interfaces to make data structures clear
- **Function design**: Keep functions focused and single-purpose
- **Documentation**: Focus on API documentation rather than inline comments

## Examples

### Good (Self-Explanatory)
```typescript
const userActivities = await stravaService.fetchUserActivities(userId);
const uniqueRoutes = routeAnalyzer.findUniqueRoutes(userActivities);
const explorationScore = calculateExplorationPercentage(uniqueRoutes);
```

### Bad (Over-Commented)
```typescript
// Get user activities from Strava
const userActivities = await stravaService.fetchUserActivities(userId);
// Find unique routes from activities
const uniqueRoutes = routeAnalyzer.findUniqueRoutes(userActivities);
// Calculate exploration percentage
const explorationScore = calculateExplorationPercentage(uniqueRoutes);
```

## Related Decisions

- [016-dependency-driven-development.md](./016-dependency-driven-development.md) - Development approach
- [015-linear-integration-branch-naming.md](./015-linear-integration-branch-naming.md) - Development workflow
