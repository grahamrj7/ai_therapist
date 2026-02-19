import { motion } from "framer-motion"
import { Wind } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message } from "@/types"

interface MessageBubbleProps {
  message: Message
  onTriggerBreathing?: () => void
}

// Keywords that indicate the bot is suggesting the breathing exercise
const BREATHING_KEYWORDS = [
  "breathing exercise",
  "box breathing",
  "try breathing",
  "breathing technique",
  "guided breathing",
  "deep breathing",
]

// Check if the message suggests the breathing exercise
function suggestsBreathing(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return BREATHING_KEYWORDS.some(keyword => lowerContent.includes(keyword))
}

export function MessageBubble({ message, onTriggerBreathing }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const showBreathingButton = !isUser && onTriggerBreathing && suggestsBreathing(message.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && (
        <Avatar className="h-10 w-10 shrink-0 shadow-soft">
          <AvatarFallback className="bg-gradient-to-br from-terracotta to-terracotta-dark text-white text-sm font-semibold">
            A
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col gap-2 max-w-[75%]">
        <div
          className={cn(
            "px-5 py-3.5 text-[15px] leading-relaxed shadow-soft",
            isUser
              ? "bg-terracotta text-white rounded-2xl rounded-tr-sm"
              : "bg-white text-text-primary border border-linen rounded-2xl rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
        
        {/* Breathing Exercise Button */}
        {showBreathingButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onTriggerBreathing}
            className="flex items-center gap-2 self-start px-4 py-2 bg-terracotta/10 hover:bg-terracotta/20 text-terracotta rounded-full text-sm font-medium transition-colors border border-terracotta/20"
          >
            <Wind className="h-4 w-4" />
            Start Breathing Exercise
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}