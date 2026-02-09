# 💻 Code Standards & Best Practices

## 🔥 Golden Rules (MANDATORY)

### 1. **Every Function MUST Have Comments**

```typescript
/**
 * What: Creates a new project in the system
 * Why: Users need to organize their test cases by project
 * How: Generates ID, validates data, writes to both Firestore and Local JSON
 * 
 * @param name - Project name (must be non-empty)
 * @param description - Optional project description
 * @param userId - Owner's Firebase UID
 * @returns Promise resolving to created Project object with generated ID
 * @throws Error if name is empty or database write fails
 */
async createProject(name: string, description: string, userId: string): Promise<Project> {
  // Implementation
}
```

### 2. **Every File MUST Have a Header**

```typescript
/**
 * Module: UnifiedProjectService
 * Purpose: Coordinates dual-write pattern for project data persistence
 * Responsibilities:
 *   - Writes data to both Firestore (primary) and Local JSON (backup)
 *   - Provides local-first reads for performance
 *   - Handles sync on login for offline changes
 * 
 * Dependencies: ProjectService (Firestore), LocalProjectService (JSON)
 * Used By: All routes in /api/projects, /api/scripts, etc.
 * 
 * ⚠️ CRITICAL: This is the ONLY way to persist project data. Never bypass this service.
 */

import { projectService as remoteService } from './ProjectService';
// ... rest of file
```

### 3. **Complex Logic MUST Have Inline Comments**

```typescript
// ✅ GOOD: Explains WHY
async getAllProjects(userId: string): Promise<Project[]> {
  // Return local data immediately for instant UI response
  const localProjects = await localProjectService.getAllProjects(userId);
  
  // Trigger background sync to refresh stale data (fire-and-forget)
  this.syncUserProjects(userId).catch(e => console.error('[Unified] Sync Error:', e));
  
  return localProjects;
}

// ❌ BAD: No explanation
async getAllProjects(userId: string): Promise<Project[]> {
  const localProjects = await localProjectService.getAllProjects(userId);
  this.syncUserProjects(userId).catch(e => console.error('[Unified] Sync Error:', e));
  return localProjects;
}
```

## TypeScript Standards

### 1. **No `any` Type**

```typescript
// ❌ BAD
async handleRequest(data: any): Promise<any> {
  return data.value;
}

// ✅ GOOD: Use specific types
interface RequestData {
  value: string;
}

async handleRequest(data: RequestData): Promise<string> {
  return data.value;
}

// ✅ ACCEPTABLE: Use `unknown` with type guards
async handleUnknown(data: unknown): Promise<string> {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data structure');
}
```

### 2. **Proper Error Handling**

```typescript
// ✅ GOOD: Try-catch with typed errors
async createResource(data: ResourceData): Promise<Resource> {
  try {
    const result = await database.insert(data);
    return result;
  } catch (error) {
    // Type guard for proper error handling
    if (error instanceof Error) {
      console.error('Database insertion failed:', error.message);
      throw new Error(`Failed to create resource: ${error.message}`);
    }
    throw error;
  }
}

// ❌ BAD: Silent failures
async createResource(data: ResourceData): Promise<Resource | null> {
  try {
    return await database.insert(data);
  } catch {
    return null; // Error information lost!
  }
}
```

### 3. **Interface-First Development**

```typescript
// ✅ GOOD: Define interfaces first
export interface TestCase {
  id: string;
  title: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface TestStep {
  action: string;
  data?: string;
  selector?: string;
}

// ❌ BAD: Inline types (hard to reuse)
function createTest(data: { title: string; steps: any[] }): void {
  // ...
}
```

## Naming Conventions

### Functions & Variables

```typescript
// ✅ GOOD: camelCase, descriptive
async getUserProjects(userId: string): Promise<Project[]>
const isValidEmail = (email: string): boolean => /.../.test(email);
let currentProjectId: string | null = null;

// ❌ BAD: Unclear abbreviations
async getUsrProj(uid: string): Promise<Project[]>
const valEm = (e: string): boolean => /.../.test(e);
let cpid: string | null = null;
```

### Classes & Interfaces

```typescript
// ✅ GOOD: PascalCase, noun-based
export class ProjectService { }
export interface TestRunResult { }

// ❌ BAD: Lowercase or verb-based
export class projectservice { }
export interface RunningTests { }
```

### Files

```typescript
// ✅ GOOD: Match class/export name
ProjectService.ts       // exports ProjectService class
test-runner.ts          // exports testRunnerService
user-types.ts           // exports User, UserProfile interfaces

// ❌ BAD: Generic names
service.ts
helpers.ts
utils.ts
```

### Constants

```typescript
// ✅ GOOD: SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// ✅ GOOD: camelCase for config objects
const serverConfig = {
  port: 8081,
  host: 'localhost'
};
```

## Code Organization

### File Structure

```typescript
/**
 * Module: MyService
 * Purpose: ...
 */

// 1. Imports (grouped)
import { external } from 'library';
import { internal } from '../local';

// 2. Interfaces & Types
export interface MyData {
  // ...
}

// 3. Constants
const CONSTANT_VALUE = 100;

// 4. Main Class/Function
export class MyService {
  // Class implementation
}

// 5. Helper Functions (private)
function helperFunction() {
  // ...
}

// 6. Export singleton if applicable
export const myService = new MyService();
```

### Function Length

- **Ideal**: 10-30 lines
- **Maximum**: 50 lines
- **If longer**: Extract helper functions

