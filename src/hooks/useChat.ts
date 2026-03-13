import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleGenerativeAI, type ChatSession } from "@google/generative-ai"
import type { Message, Session } from "@/types"
import type { Memory } from "@/types/memory"
import { saveSession, loadSessions, loadMemories, getMemoryCount, removeLowestImportanceMemory, findSimilarMemory, saveMemory } from "@/lib/db"
import { ACTIVITY_KEYWORDS } from "@/constants/activities"
import { extractMemories, calculateImportance } from "@/lib/memoryExtractor"
import { shouldAskLearningQuestion, getPersonalizationPrompt, generateMemoryFollowUp, getContextualMemoryPrompt } from "@/lib/learningQuestions"

const SYNC_CACHE_KEY = "therapy_sessions_sync"
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Generate a personalized welcome message based on existing memories
 */
function generateWelcomeMessage(therapistName: string, memories: string[]): string {
  // Check if we know the user's name
  const nameMemory = memories.find(m => m.toLowerCase().includes("user's name is"))
  
  if (nameMemory) {
    // Extract name from memory
    const nameMatch = nameMemory.match(/name is (.+)/i)
    const userName = nameMatch ? nameMatch[1].trim() : null
    
    if (userName) {
      return `Welcome back ${userName}! It's good to see you again. How have you been since our last session?`
    }
  }
  
  // Check if returning user (has any memories)
  if (memories.length > 0) {
    return `Welcome back! It's good to see you again. I've been looking forward to our session. How are you feeling today?`
  }
  
  // First time user
  return `Hi there! I'm ${therapistName}, and I'm here to support you. This is a safe space where you can share whatever's on your mind. How are you feeling today?`
}

function getTherapistPrompt(
  userName: string | undefined, 
  therapistName: string = "Abby",
  memories: string[] = []
): string {
  const nameContext = userName
    ? `The client's name is ${userName}. Use their name occasionally and naturally in conversation.`
    : ''

  // Format memories for the prompt
  const memoriesContext = memories.length > 0 
    ? `MEMORIES ABOUT THE CLIENT (from previous sessions - use this to personalize your responses):
${memories.map((m, i) => `${i + 1}. ${m}`).join('\n')}

`
    : ''

  return `Your name is ${therapistName}. You are a compassionate and empathetic therapist.

IMPORTANT: ${therapistName} is YOUR name (the therapist), NOT the client's name.

${nameContext}
${memoriesContext}
AVAILABLE THERAPEUTIC TOOLS:
- Box Breathing Exercise: A guided 4-4-4-4 breathing technique (inhale 4 seconds, hold 4, exhale 4, hold 4). You can suggest this when:
  * The user expresses anxiety, stress, overwhelm, or panic
  * They mention physical symptoms like rapid heartbeat or shallow breathing
  * They're having trouble calming down or focusing
  * They explicitly ask for a breathing exercise or relaxation technique
  * They say things like "I need to calm down" or "I'm feeling overwhelmed"

When suggesting the breathing exercise, be gentle and offer it as an option, not a requirement. Use phrases like:
- "Would you like to try a breathing exercise?"
- "I can guide you through a box breathing technique if that would help."
- "There's a breathing exercise available if you'd like to use it."

- Emotion Check-In: A tool to track how the user is feeling across different dimensions (anxiety, mood, stress, energy). 
  IMPORTANT: Do NOT describe or explain this tool to the user. Instead, naturally prompt them to check in by asking questions like:
  * "How are you feeling right now? Would you like to do a quick emotion check-in?"
  * "On a scale of 1-10, how would you rate your [anxiety/stress/mood/energy] today?"
  * "Before we continue, I'd love to hear how you're feeling. Would you like to track your emotions?"
  
  Use this at natural conversation pauses, especially:
  * After the user shares something significant or emotional
  * At the start of a new conversation session
  * When you notice mood shifts in the conversation
  * Periodically during longer conversations (every 10-15 minutes)
  * When the user seems stuck or overwhelmed

Your role is to:
- Listen actively and provide supportive responses
- Ask thoughtful follow-up questions to help users explore their feelings
- Validate emotions without judgment
- Offer gentle insights and coping strategies when appropriate
- Suggest the breathing exercise naturally when it seems helpful (anxiety, stress, overwhelm)
- Naturally prompt for emotion check-ins at appropriate moments
- Maintain a warm, professional, and caring tone
- Keep responses concise (2-4 sentences typically)
- Never diagnose conditions or replace professional mental health care
- Encourage seeking professional help for serious concerns
- Never refer to yourself as an AI - you're simply ${therapistName}, a therapist here to help

Remember: You're ${therapistName}, the therapist providing a safe space for your client.`
}

