import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Wind, Play, Pause, ArrowLeft, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BreathingExerciseProps {
  onClose: () => void
  voiceName?: string
}

type BreathingPhase = "inhale" | "hold" | "exhale" | "hold2"

const PHASE_DURATION = 4 // seconds

export function BreathingExercise({ onClose, voiceName }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathingPhase>("inhale")
  const [cycleCount, setCycleCount] = useState(0)
  const [secondsRemaining, setSecondsRemaining] = useState(PHASE_DURATION)
  const [isMuted, setIsMuted] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prevPhaseRef = useRef<BreathingPhase | null>(null)

  // Clear all timers
  const clearTimers = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current)
      phaseTimerRef.current = null
    }
  }

  // Start countdown timer
  const startCountdown = () => {
    setSecondsRemaining(PHASE_DURATION)
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return PHASE_DURATION
        }
        return prev - 1
      })
    }, 1000)
  }

  // Phase transition effect
  useEffect(() => {
    if (!isActive) {
      clearTimers()
      return
    }

    // Start countdown
    startCountdown()

    // Set up phase transition
    phaseTimerRef.current = setTimeout(() => {
      const phaseOrder: BreathingPhase[] = ["inhale", "hold", "exhale", "hold2"]
      const currentIndex = phaseOrder.indexOf(phase)
      const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length]
      
      if (nextPhase === "inhale") {
        setCycleCount((prev) => prev + 1)
      }
      
      setPhase(nextPhase)
    }, PHASE_DURATION * 1000)

    return () => {
      clearTimers()
    }
  }, [isActive, phase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
      // Cancel any ongoing speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleToggle = () => {
    if (isActive) {
      // Pausing
      clearTimers()
      setIsActive(false)
      prevPhaseRef.current = null
      // Cancel any ongoing speech when pausing
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } else {
      // Starting
      setIsActive(true)
      setPhase("inhale")
      setSecondsRemaining(PHASE_DURATION)
      prevPhaseRef.current = null
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted && window.speechSynthesis) {
      // If unmuting, cancel any ongoing speech
      window.speechSynthesis.cancel()
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In"
      case "hold":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      case "hold2":
        return "Hold"
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "bg-terracotta"
      case "hold":
      case "hold2":
        return "bg-terracotta-dark"
      case "exhale":
        return "bg-sage"
    }
  }

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale":
        return "Inhale slowly through your nose"
      case "hold":
        return "Hold your breath gently"
      case "exhale":
        return "Exhale slowly through your mouth"
      case "hold2":
        return "Rest before the next breath"
    }
  }

  // Text-to-speech for breathing guidance
  const speakPhase = (phaseToSpeak: BreathingPhase) => {
    if (isMuted || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const text = getPhaseTextForSpeech(phaseToSpeak)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85 // Slightly slower for breathing guidance
    utterance.pitch = 1
    utterance.volume = 0.8

    // Use the user's selected voice if available
    const voices = window.speechSynthesis.getVoices()
    if (voiceName) {
      const selectedVoice = voices.find(v => v.name === voiceName)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  const getPhaseTextForSpeech = (phase: BreathingPhase) => {
    const greetings = ["Let's begin", "Here we go", "Starting now"]
    const inhalePhrases = ["Breathe in slowly", "Take a deep breath in", "Inhale gently"]
    const holdPhrases = ["Hold it there", "Pause and hold", "Stay with this moment"]
    const exhalePhrases = ["Breathe out slowly", "Release and exhale", "Let it all out"]
    
    switch (phase) {
      case "inhale":
        // Use greeting on first cycle, otherwise random inhale phrase
        if (cycleCount === 0 && prevPhaseRef.current === null) {
          return greetings[Math.floor(Math.random() * greetings.length)] + ". " + inhalePhrases[Math.floor(Math.random() * inhalePhrases.length)]
        }
        return inhalePhrases[Math.floor(Math.random() * inhalePhrases.length)]
      case "hold":
        return holdPhrases[Math.floor(Math.random() * holdPhrases.length)]
      case "exhale":
        return exhalePhrases[Math.floor(Math.random() * exhalePhrases.length)]
      case "hold2":
        return holdPhrases[Math.floor(Math.random() * holdPhrases.length)]
    }
  }

  // Speak when phase changes
  useEffect(() => {
    if (isActive && phase !== prevPhaseRef.current) {
      speakPhase(phase)
      prevPhaseRef.current = phase
    }
  }, [phase, isActive])

  // Speak when starting the exercise
  useEffect(() => {
    if (isActive && prevPhaseRef.current === null) {
      speakPhase(phase)
      prevPhaseRef.current = phase
    }
  }, [isActive])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white z-10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-linen">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-cream"
          >
            <ArrowLeft className="h-5 w-5 text-text-secondary" />
          </Button>
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-terracotta" />
            <h2 className="font-semibold text-lg text-text-primary">Box Breathing</h2>
          </div>
        </div>
        
        {/* Mute Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="rounded-full hover:bg-cream"
          title={isMuted ? "Unmute guidance" : "Mute guidance"}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-text-secondary" />
          ) : (
            <Volume2 className="h-5 w-5 text-text-secondary" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Breathing Circle */}
        <div className="relative w-72 h-72 mb-12">
          {/* Outer rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className={cn(
                "absolute inset-0 rounded-full border-2 border-terracotta/20",
                isActive && phase === "inhale" && "border-terracotta/40"
              )}
              animate={
                isActive
                  ? {
                      scale: phase === "inhale" ? 1 + ring * 0.1 : phase === "exhale" ? 1 : 1 + ring * 0.05,
                      opacity: phase === "hold" || phase === "hold2" ? 0.3 : 0.6 - ring * 0.15,
                    }
                  : { scale: 1, opacity: 0.2 }
              }
              transition={{ duration: PHASE_DURATION, ease: "easeInOut" }}
            />
          ))}

          {/* Main circle */}
          <motion.div
            className={cn(
              "absolute inset-6 rounded-full flex flex-col items-center justify-center transition-colors duration-1000 shadow-lg",
              getPhaseColor()
            )}
            animate={
              isActive
                ? {
                    scale: phase === "inhale" ? 1.3 : phase === "exhale" ? 1 : 1.15,
                  }
                : { scale: 1 }
            }
            transition={{ duration: PHASE_DURATION, ease: "easeInOut" }}
          >
            <span className="text-white font-semibold text-2xl mb-2">
              {isActive ? getPhaseText() : "Ready?"}
            </span>
            {isActive ? (
              <span className="text-white text-5xl font-bold tabular-nums">
                {secondsRemaining}
              </span>
            ) : (
              <span className="text-white/80 text-sm font-medium">
                4 seconds each
              </span>
            )}
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.p
          key={isActive ? phase : "ready"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-text-secondary text-lg mb-8 text-center max-w-md"
        >
          {isActive ? getPhaseInstruction() : "A simple technique to calm your mind and reduce stress. Breathe in for 4, hold for 4, breathe out for 4, hold for 4."}
        </motion.p>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <Button
            onClick={handleToggle}
            size="lg"
            className={cn(
              "gap-2 px-8 py-6 text-lg rounded-full transition-all",
              isActive 
                ? "bg-sage hover:bg-sage/90" 
                : "bg-terracotta hover:bg-terracotta/90"
            )}
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start Exercise
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        {cycleCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex items-center gap-2 text-text-muted"
          >
            <span className="text-2xl font-semibold text-terracotta">{cycleCount}</span>
            <span className="text-sm">{cycleCount === 1 ? "cycle" : "cycles"} completed</span>
          </motion.div>
        )}
      </div>

      {/* Footer tip */}
      <div className="px-6 py-4 border-t border-linen bg-cream/50">
        <p className="text-xs text-text-muted text-center">
          Tip: Box breathing is used by Navy SEALs to stay calm under pressure. It helps reduce stress and improve focus.
        </p>
      </div>
    </motion.div>
  )
}