```typescript
// ❌ BAD: 100+ line function
async processData(data: any) {
  // ... 100 lines of logic
}

// ✅ GOOD: Broken into helpers
async processData(data: ProcessedData) {
  const validated = await validateData(data);
  const transformed = transformData(validated);
  const result = await saveData(transformed);
  return result;
}

async validateData(data: ProcessedData): Promise<ValidData> { /* ... */ }
function transformData(data: ValidData): TransformedData { /* ... */ }
async saveData(data: TransformedData): Promise<Result> { /* ... */ }
```

## API Route Standards

### Pattern Template

```typescript
import { Router } from 'express';
import { myService } from '../services/MyService';

const router = Router();

/**
 * What: Creates a new resource
 * Auth: Required (userId from middleware)
 * Body: { name: string, description?: string }
 * Returns: 201 + created resource | 400 + error | 500 + error
 */
router.post('/', async (req, res) => {
  try {
    // 1. Extract and validate auth
    const userId = (req as any).user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Extract and validate input
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // 3. Call service
    const result = await myService.create(name, description, userId);

    // 4. Return response
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating resource:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export { router as myRoutes };
```

## Service Layer Standards

### Always Accept `userId`

```typescript
// ✅ GOOD: Scoped by user for security
async getProjects(userId: string): Promise<Project[]> {
  return await database.find({ user_id: userId });
}

// ❌ BAD: Global query (security risk)
async getProjects(): Promise<Project[]> {
  return await database.find({});
}
```

### Return Typed Results

```typescript
// ✅ GOOD: Specific return type
async createProject(name: string, userId: string): Promise<Project> {
  // ...
}

// ❌ BAD: Generic return
async createProject(name: string, userId: string): Promise<any> {
  // ...
}
```

## Logging Standards

### Use Structured Logs

```typescript
// ✅ GOOD: Contextual information
console.log('[UnifiedService] Creating project', { 
  projectId: newProject.id, 
  userId, 
  timestamp: new Date().toISOString() 
});

// ✅ GOOD: Error logs with stack traces
console.error('[UnifiedService] Sync failed', {
  userId,
  error: error instanceof Error ? error.message : 'Unknown error',
  stack: error instanceof Error ? error.stack : undefined
});

// ❌ BAD: Vague messages
console.log('Project created');
console.error('Failed');
```

### Log Levels

- **Info**: Normal operations (`Creating project...`)
- **Warn**: Recoverable issues (`Firestore sync failed, using local only`)
- **Error**: Critical failures (`Database connection lost`)

## Testing Standards

### Test File Naming

```
MyService.ts         → MyService.test.ts
router/projects.ts   → router/projects.test.ts
```

### Test Structure

```typescript
describe('ProjectService', () => {
  describe('createProject', () => {
    it('should create project with valid data', async () => {
      // Arrange
      const name = 'Test Project';
      const userId = 'user123';
      
      // Act
      const result = await service.createProject(name, '', userId);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(name);
    });

    it('should throw error if name is empty', async () => {
      await expect(service.createProject('', '', 'user123'))
        .rejects
        .toThrow('Name is required');
    });
  });
});
```

## Git Commit Standards

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding tests
- `chore`: Maintenance (dependencies, build tools)

**Examples**:
```
feat(projects): add dual-write pattern for project creation

Implements UnifiedProjectService to write to both Firestore
and Local JSON for reliability.

Closes #123
```

```
fix(auth): correct userId extraction from Firebase token

The middleware was not properly handling expired tokens.
Now throws 401 with clear error message.
```

## Security Best Practices

### 1. **Input Validation**

```typescript
// ✅ GOOD: Validate all inputs
function createUser(email: string, password: string) {
  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    throw new Error('Invalid email');
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  // ... proceed
}
```

### 2. **Never Expose Sensitive Data**

```typescript
// ✅ GOOD: Filter sensitive fields
async getUser(userId: string): Promise<PublicUser> {
  const user = await database.getUser(userId);
  return {
    id: user.id,
    name: user.name,
    email: user.email
    // passwordHash is NOT included
  };
}
```

### 3. **Parameterize Queries**

```typescript
// ✅ GOOD: Firestore SDK handles this
await db.collection('projects').where('user_id', '==', userId).get();

// ❌ BAD: String concatenation (if using SQL)
const query = `SELECT * FROM projects WHERE user_id = '${userId}'`; // SQL injection risk
```

## Performance Best Practices

### 1. **Lazy Load Heavy Operations**

```typescript
// ✅ GOOD: Background sync
const projects = await localService.getAll(); // Fast
this.syncInBackground(); // Fire-and-forget
return projects;
```

### 2. **Cache Expensive Results**

```typescript
// ✅ GOOD: In-memory cache for frequently accessed data
private cache = new Map<string, Project>();

async getProject(id: string): Promise<Project> {
  if (this.cache.has(id)) return this.cache.get(id)!;
  const project = await database.get(id);
  this.cache.set(id, project);
  return project;
}
```

### 3. **Avoid N+1 Queries**

```typescript
// ❌ BAD: Queries in loop
const users = await getUsers();
for (const user of users) {
  user.projects = await getProjects(user.id); // N queries
}

// ✅ GOOD: Batch query
const users = await getUsers();
const allProjects = await getAllProjects(users.map(u => u.id));
users.forEach(user => {
  user.projects = allProjects.filter(p => p.user_id === user.id);
});
```

---

**Next**: Read `MODULE_TEMPLATE.md` for step-by-step feature addition guide.
