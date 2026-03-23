import { GoogleGenAI } from '@google/genai';
import { GitLabAPI } from '../gitlab';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class SecurityAgent {
  static async execute(branchName: string, mrId: string | number, gitlab: GitLabAPI) {
    // Simulates running SAST/DAST and patching
    const prompt = `You are the Security Agent. Analyze typical code for vulnerabilities and provide a patch. Output JSON with 'vulnerabilities_found', 'patches_applied', and 'risk_level' (Low/Medium/High).`;

    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let result = { vulnerabilities_found: 0, patches_applied: 0, risk_level: 'Low' };
    try {
      result = JSON.parse(response.text || '{}');
    } catch (e) {}

    return { 
      status: 'Scanned', 
      riskLevel: result.risk_level || 'Low', 
      patchesApplied: result.patches_applied || 0 
    };
  }
}
