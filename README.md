# AI Therapist - Mental Health Support App

An AI-powered therapy application that provides emotional support, therapeutic tools, and builds a persistent memory of the user over time.

## Live Demo

**URL:** https://ai-therapist-d691c.web.app

---

## Features (Complete List)

### 🤖 AI-Powered Therapy
- **Gemini 2.5 Flash** integration for natural, empathetic conversations
- **Therapist Persona** - Customizable AI therapist with a warm, supportive personality
- **Context-Aware Responses** - Remembers previous sessions and adapts responses
- **Intelligent Activity Detection** - Auto-triggers breathing exercises or emotion check-ins based on conversation
- **Learning Questions** - AI asks follow-up questions to learn about the user (40% probability after first message)

### 💾 Persistent Memory System
- **Learns About You** - Extracts personal facts, emotions, topics, and preferences from every message
- **Memory Categories**:
  - **Personal** - Name, location, job, family, hobbies, age, pets
  - **Emotions** - Anxiety, sadness, anger, happiness, fatigue, confusion, shame
  - **Topics** - Problems, goals, relationships, work issues
  - **Preferences** - Communication style, boundaries, coping strategies
- **Contextual Retrieval** - AI finds and references relevant memories when you discuss related topics
- **Memory Importance Scores** - Each memory rated 1-10 for relevance
- **Memory Deduplication** - Prevents storing duplicate memories (>80% similarity check)
- **100 Memory Cap** - Automatically removes lowest importance memories when limit reached
- **Memory Indicators** - Sparkle icon shows when memory is saved from your message
- **Active Learning** - 25+ learning questions to gather information about the user

### 📊 Memory Management
- **Memory Viewer** - View all stored memories in Settings
- **Search Memories** - Search through your memories
- **Filter by Category** - Filter memories by personal, topic, emotion, or preference
- **Delete Memories** - Remove individual memories
- **Memory Statistics** - Shows category counts and average importance
- **Memory Age Display** - Shows when each memory was saved (e.g., "2h ago", "3d ago")

### 🧘 Therapeutic Tools (4 Activities)
1. **Box Breathing Exercise** - 4-4-4-4 guided breathing technique with visual circle animation
2. **Emotion Check-In** - Track feelings across 4 dimensions (Anxiety, Mood, Stress, Energy) using 1-10 sliders
3. **Sound Therapy** - Ambient nature sounds (rain, ocean, forest, fire, wind) for relaxation
4. **Journal** - Private journal entries with create, edit, and delete functionality

### 📈 Mood Tracking
- **Emotion History** - Store all emotion check-ins in database
- **Mood Charts** - Visual line chart showing emotion trends over time (7/30/90 days)
- **Average Scores** - Display average for each emotion dimension
- **Trend Indicators** - Shows if emotions are trending up/down/stable

### 🎙️ Voice Features
- **Voice Input** - Speech-to-text using Web Speech API
- **Voice Output** - Text-to-speech using browser's Speech Synthesis
- **Multiple Voice Selection** - Choose from 9+ voices (Moira, Daniel, Karen, Samantha, etc.) in Settings
- **TTS Toggle** - Enable/disable voice output in Settings
- **TTS Prompt** - Friendly prompt to enable voice after first conversation

### 💬 Chat Features
- **Session Management** - Automatic daily sessions with session history
- **Real-time Typing Indicators** - Shows when AI is responding
- **Message Bubbles** - Clean UI for user and bot messages
- **Session Sidebar** - View and switch between past sessions on mobile
- **Auto-Scroll** - Automatically scrolls to new messages

### 🔐 Authentication & Data
- **Firebase Auth** - Email/password and Google sign-in
- **Supabase Backend** - PostgreSQL database for cloud persistence
- **Local Storage** - Fast local caching of sessions for offline use
- **Cloud Sync** - Supabase for cross-device synchronization

### 📱 Mobile & UX
- **Responsive Design** - Works on mobile and desktop
- **Mobile Optimizations** - Touch-friendly 44px targets, safe area padding, proper viewport handling
- **Onboarding Flow** - 3-step setup (Sign in → Name therapist → Voice selection)
- **Settings Dialog** - Customize therapist name, voice, TTS toggle, view memories, mood history
- **Error Boundary** - Graceful error handling with user-friendly messages
- **Landing Page** - Beautiful landing page before sign-in

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
| **Charts** | Recharts |

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

#### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT
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
│                   Memory Extractor                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Personal     │ │ Emotions      │ │ Topics       │            │
│  │ Facts        │ │ Detection     │ │ Extraction   │            │
│  │ - Name       │ │ - Anxiety    │ │ - Problems   │            │
│  │ - Location   │ │ - Sadness    │ │ - Goals      │            │
│  │ - Job        │ │ - Anger      │ │ - Work       │            │
│  │ - Family     │ │ - Happiness  │ │ - Relations  │            │
│  │ - Hobbies    │ │ - Fatigue    │ │              │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
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
│  - Set importance score (1-10)                                 │
│  - Mark category (personal/topic/emotion/preference)            │
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
│ Send Message  │    │ Extract       │    │ AI Response  │
│ to Gemini     │    │ Memories      │    │ with Context │
└───────────────┘    └───────────────┘    └───────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────┐
                              │ Check Learning Opportunity      │
                              │ - 40% probability              │
                              │ - After 1+ messages            │
                              │ - Select unasked question      │
                              └─────────────────────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────┐
                              │ Ask Follow-up Question         │
                              │ - "I'd love to know..."        │
                              │ - Reference past emotions      │
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
│                  Transcript Handling                            │
│  - Real-time interim display                                   │
│  - Final transcript on speech end                              │
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
│  - Preferred voices: Karen, Samantha, Daniel, Moira, etc.       │
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
| `learningQuestions.ts` | Generates learning questions, follow-ups, and contextual memory retrieval |
| `db.ts` | Supabase database operations for sessions, messages, memories, emotions, journal |
| `gemini.ts` | Gemini AI configuration |

### Components

| Component | Purpose |
|-----------|---------|
| `ChatApp.tsx` | Main chat interface with session management |
| `MessageBubble.tsx` | Individual chat messages with memory indicator |
| `MessagesList.tsx` | Scrollable message container |
| `InputArea.tsx` | Text input, voice recorder, activities menu |
| `MemoryViewer.tsx` | View/search/filter/delete memories with stats |
| `MoodChart.tsx` | Recharts visualization of emotion history |
| `Journal.tsx` | Journal entry create/edit/delete UI |
| `EmotionScaleSliders.tsx` | 1-10 emotion tracking with presets |
| `BreathingExercise.tsx` | Box breathing UI with animation |
| `SoundTherapy.tsx` | Ambient sound player |
| `VoiceRecorder.tsx` | Speech input UI |
| `SettingsDialog.tsx` | User preferences with tabs |
| `Sidebar.tsx` | Session list navigation |
| `AppLayout.tsx` | Responsive layout with mobile sidebar |
| `Onboarding.tsx` | 3-step initial setup |
| `LandingPage.tsx` | Pre-auth landing page |

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

## Local Setup Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google account (for Gemini API)
- Supabase account (free tier works)
- Firebase account (free tier works)

### Step 1: Clone & Install
```bash
git clone https://github.com/grahamrr7/ai_therapist.git
cd ai_therapist
npm install
```

### Step 2: Supabase Setup
1. Go to https://supabase.com and create a new project
2. In the SQL Editor, run all migrations in `supabase/migrations/`
3. Go to Project Settings → API
4. Copy the **Project URL** and **anon public key**

### Step 3: Firebase Setup
1. Go to https://console.firebase.google.com and create a project
2. Enable **Authentication**: Enable Email/Password and Google sign-in
3. Go to Project Settings → General
4. Copy your **Web app config** (apiKey, authDomain, projectId, etc.)

### Step 4: Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy the key

### Step 5: Configure Environment
Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

### Step 6: Run
```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Firebase
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
- **Pets**: "I have a dog/cat", "my pet is..."

### Emotions (7 Categories)
- **Anxiety**: anxious, worried, nervous, panic, overwhelmed, stressed, fear, scared
- **Sadness**: sad, depressed, down, hopeless, heartbroken, lonely, empty
- **Anger**: angry, frustrated, annoyed, irritated, furious, mad
- **Happiness**: happy, joy, excited, grateful, blessed, content, peaceful
- **Fatigue**: tired, exhausted, drained, burnout, drowsy, sleepy
- **Confusion**: confused, overwhelmed, lost, uncertain, stuck
- **Shame**: ashamed, embarrassed, humiliated, guilty

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

The AI asks learning questions after the first message with 40% probability:

1. "What do you do for work or study?"
2. "Where are you based?"
3. "Do you have any pets?"
4. "What are your hobbies?"
5. "Do you have a partner or kids?"
6. "How old are you?"
7. "Are you currently in school?"
8. "What do you hope to get out of therapy?"
9. "What's been on your mind lately?"
10. "How would you describe your living situation?"
11. "What does a typical day look like for you?"
12. "Are you more of an introvert or extrovert?"
13. "Is there a relationship you'd like to work on?"
14. "How do you usually cope with difficult emotions?"
15. "Do you prefer concrete advice or just someone to listen?"
16. "What's one thing that always makes you smile?"
17. "Are you a morning person or night owl?"
...and more

---

## Security Considerations

- **Row Level Security (RLS)** - Users can only access their own data (when enabled)
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
- **Charts**: Recharts