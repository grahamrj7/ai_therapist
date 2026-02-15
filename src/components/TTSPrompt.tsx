import { useState, useEffect } from "react"
import { Volume2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TTSPromptProps {
  isOpen: boolean
  onEnable: () => void
  onDismiss: () => void
  onNeverAsk: () => void
}

export function TTSPrompt({ isOpen, onEnable, onDismiss, onNeverAsk }: TTSPromptProps) {
  const [progress, setProgress] = useState(100)

  // Auto-dismiss after 10 seconds with progress bar
  useEffect(() => {
    if (!isOpen) return

    setProgress(100)
    const duration = 10000 // 10 seconds
    const interval = 100 // Update every 100ms
    const steps = duration / interval
    const decrement = 100 / steps

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          onDismiss()
          return 0
        }
        return prev - decrement
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isOpen, onDismiss])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-linen overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-sand w-full">
              <motion.div
                className="h-full bg-terracotta"
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-terracotta/10 rounded-full shrink-0">
                  <Volume2 className="h-5 w-5 text-terracotta" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary text-sm">
                    Enable voice responses?
                  </h4>
                  <p className="text-xs text-text-muted mt-1">
                    Let your therapist speak their responses aloud
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={onEnable}
                      className="px-3 py-1.5 bg-terracotta text-white text-xs font-medium rounded-lg hover:bg-terracotta-dark transition-colors"
                    >
                      Enable
                    </button>
                    <button
                      onClick={onDismiss}
                      className="px-3 py-1.5 text-text-secondary text-xs hover:text-text-primary transition-colors"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
                <button
                  onClick={onNeverAsk}
                  className="p-1 text-text-muted hover:text-text-secondary transition-colors"
                  title="Don't ask again"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
