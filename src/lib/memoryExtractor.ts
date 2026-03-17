/**
 * Memory Extractor Service
 * Analyzes conversations to extract memory-worthy information
 * 
 * This service processes user messages and AI responses to identify
 * personal facts, topics, emotions, and preferences worth remembering.
 */

import type { MemoryCategory } from '@/types/memory'

// ============================================================================
// Extraction Patterns
// ============================================================================

// Personal facts patterns
const NAME_PATTERNS = [
  /my name is ([\w\s]+)/i,
  /i'm ([\w\s]+)/i,
  /i am ([\w\s]+)/i,
  /call me ([\w\s]+)/i,
  /this is ([\w\s]+)/i,
  /my name's ([\w\s]+)/i,
]

const AGE_PATTERNS = [
  /i'm (?:about |approximately )?(\d{1,2})(?: years old)?/i,
  /i am (?:about |approximately )?(\d{1,2})/i,
  /age (\d{1,2})/i,
  /(\d{1,2}) years? old/i,
]

const LOCATION_PATTERNS = [
  /i live in ([\w\s]+)/i,
  /i'm from ([\w\s]+)/i,
  /i stay in ([\w\s]+)/i,
  /based in ([\w\s]+)/i,
  /located in ([\w\s]+)/i,
  /i reside in ([\w\s]+)/i,
]

const OCCUPATION_PATTERNS = [
  /i work (?:as|as a|in)/i,
  /i'm a ([\w\s]+)/i,
  /i do ([\w\s]+) for a living/i,
  /my job is/i,
  /i'm (?:currently )?working (?:as|in)/i,
  /i'm employed (?:as|in)/i,
  /my profession is/i,
]

const EDUCATION_PATTERNS = [
  /i (?:study|studied|am studying)/i,
  /i'm a (?:student|graduate)/i,
  /i have a (?:bachelor|master|phd|degree)/i,
  /i graduated from/i,
  /my major is/i,
]

