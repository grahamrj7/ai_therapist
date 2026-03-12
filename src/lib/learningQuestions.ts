/**
 * Learning Question Generator
 * Occasionally prompts the AI to ask questions to learn more about the user
 */

import type { MemoryCategory } from '@/types/memory'

// What we want to learn about
interface LearningGoal {
  category: MemoryCategory
  question: string
  keywords: string[]
  alreadyAsked: (existingMemories: string[]) => boolean
}

// Questions to ask when we don't have certain information
const LEARNING_GOALS: LearningGoal[] = [
  {
    category: 'personal',
    question: "I'd love to know more about you. What do you do for work or study?",
    keywords: ['work', 'job', 'career', 'study', 'occupation', 'profession'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('work') || 
      m.toLowerCase().includes('job') ||
      m.toLowerCase().includes('occupation')
    )
  },
  {
    category: 'personal',
    question: "Where are you based? I always like to know where my clients are located.",
    keywords: ['live', 'location', 'city', 'from', 'based'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('live') || 
      m.toLowerCase().includes('location')
    )
  },
  {
    category: 'personal',
    question: "Do you have any pets? I find pets can be a big part of people's lives!",
    keywords: ['pet', 'dog', 'cat', 'animal'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('pet') || 
      m.toLowerCase().includes('dog') ||
      m.toLowerCase().includes('cat')
    )
  },
  {
    category: 'personal',
    question: "Do you have any hobbies or things you enjoy doing in your free time?",
    keywords: ['hobby', 'enjoy', 'free time', 'relax'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('hobby') || 
      m.toLowerCase().includes('enjoy')
    )
  },
  {
    category: 'personal',
    question: "How about your family? Do you have a partner or kids you'd like to talk about?",
    keywords: ['partner', 'husband', 'wife', 'kids', 'family', 'children'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('partner') || 
      m.toLowerCase().includes('family') ||
      m.toLowerCase().includes('husband') ||
      m.toLowerCase().includes('wife')
    )
  },
  {
    category: 'emotion',
    question: "You mentioned feeling [emotion]. How long have you been feeling this way?",
    keywords: ['anxious', 'stressed', 'sad', 'overwhelmed'],
    alreadyAsked: (memories) => false // Always okay to ask about current emotions
  },
  {
    category: 'preference',
    question: "Is there anything that helps you feel better when you're [emotion]?",
    keywords: ['anxious', 'stressed', 'sad', 'overwhelmed', 'worried'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('coping') || 
      m.toLowerCase().includes('helps')
    )
  },
]

/**
 * Decide whether to ask a learning question
 * Returns the question to ask, or null if no question needed
 */
export function shouldAskLearningQuestion(
  existingMemories: string[],
  messageCount: number
): string | null {
  // Only ask after at least 3 messages in the conversation
  if (messageCount < 3) {
    return null
  }

  // Only ask with 20% probability to not overwhelm the user
  if (Math.random() > 0.2) {
    return null
  }

  // Find a learning goal we haven't achieved yet
  for (const goal of LEARNING_GOALS) {
    if (!goal.alreadyAsked(existingMemories)) {
      return goal.question
    }
  }

  return null
}

/**
 * Check if we should personalize based on what we know
 */
export function getPersonalizationPrompt(existingMemories: string[]): string {
  const personalFacts = existingMemories.filter(m => 
    m.toLowerCase().includes("name") ||
    m.toLowerCase().includes("work") ||
    m.toLowerCase().includes("live") ||
    m.toLowerCase().includes("family") ||
    m.toLowerCase().includes("pet")
  )

  if (personalFacts.length === 0) {
    return ""
  }

  // Occasionally remind the AI what it knows
  if (Math.random() > 0.7) {
    return `You already know these things about the client: ${personalFacts.join('. ')}`
  }

  return ""
}
