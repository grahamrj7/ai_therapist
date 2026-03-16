import { supabase } from "./supabase"
import type { Message, Session } from "@/types"
import type { EmotionScale } from "@/components/activities/EmotionScaleSliders"
import type { Memory, MemoryCategory } from "@/types/memory"

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

  if (session.messages.length > 0) {
    const messagesData = session.messages.map(message => ({
      id: message.id,
      session_id: session.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }))

    const { error: messagesError } = await supabase
      .from("messages")
      .upsert(messagesData)

    if (messagesError) {
      console.error("Error saving messages:", messagesError)
      throw messagesError
    }
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

export interface EmotionHistoryParams {
  days?: number // Number of days to look back, null for all
  limit?: number
}

export async function loadEmotionHistory(
  userId: string, 
  params: EmotionHistoryParams = {}
): Promise<EmotionCheckin[]> {
  const { days = 30, limit = 100 } = params
  
  let query = supabase
    .from("emotion_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true })
    .limit(limit)

  if (days) {
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    query = query.gte("timestamp", startDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error loading emotion history:", error)
    return []
  }

  return data || []
}

// ============================================================================
// Memory Database Functions
// ============================================================================

export async function saveMemory(userId: string, memory: Omit<Memory, 'id' | 'createdAt' | 'lastReferencedAt' | 'isActive'>): Promise<Memory | null> {
  const { data, error } = await supabase
    .from("memories")
    .insert({
      user_id: userId,
      content: memory.content,
      category: memory.category,
      importance: memory.importance,
      source_message_id: memory.sourceMessageId || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving memory:", error)
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    content: data.content,
    category: data.category as MemoryCategory,
    importance: data.importance,
    sourceMessageId: data.source_message_id,
    createdAt: data.created_at,
    lastReferencedAt: data.last_referenced_at,
    isActive: data.is_active,
  }
}

export async function loadMemories(
  userId: string,
  options?: {
    category?: MemoryCategory
    limit?: number
    minImportance?: number
  }
): Promise<Memory[]> {
  let query = supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)

  if (options?.category) {
    query = query.eq("category", options.category)
  }

  if (options?.minImportance) {
    query = query.gte("importance", options.minImportance)
  }

  query = query
    .order("importance", { ascending: false })
    .order("last_referenced_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error loading memories:", error)
    return []
  }

  return (data || []).map(m => ({
    id: m.id,
    userId: m.user_id,
    content: m.content,
    category: m.category as MemoryCategory,
    importance: m.importance,
    sourceMessageId: m.source_message_id,
    createdAt: m.created_at,
    lastReferencedAt: m.last_referenced_at,
    isActive: m.is_active,
  }))
}

export async function updateMemoryLastReferenced(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from("memories")
    .update({ last_referenced_at: Date.now() })
    .eq("id", memoryId)

  if (error) {
    console.error("Error updating memory reference:", error)
  }
}

export async function deleteMemory(memoryId: string): Promise<boolean> {
  const { error } = await supabase
    .from("memories")
    .update({ is_active: false })
    .eq("id", memoryId)

  if (error) {
    console.error("Error deleting memory:", error)
    return false
  }

  return true
}

export async function getMemoryCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true)

  if (error) {
    console.error("Error getting memory count:", error)
    return 0
  }

  return count || 0
}

export async function findSimilarMemory(userId: string, content: string, threshold: number = 0.8): Promise<Memory | null> {
  const memories = await loadMemories(userId, { limit: 100 })
  
  // Simple similarity check - look for very similar content
  const normalizedContent = content.toLowerCase().trim()
  
  for (const memory of memories) {
    const normalizedMemory = memory.content.toLowerCase().trim()
    
    // Check for exact match or very close match
    if (normalizedMemory === normalizedContent) {
      return memory
    }
    
    // Check if one contains the other (for longer memories)
    if (normalizedMemory.length > 20 && normalizedContent.length > 20) {
      if (normalizedMemory.includes(normalizedContent) || normalizedContent.includes(normalizedMemory)) {
        return memory
      }
    }
  }

  return null
}

export async function removeLowestImportanceMemory(userId: string): Promise<boolean> {
  // Get memories sorted by importance, exclude the most important ones
  const { data, error } = await supabase
    .from("memories")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("importance", { ascending: true })
    .order("last_referenced_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    return false
  }

  return deleteMemory(data.id)
}
