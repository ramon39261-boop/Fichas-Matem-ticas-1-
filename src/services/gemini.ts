import { GoogleGenAI, Type } from "@google/genai";
import { DidacticSheet, TopicId } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function generateDidacticSheet(topicId: TopicId, topicTitle: string): Promise<DidacticSheet> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const prompt = `Genera una ficha didáctica de matemáticas para alumnos de 1° de Primaria en México, alineada al Programa Sintético 2022.
  El tema específico es: "${topicTitle}" (ID: ${topicId}).
  
  La ficha debe ser lúdica, clara y adecuada para niños de 6-7 años.
  Incluye 3 actividades variadas.
  
  IMPORTANTE: Responde estrictamente en formato JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          topic: { type: Type.STRING },
          objective: { type: Type.STRING },
          instructions: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['exercise', 'problem', 'drawing', 'table'] },
                content: { type: Type.STRING },
                visualDescription: { type: Type.STRING }
              },
              required: ['type', 'content']
            }
          },
          teacherNotes: { type: Type.STRING }
        },
        required: ['title', 'topic', 'objective', 'instructions', 'activities', 'teacherNotes']
      }
    }
  });

  return JSON.parse(response.text || "{}") as DidacticSheet;
}
