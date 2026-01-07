
import { GoogleGenAI, Type } from "@google/genai";
import { STARR, Language } from "../types";

const API_KEY = process.env.API_KEY || "";

export const refineToSTARR = async (rawNotes: string, lang: Language): Promise<STARR> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const languageInstructions = {
    en: "Output all fields in English.",
    ko: "모든 필드를 한국어로 작성하세요.",
    ja: "すべてのフィールドを日本語で作成してください。",
    es: "Escribe todos los campos en español."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform the following raw notes into a structured STARR (Situation, Task, Action, Result, Reflection) format. 
    ${languageInstructions[lang]}
    Provide the output as a JSON object.
    
    Notes: ${rawNotes}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          situation: { type: Type.STRING },
          task: { type: Type.STRING },
          action: { type: Type.STRING },
          result: { type: Type.STRING },
          reflection: { type: Type.STRING },
        },
        required: ["situation", "task", "action", "result", "reflection"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { situation: "", task: "", action: "", result: "", reflection: "" };
  }
};

export const suggestTags = async (starr: STARR): Promise<{ activityTags: string[], competencyTags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this experience and suggest appropriate tags from these categories (Use the exact English keys):
    Activities: Art, Science, Sports, Volunteering, Career, Coding, Music, Leadership, Language, Reading
    Competencies: Curiosity, Collaboration, Grit, Leadership, Problem Solving, Creativity, Empathy, Communication

    Experience:
    Situation: ${starr.situation}
    Task: ${starr.task}
    Action: ${starr.action}
    Result: ${starr.result}
    Reflection: ${starr.reflection}
    
    Return as a JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          activityTags: { type: Type.ARRAY, items: { type: Type.STRING } },
          competencyTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["activityTags", "competencyTags"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { activityTags: [], competencyTags: [] };
  }
};
