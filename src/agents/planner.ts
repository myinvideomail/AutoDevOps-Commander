import { GoogleGenAI, Type } from '@google/genai';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class PlannerAgent {
  static async execute(title: string, description: string) {
    const prompt = `You are the Planner Agent. Break down the following issue into a structured technical plan.
    Issue Title: ${title}
    Issue Description: ${description}
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feature_overview: { type: Type.STRING },
            files_to_create: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            files_to_modify: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task_name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  complexity: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }
}
