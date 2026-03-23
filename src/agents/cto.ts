import { GoogleGenAI } from '@google/genai';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class CTOAgent {
  static async execute(workflowData: any) {
    const prompt = `You are the CTO Agent (Observer). Summarize the following autonomous workflow execution.
    Provide a concise executive summary, risk level, and estimated time saved.
    
    Workflow Data:
    ${JSON.stringify(workflowData)}
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt
    });

    return response.text || 'Workflow completed successfully.';
  }
}
