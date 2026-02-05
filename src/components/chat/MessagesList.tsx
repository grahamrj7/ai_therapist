import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import type { Message } from "@/types"

interface MessagesListProps {
  messages: Message[]
  isTyping?: boolean
  isFreshChat?: boolean
}

export function MessagesList({ messages, isTyping, isFreshChat }: MessagesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </AnimatePresence>
      
      {/* Show greeting from Abby in fresh chat mode */}
      {isFreshChat && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center shadow-soft">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <div className="max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed shadow-soft bg-white text-text-primary border border-linen rounded-2xl rounded-tl-sm">
            Hi from your therapist, Abby. I'm here to listen and support you. How are you feeling today?
          </div>
        </motion.div>
      )}
      
      {/* Show empty state only when not in fresh chat mode and no messages */}
      {!isFreshChat && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta/20 to-terracotta/5 flex items-center justify-center">
            <span className="text-3xl">💭</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl text-text-primary">Your safe space awaits</h3>
            <p className="text-text-secondary max-w-sm">
              I'm here to listen. Share whatever is on your mind, and we'll work through it together.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
