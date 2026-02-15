import { useState } from "react"
import { X, Trash2, AlertTriangle, User, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onClearData: () => void
  therapistName: string
  onTherapistNameChange: (name: string) => void
  ttsEnabled: boolean
  onTTSEnabledChange: (enabled: boolean) => void
}

export function SettingsDialog({
  isOpen,
  onClose,
  onClearData,
  therapistName,
  onTherapistNameChange,
  ttsEnabled,
  onTTSEnabledChange,
}: SettingsDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [nameInput, setNameInput] = useState(therapistName)

  const handleClearData = () => {
    onClearData()
    setShowConfirm(false)
    onClose()
  }

  const handleSaveName = () => {
    onTherapistNameChange(nameInput)
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
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

            {/* Content */}
            <div className="p-6 space-y-6">
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
              </div>

              {/* Divider */}
              <div className="h-px bg-linen" />

              {/* Clear Data Section */}
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

              {/* Divider */}
              <div className="h-px bg-linen" />

              {/* About Section */}
              <div className="space-y-2">
                <h3 className="font-medium text-text-primary">About</h3>
                <div className="text-sm text-text-muted space-y-1">
                  <p>AI Therapist</p>
                  <p>Your safe space to talk</p>
                  <p className="text-xs text-text-tertiary mt-2">Built with care</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
