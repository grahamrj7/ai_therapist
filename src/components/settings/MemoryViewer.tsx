import { useState, useEffect, useMemo } from "react"
import { Trash2, Eye, X, Loader2, BarChart3, Brain } from "lucide-react"
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

  const filteredMemories = filter === "all" 
    ? memories 
    : memories.filter(m => m.category === filter)

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">What I Know About You</h2>
            <p className="text-sm text-gray-500">{memories.length} memories stored</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        {memories.length > 0 && (
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-blue-600">{stats.categoryCount.personal} personal</span>
                <span className="text-purple-600">{stats.categoryCount.topic} topics</span>
                <span className="text-red-600">{stats.categoryCount.emotion} emotions</span>
                <span className="text-green-600">{stats.categoryCount.preference} prefs</span>
              </div>
              <span className="text-gray-500">Avg importance: {stats.avgImportance}/10</span>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 p-3 border-b overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filter === "all" ? "bg-terracotta text-white" : "bg-gray-100"
            }`}
          >
            All ({memories.length})
          </button>
          {(["personal", "topic", "emotion", "preference"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                filter === cat ? "bg-terracotta text-white" : "bg-gray-100"
              }`}
            >
              {CATEGORY_LABELS[cat]} ({memories.filter(m => m.category === cat).length})
            </button>
          ))}
        </div>

        {/* Memories list */}
        <div className="overflow-y-auto p-4 space-y-3 max-h-[50vh]">
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
