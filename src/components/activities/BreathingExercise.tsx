import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wind, Play, Pause, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BreathingExerciseProps {
  onClose: () => void
}

type BreathingPhase = "inhale" | "hold" | "exhale" | "hold2"

export function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<BreathingPhase>("inhale")
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const phaseDurations: Record<BreathingPhase, number> = {
      inhale: 4000,
      hold: 4000,
      exhale: 4000,
      hold2: 4000,
    }

    const timer = setTimeout(() => {
      const phaseOrder: BreathingPhase[] = ["inhale", "hold", "exhale", "hold2"]
      const currentIndex = phaseOrder.indexOf(phase)
      const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length]
      
      if (nextPhase === "inhale") {
        setCycleCount((prev) => prev + 1)
      }
      
      setPhase(nextPhase)
    }, phaseDurations[phase])

    return () => clearTimeout(timer)
  }, [isActive, phase])

  useEffect(() => {
    return () => {
      setIsActive(false)
      setPhase("inhale")
    }
  }, [])

  const handleToggle = () => {
    setIsActive(!isActive)
    if (!isActive) {
      setPhase("inhale")
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white z-10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-linen">
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
              transition={{ duration: 4, ease: "easeInOut" }}
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
            transition={{ duration: 4, ease: "easeInOut" }}
          >
            <span className="text-white font-semibold text-2xl mb-1">
              {isActive ? getPhaseText() : "Ready?"}
            </span>
            {isActive && (
              <span className="text-white/80 text-sm font-medium">
                4 seconds
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