const FAMILY_PATTERNS = [
  /my (?:husband|wife|partner|boyfriend|girlfriend|fiance)(?:'s)? name is/i,
  /i have a (?:husband|wife|partner|boyfriend|girlfriend)/i,
  /my (?:mom|father|mother|dad|parent)(?:s)?/i,
  /i have (?:[\w\s]+ )?(?:kids?|children|son|daughter)/i,
  /my (?:son|daughter|child|kids?)/i,
  /i have a (?:dog|cat|pet)/i,
  /i'm (?:married|single|divorced|separated)/i,
  /i live with my/i,
]

const HOBBY_PATTERNS = [
  /i (?:like|love|enjoy|do)(?:ing)? (?:[\w\s]+ )?(?:in my )?(?:free |spare )?time/i,
  /my hobby (?:is|are)/i,
  /i (?:go|play|practice)(?:ing)? ([\w\s]+)/i,
  /i like to ([\w\s]+)/i,
  /in my free time i ([\w\s]+)/i,
]

const HEALTH_PATTERNS = [
  /i have (?:been diagnosed with|diagnosed with)/i,
  /i suffer from/i,
  /my doctor (?:said|told me|diagnosed)/i,
  /i'm on medication for/i,
  /i have (?:diabetes|anxiety|depression|adhd|bipolar|ocd)/i,
]

// Emotion indicators - only include clear emotional expressions
// Note: "love" is removed as it's too commonly used in non-emotional contexts (e.g., "I love apples")
const EMOTION_KEYWORDS = {
  anxiety: ['anxious', 'worried', 'nervous', 'panic', 'overwhelmed', 'stressed', 'fear', 'scared', 'racing thoughts', 'uneasy', 'tense', 'apprehensive', 'panic attack'],
  sadness: ['sad', 'depressed', 'down', 'hopeless', 'heartbroken', 'grief', 'lonely', 'empty', 'numb', 'melancholy', 'disappointed', 'devastated', 'miserable'],
  anger: ['angry', 'frustrated', 'annoyed', 'irritated', 'furious', 'mad', 'resentful', 'bitter', 'hostile', 'aggravated', 'pissed', 'irked'],
  happiness: ['happy', 'joy', 'excited', 'grateful', 'blessed', 'content', 'peaceful', 'calm', 'satisfied', 'optimistic', 'hopeful', 'elated', 'thrilled'],
  fatigue: ['tired', 'exhausted', 'drained', 'burnout', 'fatigue', 'drowsy', 'sleepy', 'worn out', 'spent', 'beat'],
  confusion: ['confused', 'overwhelmed', 'lost', 'uncertain', 'unsure', 'stuck', 'mixed feelings', 'unclear', 'perplexed'],
  shame: ['ashamed', 'embarrassed', 'humiliated', 'guilty', 'regretful', 'self-conscious', 'flustered'],
}

// Context patterns that indicate actual emotional expression (not casual usage)
const EMOTION_CONTEXT_PATTERNS = [
  /i(?:'?m| am) (?:feeling |so |very |really |actually )?(?:anxious|worried|nervous|sad|depressed|angry|frustrated|happy|excited|tired|exhausted|confused|overwhelmed)/i,
  /i(?:'?m| am) (?:feeling |so |very |really )?[\w]+ing/i, // feeling X, feeling sad, feeling anxious
  /i feel (?:very |really |so |)?(anxious|worried|nervous|sad|depressed|angry|frustrated|happy|excited|tired|exhausted|confused|overwhelmed|hopeless)/i,
  /i(?:'?ve| have) been feeling/i,
  /lately i feel/i,
  /i've been feeling/i,
  /these days i feel/i,
  /as of late i feel/i,
  /right now i feel/i,
  /at the moment i feel/i,
]

// ============================================================================
// Extraction Functions
// ============================================================================

export interface ExtractedFact {
  content: string
  category: MemoryCategory
  importance: number
  confidence: number
}

/**
 * Extract personal facts from a message
 * Looks for names, locations, occupations, family info, hobbies
 */
export function extractPersonalFacts(text: string): ExtractedFact[] {
  const facts: ExtractedFact[] = []
  const lowerText = text.toLowerCase()

  // Check for name
  for (const pattern of NAME_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      // Make sure it's not a common phrase
      if (name.length > 2 && !['a', 'an', 'the', 'not', 'very', 'really'].includes(name)) {
        facts.push({
          content: `User's name is ${name}`,
          category: 'personal',
          importance: 10,
          confidence: 0.9,
        })
        break
      }
    }
  }

  // Check for location
  for (const pattern of LOCATION_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const location = match[1].trim()
      if (location.length > 2) {
        facts.push({
          content: `User lives in ${location}`,
          category: 'personal',
          importance: 7,
          confidence: 0.7,
        })
        break
      }
    }
  }

  // Check for occupation
  for (const pattern of OCCUPATION_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      facts.push({
        content: `User mentioned their work: "${match[0]}"`,
        category: 'personal',
        importance: 6,
        confidence: 0.6,
      })
      break
    }
  }

  // Check for family
  for (const pattern of FAMILY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      facts.push({
        content: `User mentioned family: "${match[0]}"`,
        category: 'personal',
        importance: 8,
        confidence: 0.7,
      })
      break
    }
  }

  // Check for hobbies
  for (const pattern of HOBBY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      facts.push({
        content: `User has hobby/interest: "${match[0]}"`,
        category: 'personal',
        importance: 5,
        confidence: 0.5,
      })
      break
    }
  }

  // Check for age
  for (const pattern of AGE_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const age = match[1]
      const ageNum = parseInt(age)
      if (ageNum >= 13 && ageNum <= 100) {
        facts.push({
          content: `User is ${ageNum} years old`,
          category: 'personal',
          importance: 6,
          confidence: 0.8,
        })
        break
      }
    }
  }

  // Check for education
  for (const pattern of EDUCATION_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      facts.push({
        content: `User mentioned education: "${match[0]}"`,
        category: 'personal',
        importance: 5,
        confidence: 0.6,
      })
      break
    }
  }

  // Check for health
  for (const pattern of HEALTH_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      facts.push({
        content: `User mentioned health condition: "${match[0]}"`,
        category: 'personal',
        importance: 9,
        confidence: 0.8,
      })
      break
    }
  }

  return facts
}

/**
 * Extract emotions from a message
 * Only extracts emotions when they appear in emotional context
 * (not casual usage like "I love apples" or "I'm happy to help")
 */
