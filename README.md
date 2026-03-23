# AutoDevOps Commander (ADC) 🚀

AutoDevOps Commander is a production-ready, event-driven multi-agent system designed to run on GitLab. It autonomously converts a GitLab issue into planned tasks, generated code, test coverage, security validation, compliance reports, and deployment—without human intervention.

## 🧠 Architecture

ADC uses a **Multi-Agent Architecture** orchestrated by a Node.js backend. It listens to GitLab webhooks and triggers a sequential pipeline of specialized AI agents.

1. **Planner Agent:** Analyzes the issue and outputs a structured JSON task plan.
2. **Builder Agent:** Generates code, creates a branch, and opens a Merge Request.
3. **QA Agent:** Writes unit/integration tests and comments coverage on the MR.
4. **Security Agent:** Runs SAST/DAST scans (via Python modules) and auto-patches vulnerabilities.
5. **Compliance Agent:** Generates a Markdown compliance report (GDPR, AI safety).
6. **Deploy Agent:** Merges the MR and triggers the CI/CD deployment pipeline.
7. **CTO Agent:** Summarizes the workflow, calculates time saved, and assesses risk.

## 📂 Folder Structure

```text
/
├── server.ts                 # Express server & Webhook receiver
├── src/
│   ├── orchestrator.ts       # State machine coordinating agents
│   ├── gitlab.ts             # GitLab API wrapper
│   └── agents/               # AI Agent definitions
│       ├── planner.ts
│       ├── builder.ts
│       ├── qa.ts
│       ├── security.ts
│       ├── compliance.ts
│       ├── deploy.ts
│       └── cto.ts
├── python/
│   └── security_scanner.py   # Python module for security analysis
├── .gitlab-ci.yml            # GitLab CI/CD Pipeline
├── Dockerfile                # Containerization
├── agent-definitions.json    # Structured agent metadata
└── README.md                 # Documentation
```

## ⚙️ Setup Instructions

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GITLAB_TOKEN=your_gitlab_personal_access_token
   GITLAB_API_URL=https://gitlab.com/api/v4
   PORT=3000
   ```
4. **Run the Orchestrator:**
   ```bash
   npm run dev
   ```
5. **Configure GitLab Webhook:**
   - Go to your GitLab Project -> Settings -> Webhooks.
   - URL: `https://your-domain.com/webhook/gitlab`
   - Trigger: Select "Issues events".

## 🎬 Demo Script (3 Minutes)

**[0:00 - 0:30] Introduction**
"Welcome to AutoDevOps Commander. Today we're showing how a single GitLab issue can trigger an entire autonomous software development lifecycle using a multi-agent system."

**[0:30 - 1:00] Triggering the System**
"I'm creating a new GitLab issue titled 'Implement User Authentication API'. As soon as I hit submit, a webhook fires to our Node.js orchestrator."

**[1:00 - 1:45] Agent Execution**
"Behind the scenes:
1. The **Planner Agent** breaks this down into JWT setup, login routes, and DB models.
2. The **Builder Agent** writes the code, creates a branch, and opens a Merge Request.
3. The **QA Agent** generates Jest tests and posts the coverage to the MR.
4. The **Security Agent** runs our Python SAST scanner, finds a hardcoded secret risk, and pushes a patch automatically."

**[1:45 - 2:30] Compliance & Deployment**
"Next, the **Compliance Agent** attaches a GDPR data usage report to the MR. Since all checks pass, the **Deploy Agent** merges the MR, triggering our `.gitlab-ci.yml` pipeline to deploy to production."

**[2:30 - 3:00] The CTO Summary**
"Finally, the **CTO Agent** posts a summary on the original issue: 'Feature deployed. Risk: Low. Estimated time saved: 14 hours.' ADC just completed a full sprint task in 3 minutes."
