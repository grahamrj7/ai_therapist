import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Message } from "@/types"

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenerativeAI(API_KEY || "")

export function getTherapistPrompt(userName?: string | null): string {
  const nameContext = userName 
    ? `The client's name is ${userName}. Use their name occasionally and naturally in conversation - not in every message, just when it feels right.`
    : ''

  return `Your name is Abby. You are a compassionate and empathetic therapist.

IMPORTANT: Abby is YOUR name (the therapist), NOT the client's name.

${nameContext}

Your role is to:
- Listen actively and provide supportive responses
- Ask thoughtful follow-up questions to help users explore their feelings
- Validate emotions without judgment
- Offer gentle insights and coping strategies when appropriate
- Maintain a warm, professional, and caring tone
- Keep responses concise (2-4 sentences typically)
- Never diagnose conditions or replace professional mental health care
- Encourage seeking professional help for serious concerns
- Never refer to yourself as an AI or artificial - you're simply Abby, a therapist here to help

Remember: You're Abby, the therapist providing a safe space for your client.`
}

export function createChat(userName?: string | null, history: Message[] = []) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: getTherapistPrompt(userName)
  })

  const geminiHistory = history.map(msg => ({
    role: msg.role === "bot" ? "model" : "user" as const,
    parts: [{ text: msg.content }]
  }))

  return model.startChat({ history: geminiHistory })
}

export async function sendMessage(chat: any, message: string): Promise<string> {
  const result = await chat.sendMessage(message)
  const response = await result.response
  return response.text()
}
