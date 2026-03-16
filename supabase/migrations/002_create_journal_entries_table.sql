-- Create journal_entries table for user journaling
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    updated_at BIGINT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(user_id, created_at DESC);

-- Disable RLS for now (can enable later with proper policy)
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
