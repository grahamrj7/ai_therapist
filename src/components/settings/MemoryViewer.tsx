import { useState, useEffect, useMemo } from "react"
import { Trash2, Eye, X, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Memory, MemoryCategory } from "@/types/memory"
import { loadMemories, deleteMemory } from "@/lib/db"

interface MemoryViewerProps {
  userId: string
  onClose: () => void
}

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  personal: "Personal",
  topic: "Topics",
  emotion: "Emotions",
  preference: "Preferences",
}

const CATEGORY_COLORS: Record<MemoryCategory, string> = {
  personal: "bg-blue-100 text-blue-700",
  topic: "bg-purple-100 text-purple-700",
  emotion: "bg-red-100 text-red-700",
  preference: "bg-green-100 text-green-700",
}

export function MemoryViewer({ userId, onClose }: MemoryViewerProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<MemoryCategory | "all">("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadUserMemories()
  }, [userId, filter])

  async function loadUserMemories() {
    setIsLoading(true)
    const data = await loadMemories(userId, { limit: 100 })
    setMemories(data)
    setIsLoading(false)
  }

  async function handleDelete(memoryId: string) {
    await deleteMemory(memoryId)
    loadUserMemories()
  }

  const filteredMemories = useMemo(() => {
    let result = filter === "all" 
      ? memories 
      : memories.filter(m => m.category === filter)
    
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(m => m.content.toLowerCase().includes(searchLower))
    }
    
    return result
  }, [memories, filter, search])

  // Helper to format memory age
  function formatMemoryAge(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const categoryCount = {
      personal: memories.filter(m => m.category === 'personal').length,
      topic: memories.filter(m => m.category === 'topic').length,
      emotion: memories.filter(m => m.category === 'emotion').length,
      preference: memories.filter(m => m.category === 'preference').length,
    }
    const avgImportance = memories.length > 0
      ? Math.round(memories.reduce((acc, m) => acc + m.importance, 0) / memories.length)
      : 0
    return { categoryCount, avgImportance }
  }, [memories])

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 touch-manipulation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
            <h2 className="font-semibold text-lg">What I Know About You</h2>
            <p className="text-sm text-gray-500">{memories.length} memories stored</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="touch-manipulation">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        {memories.length > 0 && (
          <div className="p-3 border-b bg-gray-50 shrink-0">
            <div className="flex items-center justify-between text-xs overflow-x-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-blue-600 shrink-0">{stats.categoryCount.personal} personal</span>
                <span className="text-purple-600 shrink-0">{stats.categoryCount.topic} topics</span>
                <span className="text-red-600 shrink-0">{stats.categoryCount.emotion} emotions</span>
                <span className="text-green-600 shrink-0">{stats.categoryCount.preference} prefs</span>
              </div>
              <span className="text-gray-500 shrink-0">Avg: {stats.avgImportance}/10</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 touch-manipulation"
            />
          </div>
        </div>

        {/* Memories list */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No memories yet</p>
              <p className="text-sm">The AI will learn about you as you chat</p>
            </div>
          ) : (
            filteredMemories.map(memory => (
              <div
                key={memory.id}
                className="p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${CATEGORY_COLORS[memory.category]}`}>
                      {CATEGORY_LABELS[memory.category]}
                    </span>
                    <p className="text-sm mt-1.5">{memory.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>Importance: {memory.importance}/10</span>
                      <span>•</span>
                      <span>{formatMemoryAge(memory.created_at)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => handleDelete(memory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            You can delete any memory. The AI will ask questions to learn more about you over time.
          </p>
        </div>
      </div>
    </div>
  )
}
