import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import type { Message } from "@/types"

interface MessagesListProps {
  messages: Message[]
  isTyping?: boolean
  isFreshChat?: boolean
  therapistName?: string
  onTriggerBreathing?: () => void
}

export function MessagesList({ messages, isTyping, isFreshChat, therapistName = "Abby", onTriggerBreathing }: MessagesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onTriggerBreathing={onTriggerBreathing} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </AnimatePresence>
      
      {/* Show greeting from therapist in fresh chat mode */}
      {isFreshChat && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 sm:gap-3"
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center shadow-soft">
            <span className="text-white text-xs sm:text-sm font-semibold">{therapistName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-3 text-sm sm:text-[15px] leading-relaxed shadow-soft bg-white text-text-primary border border-linen rounded-2xl rounded-tl-sm">
            Hi from your therapist, {therapistName}. I'm here to listen and support you. How are you feeling today?
          </div>
        </motion.div>
      )}
      
      {/* Show empty state only when not in fresh chat mode and no messages */}
      {!isFreshChat && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4 px-4"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-terracotta/20 to-terracotta/5 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl">💭</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-lg sm:text-xl text-text-primary">Your safe space awaits</h3>
            <p className="text-text-secondary text-sm sm:text-base max-w-sm">
              I'm here to listen. Share whatever is on your mind, and we'll work through it together.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