interface UseChatOptions {
  therapistName?: string
  userId?: string
  onActivityTriggered?: (activity: 'breathing' | 'emotions') => void
  onMemorySaved?: (messageId: string) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { therapistName = "Abby", userId, onActivityTriggered, onMemorySaved } = options
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [isFreshChat, setIsFreshChat] = useState(false)
  const [loadedMemories, setLoadedMemories] = useState<Memory[]>([])
  const chatRef = useRef<ChatSession | null>(null)
  const genAIRef = useRef<GoogleGenerativeAI | null>(null)

  // Initialize Gemini
  useEffect(() => {
    if (API_KEY) {
      genAIRef.current = new GoogleGenerativeAI(API_KEY)
    }
  }, [])

  // Initialize or re-initialize chat when therapistName changes
  useEffect(() => {
    if (genAIRef.current) {
      initializeChat(messages, loadedMemories)
    }
  }, [therapistName])

  // Load sessions from localStorage or Supabase
  useEffect(() => {
    async function load() {
      // Load localStorage first (fast)
      const savedSessions = localStorage.getItem('therapy_sessions')
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions)
        const sessionsArray = Object.values(parsed) as Session[]
        setSessions(sessionsArray.sort((a, b) => b.timestamp - a.timestamp))

        const today = getTodayDate()
        const todaySession = sessionsArray.find(s => s.date === today)
        if (todaySession) {
          setCurrentSessionId(todaySession.id)
          setMessages(todaySession.messages)
          initializeChat(todaySession.messages, loadedMemories)
        } else if (sessionsArray.length > 0) {
          setCurrentSessionId(sessionsArray[0].id)
          setMessages(sessionsArray[0].messages)
          initializeChat(sessionsArray[0].messages, loadedMemories)
        }
      } else {
        const welcomeMessage: Message = {
          id: generateId(),
          role: "bot",
          content: `Hi there! I'm ${therapistName}, and I'm here to support you. This is a safe space where you can share whatever's on your mind. How are you feeling today?`,
          timestamp: Date.now(),
        }
        setMessages([welcomeMessage])
      }

      // Also load memories if user is logged in
      if (userId) {
        const memories = await loadMemories(userId, { limit: 20 })
        setLoadedMemories(memories)
        console.log('[Memory] Loaded', memories.length, 'memories')
      }

      // Then sync with Supabase if user is logged in and enough time has passed
      if (userId) {
        const lastSync = localStorage.getItem(SYNC_CACHE_KEY)
        const now = Date.now()
        
        // Only sync if never synced or 5 minutes have passed
        if (!lastSync || (now - parseInt(lastSync)) > SYNC_INTERVAL) {
          const supabaseSessions = await loadSessions(userId)
          if (supabaseSessions.length > 0) {
            setSessions(supabaseSessions)
            localStorage.setItem(SYNC_CACHE_KEY, now.toString())
            
            const today = getTodayDate()
            const todaySession = supabaseSessions.find(s => s.date === today)
            if (todaySession) {
              setCurrentSessionId(todaySession.id)
              setMessages(todaySession.messages)
              initializeChat(todaySession.messages, loadedMemories)
            } else if (supabaseSessions.length > 0) {
              setCurrentSessionId(supabaseSessions[0].id)
              setMessages(supabaseSessions[0].messages)
              initializeChat(supabaseSessions[0].messages, loadedMemories)
            }

            // Load memories for context
            if (userId) {
              const memories = await loadMemories(userId, { limit: 20 })
              setLoadedMemories(memories)
              console.log('[Memory] Loaded', memories.length, 'memories for session')
            }
          } else {
            localStorage.setItem(SYNC_CACHE_KEY, now.toString())
          }
        }
      }
    }
    load()
  }, [userId])

  const initializeChat = (history: Message[] = [], memories: Memory[] = []) => {
    if (!genAIRef.current) return

    // Format memories for the prompt
    const memoryStrings = memories.slice(0, 15).map(m => m.content)

    const model = genAIRef.current.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: getTherapistPrompt(undefined, therapistName, memoryStrings),
    })

    // Filter out the welcome message (first bot message when no user messages exist yet)
    // Gemini requires the first message in history to be from 'user', not 'model'
    const validHistory = history.filter((msg, index) => {
      // Keep user messages
      if (msg.role === 'user') return true
      // Keep bot messages only if there's at least one user message before it
      const hasUserMessageBefore = history.slice(0, index).some(m => m.role === 'user')
      return hasUserMessageBefore
    })

    const geminiHistory = validHistory.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    chatRef.current = model.startChat({ history: geminiHistory })
  }

  const saveSessions = useCallback(async (newSessions: Session[]) => {
    const sessionsObj = newSessions.reduce((acc, session) => {
      acc[session.id] = session
      return acc
    }, {} as Record<string, Session>)
    localStorage.setItem('therapy_sessions', JSON.stringify(sessionsObj))

    if (userId) {
      for (const session of newSessions) {
        await saveSession(userId, session)
      }
      // Update sync timestamp after saving
      localStorage.setItem(SYNC_CACHE_KEY, Date.now().toString())
    }
  }, [userId])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !chatRef.current) return

    const today = getTodayDate()
    let todaySession = sessions.find(s => s.date === today)

    // If there's no today session, create one (whether in fresh chat mode or not)
    if (!todaySession) {
      todaySession = {
        id: generateId(),
        date: today,
        messages: messages, // Preserve current messages when creating new session
        timestamp: Date.now(),
      }
      const updatedSessions = [todaySession, ...sessions]
      setSessions(updatedSessions)
      setCurrentSessionId(todaySession.id)
      saveSessions(updatedSessions)
    }

    // Use today's session
    const targetSession = todaySession || sessions.find(s => s.id === currentSessionId)

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    }

    // Get current messages from target session or empty
    const currentMessages = targetSession ? targetSession.messages : messages
    const updatedMessages = [...currentMessages, userMessage]
    setMessages(updatedMessages)
    setInterimText("")
    setIsTyping(true)
    setIsFreshChat(false) // Exit fresh chat mode after first message

    // Update the session - we should always have a target session now
    const sessionToUpdate = targetSession || todaySession
    if (sessionToUpdate) {
      const newSessions = sessions.map(s => 
        s.id === sessionToUpdate.id 
          ? { ...s, messages: updatedMessages, timestamp: Date.now() }
          : s
      )
      // If session doesn't exist in sessions array yet (was just created), add it
      const finalSessions = newSessions.find(s => s.id === sessionToUpdate.id) 
        ? newSessions 
        : [sessionToUpdate, ...sessions]
      
      setSessions(finalSessions)
      saveSessions(finalSessions)
      setCurrentSessionId(sessionToUpdate.id)
    }

    try {
      const messageId = userMessage.id

      // Extract memories from user message BEFORE sending (on every message)
      if (userId && content.trim()) {
        setTimeout(async () => {
          try {
            const extractedMemories = extractMemories(content, '')
            let actuallySaved = false
            
            for (const fact of extractedMemories) {
              const existing = await findSimilarMemory(userId, fact.content)
              if (existing) continue
              
              const count = await getMemoryCount(userId)
              if (count >= 100) {
                await removeLowestImportanceMemory(userId)
              }
              
              const saved = await saveMemory(userId, {
                userId,
                content: fact.content,
                category: fact.category,
                importance: fact.importance,
              })
              
              if (saved) {
                actuallySaved = true
                console.log('[Memory] Saved:', fact.content.substring(0, 50))
              }
            }
            
            if (actuallySaved) {
              const updated = await loadMemories(userId, { limit: 20 })
              setLoadedMemories(updated)
              onMemorySaved?.(messageId)
            } else if (extractedMemories.length > 0) {
              console.log('[Memory] Extracted but not saved (likely table missing):', extractedMemories.length)
            }
          } catch (err) {
            console.error('[Memory] Error extracting from message:', err)
          }
        }, 100)
      }

      // Get contextual memories for this message
      const memoryStrings = loadedMemories.map(m => m.content)
      const contextualPrompt = getContextualMemoryPrompt(memoryStrings, content)
      
      // Send message with contextual memory if relevant
      const messageToSend = contextualPrompt 
        ? `${contextualPrompt}\n\nUser's message: ${content}`
        : content

      const result = await chatRef.current.sendMessage(messageToSend)
      const response = await result.response
      const responseText = response.text()

      const botMessage: Message = {
        id: generateId(),
        role: "bot",
        content: responseText,
        timestamp: Date.now(),
      }

      const finalMessages = [...updatedMessages, botMessage]
      setMessages(finalMessages)
      setIsTyping(false)

      // Check if we should ask a learning question or follow up on past memories
      if (userId && loadedMemories.length > 0) {
        const memoryStrings = loadedMemories.map(m => m.content)
        
        // Use updatedMessages.length for accurate count
        const userMessageCount = updatedMessages.filter(m => m.role === 'user').length
        const learningQuestion = shouldAskLearningQuestion(memoryStrings, userMessageCount)
        const followUpQuestion = generateMemoryFollowUp(memoryStrings)
        
        // Prefer follow-up questions, fall back to learning questions
        const selectedQuestion = followUpQuestion || learningQuestion
        
        if (selectedQuestion) {
          // Wait a bit then ask the question
          setTimeout(async () => {
            try {
              const personalization = getPersonalizationPrompt(memoryStrings)
              const prompt = personalization 
                ? `${personalization}\n\n${selectedQuestion}`
                : selectedQuestion
              
              const result = await chatRef.current.sendMessage(prompt)
              const response = await result.response
              const questionText = response.text()

              const learningMessage: Message = {
                id: generateId(),
                role: "bot",
                content: questionText,
                timestamp: Date.now(),
              }

              setMessages(prev => [...prev, learningMessage])
            } catch (err) {
              console.error('[Learning] Error asking question:', err)
            }
          }, 2000) // Wait 2 seconds after main response
        }
      }

      // Check if AI response suggests an activity - delay to let user read/message
      if (onActivityTriggered) {
        const lowerResponse = responseText.toLowerCase()

        setTimeout(() => {
          if (ACTIVITY_KEYWORDS.breathing.some(kw => lowerResponse.includes(kw))) {
            onActivityTriggered('breathing')
          } else if (ACTIVITY_KEYWORDS.emotions.some(kw => lowerResponse.includes(kw))) {
            onActivityTriggered('emotions')
          } else if (ACTIVITY_KEYWORDS.sound.some(kw => lowerResponse.includes(kw))) {
            onActivityTriggered('sound')
          }
        }, 3000) // 3 second delay to let user read message and hear TTS
      }

      // Update session with bot response
      const sessionToUpdateForBot = targetSession || todaySession
      if (sessionToUpdateForBot) {
        const finalSessions = sessions.map(s => 
          s.id === sessionToUpdateForBot.id 
            ? { ...s, messages: finalMessages, timestamp: Date.now() }
            : s
        )
        // If session doesn't exist in sessions array yet, add it
        const finalSessionsWithBot = finalSessions.find(s => s.id === sessionToUpdateForBot.id) 
          ? finalSessions 
          : [sessionToUpdateForBot, ...sessions]
        
        setSessions(finalSessionsWithBot)
        saveSessions(finalSessionsWithBot)

        // Note: Memory extraction already happens on every user message (before sending)
        // So we don't need to extract again here

      }

    } catch (error) {
      console.error("Error sending message:", error)
      setIsTyping(false)
      
      const errorMessage: Message = {
        id: generateId(),
        role: "bot",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      }
      
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      
      // Save error message to session too
      const sessionToUpdateForError = targetSession || todaySession
      if (sessionToUpdateForError) {
        const errorSessions = sessions.map(s => 
          s.id === sessionToUpdateForError.id 
            ? { ...s, messages: finalMessages, timestamp: Date.now() }
            : s
        )
        const finalErrorSessions = errorSessions.find(s => s.id === sessionToUpdateForError.id) 
          ? errorSessions 
          : [sessionToUpdateForError, ...sessions]
        
        setSessions(finalErrorSessions)
        saveSessions(finalErrorSessions)
      }
    }
  }, [messages, sessions, currentSessionId, isFreshChat, saveSessions])

  const createNewSession = useCallback(() => {
    // Generate personalized welcome if we have memories
    const memoryStrings = loadedMemories.map(m => m.content)
    const welcomeContent = generateWelcomeMessage(therapistName, memoryStrings)
    
    const welcomeMessage: Message = {
      id: generateId(),
      role: "bot",
      content: welcomeContent,
      timestamp: Date.now(),
    }

    // Create a brand new session
    const newSession: Session = {
      id: generateId(),
      date: getTodayDate(),
      messages: [welcomeMessage],
      timestamp: Date.now(),
    }

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    setCurrentSessionId(newSession.id)
    setMessages([welcomeMessage])
    setIsFreshChat(true)
    initializeChat([welcomeMessage], loadedMemories)
    saveSessions(updatedSessions)
  }, [sessions, therapistName, loadedMemories])

  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
      setIsFreshChat(false)
      initializeChat(session.messages, loadedMemories)
    }
  }, [sessions, loadedMemories])

  const triggerEmotionResponse = useCallback(async (emotions: { label: string; value: number }[]) => {
    const emotionSummary = emotions
      .map(e => `${e.label}: ${e.value}/10`)
      .join(", ")
    
    const prompt = `The user just completed an emotion check-in. Here are their results: ${emotionSummary}. Please acknowledge this, provide a brief supportive response, and ask a follow-up question based on their results.`
    
    const botMessage: Message = {
      id: generateId(),
      role: "bot",
      content: "",
      timestamp: Date.now(),
    }

    setIsTyping(true)

    try {
      const result = await chatRef.current.sendMessage(prompt)
      const response = await result.response
      const responseText = response.text()

      botMessage.content = responseText
      
      const updatedMessages = [...messages, botMessage]
      setMessages(updatedMessages)
      setIsTyping(false)

      // Update session
      const today = getTodayDate()
      const todaySession = sessions.find(s => s.date === today)
      if (todaySession) {
        const finalSessions = sessions.map(s => 
          s.id === todaySession.id 
            ? { ...s, messages: updatedMessages, timestamp: Date.now() }
            : s
        )
        setSessions(finalSessions)
        saveSessions(finalSessions)
      }
    } catch (error) {
      console.error("Error triggering emotion response:", error)
      setIsTyping(false)
    }
  }, [messages, sessions])

  return {
    sessions,
    currentSessionId,
    messages,
    isTyping,
    isFreshChat,
    interimText,
    setSessions,
    setMessages,
    setCurrentSessionId,
    sendMessage,
    createNewSession,
    selectSession,
    setInterimText,
    triggerEmotionResponse,
  }
}
