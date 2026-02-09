# 🤖 AI Agent Instructions - Bug Binder Project

**⚠️ READ THIS FIRST BEFORE MAKING ANY CHANGES ⚠️**

## Project Type
**Bug Binder** is a Hybrid Electron Desktop Application for Test Management.
- **Frontend**: React + Vite + TailwindCSS + ShadCN UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: Dual-storage (Firestore Cloud + Local JSON Backup)
- **Automation**: Playwright for test execution

## Quick Start

### Running the Application
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Electron
npm run dev
```

## 🔥 CRITICAL RULES (Do Not Violate)

### 1. **ALWAYS Use `UnifiedProjectService`**
- ❌ NEVER import `ProjectModel` or write directly to JSON files
- ✅ ALL data operations MUST go through `UnifiedProjectService`
- **Why**: This ensures data is written to both Firestore (cloud) and Local JSON (backup)

### 2. **Data Scoping**
Every database query MUST filter by:
- `user_id` (for security)
- `project_id` (for data isolation)

### 3. **Comment Everything**
Every function MUST have:
```typescript
/**
 * What: Brief description of what this does
 * Why: Business reason this exists
 * How: Technical approach (if complex)
 * @param name - Parameter description
 * @returns Description of return value
 */
```

### 4. **Never Use `any` Type**
- Use `unknown` and type guards instead
- Or define proper interfaces

## 📚 Required Reading

Before making ANY changes, read these files IN ORDER:

1. **ARCHITECTURE.md** (5 min) - Understand the system design
2. **PROJECT_STRUCTURE.md** (3 min) - Learn where files live
3. **CODE_STANDARDS.md** (10 min) - Follow coding rules
4. **MODULE_TEMPLATE.md** - Use this checklist when adding features

## Common Tasks

### Adding a New Feature
1. Read `MODULE_TEMPLATE.md`
2. Define interface in `backend/src/models/`
3. Create service in `backend/src/services/`
4. Add route in `backend/src/routes/`
5. Update `UnifiedProjectService` if needed
6. Add frontend components in `src/components/`

### Debugging
- Check `backend/logs/` for errors
- Verify `UnifiedProjectService` is being used (not `ProjectModel`)
- Ensure auth middleware is passing `userId`

## Contact/Documentation
- Legacy docs: `src/Chat/archive/` (read-only, outdated)
- Current docs: All `.agent/` files
- Planning: `C:\Users\dhruv\.gemini\antigravity\brain\af408a45-1674-44aa-8eda-0324a9655064\`

---

**Built with ❤️ for QA Engineers**
