-- ==============================================================================
-- ALBORISS TYPING ASSESSMENT SYSTEM — DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create BATCHES table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number INT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    passage_id TEXT NOT NULL DEFAULT 'passage_a',
    max_candidates INT NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ
);

-- 3. Create TYPING_ATTEMPTS table
CREATE TABLE IF NOT EXISTS public.typing_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PRACTICE' CHECK (status IN ('PRACTICE', 'IN_PROGRESS', 'COMPLETED', 'INVALID')),
    invalid_reason TEXT,
    practice_started_at TIMESTAMPTZ,
    test_started_at TIMESTAMPTZ,
    test_completed_at TIMESTAMPTZ,
    gross_wpm NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    net_wpm NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    errors INT NOT NULL DEFAULT 0,
    correct_characters INT NOT NULL DEFAULT 0,
    incorrect_characters INT NOT NULL DEFAULT 0,
    total_characters INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_number ON public.batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_typing_attempts_batch_id ON public.typing_attempts(batch_id);
CREATE INDEX IF NOT EXISTS idx_typing_attempts_candidate_name ON public.typing_attempts(lower(candidate_name));
CREATE INDEX IF NOT EXISTS idx_typing_attempts_status ON public.typing_attempts(status);
CREATE INDEX IF NOT EXISTS idx_typing_attempts_batch_candidate ON public.typing_attempts(batch_id, lower(candidate_name));

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to batches so candidates can check the active batch
CREATE POLICY "Allow public read access to batches"
    ON public.batches FOR SELECT
    USING (true);

-- Allow public create/update on batches for admin client (using anon key)
CREATE POLICY "Allow public insert to batches"
    ON public.batches FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update to batches"
    ON public.batches FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete to batches"
    ON public.batches FOR DELETE
    USING (true);

-- Allow public read access to typing_attempts
CREATE POLICY "Allow public read access to typing_attempts"
    ON public.typing_attempts FOR SELECT
    USING (true);

-- Allow public insert to typing_attempts (for starting practice/test)
CREATE POLICY "Allow public insert to typing_attempts"
    ON public.typing_attempts FOR INSERT
    WITH CHECK (true);

-- Allow public update to typing_attempts (for saving completed/invalid results)
CREATE POLICY "Allow public update to typing_attempts"
    ON public.typing_attempts FOR UPDATE
    USING (true);

-- Allow public delete to typing_attempts
CREATE POLICY "Allow public delete to typing_attempts"
    ON public.typing_attempts FOR DELETE
    USING (true);

-- 6. Enable Realtime Publications
-- Enables instant live admin monitor updates when candidates submit/progress
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'typing_attempts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_attempts;
    END IF;
END $$;

-- 7. Seed Initial Batch 01 if no batches exist
INSERT INTO public.batches (batch_number, name, status, passage_id, max_candidates, started_at)
VALUES (1, 'Batch 01', 'OPEN', 'passage_a', 15, now())
ON CONFLICT (batch_number) DO NOTHING;
