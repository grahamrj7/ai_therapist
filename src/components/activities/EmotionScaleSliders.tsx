import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sliders, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmotionScale {
  id: string
  label: string
  minLabel: string
  maxLabel: string
  value: number
  color: string
}

interface EmotionScaleSlidersProps {
  onClose: () => void
  onSave?: (emotions: EmotionScale[]) => void
  initialEmotions?: EmotionScale[]
  title?: string
}

const DEFAULT_EMOTIONS: Omit<EmotionScale, "value">[] = [
  { 
    id: "anxiety", 
    label: "Anxiety", 
    minLabel: "Calm", 
    maxLabel: "Very Anxious",
    color: "#D4A574"
  },
  { 
    id: "mood", 
    label: "Mood", 
    minLabel: "Low", 
    maxLabel: "Great",
    color: "#A8B5A0"
  },
  { 
    id: "stress", 
    label: "Stress", 
    minLabel: "Relaxed", 
    maxLabel: "Very Stressed",
    color: "#C9897A"
  },
  { 
    id: "energy", 
    label: "Energy", 
    minLabel: "Exhausted", 
    maxLabel: "Energized",
    color: "#C9B8C8"
  },
]

export function EmotionScaleSliders({ 
  onClose, 
  onSave, 
  initialEmotions,
  title = "How are you feeling?" 
}: EmotionScaleSlidersProps) {
  const [emotions, setEmotions] = useState<EmotionScale[]>(() => {
    if (initialEmotions) return initialEmotions
    return DEFAULT_EMOTIONS.map(e => ({ ...e, value: 50 }))
  })
  const [hasChanges, setHasChanges] = useState(false)

  const handleSliderChange = (id: string, value: number) => {
    setEmotions(prev => prev.map(e => 
      e.id === id ? { ...e, value } : e
    ))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave?.(emotions)
    onClose()
  }

  const getTrendIcon = (value: number) => {
    if (value < 40) return <TrendingDown className="h-4 w-4" />
    if (value > 60) return <TrendingUp className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = (value: number) => {
    if (value < 40) return "text-sage"
    if (value > 60) return "text-terracotta"
    return "text-text-muted"
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white z-10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-linen">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-cream"
          >
            <ArrowLeft className="h-5 w-5 text-text-secondary" />
          </Button>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-terracotta" />
            <h2 className="font-semibold text-lg text-text-primary">Emotion Check</h2>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-md mx-auto space-y-6 sm:space-y-8">
          {/* Title */}
          <div className="text-center">
            <h3 className="font-display text-xl sm:text-2xl text-text-primary mb-2">
              {title}
            </h3>
            <p className="text-sm text-text-muted">
              Slide each bar to reflect how you're feeling right now
            </p>
          </div>

          {/* Emotion Sliders */}
          <div className="space-y-5 sm:space-y-6">
            {emotions.map((emotion) => (
              <motion.div
                key={emotion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {/* Label and value */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: emotion.color }}
                    />
                    <span className="font-medium text-text-primary text-sm sm:text-base">
                      {emotion.label}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-1", getTrendColor(emotion.value))}>
                    {getTrendIcon(emotion.value)}
                    <span className="text-sm font-semibold">{emotion.value}%</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={emotion.value}
                    onChange={(e) => handleSliderChange(emotion.id, parseInt(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${emotion.color}40 0%, ${emotion.color} ${emotion.value}%, ${emotion.color}20 ${emotion.value}%, ${emotion.color}20 100%)`,
                    }}
                  />
                  {/* Custom thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2 pointer-events-none transition-transform"
                    style={{
                      left: `calc(${emotion.value}% - 10px)`,
                      borderColor: emotion.color,
                    }}
                  />
                </div>

                {/* Min/Max labels */}
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{emotion.minLabel}</span>
                  <span>{emotion.maxLabel}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick preset buttons */}
          <div className="pt-4 border-t border-linen">
            <p className="text-xs text-text-muted text-center mb-3">Quick presets</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setEmotions(DEFAULT_EMOTIONS.map(e => ({ ...e, value: 30 })))}
                className="px-3 py-1.5 text-xs bg-sage/20 text-text-secondary rounded-full hover:bg-sage/30 transition-colors"
              >
                Feeling Good
              </button>
              <button
                onClick={() => setEmotions(DEFAULT_EMOTIONS.map(e => ({ ...e, value: 70 })))}
                className="px-3 py-1.5 text-xs bg-terracotta/20 text-text-secondary rounded-full hover:bg-terracotta/30 transition-colors"
              >
                Stressed
              </button>
              <button
                onClick={() => setEmotions(DEFAULT_EMOTIONS.map(e => ({ ...e, value: 50 })))}
                className="px-3 py-1.5 text-xs bg-linen text-text-secondary rounded-full hover:bg-cream transition-colors"
              >
                Neutral
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-4 border-t border-linen bg-cream/50">
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
        >
          Save Check-in
        </Button>
        <p className="text-xs text-text-muted text-center mt-2">
          Tracking your emotions helps {emotions[0]?.label ? "understand your patterns" : "you"} over time
        </p>
      </div>
    </motion.div>
  )
}

export { DEFAULT_EMOTIONS }
