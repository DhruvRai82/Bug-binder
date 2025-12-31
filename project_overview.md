# Bug Binder - Project Architecture & Deep Dive

## 1. Executive Summary
**Bug Binder** is a comprehensive **Test Management & Automation System** designed to bridge the gap between Manual Testing, AI Generation, and Automated Execution.

It is built as a **Hybrid Web Application** where the Frontend (React) provides a premium UI, and the Backend (Node.js) handles heavy lifting like Browser Automation (Playwright), AI Processing (Gemini), and File System operations (Git Sync).

### Core Philosophy
-   **Local-First / Portability:** Uses a JSON file (`data.json`) as a database, backed by Git. This makes the project easy to move, backup, and version control without needing a complex SQL setup.
-   **AI-Augmented:** Heavily relies on Google Gemini to generate test cases from raw requirements and summarize bug reports.
-   **Automation-Ready:** Integrates Playwright directly, allowing users to "Record" actions in the browser and save them as executable scripts.

---

## 2. Technology Stack

### Frontend (The UI)
*   **Framework:** **React 18** (via Vite) - Fast, component-based UI.
*   **Language:** **TypeScript** - Ensures type safety and cleaner code.
*   **Styling:** **Tailwind CSS** + **Shadcn UI** - Provides the "Premium," modern aesthetic (glassmorphism, gradients, smooth animations).
*   **State Management:**
    *   `ProjectContext`: Global state for the currently selected project.
    *   `React Query`: Efficient data fetching and caching.
*   **Routing:** `react-router-dom` - Handles navigation between pages.

### Backend (The Engine)
*   **Runtime:** **Node.js** with **Express** - Handles API requests.
*   **Language:** **TypeScript** - Mirrors the frontend for consistency.
*   **Automation:** **Playwright** - Launches headless Chrome browsers to record user actions or execute scripts.
*   **AI:** **Google Generative AI SDK** - Communicates with Gemini models.
*   **Storage:** `fs` (File System) - Reads/Writes directly to `data/data.json`.
*   **Real-time:** `Socket.io` - Streams live logs from the backend to the frontend (e.g., during script execution).

---

## 3. High-Level Architecture & Data Flow

```mermaid
graph TD
    User[User] -->|Interacts| UI[Frontend (React)]
    UI -->|HTTP Requests| API[Backend API (Express)]
    UI -->|WebSockets| Socket[Socket.io Stream]
    
    API -->|Reads/Writes| DB[(data.json)]
    API -->|Executes| PW[Playwright (Browser)]
    API -->|Prompts| AI[Google Gemini API]
    API -->|Syncs| Git[Git Service]

    subgraph "Data Layer"
        DB <--> Git
    end
```

1.  **Request:** User clicks "Generate Tests".
2.  **frontend:** Sends prompt + API Key (headers) to Backend.
3.  **backend:**
    *   Checks if Custom Key exists (BYOK).
    *   Calls Gemini API.
    *   Receives JSON response.
4.  **Response:** Sends generated tests back to UI.
5.  **Storage:** User clicks "Save", Frontend sends `POST` to Backend, which writes to `backend/data/data.json`.

---

## 4. Frontend Page Breakdown

### 4.1. Dashboard (`Dashboard.tsx`)
*   **Purpose:** The "Home Base". Shows high-level metrics (Total Bugs, Test Cases, Automation Status).
*   **Key Features:**
    *   Project switching.
    *   Quick stats cards.
    *   Recent activity feed.

### 4.2. Universal Recorder (`Recorder.tsx`)
*   **Purpose:** Allows users to record browser interactions to create automated tests *without coding*.
*   **How it works:**
    *   User enters a URL and clicks "Start Recording".
    *   Backend launches a Playwright browser instance.
    *   User interacts with the browser window.
    *   Backend captures events (clicks, types) and streams code back to the Frontend via `Socket.io`.
*   **Why:** Low-code automation creation.

### 4.3. Test Case Studio (`TestCases.tsx` / `TestCaseSheet.tsx`)
*   **Purpose:** Excel-like interface for managing manual test cases.
*   **Key Features:**
    *   **AI Generation:** Type "Login flow for e-commerce" -> Click "Generate" -> AI populates rows with steps/results.
    *   **Bulk Edit:** Add/Delete rows just like a spreadsheet.
    *   **Export:** Download as CSV/JSON.

### 4.4. Settings (`Settings.tsx`)
*   **Purpose:** Configuration hub.
*   **Key Features:**
    *   **Project Management:** Create/Delete Projects.
    *   **Git Sync:** Push/Pull `data.json` to a remote repo (version control your data).
    *   **AI Brain (Multi-Profile):**
        *   **Multi-List:** Users save multiple API Keys (Work, Personal).
        *   **Activation:** Toggling a profile writes it to `localStorage`.
        *   **BYOK:** "Bring Your Own Key" architecture bypasses server-side rate limits.

### 4.5. Bugs & Reports (`Bugs.tsx`, `ExecutionReports.tsx`)
*   **Purpose:** Tracking defects and automation run results.
*   **Flow:**
    *   User describes a bug.
    *   AI "Summarize" button converts verbose text into a structured Defect Report (Steps, Severity, Priority).

---

