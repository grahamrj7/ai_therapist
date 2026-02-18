import { useState, useEffect } from "react"
import { X, Trash2, AlertTriangle, User, Volume2, Mic, Info, Settings2, Database } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface VoiceOption {
  name: string
  lang: string
  local: boolean
}

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onClearData: () => void
  therapistName: string
  onTherapistNameChange: (name: string) => void
  ttsEnabled: boolean
  onTTSEnabledChange: (enabled: boolean) => void
  voiceName?: string
  onVoiceChange?: (voiceName: string) => void
}

export function SettingsDialog({
  isOpen,
  onClose,
  onClearData,
  therapistName,
  onTherapistNameChange,
  ttsEnabled,
  onTTSEnabledChange,
  voiceName,
  onVoiceChange,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about'>('general')
  const [showConfirm, setShowConfirm] = useState(false)
  const [nameInput, setNameInput] = useState(therapistName)
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([])
  
  // Allowed voices - must be exact matches from this list only
  const allowedVoiceNames = [
    'Moira', 'Daniel', 'Eddy', 'Flo', 'Karen', 
    'Ralph', 'Reed', 'Samantha', 'Google US English'
  ]

  // Reset tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('general')
    }
  }, [isOpen])

  // Update input when dialog opens or therapistName changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(therapistName)
    }
  }, [isOpen, therapistName])

  // Load available voices
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return

    const loadVoices = () => {
      const voices = synth.getVoices()
      console.log('[Settings] Total voices available:', voices.length)
      
      // Filter to only English voices that contain one of the allowed names
      const filteredVoices = voices
        .filter(v => {
          // Must be English
          if (!v.lang.startsWith('en')) return false
          
          // Must match one of the allowed voice names
          return allowedVoiceNames.some(allowed => v.name.includes(allowed))
        })
        .map(v => ({
          name: v.name,
          lang: v.lang,
          local: v.localService
        }))
      
      // Remove duplicates by name
      const uniqueVoices = filteredVoices.filter((voice, index, self) => 
        index === self.findIndex((v) => v.name === voice.name)
      )
      
      console.log('[Settings] Filtered voices:', uniqueVoices.length)
      setAvailableVoices(uniqueVoices)
    }

    // Load voices immediately if available
    if (synth.getVoices().length > 0) {
      loadVoices()
    }
    
    // Also set up the event listener for when voices load
    synth.onvoiceschanged = loadVoices
    
    // Fallback: try loading after a short delay
    const timeoutId = setTimeout(() => {
      if (availableVoices.length === 0) {
        console.log('[Settings] Retrying voice load after delay...')
        loadVoices()
      }
    }, 500)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const handleClearData = () => {
    onClearData()
    setShowConfirm(false)
    onClose()
  }

  const handleSaveName = () => {
    onTherapistNameChange(nameInput)
  }

  const previewVoice = (voiceNameToPreview: string) => {
    const synth = window.speechSynthesis
    if (!synth) return

    synth.cancel()
    
    // Auto-select this voice when previewing
    onVoiceChange?.(voiceNameToPreview)
    
    const utterance = new SpeechSynthesisUtterance(`Hi, I'm ${therapistName}. This is how I'll sound.`)
    const voice = synth.getVoices().find(v => v.name === voiceNameToPreview)
    if (voice) {
      utterance.voice = voice
    }
    
    synth.speak(utterance)
  }

  const playTestTone = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 440
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)

      console.log('Test tone played successfully')
    } catch (error) {
      console.error('Failed to play test tone:', error)
      alert('Audio test failed. Please check your browser audio settings.')
    }
  }

  const playTestSpeech = () => {
    try {
      console.log('[Test Speech] Starting test...')
      const synth = window.speechSynthesis
      if (!synth) {
        console.error('[Test Speech] Speech synthesis not supported')
        alert('Speech synthesis not supported in this browser')
        return
      }

      console.log('[Test Speech] Browser:', navigator.userAgent)
      
      // CRITICAL CHROME FIX: Resume audio context first
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const audioCtx = new AudioContext()
        if (audioCtx.state === 'suspended') {
          audioCtx.resume()
        }
      }

      // Chrome fix: Always cancel first to clear any stuck state
      synth.cancel()
      
      // Small delay after cancel
      setTimeout(() => {
        console.log('[Test Speech] Synth state after cancel:', {
          speaking: synth.speaking,
          pending: synth.pending,
          paused: synth.paused
        })

        const voices = synth.getVoices()
        console.log('[Test Speech] Available voices:', voices.length)

        if (voices.length === 0) {
          console.error('[Test Speech] No voices available!')
          alert('No speech voices available.')
          return
        }

        const utterance = new SpeechSynthesisUtterance(`This is a test. I am ${therapistName}. Can you hear me?`)
        
        // Use a local voice if available (more reliable in Chrome)
        const localVoice = voices.find(v => 
          v.lang.startsWith('en') && v.localService === true
        )
        
        const preferredVoice = localVoice || voices.find(v =>
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0]

        if (preferredVoice) {
          utterance.voice = preferredVoice
          console.log('[Test Speech] Using voice:', preferredVoice.name, 'local:', preferredVoice.localService)
        }

        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = 1

        let hasStarted = false
        
        utterance.onstart = () => {
          hasStarted = true
          console.log('[Test Speech] ✅ Started successfully')
        }
        
        utterance.onend = () => {
          console.log('[Test Speech] ✅ Ended successfully')
        }
        
        utterance.onerror = (event) => {
          if (!hasStarted && event.error === 'canceled') {
            console.log('[Test Speech] ⚠️ Canceled before starting - Chrome autoplay blocked')
            alert('Speech blocked by Chrome. Try clicking directly on this button (not the Settings dialog), or refresh and try again.')
          } else {
            console.error('[Test Speech] ❌ Error:', event.error, 'charIndex:', event.charIndex, 'elapsed:', event.elapsedTime)
          }
        }

        console.log('[Test Speech] Calling synth.speak()...')
        synth.speak(utterance)
        
        // Chrome keep-alive: speak empty string every 10 seconds
        const keepAlive = setInterval(() => {
          if (!synth.speaking) {
            clearInterval(keepAlive)
          } else {
            synth.pause()
            synth.resume()
          }
        }, 10000)
      }, 100)

    } catch (error) {
      console.error('[Test Speech] Exception:', error)
    }
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings2 },
    { id: 'data' as const, label: 'Data', icon: Database },
    { id: 'about' as const, label: 'About', icon: Info },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-linen">
              <h2 className="font-display text-xl text-text-primary">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-sand rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-linen">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-terracotta border-b-2 border-terracotta bg-terracotta/5'
                      : 'text-text-secondary hover:text-text-primary hover:bg-sand/50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Therapist Name Section */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-text-primary">Therapist Name</h3>
                    <p className="text-sm text-text-muted">
                      Customize your therapist's name. This is what they'll be called during your conversations.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <Input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Enter therapist name"
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={handleSaveName} size="sm">
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linen" />

                  {/* Voice Responses Section */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-text-primary">Voice Responses</h3>
                    <p className="text-sm text-text-muted">
                      Enable your therapist to speak responses aloud.
                    </p>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-text-secondary">Enable voice</span>
                      <button
                        onClick={() => onTTSEnabledChange(!ttsEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          ttsEnabled ? 'bg-terracotta' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            ttsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Test buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playTestTone}
                        className="flex-1"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Test Tone
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playTestSpeech}
                        className="flex-1"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Test Speech
                      </Button>
                    </div>

                    {/* Voice Selection - only show when TTS is enabled */}
                    {ttsEnabled && availableVoices.length > 0 && onVoiceChange && (
                      <div className="space-y-3 pt-4 border-t border-linen">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
                          <Mic className="h-4 w-4 text-terracotta" />
                          Voice
                        </label>
                        <div className="max-h-40 overflow-y-auto space-y-1 border border-linen rounded-lg p-2">
                          {availableVoices.map((voice) => (
                            <div
                              key={voice.name}
                              onClick={() => onVoiceChange(voice.name)}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                voiceName === voice.name
                                  ? 'bg-terracotta/10 border border-terracotta'
                                  : 'hover:bg-cream border border-transparent'
                              }`}
                            >
                              <div>
                                <p className="font-medium text-text-primary text-sm">{voice.name}</p>
                                <p className="text-xs text-text-muted">{voice.lang}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  previewVoice(voice.name)
                                }}
                                className="p-1.5 hover:bg-white rounded-full transition-colors"
                                title="Preview voice"
                              >
                                <Volume2 className="h-4 w-4 text-terracotta" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-text-primary">Data Management</h3>
                    <p className="text-sm text-text-muted">
                      Clear all your conversation history and session data. This action cannot be undone.
                    </p>

                    {!showConfirm ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirm(true)}
                        className="w-full border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-destructive">Are you sure?</p>
                            <p className="text-sm text-text-secondary">
                              This will permanently delete all your conversations and cannot be undone.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowConfirm(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleClearData}
                            className="flex-1"
                          >
                            Yes, Clear All
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <h3 className="font-display text-xl text-text-primary mb-2">AI Therapist</h3>
                    <p className="text-text-secondary mb-4">Your safe space to talk</p>
                    <div className="text-sm text-text-muted space-y-1">
                      <p>Version 1.0</p>
                      <p>Built with care</p>
                    </div>
                  </div>
                  
                  <div className="bg-cream rounded-xl p-4">
                    <h4 className="font-medium text-text-primary mb-2">Features</h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Personalized AI therapy sessions</li>
                      <li>• Voice responses with multiple voice options</li>
                      <li>• Speech-to-text for hands-free conversations</li>
                      <li>• Private and secure</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
