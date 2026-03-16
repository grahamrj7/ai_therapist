import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Plus, X, Trash2, Save, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { loadJournalEntries, saveJournalEntry, deleteJournalEntry, type JournalEntry } from "@/lib/db"

interface JournalProps {
  userId: string
  onClose: () => void
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatPreview(content: string): string {
  if (content.length <= 100) return content
  return content.substring(0, 100) + "..."
}

export function Journal({ userId, onClose }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [userId])

  async function loadEntries() {
    setLoading(true)
    const data = await loadJournalEntries(userId)
    setEntries(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!editContent.trim()) return
    
    setSaving(true)
    const saved = await saveJournalEntry(userId, {
      id: selectedEntry?.id,
      title: editTitle.trim() || null,
      content: editContent,
    })
    
    if (saved) {
      await loadEntries()
      setSelectedEntry(saved)
      setIsEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!selectedEntry) return
    
    setDeleting(true)
    const deleted = await deleteJournalEntry(selectedEntry.id)
    
    if (deleted) {
      await loadEntries()
      setSelectedEntry(null)
    }
    setDeleting(false)
  }

  function handleNewEntry() {
    setSelectedEntry(null)
    setEditTitle("")
    setEditContent("")
    setIsEditing(true)
  }

  function handleEditEntry(entry: JournalEntry) {
    setSelectedEntry(entry)
    setEditTitle(entry.title || "")
    setEditContent(entry.content)
    setIsEditing(true)
  }

  function handleCancelEdit() {
    if (selectedEntry) {
      setEditTitle(selectedEntry.title || "")
      setEditContent(selectedEntry.content)
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    )
  }

  // Editing/New Entry View
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white z-10 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-linen">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelEdit}
            className="rounded-full hover:bg-cream"
          >
            <ChevronLeft className="h-5 w-5 text-text-secondary" />
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg text-text-primary">
              {selectedEntry ? "Edit Entry" : "New Entry"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-cream"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-lg mx-auto space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full text-xl font-semibold border-none outline-none bg-transparent placeholder:text-text-muted"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="min-h-[300px] resize-none border-linen focus:border-terracotta focus:ring-terracotta/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-linen bg-cream/50 flex gap-3">
          {selectedEntry && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !editContent.trim()}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </motion.div>
    )
  }

  // List View
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white z-10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-linen">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-terracotta" />
          <h2 className="font-semibold text-lg text-text-primary">Journal</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewEntry}
            className="rounded-full hover:bg-cream"
          >
            <Plus className="h-5 w-5 text-terracotta" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-cream"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="font-medium text-text-primary mb-2">No journal entries yet</h3>
            <p className="text-sm text-text-muted mb-4">
              Start writing to capture your thoughts and reflections
            </p>
            <Button onClick={handleNewEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Write First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-w-lg mx-auto">
            {entries.map((entry) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleEditEntry(entry)}
                className="w-full text-left p-4 rounded-xl border border-linen hover:border-terracotta/30 hover:bg-cream/50 transition-colors group"
              >
                {entry.title && (
                  <h4 className="font-medium text-text-primary mb-1 group-hover:text-terracotta">
                    {entry.title}
                  </h4>
                )}
                <p className="text-sm text-text-muted mb-2">
                  {formatPreview(entry.content)}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatDate(entry.created_at)}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="px-4 sm:px-6 py-4 border-t border-linen bg-cream/50">
          <Button onClick={handleNewEntry} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
      )}
    </motion.div>
  )
}
