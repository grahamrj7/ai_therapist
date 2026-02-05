import { useState, useEffect, useCallback, useRef } from "react"

interface UseSpeechRecognitionReturn {
  isRecording: boolean
  transcript: string
  interimTranscript: string
  startRecording: () => void
  stopRecording: () => void
  error: string | null
  supported: boolean
}

export function useSpeechRecognition(onResult?: (transcript: string) => void): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setSupported(false)
      setError("Speech recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }

      setInterimTranscript(interim)
      
      if (final) {
        setTranscript(final)
        onResult?.(final)
        setIsRecording(false)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        setError(event.error)
      }
      setIsRecording(false)
      setInterimTranscript('')
    }

    recognition.onend = () => {
      setIsRecording(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition
  }, [onResult])

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || !supported) {
      console.log("Speech recognition not supported or not available")
      return
    }
    
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    
    try {
      console.log("Starting speech recognition...")
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording:", err)
      setError('Failed to start recording')
      setIsRecording(false)
    }
  }, [supported])

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return
    
    try {
      recognitionRef.current.stop()
    } catch (err) {
      // Ignore errors when stopping
    }
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    transcript,
    interimTranscript,
    startRecording,
    stopRecording,
    error,
    supported,
  }
}
