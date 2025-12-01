import { GoogleGenAI, Type } from "@google/genai";
import { SOPStep } from "../types";
import { generateId } from "../constants";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSOPSteps = async (title: string, count: number = 6): Promise<Partial<SOPStep>[]> => {
  try {
    const ai = initGenAI();
    
    const prompt = `Create a step-by-step standard operating procedure (SOP) for the following task: "${title}". 
    Generate exactly ${count} distinct steps. Keep descriptions concise and action-oriented.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: "The instruction text for this step."
              }
            },
            required: ["description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawSteps = JSON.parse(text) as { description: string }[];
    
    return rawSteps.map((s, index) => ({
      id: generateId(),
      order: index + 1,
      description: s.description,
      image: null
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};