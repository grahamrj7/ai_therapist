import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Message, Session } from "@/types"

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function getTherapistPrompt(userName?: string, therapistName: string = "Abby"): string {
  const nameContext = userName
    ? `The client's name is ${userName}. Use their name occasionally and naturally in conversation.`
    : ''

  return `Your name is ${therapistName}. You are a compassionate and empathetic therapist.

IMPORTANT: ${therapistName} is YOUR name (the therapist), NOT the client's name.

${nameContext}

Your role is to:
- Listen actively and provide supportive responses
- Ask thoughtful follow-up questions to help users explore their feelings
- Validate emotions without judgment
- Offer gentle insights and coping strategies when appropriate
n- Maintain a warm, professional, and caring tone
- Keep responses concise (2-4 sentences typically)
- Never diagnose conditions or replace professional mental health care
- Encourage seeking professional help for serious concerns
- Never refer to yourself as an AI - you're simply ${therapistName}, a therapist here to help

Remember: You're ${therapistName}, the therapist providing a safe space for your client.`
}

interface UseChatOptions {
  therapistName?: string
}

export function useChat(options: UseChatOptions = {}) {
  const { therapistName = "Abby" } = options
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [interimText, setInterimText] = useState("")
  const [isFreshChat, setIsFreshChat] = useState(false)
  const chatRef = useRef<any>(null)
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
      initializeChat(messages)
    }
  }, [therapistName])

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('therapy_sessions')
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions)
      const sessionsArray = Object.values(parsed) as Session[]
      setSessions(sessionsArray.sort((a, b) => b.timestamp - a.timestamp))

      // Set current session to today or most recent
      const today = getTodayDate()
      const todaySession = sessionsArray.find(s => s.date === today)
      if (todaySession) {
        setCurrentSessionId(todaySession.id)
        setMessages(todaySession.messages)
        initializeChat(todaySession.messages)
      } else if (sessionsArray.length > 0) {
        setCurrentSessionId(sessionsArray[0].id)
        setMessages(sessionsArray[0].messages)
        initializeChat(sessionsArray[0].messages)
      }
    }
  }, [])

  const initializeChat = (history: Message[] = []) => {
    if (!genAIRef.current) return

    const model = genAIRef.current.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: getTherapistPrompt(undefined, therapistName),
    })

    const geminiHistory = history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    chatRef.current = model.startChat({ history: geminiHistory })
  }

  const saveSessions = useCallback((newSessions: Session[]) => {
    const sessionsObj = newSessions.reduce((acc, session) => {
      acc[session.id] = session
      return acc
    }, {} as Record<string, Session>)
    localStorage.setItem('therapy_sessions', JSON.stringify(sessionsObj))
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !chatRef.current) return

    const today = getTodayDate()
    let todaySession = sessions.find(s => s.date === today)

    // If there's no today session, create one (whether in fresh chat mode or not)
    if (!todaySession) {
      todaySession = {
        id: generateId(),
        date: today,
        messages: [],
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
      const result = await chatRef.current.sendMessage(content)
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
    // Clear UI and reset chat context, but don't create a new session entry
    setMessages([])
    setIsFreshChat(true)
    initializeChat([])
    
    // Set current session to today's session if it exists
    const today = getTodayDate()
    const todaySession = sessions.find(s => s.date === today)
    if (todaySession) {
      setCurrentSessionId(todaySession.id)
    }
  }, [sessions])

  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
      setIsFreshChat(false)
      initializeChat(session.messages)
    }
  }, [sessions])

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
  }
}
