# 🛠️ Module Template - Adding New Features

## Checklist for Adding a New Module

Use this checklist every time you add a new feature or module to Bug Binder.

---

## Phase 1: Planning & Design

- [ ] **Define Purpose**: Write a one-sentence description of what this module does
- [ ] **Identify Data Model**: What new data structures are needed?
- [ ] **Check Dependencies**: Does this depend on existing services?
- [ ] **Security Scope**: Will this be scoped by `user_id` and/or `project_id`?

**Example**:
> **Purpose**: Allow users to create reusable test data sets (CSV/JSON) for data-driven testing  
> **Data Model**: `TestDataSet { id, name, format, data[], projectId, userId }`  
> **Dependencies**: UnifiedProjectService for persistence  
> **Security**: Scoped by both `user_id` and `project_id`

---

## Phase 2: Backend Implementation

### Step 1: Create Interface/Model

**File**: `backend/src/models/{ModuleName}.ts`

```typescript
\/**
 * Module: TestDataSet
 * Purpose: Represents a reusable data set for data-driven testing
 */

export interface TestDataSet {
  id: string;
  name: string;
  format: 'csv' | 'json';
  data: Record<string, any>[];
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] Interface created
- [ ] All required fields documented
- [ ] File header comment added

### Step 2: Create Service

**File**: `backend/src/services/{category}/{ModuleName}Service.ts`

```typescript
\/**
 * Module: TestDataService
 * Purpose: Manages test data sets for data-driven testing
 * Responsibilities:
 *   - CRUD operations for test data sets
 *   - CSV/JSON parsing and validation
 *   - Persistence via UnifiedProjectService
 * 
 * Dependencies: UnifiedProjectService
 * Used By: /api/test-data routes
 */

import { unifiedProjectService } from '../persistence/UnifiedProjectService';
import { TestDataSet } from '../../models/TestDataSet';

export class TestDataService {
  \/**
   * What: Creates a new test data set
   * Why: Users need to store reusable test data
   * How: Validates format, generates ID, persists via UnifiedProjectService
   * 
   * @param name - Data set name
   * @param format - Data format (csv or json)
   * @param data - Actual data rows
   * @param projectId - Parent project ID
   * @param userId - Owner's user ID
   * @returns Promise resolving to created TestDataSet
   */
  async create(
    name: string,
    format: 'csv' | 'json',
    data: Record<string, any>[],
    projectId: string,
    userId: string
  ): Promise<TestDataSet> {
    // Validate input
    if (!name) throw new Error('Name is required');
    if (!data || data.length === 0) throw new Error('Data is required');
    
    // Create data set object
    const dataSet: TestDataSet = {
      id: this.generateId(),
      name,
      format,
      data,
      projectId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Persist via UnifiedProjectService
    await unifiedProjectService.createTestData(projectId, dataSet, userId);
    
    return dataSet;
  }

  \/**
   * What: Retrieves all test data sets for a project
   * Why: Users need to view available data sets
   * How: Queries UnifiedProjectService with project and user filters
   */
  async getAll(projectId: string, userId: string): Promise<TestDataSet[]> {
    return await unifiedProjectService.getTestData(projectId, userId);
  }

  // ... more CRUD methods

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

// Export singleton
export const testDataService = new TestDataService();
```

- [ ] Service class created
- [ ] All methods have JSDoc comments (What/Why/How)
- [ ] Uses UnifiedProjectService for persistence (NO direct file access)
- [ ] All methods accept `userId` parameter
- [ ] Singleton exported at bottom

### Step 3: Update UnifiedProjectService (if needed)

**File**: `backend/src/services/persistence/UnifiedProjectService.ts`

If the new module requires new persistence methods:

```typescript
\/**
 * What: Creates a test data set in both local and cloud storage
 * Why: Part of dual-write pattern for reliability
 */
async createTestData(
  projectId: string,
  dataSet: TestDataSet,
  userId: string
): Promise<void> {
  // Write to cloud first
  await remoteService.createTestData(projectId, dataSet);
  
  // Backup to local
  await localProjectService.createTestData(projectId, dataSet, userId);
}
```

- [ ] Method added to UnifiedProjectService
- [ ] Dual-write pattern implemented (cloud first, then local)
- [ ] Method documented with JSDoc

### Step 4: Create API Route

**File**: `backend/src/routes/{category}/{module-name}.ts`

```typescript
\/**
 * Module: Test Data Routes
 * Purpose: HTTP endpoints for test data management
 * Base Path: /api/test-data
 */

import { Router } from 'express';
import { testDataService } from '../../services/persistence/TestDataService';

const router = Router();

\/**
 * What: Creates a new test data set
 * Auth: Required
 * Body: { name, format, data, projectId }
 * Returns: 201 + created data set | 400/500 + error
 */
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, format, data, projectId } = req.body;

