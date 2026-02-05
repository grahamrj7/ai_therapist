import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message } from "@/types"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

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
      
      <div
        className={cn(
          "max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed shadow-soft",
          isUser
            ? "bg-terracotta text-white rounded-2xl rounded-tr-sm"
            : "bg-white text-text-primary border border-linen rounded-2xl rounded-tl-sm"
        )}
      >
        {message.content}
      </div>
    </motion.div>
  )
}
