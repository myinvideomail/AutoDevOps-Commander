import { PlannerAgent } from './agents/planner';
import { BuilderAgent } from './agents/builder';
import { QAAgent } from './agents/qa';
import { SecurityAgent } from './agents/security';
import { ComplianceAgent } from './agents/compliance';
import { DeployAgent } from './agents/deploy';
import { CTOAgent } from './agents/cto';
import { GitLabAPI } from './gitlab';

export async function handleGitLabWebhook(payload: any) {
  const issueId = payload.object_attributes.iid;
  const projectId = payload.project.id;
  const issueDescription = payload.object_attributes.description;
  const issueTitle = payload.object_attributes.title;

  const gitlab = new GitLabAPI(projectId);
  
  console.log(`[Orchestrator] Starting ADC workflow for Issue #${issueId}`);

  try {
    // 1. Planner Agent
    console.log(`[Orchestrator] Triggering Planner Agent...`);
    const plan = await PlannerAgent.execute(issueTitle, issueDescription);
    await gitlab.addIssueComment(issueId, `**Planner Agent:**\nCreated execution plan:\n\`\`\`json\n${JSON.stringify(plan, null, 2)}\n\`\`\``);

    // 2. Builder Agent
    console.log(`[Orchestrator] Triggering Builder Agent...`);
    const buildResult = await BuilderAgent.execute(plan, issueId, gitlab);
    await gitlab.addIssueComment(issueId, `**Builder Agent:**\nCreated branch \`${buildResult.branchName}\` and MR !${buildResult.mrId}.`);

    // 3. QA Agent
    console.log(`[Orchestrator] Triggering QA Agent...`);
    const qaResult = await QAAgent.execute(buildResult.branchName, buildResult.mrId, gitlab);
    await gitlab.addMRComment(buildResult.mrId, `**QA Agent:**\nTest generation complete. Coverage: ${qaResult.coverage}%\nStatus: ${qaResult.status}`);

    // 4. Security Agent
    console.log(`[Orchestrator] Triggering Security Agent...`);
    const secResult = await SecurityAgent.execute(buildResult.branchName, buildResult.mrId, gitlab);
    await gitlab.addMRComment(buildResult.mrId, `**Security Agent:**\nScanned and patched vulnerabilities.\nRisk Level: ${secResult.riskLevel}\nPatches Applied: ${secResult.patchesApplied}`);

    // 5. Compliance Agent
    console.log(`[Orchestrator] Triggering Compliance Agent...`);
    const compResult = await ComplianceAgent.execute(buildResult.mrId, gitlab);
    await gitlab.addMRComment(buildResult.mrId, `**Compliance Agent:**\nReport generated.\nStatus: ${compResult.status}\n[View Report](${compResult.reportUrl})`);

    // 6. Deploy Agent
    console.log(`[Orchestrator] Triggering Deploy Agent...`);
    const deployResult = await DeployAgent.execute(buildResult.mrId, gitlab);
    await gitlab.addMRComment(buildResult.mrId, `**Deploy Agent:**\nMerge Request merged. Deployment pipeline triggered.\nStatus: ${deployResult.status}`);

    // 7. CTO Agent
    console.log(`[Orchestrator] Triggering CTO Agent...`);
    const summary = await CTOAgent.execute({
      plan, buildResult, qaResult, secResult, compResult, deployResult
    });
    await gitlab.addIssueComment(issueId, `**CTO Agent Summary:**\n${summary}`);

    console.log(`[Orchestrator] ADC workflow complete for Issue #${issueId}`);

  } catch (error) {
    console.error(`[Orchestrator] Error in workflow:`, error);
    await gitlab.addIssueComment(issueId, `**System Error:** ADC workflow failed.\n\`\`\`\n${error}\n\`\`\``);
  }
}
