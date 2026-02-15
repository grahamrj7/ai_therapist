import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { VoiceRecorder } from "./VoiceRecorder"
import { cn } from "@/lib/utils"

interface InputAreaProps {
  onSendMessage: (message: string) => void
  isTyping?: boolean
  isRecording?: boolean
  onToggleRecording?: () => void
  interimText?: string
  therapistName?: string
}

const QUICK_ACTIONS = [
  "I'm feeling anxious",
  "I need to vent",
  "Help me process this",
  "Just checking in",
]

export function InputArea({ 
  onSendMessage, 
  isTyping, 
  isRecording, 
  onToggleRecording,
  interimText,
  therapistName = "Abby"
}: InputAreaProps) {
  const [input, setInput] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(true)

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    onSendMessage(input)
    setInput("")
    setShowQuickActions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (action: string) => {
    onSendMessage(action)
    setShowQuickActions(false)
  }

  return (
    <div className="bg-white border-t border-linen px-6 py-5 space-y-4">
      {/* Voice Recorder - Centered above input */}
      <div className="flex justify-center pb-2">
        <VoiceRecorder 
          isRecording={isRecording || false} 
          onToggle={onToggleRecording || (() => {})} 
        />
      </div>

      {/* Quick Actions */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="px-4 py-2 text-sm text-text-secondary bg-cream border border-linen rounded-full hover:bg-sand hover:border-terracotta-light transition-all duration-200"
              >
                {action}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Input */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Input
            value={interimText || input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share how you're feeling..."
            disabled={isTyping || isRecording}
            className="pr-12 py-6 text-base"
          />
          <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-terracotta/40" />
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className={cn(
            "h-12 px-6 rounded-xl transition-all duration-300",
            !input.trim() && "opacity-50"
          )}
        >
          <Send className="h-5 w-5 mr-2" />
          Send
        </Button>
      </div>

      <p className="text-center text-xs text-text-muted">
        {therapistName} is here to listen and support you. For emergencies, please contact emergency services.
      </p>
    </div>
  )
}
