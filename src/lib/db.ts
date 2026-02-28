import { supabase } from "./supabase"
import type { Message, Session } from "@/types"
import type { EmotionScale } from "@/components/activities/EmotionScaleSliders"

export async function saveSession(userId: string, session: Session) {
  const { error } = await supabase
    .from("sessions")
    .upsert({
      id: session.id,
      user_id: userId,
      date: session.date,
      timestamp: session.timestamp,
    })

  if (error) {
    console.error("Error saving session:", error)
    throw error
  }

  for (const message of session.messages) {
    await saveMessage(session.id, message)
  }
}

export async function saveMessage(sessionId: string, message: Message) {
  const { error } = await supabase
    .from("messages")
    .upsert({
      id: message.id,
      session_id: sessionId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    })

  if (error) {
    console.error("Error saving message:", error)
    throw error
  }
}

export async function loadSessions(userId: string): Promise<Session[]> {
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error loading sessions:", error)
    return []
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("session_id", sessions.map(s => s.id))
    .order("timestamp", { ascending: true })

  const messageMap = new Map<string, Message[]>()
  messages?.forEach(msg => {
    const existing = messageMap.get(msg.session_id) || []
    messageMap.set(msg.session_id, [...existing, {
      id: msg.id,
      role: msg.role as "user" | "bot",
      content: msg.content,
      timestamp: msg.timestamp,
    }])
  })

  return sessions.map(s => ({
    id: s.id,
    date: s.date,
    timestamp: s.timestamp,
    messages: messageMap.get(s.id) || [],
  }))
}

export async function saveUserProfile(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }) {
  const { error } = await supabase
    .from("users")
    .upsert({
      id: user.uid,
      display_name: user.displayName,
      email: user.email,
      photo_url: user.photoURL,
    })

  if (error) {
    console.error("Error saving user profile:", error)
  }
}

export interface EmotionCheckin {
  id: string
  user_id: string
  session_id?: string
  timestamp: number
  anxiety?: number
  mood?: number
  stress?: number
  energy?: number
}

export async function saveEmotionCheckin(
  userId: string, 
  emotions: EmotionScale[], 
  sessionId?: string
) {
  const emotionData = emotions.reduce((acc, emotion) => {
    acc[emotion.id] = emotion.value
    return acc
  }, {} as Record<string, number>)

  const { error } = await supabase
    .from("emotion_checkins")
    .upsert({
      id: Math.random().toString(36).substring(2, 9),
      user_id: userId,
      session_id: sessionId,
      timestamp: Date.now(),
      ...emotionData,
    })

  if (error) {
    console.error("Error saving emotion checkin:", error)
    throw error
  }
}

export async function loadEmotionCheckins(userId: string, sessionId?: string): Promise<EmotionCheckin[]> {
  let query = supabase
    .from("emotion_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })

  if (sessionId) {
    query = query.eq("session_id", sessionId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error loading emotion checkins:", error)
    return []
  }

  return data || []
}
