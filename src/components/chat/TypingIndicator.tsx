import { motion } from "framer-motion"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-3"
    >
      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center shadow-soft">
        <span className="text-white text-sm font-semibold">A</span>
      </div>
      
      <div className="bg-white border border-linen rounded-2xl rounded-tl-sm px-5 py-4 shadow-soft">
        <div className="flex gap-1.5 items-center">
          <motion.span
            className="w-2 h-2 bg-terracotta rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-terracotta rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-2 h-2 bg-terracotta rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
