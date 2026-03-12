-- Create memories table for storing user information across sessions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('personal', 'topic', 'emotion', 'preference')),
    importance INTEGER NOT NULL DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    source_message_id TEXT,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    last_referenced_at BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_importance ON memories(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_category ON memories(user_id, category);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own memories
CREATE POLICY "Users can only see their own memories" ON memories
    FOR ALL
    USING (auth.uid()::TEXT = user_id);

-- Comment for documentation
COMMENT ON TABLE memories IS 'Stores AI memory about the user - personal facts, topics discussed, emotions, preferences';
COMMENT ON COLUMN memories.content IS 'The actual memory content - what was remembered';
COMMENT ON COLUMN memories.category IS 'Type of memory: personal, topic, emotion, or preference';
COMMENT ON COLUMN memories.importance IS 'Importance score 1-10, higher = more important to remember';
