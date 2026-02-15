export interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: number
}

export interface Session {
  id: string
  date: string
  messages: Message[]
  timestamp: number
}

export interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export interface UserSettings {
  therapistName: string
}
