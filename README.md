# AI Therapist - Mental Health Support App

An AI-powered therapy application that provides emotional support, therapeutic tools, and builds a persistent memory of the user over time.

## Live Demo

**URL:** https://ai-therapist-d691c.web.app

## Features

### 🤖 AI-Powered Therapy
- **Gemini 2.5 Flash** integration for natural, empathetic conversations
- **Therapist Persona** - Customizable AI therapist with a warm, supportive personality
- **Context-Aware Responses** - Remembers previous sessions and adapts responses

### 💾 Persistent Memory System
- **Learns About You** - Extracts personal facts, emotions, topics, and preferences from conversations
- **Active Learning** - Asks follow-up questions to gather more information about the user
- **Memory Categories**:
  - **Personal** - Name, location, job, family, hobbies, age
  - **Emotions** - Anxiety, sadness, anger, happiness, fatigue
  - **Topics** - Problems, goals, relationships, work issues
  - **Preferences** - Communication style, boundaries, coping strategies
- **Memory Viewer** - View, search, and delete stored memories in Settings
- **Personalized Welcome** - Greets returning users by name based on stored memories

### 🧘 Therapeutic Tools
- **Box Breathing Exercise** - 4-4-4-4 guided breathing technique
- **Emotion Check-In** - Track feelings across 4 dimensions (Anxiety, Mood, Stress, Energy) using 1-10 sliders
- **Sound Therapy** - Ambient nature sounds for relaxation

### 🎙️ Voice Features
- **Voice Input** - Speech-to-text using Web Speech API
- **Voice Output** - Text-to-speech using browser's Speech Synthesis
- **Auto-Triggered Tools** - AI suggests breathing exercises or emotion check-ins based on conversation

### 💬 Chat Features
- **Session Management** - Automatic daily sessions with session history
- **Real-time Typing Indicators** - Shows when AI is responding
- **Message Bubbles** - Clean UI for user and bot messages

### 🔐 Authentication
- **Firebase Auth** - Email/password and Google sign-in
- **Supabase Backend** - PostgreSQL database for data persistence

### 📊 Data Persistence
- **Local Storage** - Fast local caching of sessions
- **Cloud Sync** - Supabase for cross-device sync
- **Memory Deduplication** - Prevents duplicate memories

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Build Tool** | Vite |
| **AI** | Google Gemini 2.5 Flash |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Firebase Auth |
| **Hosting** | Firebase Hosting |
| **Voice** | Web Speech API (Speech Recognition + Speech Synthesis) |

### Database Schema

#### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);
```

#### Memories Table
```sql
CREATE TABLE memories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personal', 'topic', 'emotion', 'preference')),
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  source_message_id TEXT,
  created_at BIGINT NOT NULL,
  last_referenced_at BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

#### Emotion Check-ins Table
```sql
CREATE TABLE emotion_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT,
  timestamp BIGINT NOT NULL,
  anxiety INTEGER,
  mood INTEGER,
  stress INTEGER,
  energy INTEGER
);
```

---

## Technical Design

### Memory System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Message                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Memory Extractor                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Personal     │ │ Emotions      │ │ Topics       │           │
│  │ Facts        │ │ Detection     │ │ Extraction   │           │
│  │ - Name       │ │ - Anxiety    │ │ - Problems   │           │
│  │ - Location   │ │ - Sadness    │ │ - Goals      │           │
│  │ - Job        │ │ - Anger      │ │ - Work       │           │
│  │ - Family     │ │ - Happiness  │ │ - Relations  │           │
│  │ - Hobbies    │ │ - Fatigue    │ │              │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐                                                │
│  │ Preferences  │                                                │
│  │ - Boundaries │                                                │
│  │ - Coping     │                                                │
│  │ - Style      │                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Deduplication Check                           │
│  - Compare with existing memories                               │
│  - Skip if duplicate (>80% similarity)                         │
│  - Enforce 100 memory cap                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Save to Supabase                              │
│  - Insert into memories table                                   │
│  - Set importance score (1-10)                                  │
│  - Mark category (personal/topic/emotion/preference)           │
└─────────────────────────────────────────────────────────────────┘
```

### Learning Questions System

```
┌─────────────────────────────────────────────────────────────────┐
│                   Chat Flow                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Send Message  │    │ Extract       │    │ AI Response   │
│ to Gemini     │    │ Memories      │    │ with Context  │
└───────────────┘    └───────────────┘    └───────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────┐
                              │ Check Learning Opportunity      │
                              │ - 15% probability              │
                              │ - After 1+ messages            │
                              │ - Select unasked question      │
                              └─────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────┐
                              │ Ask Follow-up Question         │
                              │ - "I'd love to know..."        │
                              │ - Reference past emotions      │
                              │ - 2 second delay               │
                              └─────────────────────────────────┘
