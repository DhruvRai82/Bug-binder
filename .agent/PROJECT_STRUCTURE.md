# 📂 Project Structure Guide

## Root Directory Layout

```
bug-binder/
├── .agent/                # 🤖 AI Agent instructions (YOU ARE HERE)
├── backend/               # 🚀 Node.js Express server
├── src/                   # ⚛️ React frontend
├── electron/              # 🖥️ Electron wrapper (desktop app)
├── public/                # Static assets
├── tests/                 # Playwright test specs
└── package.json           # Root workspace config
```

## Backend Structure (`backend/src/`)

### Organization by Responsibility

```
backend/src/
├── index.ts                 # Server entry point
├── middleware/              # Request interceptors
│   └── auth.ts             # Firebase token verification
├── routes/                  # HTTP endpoint definitions (29 files)
│   ├── persistence/        # Data CRUD (projects, scripts, suites)
│   ├── execution/          # Test running (runner, scheduler)
│   ├── ai/                 # AI features (generation, analytics)
│   ├── integration/        # External services (Git, webhooks, auth)
│   └── admin/              # Admin tools (users, tasks, DB management)
├── services/                # Business logic (21 files)
│   ├── persistence/        # Data layer (UnifiedProjectService, etc.)
│   ├── execution/          # Automation (TestRunner, Recorder, Scheduler)
│   ├── ai/                 # GenAI features
│   ├── analysis/           # Reports, visual testing
│   └── integration/        # Git, Proxy
├── models/                  # Data schemas & validation
│   └── Project.ts          # ⚠️ UNUSED - Use UnifiedProjectService instead
├── controllers/             # (Legacy, mostly migrated to routes)
├── lib/                     # Utilities (logger, helpers)
└── data/                    # Local JSON storage
    ├── projects.json
    └── projects/{id}/data.json
```

## Frontend Structure (`src/`)

```
src/
├── main.tsx                 # App entry point
├── App.tsx                  # Root component + routing
├── components/              # Reusable UI components
│   ├── ui/                 # ShadCN primitives (Button, Dialog, etc.)
│   ├── dashboard/          # Dashboard widgets
│   ├── ide/                # Code editor components
│   └── recorder/           # Test recorder UI
├── pages/                   # Route-level components
│   ├── Dashboard.tsx
│   ├── Bugs.tsx
│   ├── TestCases.tsx
│   ├── Execution.tsx
│   ├── IDE.tsx
│   └── Settings.tsx
├── lib/                     # Utilities
│   ├── api.ts              # HTTP client (axios)
│   └── utils.ts            # Helper functions
├── contexts/                # React Context providers
│   └── AuthContext.tsx     # Firebase auth state
└── styles/
    └── globals.css          # Tailwind + theme
```

## Service Layer Deep Dive

### Persistence Services (Data Layer)

| File | Purpose | Uses |
|------|---------|------|
| `UnifiedProjectService.ts` | **Dual-write coordinator** | LocalProjectService + ProjectService |
| `LocalProjectService.ts` | Local JSON operations | File system with locking |
| `ProjectService.ts` | Firestore operations | Firebase Admin SDK |
| `TestDataService.ts` | Test data management | UnifiedProjectService |
| `SuiteService.ts` | Test suite organization | UnifiedProjectService |
| `TestRunService.ts` | Test execution history | UnifiedProjectService |
| `APILabService.ts` | API testing tools | UnifiedProjectService |
| `FileSystemService.ts` | File tree management | UnifiedProjectService |
| `SettingsService.ts` | App settings | Local JSON |
| `UserService.ts` | User profiles | Firestore |

### Execution Services (Automation)

| File | Purpose | Tech |
|------|---------|------|
| `TestRunnerService.ts` | Executes Playwright tests | `child_process.spawn` |
| `RecorderService.ts` | Records browser actions | Playwright API |
| `BatchRunnerService.ts` | Parallel test execution | TestRunnerService |
| `SchedulerService.ts` | Cron job manager | `node-cron` |
| `CodeExecutorService.ts` | Runs arbitrary code | VM sandbox |
| `PerformanceService.ts` | Performance metrics | Playwright |

