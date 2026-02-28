import { supabase } from "./supabase"
import type { Message, Session } from "@/types"

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
