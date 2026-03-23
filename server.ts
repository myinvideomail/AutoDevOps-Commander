import express from 'express';
import { handleGitLabWebhook } from './src/orchestrator';

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const WEBHOOK_SECRET = process.env.GITLAB_WEBHOOK_SECRET || 'simulate_token';

// --- Production Queueing System ---
// Prevents server timeouts and handles multiple issues gracefully
const taskQueue: any[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || taskQueue.length === 0) return;
  isProcessing = true;
  
  while (taskQueue.length > 0) {
    const payload = taskQueue.shift();
    try {
      console.log(`\n[Queue] 🚀 Starting workflow for issue: "${payload.object_attributes.title}"`);
      await handleGitLabWebhook(payload);
      console.log(`[Queue] ✅ Finished workflow for issue: "${payload.object_attributes.title}"\n`);
    } catch (error) {
      console.error(`[Queue] ❌ Error in workflow:`, error);
    }
  }
  
  isProcessing = false;
}
// ----------------------------------

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AutoDevOps Commander (ADC)</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-white font-sans min-h-screen flex flex-col items-center justify-center p-4">
        <div class="max-w-3xl w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
            <div class="flex items-center space-x-4 mb-6">
                <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">🤖</div>
                <h1 class="text-3xl font-bold">AutoDevOps Commander</h1>
            </div>
            
            <p class="text-slate-300 mb-6 text-lg">
                The orchestration server is <span class="text-green-400 font-semibold">Online and Listening</span>.
            </p>
            
            <div class="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                <h2 class="text-xl font-semibold mb-2 text-blue-400">Webhook Endpoint</h2>
                <code class="text-green-300 bg-black px-2 py-1 rounded">POST /webhook/gitlab</code>
                <p class="text-sm text-slate-400 mt-2">Configure this URL in your GitLab project webhooks to trigger the AI agents when an issue is opened.</p>
                <div class="mt-4 p-3 bg-slate-800 rounded border border-slate-600">
                    <p class="text-sm font-semibold text-slate-300">Production Security Enabled 🔒</p>
                    <p class="text-xs text-slate-400 mt-1">This server requires a Secret Token. Set <code class="text-pink-400">GITLAB_WEBHOOK_SECRET</code> in your environment variables and paste the same token in GitLab.</p>
                </div>
            </div>

            <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <h2 class="text-xl font-semibold mb-2 text-purple-400">Simulate Webhook (For Testing)</h2>
                <p class="text-sm text-slate-400 mb-4">Click below to simulate a GitLab issue creation and trigger the agent workflow in the console.</p>
                <button onclick="simulateWebhook()" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                    Simulate Issue Creation
                </button>
                <div id="status" class="mt-4 text-sm hidden"></div>
            </div>
        </div>

        <script>
            function simulateWebhook() {
                const statusEl = document.getElementById('status');
                statusEl.classList.remove('hidden');
                statusEl.innerHTML = '<span class="text-yellow-400">Sending simulated webhook... Check server console.</span>';
                
                fetch('/webhook/gitlab', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-gitlab-event': 'Issue Hook',
                        'x-gitlab-token': '${WEBHOOK_SECRET}'
                    },
                    body: JSON.stringify({
                        object_kind: 'issue',
                        project: { id: 1 },
                        object_attributes: {
                            action: 'open',
                            iid: 99,
                            title: 'Simulated Task: Create Login API',
                            description: 'Create a secure login API endpoint using Node.js and Express.'
                        }
                    })
                }).then(async res => {
                    if(res.ok) {
                        statusEl.innerHTML = '<span class="text-green-400">Webhook accepted! Workflow added to queue. Check the terminal logs.</span>';
                    } else {
                        const err = await res.json();
                        statusEl.innerHTML = '<span class="text-red-400">Error: ' + (err.error || 'Failed to trigger webhook') + '</span>';
                    }
                }).catch(err => {
                    statusEl.innerHTML = '<span class="text-red-400">Network error.</span>';
                });
            }
        </script>
    </body>
    </html>
  `);
});

app.post('/webhook/gitlab', async (req, res) => {
  // 1. Security Check: Validate GitLab Token
  const providedToken = req.headers['x-gitlab-token'];
  if (process.env.GITLAB_WEBHOOK_SECRET && providedToken !== process.env.GITLAB_WEBHOOK_SECRET) {
    console.warn('⚠️ Unauthorized webhook attempt blocked.');
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-gitlab-token' });
  }

  const event = req.headers['x-gitlab-event'];
  
  if (event === 'Issue Hook') {
    const payload = req.body;
    // Only trigger on newly opened issues
    if (payload.object_attributes && payload.object_attributes.action === 'open') {
      console.log(`📥 Received new issue webhook: ${payload.object_attributes.title}`);
      
      // 2. Queueing: Add to background queue instead of running directly
      taskQueue.push(payload);
      processQueue().catch(console.error);
    }
  }
  
  // 3. Fast Response: Acknowledge receipt immediately so GitLab doesn't timeout
  res.status(200).json({ status: 'Webhook received and queued for processing' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoDevOps Commander', queueLength: taskQueue.length });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoDevOps Commander running on port ${PORT}`);
  console.log(`🔒 Webhook Security: ${process.env.GITLAB_WEBHOOK_SECRET ? 'ENABLED' : 'DISABLED (Set GITLAB_WEBHOOK_SECRET to enable)'}`);
});
