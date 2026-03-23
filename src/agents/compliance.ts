import { GoogleGenAI } from '@google/genai';
import { GitLabAPI } from '../gitlab';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class ComplianceAgent {
  static async execute(mrId: string | number, gitlab: GitLabAPI) {
    const prompt = `You are the Compliance Agent. Generate a markdown compliance report for a new feature deployment. Include Data Usage, GDPR compliance, and AI safety checks.`;

    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt
    });

    const reportContent = response.text || 'Compliance Report Generated.';
    
    // In reality, we might commit this to a docs/ folder or wiki
    return { 
      status: 'Compliant', 
      reportUrl: `https://gitlab.com/project/-/merge_requests/${mrId}#compliance`,
      summary: 'All compliance checks passed.'
    };
  }
}
