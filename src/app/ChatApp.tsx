import { useEffect, useState, useRef } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { SettingsDialog } from "@/components/layout/SettingsDialog"
import { MessagesList } from "@/components/chat/MessagesList"
import { InputArea } from "@/components/chat/InputArea"
import { BreathingExercise } from "@/components/activities/BreathingExercise"
import { EmotionScaleSliders } from "@/components/activities/EmotionScaleSliders"
import { TTSPrompt } from "@/components/TTSPrompt"
import { Onboarding } from "./Onboarding"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/hooks/useSettings"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import { saveUserProfile } from "@/lib/db"

export function ChatApp() {
  const { user, signIn, signOut } = useAuth()
  const { settings, updateTherapistName, setTTSEnabled, setHasSeenTTSPrompt, completeOnboarding, updateVoiceName, resetSettings, isLoaded } = useSettings()

  const {
    sessions,
    currentSessionId,
    messages,
    isTyping,
    isFreshChat,
    setSessions,
    setMessages,
    setCurrentSessionId,
    sendMessage,
    createNewSession,
    selectSession,
    setInterimText,
  } = useChat({ therapistName: settings.therapistName, userId: user?.uid })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTTSPrompt, setShowTTSPrompt] = useState(false)
  const [activeActivity, setActiveActivity] = useState<string | null>(null)
  const spokenMessageIds = useRef<Set<string>>(new Set())

  const { speak } = useTextToSpeech({ enabled: settings.ttsEnabled, voiceName: settings.voiceName })

  // Save user profile to Supabase on auth change
  useEffect(() => {
    if (user) {
      saveUserProfile({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL })
    }
  }, [user])

  // Show TTS prompt on first load after a delay
  useEffect(() => {
    if (!settings.hasSeenTTSPrompt && !settings.ttsEnabled) {
      const timer = setTimeout(() => {
        setShowTTSPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [settings.hasSeenTTSPrompt, settings.ttsEnabled])

  // Speak bot messages when they arrive
  useEffect(() => {
    if (!settings.ttsEnabled || isTyping) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "bot" && lastMessage.content) {
      if (!spokenMessageIds.current.has(lastMessage.id)) {
        spokenMessageIds.current.add(lastMessage.id)
        speak(lastMessage.content)
      }
    }
  }, [messages, isTyping, settings.ttsEnabled, speak])

  const handleTTSPromptEnable = () => {
    setTTSEnabled(true)
    setHasSeenTTSPrompt(true)
    setShowTTSPrompt(false)
  }

  const handleTTSPromptDismiss = () => {
    setHasSeenTTSPrompt(true)
    setShowTTSPrompt(false)
  }

  const handleTTSPromptNeverAsk = () => {
    setHasSeenTTSPrompt(true)
    setShowTTSPrompt(false)
  }

  const handleSpeechResult = (transcript: string) => {
    sendMessage(transcript)
    setInterimText("")
  }

  const {
    isRecording,
    interimTranscript,
    startRecording,
    stopRecording,
    supported: speechSupported,
  } = useSpeechRecognition(handleSpeechResult)

  useEffect(() => {
    if (interimTranscript) {
      setInterimText(interimTranscript)
    }
  }, [interimTranscript, setInterimText])

  // Keywords that indicate user wants to start breathing exercise
  const BREATHING_REQUEST_KEYWORDS = [
    "breathing exercise",
    "box breathing",
    "start breathing",
    "do breathing",
    "breathing technique",
    "guided breathing",
    "deep breathing",
    "i want to breathe",
    "let's breathe",
    "help me breathe",
    "breathe with me",
    "calm me down",
    "i need to calm down",
  ]

  // Keywords that indicate user wants to track emotions
  const EMOTION_TRACKING_KEYWORDS = [
    "how am i feeling",
    "track my emotions",
    "emotion check",
    "how do i feel",
    "check in on my mood",
    "how am i doing emotionally",
    "emotion tracking",
    "mood check",
    "how are my emotions",
    "feeling check",
  ]

  const handleSendMessage = (content: string) => {
    const lowerContent = content.toLowerCase()
    const isBreathingRequest = BREATHING_REQUEST_KEYWORDS.some(keyword => 
      lowerContent.includes(keyword)
    )
    const isEmotionRequest = EMOTION_TRACKING_KEYWORDS.some(keyword => 
      lowerContent.includes(keyword)
    )
    
    if (isBreathingRequest) {
      setActiveActivity("breathing")
    } else if (isEmotionRequest) {
      setActiveActivity("emotions")
    } else {
      sendMessage(content)
    }
  }

  const handleToggleRecording = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleClearData = () => {
    localStorage.removeItem('therapy_sessions')
    setSessions([])
    setMessages([])
    setCurrentSessionId('')
    resetSettings()
    setIsSettingsOpen(false)
  }

  const handleOnboardingComplete = (name: string, tts: boolean, voiceName?: string) => {
    completeOnboarding(name, tts, voiceName)
  }

  const handleTriggerBreathing = () => {
    setActiveActivity("breathing")
  }

  // Show onboarding if settings haven't loaded yet or onboarding isn't complete
  if (!isLoaded || !settings.hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <>
      <AppLayout
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        headerSubtitle={messages.length > 0 ? "Here to listen" : "Your safe space"}
        user={user}
        onSignOut={signOut}
        onSignIn={signIn}
        onSettingsClick={() => setIsSettingsOpen(true)}
        therapistName={settings.therapistName}
      >
        {/* Main content area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {activeActivity === "breathing" ? (
            <BreathingExercise onClose={() => setActiveActivity(null)} voiceName={settings.voiceName} />
          ) : activeActivity === "emotions" ? (
            <EmotionScaleSliders onClose={() => setActiveActivity(null)} />
          ) : (
            <>
              <MessagesList 
                messages={messages} 
                isTyping={isTyping} 
                isFreshChat={isFreshChat} 
                therapistName={settings.therapistName}
                onTriggerBreathing={handleTriggerBreathing}
              />
              <InputArea
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                interimText={interimTranscript}
                therapistName={settings.therapistName}
                onOpenActivity={setActiveActivity}
              />
            </>
          )}
        </div>
      </AppLayout>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearData}
        therapistName={settings.therapistName}
        onTherapistNameChange={updateTherapistName}
        ttsEnabled={settings.ttsEnabled}
        onTTSEnabledChange={setTTSEnabled}
        voiceName={settings.voiceName}
        onVoiceChange={updateVoiceName}
      />

      <TTSPrompt
        isOpen={showTTSPrompt}
        onEnable={handleTTSPromptEnable}
        onDismiss={handleTTSPromptDismiss}
        onNeverAsk={handleTTSPromptNeverAsk}
      />
    </>
  )
}
