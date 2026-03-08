export const ACTIVITY_KEYWORDS = {
  breathing: [
    "breathing exercise",
    "box breathing",
    "try breathing",
    "breathing technique",
    "guided breathing",
    "deep breathing",
    "breathe with me",
    "calm down",
    "start breathing",
    "do breathing",
    "i want to breathe",
    "let's breathe",
    "help me breathe",
    "calm me down",
    "i need to calm down",
  ],
  emotions: [
    "emotion check",
    "check in",
    "how are you feeling",
    "track your emotions",
    "mood check",
    "how am i feeling",
    "emotion tracking",
    "feeling check",
    "track my emotions",
    "how do i feel",
    "check in on my mood",
    "how am i doing emotionally",
    "how are my emotions",
  ],
  sound: [
    "ambient sounds",
    "relaxation sounds",
    "play some",
    "listen to",
    "sound therapy",
    "put on some",
    "nature sounds",
  ],
} as const

export type ActivityType = keyof typeof ACTIVITY_KEYWORDS

export function detectActivity(content: string): ActivityType | null {
  const lowerContent = content.toLowerCase()
  
  for (const [activity, keywords] of Object.entries(ACTIVITY_KEYWORDS)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return activity as ActivityType
    }
  }
  
  return null
}
