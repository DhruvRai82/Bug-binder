# <div align="center">⚡ TestFlow Platform</div>

<div align="center">
  <img src="docs/logo.png" alt="TestFlow Logo" width="100" />
  <br/>
  <i>The Next-Gen QA Automation & Performance Analysis Platform</i>
  <br/>
  <b>Web • Mobile • API • Performance</b>
</div>

---

## 📖 Overview

**TestFlow** (formerly BugBinder) is an enterprise-grade QA platform designed to unify manual testing, automated scripts, and performance auditing into a single, cohesive interface. Built with a modern tech stack, it offers a seamless experience across **Desktop** and **Mobile** devices.

### 🌟 Key Features

#### 1. 🚀 Speed Lab (New!)
Analyze web performance instantly using our integrated Lighthouse engine.
*   **Core Web Vitals**: Measure LCP, CLS, and TBT in real-time.
*   **Multi-Device**: audit desktop or mobile viewports.
*   **History**: Track performance trends over time.

#### 2. 📱 Mobile-First Architecture
A fully native-like experience for testing on the go.
*   **Responsive Design**: Dedicated mobile views for all major modules.
*   **Touch Optimized**: Swipeable drawers, large tap targets, and bottom navigation.
*   **On-the-Go Management**: Trigger tests and view results from your phone.

#### 3. 🧪 Automation Studio
*   **Web Recorder**: Record browser actions and generate Playwright scripts.
*   **Visual Regression**: Pixel-perfect screenshot comparison.
*   **Test Orchestrator**: Schedule cron jobs for automated nightly runs.

#### 4. 🔌 API Lab
*   **HTTP Runner**: integrated Postman-lite for testing backend APIs.
*   **Proxied Requests**: Bypass CORS issues automatically.

---

## 📸 Screenshots

| **Desktop Dashboard** | **Speed Lab Analysis** |
|:---:|:---:|
| ![Dashboard](docs/dashboard_desktop.png) | ![Speed Lab](docs/speedlab_desktop.png) |

| **Mobile Speed Lab** | **Mobile Test Hub** |
|:---:|:---:|
| ![Mobile Speed](docs/mobile_speedlab.png) | ![Mobile Hub](docs/mobile_testhub.png) |

---

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI, Vite
*   **Backend**: Node.js, Express, Puppeteer/Lighthouse
*   **Database**: Supabase (PostgreSQL)
*   **Engine**: Playwright, Google Lighthouse

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v18+
*   Supabase Account

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/your-org/test-flow.git
    cd test-flow
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    cd backend && npm install
    ```

3.  **Environment Setup**
    Create `.env` files in root and `backend/` directories (see `.env.example`).

4.  **Run Development Server**
    ```bash
    # Terminal 1 (Frontend)
    npm run dev

    # Terminal 2 (Backend)
    cd backend && npm run dev
    ```

---

## 🔮 Roadmap

*   [ ] **JSON Execution Engine**: Move to a declarative, language-agnostic test format.
*   [ ] **Smart Selectors**: Self-healing tests that resist UI changes.
*   [ ] **Integrations**: Connect directly to Jira and Slack.

---

<div align="center">
  <sub>Built with ❤️ by the TestFlow Team</sub>
</div>
