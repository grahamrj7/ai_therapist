import { useState, useEffect, useCallback, useRef } from "react"

interface UseTextToSpeechOptions {
  enabled?: boolean
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  supported: boolean
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const { enabled = false } = options
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const enabledRef = useRef(enabled)
  
  // Keep enabled ref in sync
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const queueRef = useRef<string[]>([])
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize voice on mount
  useEffect(() => {
    const synth = window.speechSynthesis
    
    if (!synth) {
      console.log("Speech synthesis not supported in this browser")
      setSupported(false)
      return
    }

    const selectVoice = () => {
      const voices = synth.getVoices()
      
      // Find a good English voice (prefer Karen, Samantha, or any English)
      const preferredVoice = voices.find(v =>
        v.lang.startsWith('en') && 
        (v.name.includes('Karen') || v.name.includes('Samantha') || v.name.includes('Google'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0]

      if (preferredVoice) {
        voiceRef.current = preferredVoice
        console.log("Selected voice:", preferredVoice.name)
      }
    }

    selectVoice()
    
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = selectVoice
    }
  }, [])

  // Process queue
  const processQueue = useCallback(() => {
    if (!enabledRef.current || isSpeaking || queueRef.current.length === 0) return

    const text = queueRef.current.shift()
    if (!text) return

    const synth = window.speechSynthesis
    if (!synth) return

    const utterance = new SpeechSynthesisUtterance(text)
    currentUtteranceRef.current = utterance
    
    if (voiceRef.current) {
      utterance.voice = voiceRef.current
    }

    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      currentUtteranceRef.current = null
      // Process next in queue
      setTimeout(() => processQueue(), 100)
    }

    utterance.onerror = (event) => {
      console.log("Speech error:", event.error)
      setIsSpeaking(false)
      currentUtteranceRef.current = null
      // Continue with queue even if there's an error
      setTimeout(() => processQueue(), 100)
    }

    synth.speak(utterance)
  }, [enabled, isSpeaking])

  const speak = useCallback((text: string) => {
    if (!enabledRef.current) {
      console.log("[TTS] Speak called but TTS is disabled")
      return
    }
    
    const synth = window.speechSynthesis
    if (!synth) {
      console.log("[TTS] Speech synthesis not available")
      return
    }

    console.log("[TTS] Adding to queue:", text.substring(0, 50) + "...")
    
    // Add to queue
    queueRef.current.push(text)
    
    // Start processing if not already speaking
    if (!isSpeaking) {
      console.log("[TTS] Starting queue processing")
      processQueue()
    } else {
      console.log("[TTS] Already speaking, queued message")
    }
  }, [isSpeaking, processQueue])

  const stop = useCallback(() => {
    const synth = window.speechSynthesis
    if (!synth) return

    synth.cancel()
    queueRef.current = []
    setIsSpeaking(false)
    currentUtteranceRef.current = null
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    supported,
  }
}