export function extractEmotions(text: string): ExtractedFact[] {
  const emotions: ExtractedFact[] = []
  const lowerText = text.toLowerCase()

  // First check if there's any emotional context in the message
  // If not, skip emotion extraction entirely
  const hasEmotionalContext = EMOTION_CONTEXT_PATTERNS.some(pattern => pattern.test(text))
  
  // Also check for explicit emotional statements
  const hasExplicitEmotion = [
    /i feel [\w]+/i,
    /i'm feeling/i,
    /i've been feeling/i,
    /i feel so/i,
    /i feel really/i,
  ].some(pattern => pattern.test(text))

  if (!hasEmotionalContext && !hasExplicitEmotion) {
    return emotions
  }

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const matchedKeywords = keywords.filter(kw => lowerText.includes(kw))
    
    if (matchedKeywords.length > 0) {
      emotions.push({
        content: `User expressed ${emotion}: ${matchedKeywords.join(', ')}`,
        category: 'emotion',
        importance: matchedKeywords.length > 1 ? 8 : 5,
        confidence: matchedKeywords.length > 1 ? 0.8 : 0.5,
      })
    }
  }

  return emotions
}
  }

  return emotions
}

/**
 * Extract topics from conversation
 * Identifies problems, goals, coping strategies
 */
export function extractTopics(userMessage: string, botResponse: string): ExtractedFact[] {
  const topics: ExtractedFact[] = []

  // Look for problem statements
  const problemPatterns = [
    /i'm (?:going through|dealing with|struggling with|having)/i,
    /my (?:problem|issue|challenge) is/i,
    /i can't/i,
    /i have (?:a )?problem/i,
  ]

  for (const pattern of problemPatterns) {
    if (pattern.test(userMessage)) {
      topics.push({
        content: `User is dealing with: "${userMessage.substring(0, 100)}"`,
        category: 'topic',
        importance: 7,
        confidence: 0.7,
      })
      break
    }
  }

  // Look for goals/aspirations
  const goalPatterns = [
    /i want to/i,
    /i'm trying to/i,
    /i hope to/i,
    /my goal is/i,
    /i'm working towards/i,
  ]

  for (const pattern of goalPatterns) {
    if (pattern.test(userMessage)) {
      topics.push({
        content: `User's goal: "${userMessage.substring(0, 100)}"`,
        category: 'topic',
        importance: 6,
        confidence: 0.6,
      })
      break
    }
  }

  // Look for coping strategies that work
  const copingPatterns = [
    /that (?:helps|worked|works) (?:for me|well)/i,
    /i find (?:that|it) (?:helps|works)/i,
    /when i (?:do|try) (?:[\w\s]+) (?:it|i feel) (?:better|helps)/i,
    /what helps is/i,
    /i usually (?:[\w\s]+) when/i,
  ]

  for (const pattern of copingPatterns) {
    if (pattern.test(botResponse) || pattern.test(userMessage)) {
      topics.push({
        content: `Potential coping strategy mentioned`,
        category: 'topic',
        importance: 5,
        confidence: 0.4,
      })
      break
    }
  }

  // Look for relationship issues
  const relationshipPatterns = [
    /my (?:husband|wife|partner|boyfriend|girlfriend|friend|parent|sibling)/i,
    /me and my (?:partner|husband|wife|boss|colleague)/i,
    /relationship (?:issues|problems|with)/i,
    /we (?:argue|fight|disagree)/i,
    /communication (?:issues|problems|breakdown)/i,
  ]

  for (const pattern of relationshipPatterns) {
    if (pattern.test(userMessage)) {
      topics.push({
        content: `User mentioned relationship topic: "${userMessage.substring(0, 80)}"`,
        category: 'topic',
        importance: 7,
        confidence: 0.7,
      })
      break
    }
  }

  // Look for work/career issues
  const workPatterns = [
    /work (?:stress|pressure|issues)/i,
    /my (?:boss|colleague|coworker|job)/i,
    /at (?:work|the office)/i,
    /career (?:change|transition|growth)/i,
    /job (?:loss|search|interview)/i,
    /professional (?:life|work)/i,
  ]

  for (const pattern of workPatterns) {
    if (pattern.test(userMessage)) {
      topics.push({
        content: `User mentioned work/career: "${userMessage.substring(0, 80)}"`,
        category: 'topic',
        importance: 6,
        confidence: 0.6,
      })
      break
    }
  }

  // Look for past experiences
  const pastPatterns = [
    /when i was (?:younger|a child|teen)/i,
    /growing up/i,
    /in the past/i,
    /i used to ([\w\s]+)/i,
    /my childhood/i,
  ]

  for (const pattern of pastPatterns) {
    if (pattern.test(userMessage)) {
      topics.push({
        content: `User shared past experience`,
        category: 'topic',
        importance: 6,
        confidence: 0.5,
      })
      break
    }
  }

  return topics
}

