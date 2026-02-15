import { useEffect, useState, useRef } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { SettingsDialog } from "@/components/layout/SettingsDialog"
import { MessagesList } from "@/components/chat/MessagesList"
import { InputArea } from "@/components/chat/InputArea"
import { TTSPrompt } from "@/components/TTSPrompt"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useSettings } from "@/hooks/useSettings"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import "@/styles/globals.css"

function App() {
  const { user, signIn, signOut } = useAuth()
  const { settings, updateTherapistName, setTTSEnabled, setHasSeenTTSPrompt } = useSettings()

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
  } = useChat({ therapistName: settings.therapistName })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTTSPrompt, setShowTTSPrompt] = useState(false)
  const spokenMessageIds = useRef<Set<string>>(new Set())

  const { speak } = useTextToSpeech({ enabled: settings.ttsEnabled })

  // Show TTS prompt on first load after a delay
  useEffect(() => {
    if (!settings.hasSeenTTSPrompt && !settings.ttsEnabled) {
      const timer = setTimeout(() => {
        setShowTTSPrompt(true)
      }, 3000) // Show after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [settings.hasSeenTTSPrompt, settings.ttsEnabled])

  // Speak bot messages when they arrive
  useEffect(() => {
    if (!settings.ttsEnabled || isTyping) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "bot" && lastMessage.content) {
      // Only speak if we haven't spoken this message before
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

  // Update interim text from speech recognition
  useEffect(() => {
    if (interimTranscript) {
      setInterimText(interimTranscript)
    }
  }, [interimTranscript, setInterimText])

  const handleSendMessage = (content: string) => {
    sendMessage(content)
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
    // Clear localStorage
    localStorage.removeItem('therapy_sessions')
    // Reset state
    setSessions([])
    setMessages([])
    setCurrentSessionId('')
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
        <MessagesList messages={messages} isTyping={isTyping} isFreshChat={isFreshChat} />
        <InputArea
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
          interimText={interimTranscript}
        />
      </AppLayout>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearData={handleClearData}
        therapistName={settings.therapistName}
        onTherapistNameChange={updateTherapistName}
        ttsEnabled={settings.ttsEnabled}
        onTTSEnabledChange={setTTSEnabled}
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

export default App
