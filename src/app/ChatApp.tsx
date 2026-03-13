import { useEffect, useState, useRef } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { SettingsDialog } from "@/components/layout/SettingsDialog"
import { MessagesList } from "@/components/chat/MessagesList"
import { InputArea } from "@/components/chat/InputArea"
import { BreathingExercise } from "@/components/activities/BreathingExercise"
import { EmotionScaleSliders, type EmotionScale } from "@/components/activities/EmotionScaleSliders"
import { SoundTherapy } from "@/components/activities/SoundTherapy"
import { TTSPrompt } from "@/components/TTSPrompt"
import { Onboarding } from "./Onboarding"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/hooks/useSettings"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import { saveUserProfile, saveEmotionCheckin } from "@/lib/db"
import { ACTIVITY_KEYWORDS } from "@/constants/activities"

export function ChatApp() {
  const { user, signIn, signOut } = useAuth()
  const { settings, updateTherapistName, setTTSEnabled, setHasSeenTTSPrompt, completeOnboarding, updateVoiceName, resetSettings, isLoaded } = useSettings()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTTSPrompt, setShowTTSPrompt] = useState(false)
  const [activeActivity, setActiveActivity] = useState<string | null>(null)
  const [memoriesSavedForMessages, setMemoriesSavedForMessages] = useState<Set<string>>(new Set())

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
    triggerEmotionResponse,
  } = useChat({ 
    therapistName: settings.therapistName, 
    userId: user?.uid, 
    onActivityTriggered: setActiveActivity,
    onMemorySaved: (messageId) => {
      setMemoriesSavedForMessages(prev => new Set([...prev, messageId]))
    }
  })
  
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

  const handleSendMessage = (content: string) => {
    const lowerContent = content.toLowerCase()
    const isBreathingRequest = ACTIVITY_KEYWORDS.breathing.some(keyword => 
      lowerContent.includes(keyword)
    )
    const isEmotionRequest = ACTIVITY_KEYWORDS.emotions.some(keyword => 
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

  const handleSaveEmotions = async (emotions: EmotionScale[]) => {
    if (user?.uid) {
      try {
        await saveEmotionCheckin(user.uid, emotions, currentSessionId || undefined)
      } catch (error) {
        console.error("Error saving emotion checkin:", error)
      }
    }
    setActiveActivity(null)
    await triggerEmotionResponse(emotions)
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

  // Require sign in to use the app
  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="font-display text-xl text-text-primary">Sign in required</h2>
          <p className="text-text-secondary">
            Please sign in with Google to access your safe space and sync your sessions across devices.
          </p>
          <button
            onClick={signIn}
            className="px-6 py-3 bg-terracotta text-white rounded-full font-medium hover:bg-terracotta/90 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
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
            <EmotionScaleSliders 
              onClose={() => setActiveActivity(null)} 
              onSave={handleSaveEmotions}
            />
          ) : activeActivity === "sound" ? (
            <SoundTherapy onClose={() => setActiveActivity(null)} />
          ) : (
            <>
              <MessagesList 
                messages={messages} 
                isTyping={isTyping} 
                isFreshChat={isFreshChat} 
                therapistName={settings.therapistName}
                onTriggerBreathing={handleTriggerBreathing}
                memoriesSavedForMessages={memoriesSavedForMessages}
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
        userId={user?.uid}
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