```

### Voice Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     Voice Input                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Web Speech Recognition                             │
│  - Continuous = false                                          │
│  - Interim results = true                                      │
│  - Language: en-US                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Transcript Handling                             │
│  - Real-time interim display                                   │
│  - Final transcript on speech end                             │
│  - Send to chat                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Voice Output                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               Web Speech Synthesis                              │
│  - Queue-based playback                                        │
│  - Preferred voices: Karen, Samantha, Daniel                   │
│  - Rate: 1.0, Pitch: 1.0, Volume: 1.0                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### Hooks

| Hook | Purpose |
|------|---------|
| `useChat` | Manages chat state, Gemini integration, memory extraction |
| `useMemory` | Memory CRUD operations with deduplication |
| `useAuth` | Firebase authentication state |
| `useSettings` | User preferences (TTS, voice selection) |
| `useTextToSpeech` | Text-to-speech with voice queue |
| `useSpeechRecognition` | Speech-to-text with interim results |

### Services

| Service | Purpose |
|---------|---------|
| `memoryExtractor.ts` | Regex-based extraction of personal facts, emotions, topics, preferences |
| `learningQuestions.ts` | Generates learning questions and memory follow-ups |
| `db.ts` | Supabase database operations |
| `gemini.ts` | Gemini AI configuration |

### Components

| Component | Purpose |
|-----------|---------|
| `ChatApp.tsx` | Main chat interface |
| `MessageBubble.tsx` | Individual chat messages |
| `MemoryViewer.tsx` | View/search/delete memories |
| `EmotionScaleSliders.tsx` | 1-10 emotion tracking |
| `BreathingExercise.tsx` | Box breathing UI |
| `VoiceRecorder.tsx` | Speech input UI |
| `SettingsDialog.tsx` | User preferences |

---

## Environment Variables

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/grahamrj7/ai_therapist.git
   cd ai_therapist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/`
   - Get your URL and anon key

4. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication (Email/Password, Google)
   - Get your config keys

5. **Configure environment**
   - Copy `.env.example` to `.env`
   - Fill in your API keys

6. **Run development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   ```

8. **Deploy to Firebase**
   ```bash
   npx firebase deploy
   ```

---

## Memory Extraction Patterns

### Personal Facts
- **Names**: "my name is X", "I'm X", "call me X"
- **Locations**: "I live in X", "I'm from X", "based in X"
- **Occupation**: "I work as X", "my job is X", "I do X for a living"
- **Family**: "my husband/wife/partner", "I have kids", "my mom/dad"
- **Hobbies**: "in my free time I X", "I enjoy X", "my hobby is X"

### Emotions (9 Categories)
- **Anxiety**: anxious, worried, nervous, panic, overwhelmed, stressed
- **Sadness**: sad, depressed, down, hopeless, heartbroken, lonely
- **Anger**: angry, frustrated, annoyed, irritated, furious, mad
- **Happiness**: happy, joy, excited, grateful, blessed, content
- **Fatigue**: tired, exhausted, drained, burnout, drowsy
- **Confusion**: confused, overwhelmed, lost, uncertain, stuck
- **Shame**: ashamed, embarrassed, humiliated, guilty
- **Love**: love, affection, attached, devoted, caring

### Topics
- **Problems**: "I'm dealing with X", "my problem is X", "I can't X"
- **Goals**: "I want to X", "I'm trying to X", "my goal is X"
- **Relationships**: "my partner/boss/friend", "relationship issues"
- **Work**: "work stress", "my boss", "career change"
- **Past**: "when I was younger", "growing up", "I used to X"

### Preferences
- **Communication**: "I prefer X", "I don't like X", "I'm comfortable with X"
- **Boundaries**: "don't want to talk about X", "I'd rather not"
- **Therapy Style**: "I respond well to X", "what works for me is X"

---

## Learning Questions (25+)

The AI asks learning questions after the first message with 15% probability:

1. "What do you do for work or study?"
2. "Where are you based?"
3. "Do you have any pets?"
4. "What are your hobbies?"
5. "Do you have a partner or kids?"
6. "How old are you?"
7. "Are you currently in school?"
8. "What's been on your mind lately?"
9. "How would you describe your living situation?"
10. "What does a typical day look like?"
11. "Are you an introvert or extrovert?"
12. "Is there a relationship you'd like to work on?"
13. "How do you cope with difficult emotions?"
14. "Do you prefer advice or just listening?"
15. "What makes you smile?"
16. "Are you a morning person or night owl?"
...and more

---

## Security Considerations

- **Row Level Security (RLS)** - Users can only access their own data
- **Input Sanitization** - Messages are sanitized before processing
- **No Medical Advice** - AI is instructed not to diagnose or replace professional care
- **Privacy-First** - Memories are stored per-user with RLS protection

---

## License

MIT License

---

## Credits

- **AI Model**: Google Gemini 2.5 Flash
- **Database**: Supabase
- **Auth**: Firebase
- **UI Components**: Shadcn UI + Tailwind CSS
