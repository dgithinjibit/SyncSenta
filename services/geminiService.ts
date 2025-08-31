import { GoogleGenAI, Chat, Type } from "@google/genai";

// Lazily initialize to avoid crashing the app on startup if API_KEY is missing.
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        // This error will be caught by the calling components' try/catch blocks.
        throw new Error("API_KEY environment variable not set. AI features will not work.");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
}

interface EquityData {
    ward: string;
    resource: number;
    score: number;
}


export const createTutorChat = (resourceContext: string): Chat => {
  const client = getAiClient();
  const systemInstruction = `You are Mwalimu AI, a friendly and patient Socratic tutor for students in the Kenyan CBC curriculum. Your goal is to guide students to discover answers themselves. Ask probing questions, encourage critical thinking, and avoid giving direct answers.
  ${resourceContext}
  Keep your responses concise and engaging.`;
  
  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
};

export const getCountyOfficerReport = async (query: string, context: string): Promise<string> => {
  try {
    const client = getAiClient();
    const prompt = `You are an AI Strategic Advisor for a County Officer overseeing education in Kenya. Your purpose is to provide concise, data-driven insights to improve learning outcomes and resource distribution across the county, aligned with the CBC.
      Context: ${context}
      User Query: "${query}"
      Based on the context, provide a brief, actionable analysis and recommendation. For example, suggesting resource shifts between wards to boost literacy.`;
      
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI analyst report:", error);
    return "I'm sorry, I encountered an error while analyzing the data. Please try again.";
  }
};

export const getSchoolHeadReport = async (query: string, context: string): Promise<string> => {
  try {
    const client = getAiClient();
    const prompt = `You are an AI Operational Consultant for a School Head in Kenya. Your role is to identify compliance risks and connect them to learning impact, based on the school's data.
      Context: ${context}
      User Query: "${query}"
      Based on the provided context, provide a concise analysis linking operational data (like teacher-student ratios or resource levels) to learning outcomes (like engagement metrics). For example, flag that a high student-teacher ratio is correlated with low math engagement.`;
      
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI School Head report:", error);
    return "I'm sorry, I encountered an error while analyzing the school data. Please try again.";
  }
};

/**
 * Creates a chat session for the AI Teaching Assistant.
 */
export const createTeacherAssistantChat = (): Chat => {
  const client = getAiClient();
  const systemInstruction = `You are a creative and highly capable AI Teaching Assistant for educators in Kenya, specializing in the CBC curriculum. Your purpose is to be a helpful partner for teachers. You can:
- Generate lesson plans, activities, and project ideas.
- Create quizzes, assessments, and rubrics on any topic.
- Explain complex concepts in simple terms suitable for different grade levels.
- Differentiate instruction for students with varying needs.
- Draft communications to parents.
- Provide creative and engaging teaching strategies.

Always be encouraging, practical, and tailor your responses to the Kenyan educational context when possible.`;
  
  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
  });
};


export const getEquityAnalysis = async (context: string): Promise<EquityData[]> => {
    try {
        const client = getAiClient();
        const prompt = `You are an educational data analyst for a Kenyan County Officer. Based on the following county-wide data, generate a realistic but fictional equity heatmap analysis for 4 distinct wards. The analysis should correlate resource availability with average student scores. Provide the output as a JSON array where each object represents a ward and has three properties: "ward" (string, e.g., "Ward A"), "resource" (integer, a percentage from 30 to 95 representing resource level), and "score" (integer, a percentage from 40 to 90 representing average student scores). Ensure there's some correlation, but not perfectly linear. Context: ${context}`;
        
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ward: { type: Type.STRING, description: "The name of the ward." },
                            resource: { type: Type.INTEGER, description: "The resource availability percentage." },
                            score: { type: Type.INTEGER, description: "The average student score percentage." },
                        },
                        required: ["ward", "resource", "score"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating AI equity analysis:", error);
        // Return a default/fallback structure in case of error for UI stability
        return [
            { ward: 'Ward A', resource: 85, score: 78 },
            { ward: 'Ward B', resource: 92, score: 85 },
            { ward: 'Ward C', resource: 45, score: 55 },
            { ward: 'Ward D', resource: 60, score: 62 },
        ];
    }
};