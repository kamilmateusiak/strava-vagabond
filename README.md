# Strava Vagabond 🚴

A backend application that analyzes Strava ride activities to track unique paths and calculate the percentage of new routes discovered on each ride.

## 🎯 Project Status

- **Technical Design Document**: ✅ 100% Complete (11/11 sections)
- **Project Setup**: 🚧 In Progress (STR-5: Project Setup & Repository)
- **Implementation**: 📋 Planned (74 tasks in Linear)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 22.19.0 LTS (use `.nvmrc` for automatic version switching)
- **npm**: 10.9.3 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd strava-vagabond
   ```

2. **Switch to correct Node.js version**
   ```bash
   nvm use
   ```

3. **Install dependencies** (when implementing features)
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
strava-vagabond/
├── src/                    # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── index.js           # Application entry point
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── docs/                  # Documentation
│   ├── decisions/         # Architecture decisions
│   ├── findings/          # Research findings
│   ├── technical-design/  # Technical design document
│   ├── api/               # API documentation
│   └── deployment/        # Deployment guides
├── .nvmrc                 # Node.js version specification
├── package.json           # Project configuration
└── env.example            # Environment variables template
```

## 🛠️ Development Approach

### Dependency-Driven Development
- **Minimal setup**: Start with essential project structure
- **Incremental dependencies**: Add packages only when implementing features
- **Clean architecture**: Build features progressively

### Task Management
- **Linear integration**: All development tasks tracked in Linear
- **Branch naming**: `str-{task-number}-{kebab-case-title}`
- **GitHub integration**: Automatic linking between code and tasks

## 📋 Current Focus

**STR-5: Project Setup & Repository** - Setting up the foundational project structure and development environment.

## 🔗 Links

- **Linear**: Project task management
- **Technical Design**: Complete system architecture and implementation plan
- **Decision Logs**: Architecture decisions and rationale
- **Findings**: Research insights and lessons learned

## 📄 License

MIT License - see LICENSE file for details.
