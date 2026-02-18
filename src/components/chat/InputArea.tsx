import { useState } from "react"
import { Send, Sparkles, Wind, Activity } from "lucide-react"
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
  onOpenActivity?: (activity: string) => void
}

const QUICK_ACTIONS = [
  "I'm feeling anxious",
  "I need to vent",
  "Help me process this",
  "Just checking in",
]

const ACTIVITIES = [
  { id: "breathing", label: "Breathe", icon: Wind, description: "Box breathing exercise" },
]

export function InputArea({ 
  onSendMessage, 
  isTyping, 
  isRecording, 
  onToggleRecording,
  interimText,
  therapistName = "Abby",
  onOpenActivity
}: InputAreaProps) {
  const [input, setInput] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [showActivitiesMenu, setShowActivitiesMenu] = useState(false)

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

  const handleActivityClick = (activityId: string) => {
    onOpenActivity?.(activityId)
    setShowActivitiesMenu(false)
  }

  return (
    <div className="bg-white border-t border-linen px-6 py-5 space-y-4">
      {/* Toolbar: Voice Recorder (center) + Activities (right) */}
      <div className="grid grid-cols-3 items-center">
        {/* Left - Empty spacer */}
        <div />

        {/* Center - Voice Recorder */}
        <div className="flex justify-center">
          <VoiceRecorder 
            isRecording={isRecording || false} 
            onToggle={onToggleRecording || (() => {})} 
          />
        </div>

        {/* Right - Activities Button */}
        <div className="flex justify-end relative">
          {onOpenActivity && (
            <div className="relative">
              <button
                onClick={() => setShowActivitiesMenu(!showActivitiesMenu)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200",
                  showActivitiesMenu 
                    ? "bg-terracotta text-white border-terracotta" 
                    : "bg-cream text-text-secondary border-linen hover:bg-sand hover:border-terracotta-light"
                )}
              >
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Activities</span>
              </button>

              {/* Activities Dropdown Menu */}
              <AnimatePresence>
                {showActivitiesMenu && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setShowActivitiesMenu(false)}
                    />
                    
                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-2xl shadow-xl border border-linen p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-linen mb-2">
                        <h4 className="font-semibold text-sm text-text-primary">Therapeutic Activities</h4>
                        <p className="text-xs text-text-muted">Take a moment for yourself</p>
                      </div>
                      {ACTIVITIES.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => handleActivityClick(activity.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-colors text-left group"
                        >
                          <div className="h-9 w-9 rounded-full bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta/20 transition-colors">
                            <activity.icon className="h-4 w-4 text-terracotta" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-text-primary">{activity.label}</p>
                            <p className="text-xs text-text-muted">{activity.description}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
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