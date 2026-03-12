/**
 * useMemory hook
 * Provides memory management functionality for the AI therapist
 */

import { useState, useCallback } from 'react'
import type { Memory, MemoryCategory, MemoryRetrievalOptions } from '@/types/memory'
import { 
  saveMemory, 
  loadMemories, 
  updateMemoryLastReferenced, 
  deleteMemory,
  getMemoryCount,
  findSimilarMemory,
  removeLowestImportanceMemory
} from '@/lib/db'

const MEMORY_CAP = 100

export function useMemory(userId?: string) {
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Save a new memory for the user
   */
  const addMemory = useCallback(async (
    content: string,
    category: MemoryCategory,
    importance: number,
    sourceMessageId?: string
  ): Promise<Memory | null> => {
    if (!userId) return null

    setIsLoading(true)
    try {
      // Check for similar memory first (deduplication)
      const existing = await findSimilarMemory(userId, content)
      if (existing) {
        // If similar memory exists, update its importance
        if (importance > existing.importance) {
          // Could update importance here if needed
          console.log('[Memory] Similar memory exists, skipping:', content.substring(50))
        }
        return null
      }

      // Check memory count and enforce cap
      const count = await getMemoryCount(userId)
      if (count >= MEMORY_CAP) {
        // Remove lowest importance memory to make room
        await removeLowestImportanceMemory(userId)
      }

      const memory = await saveMemory(userId, {
        userId,
        content,
        category,
        importance,
        sourceMessageId,
      })

      return memory
    } catch (error) {
      console.error('[Memory] Error saving memory:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  /**
   * Load recent memories for context
   */
  const getRecentMemories = useCallback(async (
    limit: number = 20,
    minImportance: number = 1
  ): Promise<Memory[]> => {
    if (!userId) return []

    setIsLoading(true)
    try {
      const memories = await loadMemories(userId, { limit, minImportance })
      return memories
    } catch (error) {
      console.error('[Memory] Error loading memories:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  /**
   * Load memories by category
   */
  const getMemoriesByCategory = useCallback(async (
    category: MemoryCategory,
    limit: number = 20
  ): Promise<Memory[]> => {
    if (!userId) return []

    setIsLoading(true)
    try {
      const memories = await loadMemories(userId, { category, limit })
      return memories
    } catch (error) {
      console.error('[Memory] Error loading memories by category:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  /**
   * Mark a memory as referenced (for recency sorting)
   */
  const markReferenced = useCallback(async (memoryId: string): Promise<void> => {
    await updateMemoryLastReferenced(memoryId)
  }, [])

  /**
   * Delete a memory (soft delete)
   */
  const removeMemory = useCallback(async (memoryId: string): Promise<boolean> => {
    return deleteMemory(memoryId)
  }, [])

  /**
   * Get count of user's memories
   */
  const getCount = useCallback(async (): Promise<number> => {
    if (!userId) return 0
    return getMemoryCount(userId)
  }, [userId])

  return {
    isLoading,
    addMemory,
    getRecentMemories,
    getMemoriesByCategory,
    markReferenced,
    removeMemory,
    getCount,
  }
}
