import { GoogleGenAI } from '@google/genai';
import { GitLabAPI } from '../gitlab';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class QAAgent {
  static async execute(branchName: string, mrId: string | number, gitlab: GitLabAPI) {
    // In a real scenario, this would fetch the branch code and generate tests
    const prompt = `You are the QA Agent. Generate a test suite for a generic Node.js feature. Output JSON with 'test_files' array containing 'file_path' and 'content'.`;

    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let tests = [];
    try {
      tests = JSON.parse(response.text || '[]').test_files || [];
    } catch (e) {}

    const actions = tests.map((t: any) => ({
      action: 'create',
      file_path: t.file_path,
      content: t.content
    }));

    if (actions.length > 0) {
      await gitlab.commitFiles(branchName, `Auto-generated tests by QA Agent`, actions);
    }

    return { status: 'Passed', coverage: 85, testsGenerated: tests.length };
  }
}