### AI Services

| File | Purpose | Provider |
|------|---------|----------|
| `GenAIService.ts` | Test generation, analysis | Gemini, OpenAI, Groq |

### Integration Services

| File | Purpose | Tech |
|------|---------|------|
| `GitService.ts` | Version control | `simple-git` |
| `ProxyService.ts` | HTTP proxy for recording | Custom proxy server |

## Routes-to-Services Mapping

### Persistence Routes → Services

```
/api/projects          → UnifiedProjectService
/api/scripts           → UnifiedProjectService (scripts)
/api/suites            → SuiteService
/api/test-data         → TestDataService
/api/pages             → UnifiedProjectService (pages)
/api/fs                → FileSystemService
/api/settings          → SettingsService
```

### Execution Routes → Services

```
/api/runner            → TestRunnerService
/api/runs              → TestRunService
/api/recorder          → RecorderService
/api/scheduler         → SchedulerService
/api/performance       → PerformanceService
```

### AI Routes → Services

```
/api/ai                → GenAIService
/api/ai/analytics      → GenAIService
```

### Integration Routes → Services

```
/api/auth              → UserService
/api/git               → GitService
/api/webhooks          → (Direct handlers)
```

## Data Flow Example: Creating a Project

```
1. Frontend: src/pages/Dashboard.tsx
   └─> Calls: api.post('/api/projects', { name, description })

2. Backend: backend/src/routes/persistence/projects.ts
   └─> Extracts: userId from req.user.uid (auth middleware)
   └─> Calls: unifiedProjectService.createProject(name, desc, userId)

3. Service: backend/src/services/persistence/UnifiedProjectService.ts
   └─> Calls: remoteService.createProject() → Firestore
   └─> Calls: localProjectService.createProject() → JSON file

4. Storage:
   - Firestore: /projects/{id} document created
   - Local: backend/data/projects.json updated

5. Response: Returns project object to frontend
```

## Where to Add New Features

### New Data Type (e.g., "Test Plans")

1. **Define Interface**: `backend/src/models/TestPlan.ts`
2. **Add to LocalProjectService**: Methods for JSON operations
3. **Add to ProjectService**: Methods for Firestore operations
4. **Extend UnifiedProjectService**: Coordinate the dual-write
5. **Create Route**: `backend/src/routes/persistence/test-plans.ts`
6. **Create Frontend Page**: `src/pages/TestPlans.tsx`

### New Utility/Tool

1. **Create Service**: `backend/src/services/{category}/{Name}Service.ts`
2. **Create Route**: `backend/src/routes/{category}/{filename}.ts`
3. **Wire in index.ts**: `app.use('/api/{path}', route)`

## Files by Modification Frequency

### Frequently Modified (New Features)
- `src/pages/` - New UI pages
- `backend/src/routes/` - New API endpoints
- `backend/src/services/` - New business logic

### Sometimes Modified (Enhancements)
- `backend/src/services/persistence/UnifiedProjectService.ts` - New data types
- `src/components/` - New UI components

### Rarely Modified (Core Infrastructure)
- `backend/src/middleware/auth.ts` - Auth logic
- `backend/src/services/persistence/LocalProjectService.ts` - Storage engine
- `backend/src/index.ts` - Server setup

### Never Modify (Unless You Know Exactly What You're Doing)
- `backend/src/models/Project.ts` - Dead code, slated for deletion
- `backend/data/` - Direct file manipulation (use services instead)

## Import Path Conventions

```typescript
// ✅ CORRECT: Import from service layer
import { unifiedProjectService } from '../../services/persistence/UnifiedProjectService';

// ❌ WRONG: Direct model import
import { projectModel } from '../../models/Project';

// ✅ CORRECT: Use singleton exports
import { genAIService } from '../../services/ai/GenAIService';

// ✅ CORRECT: Route imports
import { Router } from 'express';
```

## Testing Files Location

```
tests/
└── specs/
    ├── login.spec.ts
    └── data-driven/
        └── FoodChowDataDriven.spec.ts
```

---

**Next**: Read `CODE_STANDARDS.md` to learn coding conventions.
