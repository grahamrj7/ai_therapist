import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wind, Activity, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoiceRecorder } from "./VoiceRecorder"
import { Button } from "@/components/ui/button"

interface TherapeuticToolbarProps {
  isRecording: boolean
  onToggleRecording: () => void
  onOpenActivity: (activity: string) => void
  activeActivity: string | null
  onCloseActivity: () => void
}

const ACTIVITIES = [
  { id: "breathing", label: "Box Breathing", icon: Wind, description: "Calm your mind with rhythmic breathing" },
]

export function TherapeuticToolbar({ 
  isRecording, 
  onToggleRecording,
  onOpenActivity,
  activeActivity,
  onCloseActivity
}: TherapeuticToolbarProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleActivityClick = (activityId: string) => {
    onOpenActivity(activityId)
    setShowMenu(false)
  }

  return (
    <div className="relative w-full">
      {/* Main toolbar - 3 columns: spacer | mic | activities */}
      <div className="grid grid-cols-3 items-center">
        {/* Left spacer */}
        <div />

        {/* Voice Recorder - Center */}
        <div className="flex justify-center">
          <VoiceRecorder 
            isRecording={isRecording} 
            onToggle={onToggleRecording} 
          />
        </div>

        {/* Therapeutic Exercises - Right */}
        <div className="flex justify-end pr-2">
          <AnimatePresence mode="wait">
            {activeActivity ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key="close-btn"
              >
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onCloseActivity}
                  className="rounded-full h-12 w-12 border-terracotta/30 hover:bg-terracotta/10"
                >
                  <X className="h-5 w-5 text-terracotta" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key="menu-btn"
                className="relative"
              >
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-full border transition-all duration-200 bg-white",
                    showMenu 
                      ? "border-terracotta shadow-md" 
                      : "border-linen hover:border-terracotta/50 hover:shadow-sm"
                  )}
                >
                  <Activity className="h-4 w-4 text-terracotta" />
                  <span className="text-sm font-medium text-text-primary">Activities</span>
                </button>

                {/* Activity Menu Dropdown */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-2xl shadow-xl border border-linen p-2 z-50"
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
                          <div className="h-10 w-10 rounded-full bg-terracotta/10 flex items-center justify-center group-hover:bg-terracotta/20 transition-colors">
                            <activity.icon className="h-5 w-5 text-terracotta" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-text-primary">{activity.label}</p>
                            <p className="text-xs text-text-muted">{activity.description}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop to close menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}