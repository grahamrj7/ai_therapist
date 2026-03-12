/**
 * Learning Question Generator
 * Occasionally prompts the AI to ask questions to learn more about the user
 */

import type { MemoryCategory } from '@/types/memory'

interface LearningGoal {
  category: MemoryCategory
  question: string
  keywords: string[]
  alreadyAsked: (existingMemories: string[]) => boolean
}

// Comprehensive questions to ask when we don't have certain information
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
    category: 'personal',
    question: "How old are you? I ask just so I can better understand your perspective.",
    keywords: ['age', 'old', 'young'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('years old') || 
      m.toLowerCase().includes('age')
    )
  },
  {
    category: 'personal',
    question: "Are you currently in school or working? What's your daily routine like?",
    keywords: ['school', 'college', 'university', 'student'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('school') || 
      m.toLowerCase().includes('student')
    )
  },
  {
    category: 'emotion',
    question: "You mentioned feeling [emotion]. How long have you been feeling this way?",
    keywords: ['anxious', 'stressed', 'sad', 'overwhelmed'],
    alreadyAsked: () => false
  },
  {
    category: 'emotion',
    question: "What do you think is contributing to how you're feeling?",
    keywords: ['cause', 'reason', 'why'],
    alreadyAsked: () => false
  },
  {
    category: 'emotion',
    question: "How has this been affecting your daily life?",
    keywords: ['impact', 'affect', 'daily'],
    alreadyAsked: () => false
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
  {
    category: 'preference',
    question: "What have you tried before to deal with this?",
    keywords: ['tried', 'help', 'coping'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('tried')
    )
  },
  {
    category: 'preference',
    question: "Do you prefer talking through problems or having some quiet time to think?",
    keywords: ['prefer', 'quiet', 'think'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('prefer')
    )
  },
  {
    category: 'topic',
    question: "Is there anything specific you'd like to work on in our sessions?",
    keywords: ['work on', 'focus', 'goal'],
    alreadyAsked: (memories) => memories.some(m => 
      m.toLowerCase().includes('goal')
    )
  },
  {
    category: 'topic',
    question: "What do you hope to get out of therapy?",
    keywords: ['hope', 'want', 'goal'],
    alreadyAsked: () => false
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
  // Ask after at least 1 message
  if (messageCount < 1) {
    return null
  }

  // Only ask with 15% probability to not overwhelm the user
  if (Math.random() > 0.15) {
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

/**
 * Generate a follow-up prompt that references past memories
 */
export function generateMemoryFollowUp(existingMemories: string[]): string | null {
  if (existingMemories.length === 0) {
    return null
  }

  const followUps: string[] = []

  // Check for emotion memories
  const emotionMemories = existingMemories.filter(m => 
    m.toLowerCase().includes('expressed') && 
    (m.toLowerCase().includes('anxiety') || 
     m.toLowerCase().includes('stress') || 
     m.toLowerCase().includes('sad') ||
     m.toLowerCase().includes('angry') ||
     m.toLowerCase().includes('tired'))
  )

  if (emotionMemories.length > 0) {
    const randomEmotion = emotionMemories[Math.floor(Math.random() * emotionMemories.length)]
    followUps.push(`You mentioned "${randomEmotion.substring(0, 60)}..." - how are you feeling about that now?`)
  }

  // Check for topic memories
  const topicMemories = existingMemories.filter(m => 
    m.toLowerCase().includes('dealing with') ||
    m.toLowerCase().includes('goal') ||
    m.toLowerCase().includes('problem')
  )

  if (topicMemories.length > 0) {
    const randomTopic = topicMemories[Math.floor(Math.random() * topicMemories.length)]
    followUps.push(`Earlier you shared "${randomTopic.substring(0, 50)}..." - has anything changed since then?`)
  }

  // Check for personal facts
  const personalMemories = existingMemories.filter(m => 
    m.toLowerCase().includes("name is") ||
    m.toLowerCase().includes("work") ||
    m.toLowerCase().includes("hobby")
  )

  if (personalMemories.length > 0) {
    followUps.push("I'd love to hear more about what you shared before. How are things on that front?")
  }

  // Return a random follow-up with 20% probability
  if (followUps.length > 0 && Math.random() < 0.2) {
    return followUps[Math.floor(Math.random() * followUps.length)]
  }

  return null
}