/**
 * Extract preferences from conversation
 * Identifies communication preferences, boundaries, likes/dislikes
 */
export function extractPreferences(userMessage: string, botResponse: string): ExtractedFact[] {
  const preferences: ExtractedFact[] = []
  const lowerText = userMessage.toLowerCase()

  // Communication preferences
  const communicationPrefs = [
    /i prefer (?:to|when|i like)/i,
    /i don't like (?:to|when|i hate)/i,
    /i'm more comfortable with/i,
    /i find it hard to/i,
    /i'm not (?:really )?comfortable with/i,
  ]

  for (const pattern of communicationPrefs) {
    if (pattern.test(userMessage)) {
      preferences.push({
        content: `User mentioned communication preference: "${userMessage.substring(0, 100)}"`,
        category: 'preference',
        importance: 6,
        confidence: 0.7,
      })
      break
    }
  }

  // Things to avoid / boundaries
  const avoidPatterns = [
    /don't (?:want|like|bring up|talk about)/i,
    /i'd rather not/i,
    /please don't/i,
    /i don't want to (?:talk about|discuss|bring up)/i,
    /can we (?:not|avoid) (?:talking about|discussing)/i,
    /i'd prefer not to/i,
  ]

  for (const pattern of avoidPatterns) {
    if (pattern.test(userMessage)) {
      preferences.push({
        content: `User set a boundary: "${userMessage.substring(0, 100)}"`,
        category: 'preference',
        importance: 9,
        confidence: 0.8,
      })
      break
    }
  }

  // Activity preferences - what user likes/dislikes
  const activityPrefs = [
    /i (?:like|love|enjoy) (?:[\w\s]+ )?activities/i,
    /i (?:hate|dislike|don't like) (?:[\w\s]+ )?activities/i,
    /i prefer (?:[\w\s]+ )?exercises/i,
    /meditation (?:helps|doesn't work) (?:for me)?/i,
    /breathing (?:exercises|work|helps) (?:for me)?/i,
  ]

  for (const pattern of activityPrefs) {
    if (pattern.test(userMessage) || pattern.test(botResponse)) {
      preferences.push({
        content: `User shared activity preference`,
        category: 'preference',
        importance: 5,
        confidence: 0.6,
      })
      break
    }
  }

  // Therapeutic approach preferences
  const therapyPrefs = [
    /i respond well to/i,
    /i don't respond well to/i,
    /what works (?:best|well) for me/i,
    /i find (?:that|it) (?:helpful|not helpful)/i,
    /i prefer (?:one-on-one|group|written|verbal)/i,
  ]

  for (const pattern of therapyPrefs) {
    if (pattern.test(userMessage)) {
      preferences.push({
        content: `User shared therapy approach preference: "${userMessage.substring(0, 100)}"`,
        category: 'preference',
        importance: 7,
        confidence: 0.7,
      })
      break
    }
  }

  return preferences
}

/**
 * Main extraction function - combines all extractors
 */
export function extractMemories(
  userMessage: string,
  botResponse: string
): ExtractedFact[] {
  const allFacts: ExtractedFact[] = []

  // Extract in order of importance
  const personalFacts = extractPersonalFacts(userMessage)
  const emotions = extractEmotions(userMessage + ' ' + botResponse)
  const topics = extractTopics(userMessage, botResponse)
  const preferences = extractPreferences(userMessage, botResponse)

  allFacts.push(...personalFacts, ...emotions, ...topics, ...preferences)

  // Sort by importance
  allFacts.sort((a, b) => b.importance - a.importance)

  // Remove duplicates (same content)
  const seen = new Set<string>()
  return allFacts.filter(fact => {
    const key = fact.content.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Calculate importance score for a memory
 * Factors: specificity, repetition, emotional weight, recency
 */
export function calculateImportance(
  fact: ExtractedFact,
  existingMemories: string[]
): number {
  let score = fact.importance

  // Check if this topic has been mentioned before
  const isRepetition = existingMemories.some(
    existing => existing.toLowerCase().includes(fact.content.toLowerCase().substring(0, 30))
  )

  if (isRepetition) {
    // Repetition increases importance
    score += 2
  }

  // Higher confidence = higher importance
  score += Math.floor(fact.confidence * 2)

  // Cap at 10
  return Math.min(score, 10)
}
