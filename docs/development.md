# Development Guide

## 🚨 MANDATORY: Critical Pattern for Every Task

**AI agents MUST follow this exact sequence for every implementation task. NO EXCEPTIONS.**

### **The 4-Step Pattern (Cannot Be Skipped or Reordered)**

#### **Step 1: 📋 CHECK Technical Design Requirements**
**I MUST explicitly state:**
- "I will check technical design documents for [specific requirement]"
- "I will identify the relevant sections and constraints"
- "I will understand the architectural decisions before proceeding"

#### **Step 2: 🏗️ IMPLEMENT Code Based on Design**
**I MUST explicitly state:**
- "I will implement [specific feature] based on design requirements"
- "I will follow established architectural patterns"
- "I will respect previous technical decisions"

#### **Step 3: 📦 INSTALL Dependencies Used in Code**
**I MUST explicitly state:**
- "I will install only the packages this implementation needs"
- "I will include TypeScript types and development dependencies"
- "I will follow dependency-driven development approach"

#### **Step 4: ✅ VERIFY Implementation Compliance**
**I MUST explicitly state:**
- "I will verify TypeScript compilation"
- "I will verify code follows design specifications"
- "I will ensure architectural consistency"

## ⚠️ ENFORCEMENT RULES

### **NO EXCEPTIONS**
- **Pattern cannot be skipped** for any task
- **Steps cannot be reordered** or combined
- **Each step must be explicitly acknowledged** before proceeding
- **Verification is mandatory** - no implementation is complete without it

### **FAILURE TO COMPLY**
- **Task will be rejected** if pattern is not followed
- **Code will not be accepted** without proper verification
- **Architectural consistency** will be enforced at all costs

## Why This Pattern is Critical

- **Design-First**: Forces understanding before coding
- **Architectural Consistency**: 11 sections of technical design represent months of analysis
- **Decision Respect**: Every technical choice was made after careful consideration
- **Quality Assurance**: Verification loop ensures implementation matches requirements

## Implementation Guidelines

### **For AI Assistants**
- **Always start tasks** with explicit pattern acknowledgment
- **Reference technical design sections** specifically
- **Include verification steps** in all task instructions
- **No shortcuts** - follow the complete pattern every time

### **For Human Developers**
- **Reference this guide** before starting any development task
- **Verify AI compliance** with the pattern
- **Maintain technical design** documents as the source of truth
- **Enforce pattern adherence** in all AI interactions

## Common Pitfalls to Avoid

- **Skipping Design Review**: Don't implement without checking technical design
- **Premature Dependencies**: Don't install packages before implementing features
- **Incomplete Verification**: Don't skip TypeScript compilation checks
- **Pattern Violation**: Don't deviate from the established sequence

## Success Metrics

- **100% adherence** to the 4-step pattern
- **Zero deviations** from technical design requirements
- **Complete verification** of all implementations
- **Architectural consistency** across all components

## Related Documents

- [Technical Design Document](technical-design/README.md) - Complete system architecture
- [Decision Logs](decisions/README.md) - Technical decisions and rationale
- [Findings](findings/README.md) - Lessons learned and patterns
- [Implementation Plan](technical-design/10-implementation-plan.md) - Development roadmap
