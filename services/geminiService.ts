import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const enhanceNote = async (text: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve the clarity, grammar, and tone of the following note. Keep it concise but professional. Return ONLY the improved text, no explanations.\n\nNote:\n${text}`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Enhance Error:", error);
    throw error;
  }
};

export const summarizeVault = async (notes: string[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const combinedNotes = notes.join('\n---\n');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the key themes and important information from the following collection of notes into a single cohesive paragraph.\n\nNotes:\n${combinedNotes}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "AI Service currently unavailable.";
  }
};

export const suggestTags = async (text: string): Promise<string[]> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 to 5 short, relevant tags for this note. Return them as a comma-separated list (e.g., "work, meeting, urgent"). No extra text.\n\nNote:\n${text}`,
    });
    
    const rawText = response.text || "";
    return rawText.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Gemini Tag Error:", error);
    return [];
  }
};