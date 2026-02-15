import { useState } from "react"
import { X, Trash2, AlertTriangle, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onClearData: () => void
  therapistName: string
  onTherapistNameChange: (name: string) => void
}

export function SettingsDialog({
  isOpen,
  onClose,
  onClearData,
  therapistName,
  onTherapistNameChange,
}: SettingsDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [nameInput, setNameInput] = useState(therapistName)

  const handleClearData = () => {
    onClearData()
    setShowConfirm(false)
    onClose()
  }

  const handleSaveName = () => {
    onTherapistNameChange(nameInput)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-linen">
              <h2 className="font-display text-xl text-text-primary">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-sand rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Therapist Name Section */}
              <div className="space-y-3">
                <h3 className="font-medium text-text-primary">Therapist Name</h3>
                <p className="text-sm text-text-muted">
                  Customize your therapist's name. This is what they'll be called during your conversations.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter therapist name"
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSaveName} size="sm">
                    Save
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-linen" />

              {/* Clear Data Section */}
              <div className="space-y-3">
                <h3 className="font-medium text-text-primary">Data Management</h3>
                <p className="text-sm text-text-muted">
                  Clear all your conversation history and session data. This action cannot be undone.
                </p>

                {!showConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirm(true)}
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Are you sure?</p>
                        <p className="text-sm text-text-secondary">
                          This will permanently delete all your conversations and cannot be undone.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearData}
                        className="flex-1"
                      >
                        Yes, Clear All
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-linen" />

              {/* About Section */}
              <div className="space-y-2">
                <h3 className="font-medium text-text-primary">About</h3>
                <div className="text-sm text-text-muted space-y-1">
                  <p>AI Therapist</p>
                  <p>Your safe space to talk</p>
                  <p className="text-xs text-text-tertiary mt-2">Built with care</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
