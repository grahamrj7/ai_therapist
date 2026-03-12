/**
 * Memory system types
 * Defines the structure for AI memory storage
 */

export type MemoryCategory = 'personal' | 'topic' | 'emotion' | 'preference'

export interface Memory {
  id: string
  userId: string
  content: string
  category: MemoryCategory
  importance: number
  sourceMessageId?: string
  createdAt: number
  lastReferencedAt?: number
  isActive: boolean
}

export interface MemoryExtractionResult {
  memories: Omit<Memory, 'id' | 'createdAt' | 'lastReferencedAt' | 'isActive'>[]
  shouldExtract: boolean
  reason?: string
}

export interface MemoryRetrievalOptions {
  category?: MemoryCategory
  limit?: number
  minImportance?: number
}