## 5. Backend Service Breakdown

### 5.1. `GenAIService.ts`
*   **Role:** The AI Handler.
*   **Key Logic:**
    *   `getModelInstance(config)`: Decides whether to use the Server's Default Key or the User's Custom Key (from request headers).
    *   `generateBulkTestCases()`: Uses sophisticated prompts to force Gemini to output strictly formatted JSON arrays.

### 5.2. `RecorderService.ts`
*   **Role:** The Automation Orchestrator.
*   **Key Logic:**
    *   Spawns `chromium` processes.
    *   Injects JavaScript into the browser to capture user events.
    *   Translates events into Playwright Code (e.g., `await page.click('#submit')`).

### 5.3. `GitService.ts`
*   **Role:** Data Integrity.
*   **Key Logic:**
    *   Wraps `simple-git`.
    *   Commits changes to `data.json` automatically or manually along with a timestamp.

---

## 6. Why Switch Languages? (Migration Context)
You mentioned wanting to "switch language". Here is the feasibility analysis:

*   **Frontend (React -> Vue/Angular/Blazor):**
    *   **Medium Effort.** You can keep the design (Tailwind) and logic (API calls), but need to rewrite the component syntax.
*   **Backend (Node.js -> Python/Java/Go):**
    *   **High Effort.** You would need to rewrite:
        *   **Playwright Integration:** Playwright exists for Python/Java, but the *custom recording logic* here is specific to Node.js streams.
        *   **Socket.io:** Need equivalent WebSocket handling.
        *   **AI Service:** Gemini has SDKs for all major languages, so this part is easy.

## 7. Cloning & Setup Guide (For Future Ref)

1.  **Copy Source:** Clone this repo.
2.  **Install Deps:** `npm install` (root) & `cd backend && npm install`.
3.  **Environment:**
    *   Frontend: `VITE_API_BASE_URL` (optional, for cloud deploy).
    *   Backend: `GEMINI_API_KEY` (fallback key), `HEADLESS=true/false`.
4.  **Run:** `npm run dev` (Runs both concurrently).
5.  **Docker:** `docker-compose up --build` (Production-ready containerization).

---

## 8. Database Model (The JSON Schema)
Since we use a **NoSQL-style JSON file** (`data.json`) instead of SQL, the "Database" is simply a nested JSON object.

### Core Entities
The data is structured hierarchically: `Project` -> `DailyData` -> `TestCases` / `Bugs`.

#### 1. Project Entity
*   **Table/Collection:** `projects`
*   **Fields:**
    *   `id` (UUID): Unique Identifier.
    *   `name` (String): Project Name.
    *   `description` (String): Optional context.
    *   `createdAt` / `updatedAt` (ISO Date).

#### 2. TestCase Entity
*   **Table/Collection:** `testCases` (nested inside daily entries)
*   **Fields:**
    *   `testCaseId` (String): Human readable ID (e.g., `TC_LOGIN_01`).
    *   `module` (String): Functional area (e.g., "Auth", "Checkout").
    *   `testScenario` (String): One-line summary.
    *   `testSteps` (String): Newline-separated steps.
    *   `status` (Enum): `Pass` | `Fail` | `Blocked` | `Not Executed`.

#### 3. Bug Entity
*   **Table/Collection:** `bugs`
*   **Fields:**
    *   `bugId` (String): (e.g., `BUG_001`).
    *   `severity` (Enum): `Critical` | `High` | `Medium` | `Low`.
    *   `priority` (Enum): `P1` | `P2` | `P3` | `P4`.
    *   `linkedTestCaseId` (String): Foreign Key reference to the Test Case that found this bug.

---

## 9. How Pages Are Created (UI Architecture)
The user interface is NOT built with standard HTML/CSS. It uses a modern **Component-Driven Architecture**.

### The "LEGO Block" Strategy
We use **Shadcn UI** (built on top of **Radix UI** primitives) combined with **Tailwind CSS**.

#### 1. Base Components (`src/components/ui`)
These are the atomic building blocks. You don't write CSS for a button; you import the `Button` component.
*   **Card:** Used for grouping content (e.g., in `Dashboard.tsx`, `Settings.tsx`).
*   **Table:** Used for the Test Case Sheet (e.g., in `TestCases.tsx`).
*   **Dialog/Sheet:** Used for popups and forms (e.g., "New Project" modal).
*   **Input/Select:** Standardized form elements.

#### 2. Composition Pattern
To create a new page (like `Settings.tsx`), we:
1.  **Layout:** Use standard HTML `div` with Tailwind classes for layout (e.g., `flex`, `grid`, `p-8`).
2.  **State:** Use React `useState` to hold data (e.g., `const [projects, setProjects]`).
3.  **Effect:** Use `useEffect` to fetch data from the API on load.
4.  **Assemble:** Drop in the UI components:
    ```tsx
    <div className="p-8">
       <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent>
             <Input value={name} />
             <Button onClick={save}>Save</Button>
          </CardContent>
       </Card>
    </div>
    ```

### Why this approach?
*   **Consistency:** Every button and input looks exactly the same across the app.
*   **Speed:** You focus on logic, not pixels.
*   **Accessibility:** Radix UI handles keyboard navigation and screen readers automatically.
