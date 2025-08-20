# Decision: Project Initialization

**Date:** 2025-08-20 21:40 UTC  
**Status:** Implemented  
**Context:** Starting a new project to analyze Strava ride activities and track unique paths ridden by cyclists. This is part of an experiment comparing design-first vs. code-first development approaches.  
**Decision:** Initialize the Strava Vagabond project with a comprehensive technical design phase before any implementation begins.  
**Consequences:** 
- Project will have clear technical foundation before coding starts
- Development will follow iterative approach with high test coverage
- All decisions will be documented for future reference and presentations
- Project structure follows documentation-first approach

**Alternatives Considered:** 
- Jumping straight into coding (rejected - this was the approach in previous experiment)
- Minimal planning (rejected - defeats the purpose of this experiment)
- Over-engineering the design (rejected - we need practical, implementable design)

**Implementation Notes:** 
- Create comprehensive project structure with docs/, src/, tests/ directories
- Establish decision logging system with clear format
- Begin with technical analysis of Strava API capabilities
- Focus on backend-only solution with OpenAPI interface
- Plan for future email functionality

**References:** 
- User's previous experiment with code-first approach (to be referenced later)
- Strava API documentation (to be researched)
- Webhook capabilities (to be investigated)

## Initial Project Prompt

> This is strava-vagabond project. 
> 
> ----
> 
> The goal:
> Create an app which will be able to analyze each of my ride activity on strava. It should analyze what paths I managed to ride and if these paths were ridden in the past. If it's a new path it should count it and later return a calculated % measure - how much % of the whole ride were a new paths, not visited by the user yet. 
> 
> The app will be backend only - it should make the result accessible by openapi + in later phases of project, it will send an email with ride summary after the ride is analysed.
> 
> The app should allow user to connect their strava account. After the connection is done it should fetch all activities and analyze - one by one, to gather data about visited paths in the past.
> 
> After all rides are analyzed we will start getting new data after each ride.
> 
> ----
> 
> The work process: 
> 1. We will start with technical analysis of strava api, webhooks and possibility of implementing such app. Our analysis will result in the `Technical Design Document` (we will use TDD shortcut for that) including a few sections:
> - Problem
> - Requirements
>   - In scope
>   - Out of scope
> - Implementation options
>   - Option 1
>   - Option N
>   - Recommended option
> - Architecture
>   - High Level Architecture
>   - ERD
>   - Sequence diagram
> - Observability
>   - Metrics
>   - Monitoring & alerts
> - Security & Privacy (PII handling)
> - Implementation plan
> - References 
> We will work on the TDD document for a while to have a better understanding of our options and implementation details. 
> 
> 2. Actual implementation based on the implementation plan (and using chosen technology)
> We will work on the limited scope to provide minimum value - for example analysis of a single activity without saving anything to database yet.
> Each development phase should have high test coverage and should take into consideration our monitoring and alerts.
> 
> 3. Iteration on the solution (extending the initial scope of the project little by little).
> 
> ----
>  
> The project is a part of my experiment: 
> - I already tested how it is to vibe code without any preparation phase and design 
> - Now I want to properly research the problem first and use the iterative approach in the app development using AI copilot.
> 
> I would like to later compare both approaches. When we will be at it please ask me for references about the previous project. 
> 
> ----
> REALLY IMPORTANT !!!!
> 
> I want to log each of my decision and thought process in the log file. It's to be decided what format of the file and name we will be using. 
> 
> That file will be my documentation of the process and possible reference for presentations or articles.
> 
> ----
> 
> Now let's start working on the project:
> let's decide on the log file naming and format + let's save this first input I gave you as the starting point for the project.
