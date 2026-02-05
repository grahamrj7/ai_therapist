import { useState, useEffect, useCallback } from "react"

interface UseTextToSpeechReturn {
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  supported: boolean
}

export function useTextToSpeech(onEnd?: () => void): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const synth = window.speechSynthesis
    
    if (!synth) {
      setSupported(false)
      return
    }

    const loadVoices = () => {
      const voices = synth.getVoices()
      const preferredVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.includes('Samantha') || voice.name.includes('Karen') || voice.name.includes('Google'))
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0]
      
      setSelectedVoice(preferredVoice)
    }

    loadVoices()
    
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices
    }
  }, [])

  const speak = useCallback((text: string) => {
    const synth = window.speechSynthesis
    
    if (!synth || !supported) {
      console.log("TTS not supported or synth not available")
      return
    }

    console.log("Speaking:", text.substring(0, 50) + "...")

    // Cancel any ongoing speech
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.rate = 1.1
    utterance.pitch = 1.05
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    utterance.onerror = () => setIsSpeaking(false)

    synth.speak(utterance)
  }, [selectedVoice, supported, onEnd])

  const stop = useCallback(() => {
    const synth = window.speechSynthesis
    if (synth) {
      synth.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    supported,
  }
}
