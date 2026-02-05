import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { SettingsDialog } from "@/components/layout/SettingsDialog"
import { MessagesList } from "@/components/chat/MessagesList"
import { InputArea } from "@/components/chat/InputArea"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { useTextToSpeech } from "@/hooks/useTextToSpeech"
import "@/styles/globals.css"

function App() {
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
  } = useChat()

  const { user, signIn, signOut } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { speak, stop } = useTextToSpeech()

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

  // Speak bot messages when they arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "bot" && !isTyping && lastMessage.content) {
      speak(lastMessage.content)
    }
  }, [messages, isTyping, speak])

  // Update interim text from speech recognition
  useEffect(() => {
    if (interimTranscript) {
      setInterimText(interimTranscript)
    }
  }, [interimTranscript, setInterimText])

  const handleSendMessage = (content: string) => {
    stop() // Stop any ongoing speech
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
      stop() // Stop any ongoing speech
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
      />
    </>
  )
}

export default App
