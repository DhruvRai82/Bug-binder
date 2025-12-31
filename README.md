<h1 align="center">🐞 Bug Binder - QA Automation Platform</h1>

<p align="center">
  A comprehensive, modern QA platform for <b>Test Case Management</b>, <b>Bug Tracking</b>, <b>Visual Regression Testing</b>, and <b>API Testing</b>.<br/>
  Built with <b>React, TypeScript, Node.js, Express, Supabase, and Playwright</b>.
</p>

---

## 🚀 Features

### 1. Test Management
- 📝 **Test Cases**: Create, organize, and track manual test cases with steps, expected results, and priority.
- 🐞 **Bug Tracking**: Log defects with severity, status workflow, and direct integration with test cases.
- 📊 **Dashboard**: Real-time insights into test execution status and bug trends.

### 2. Automation Suite
- 🎥 **Web Recorder**: Record browser interactions and export them as **Selenium IDE (.side)**, **Java**, or **Python** scripts.
- 📸 **Visual Regression Testing**: 
    - Compare screenshots against baselines.
    - Highlight differences pixel-by-pixel.
    - Approve/Reject changes directly from the UI.
- 🧪 **API Lab**: A built-in Postman-like module for testing REST APIs.
    - Create collections and save requests.
    - Bypass CORS issues with a built-in proxy.
    - View headers, body, and status codes.
- 🕒 **Scheduler**: Schedule cron jobs to run your test scripts automatically.

### 3. Architecture
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui (Vite).
- **Backend**: Node.js, Express.
- **Database**: Supabase (PostgreSQL).
- **Engine**: Playwright (Visual Tests), Node-Cron (Scheduler).
- **Deployment**: Docker-ready (supports hybrid deployment with Render/Netlify).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: Supabase (PostgreSQL).
- **Testing**: Playwright (Visual Comparisons), Jest (Unit Tests).
- **Tools**: Simple-Git (Version Control), Multer (File Uploads), Socket.io (Real-time updates).

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase Account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPO_URL>
   cd bug-binder
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with your credentials (see .env.example)
   npm run dev
   ```

### Environment Variables
**Frontend (`.env`)**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_BASE_URL=http://localhost:8080 (or production URL)
```

**Backend (`backend/.env`)**
```
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_ai_key (Optional)
```

---

## � API Documentation
The backend exposes a full REST API for integrating with CI/CD pipelines.
See the full API documentation in [api_documentation.md](./data/api_documentation.md) (or generated artifact).

**Quick Endpoints:**
- `GET /api/projects`: List projects
- `GET /api/visual`: List visual tests
- `GET /api/schedules`: List active schedules

---

## � Docker Support
The project is fully Dockerized.
```bash
docker-compose up --build
```

---

## 📄 License
MIT License.
