import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface VoiceRecorderProps {
  isRecording: boolean
  onToggle: () => void
}

export function VoiceRecorder({ isRecording, onToggle }: VoiceRecorderProps) {
  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-destructive/30"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-0 rounded-full bg-destructive/20"
            />
          </>
        )}
      </AnimatePresence>
      
      <Button
        size="icon-lg"
        variant={isRecording ? "destructive" : "default"}
        onClick={onToggle}
        className={cn(
          "relative rounded-full h-16 w-16 shadow-glow transition-all duration-300",
          isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "hover:shadow-glow-lg hover:-translate-y-0.5"
        )}
      >
        {isRecording ? (
          <Square className="h-6 w-6 fill-current" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="text-sm text-destructive font-medium">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