    const dataSet = await testDataService.create(name, format, data, projectId, userId);
    res.status(201).json(dataSet);
  } catch (error) {
    console.error('Error creating test data:', error);
    const message = error instanceof Error ? error.message : 'Failed to create test data';
    res.status(500).json({ error: message });
  }
});

\/**
 * What: Gets all test data sets for a project
 * Auth: Required
 * Query: projectId
 * Returns: 200 + array of data sets | 400/500 + error
 */
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const dataSets = await testDataService.getAll(projectId as string, userId);
    res.json(dataSets);
  } catch (error) {
    console.error('Error fetching test data:', error);
    res.status(500).json({ error: 'Failed to fetch test data' });
  }
});

// ... more routes (PUT, DELETE, etc.)

export { router as testDataRoutes };
```

- [ ] Router created
- [ ] All routes have JSDoc comments
- [ ] Auth checks implemented (userId extraction)
- [ ] Input validation added
- [ ] Error handling with try-catch
- [ ] Proper HTTP status codes used

### Step 5: Register Route in Server

**File**: `backend/src/index.ts`

```typescript
import { testDataRoutes } from './routes/persistence/test-data';

// ... other imports

// Register route (AFTER auth middleware)
app.use('/api/test-data', testDataRoutes);
```

- [ ] Route imported
- [ ] Route registered with `app.use()`
- [ ] Registered AFTER auth middleware line

---

## Phase 3: Frontend Implementation

### Step 1: Create API Client Methods

**File**: `src/lib/api.ts`

```typescript
export const testDataAPI = {
  create: (data: { name: string; format: string; data: any[]; projectId: string }) =>
    api.post('/test-data', data),
  
  getAll: (projectId: string) =>
    api.get(`/test-data?projectId=${projectId}`),
  
  update: (id: string, data: Partial<TestDataSet>) =>
    api.put(`/test-data/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/test-data/${id}`)
};
```

- [ ] API methods created
- [ ] Methods use existing `api` instance (has auth headers)

### Step 2: Create React Components

**File**: `src/components/{module}/TestDataManager.tsx`

```typescript
import { useState, useEffect } from 'react';
import { testDataAPI } from '@/lib/api';

export function TestDataManager({ projectId }: { projectId: string }) {
  const [dataSets, setDataSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const response = await testDataAPI.getAll(projectId);
      setDataSets(response.data);
    } catch (error) {
      console.error('Failed to load test data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ... rest of component

  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

- [ ] Component created
- [ ] Loading states handled
- [ ] Error handling implemented
- [ ] Uses ShadCN UI components for consistency

### Step 3: Create Page (Optional)

**File**: `src/pages/TestData.tsx`

```typescript
export function TestDataPage() {
  const { currentProjectId } = useProject(); // Custom hook

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Data Sets</h1>
      <TestDataManager projectId={currentProjectId} />
    </div>
  );
}
```

- [ ] Page component created
- [ ] Route added to `App.tsx` router

---

## Phase 4: Testing

### Unit Tests

**File**: `backend/src/services/TestDataService.test.ts`

```typescript
describe('TestDataService', () => {
  it('should create test data set', async () => {
    const result = await testDataService.create(
      'Login Data',
      'json',
      [{ username: 'test', password: 'pass' }],
      'proj123',
      'user123'
    );
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Login Data');
  });
});
```

- [ ] Unit tests created
- [ ] Tests cover happy path
- [ ] Tests cover error cases

### Integration Tests

- [ ] Test API endpoints with Postman/curl
- [ ] Verify data appears in Firestore console
- [ ] Verify data appears in local JSON files
- [ ] Test frontend integration end-to-end

---

## Phase 5: Documentation

### Update Chat Directory

**File**: `src/Chat/CURRENT_STATE.md`

Add new module to the "Completed Modules" section.

- [ ] Module documented in CURRENT_STATE.md

### Add Code Comments

- [ ] All functions have JSDoc comments
- [ ] Complex logic has inline comments explaining WHY
- [ ] File headers explain module purpose

---

## Common Pitfalls to Avoid

- ❌ **Bypassing UnifiedProjectService**: Always use it for persistence
- ❌ **Missing userId scope**: All queries must filter by userId
- ❌ **Using `any` type**: Define proper interfaces
- ❌ **No error handling**: Always wrap async code in try-catch
- ❌ **Hardcoded values**: Use environment variables or constants
- ❌ **No comments**: Every function needs a JSDoc comment

---

## Example Complete Module

See `backend/src/services/persistence/TestDataService.ts` as a reference implementation that follows all these patterns.

---

**Congratulations!** You've successfully added a new module following Bug Binder's architecture standards.
