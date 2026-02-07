-- ============================================
-- X-AMPLIFY V2 DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Synced from Clerk via webhook
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Stripe integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive' 
        CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled', 'trialing')),
    subscription_plan TEXT DEFAULT 'free'
        CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_period_end TIMESTAMPTZ,
    
    -- Credit system
    credits_balance INTEGER DEFAULT 10 NOT NULL,
    credits_monthly_reset INTEGER DEFAULT 10,
    credits_last_reset TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for Clerk lookups
CREATE INDEX idx_profiles_clerk_id ON public.profiles(clerk_id);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- ============================================
-- PERSONAS TABLE
-- Tone of Voice library
-- ============================================
CREATE TABLE public.personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    -- Analyzed tone characteristics (JSON for flexibility)
    tone_profile JSONB DEFAULT '{}'::jsonb,
    
    -- Sample tweets for few-shot prompting (array of strings)
    sample_tweets TEXT[] DEFAULT '{}',
    
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_personas_user ON public.personas(user_id);

-- Ensure only one default persona per user
CREATE UNIQUE INDEX idx_personas_default ON public.personas(user_id) 
    WHERE is_default = TRUE;

-- ============================================
-- GENERATIONS TABLE
-- All generated content
-- ============================================
CREATE TABLE public.generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES public.personas(id) ON DELETE SET NULL,
    
    -- Input context
    source_type TEXT NOT NULL 
        CHECK (source_type IN ('manual', 'youtube', 'article', 'thread')),
    source_url TEXT,
    source_content TEXT,
    
    -- Generated output
    content TEXT NOT NULL,
    thread_content TEXT[],
    
    -- Viral scoring (computed)
    viral_score JSONB DEFAULT '{}'::jsonb,
    
    -- User actions
    is_favorite BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    published_tweet_id TEXT,
    
    -- Metadata
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_generations_user ON public.generations(user_id);
CREATE INDEX idx_generations_favorite ON public.generations(user_id, is_favorite) 
    WHERE is_favorite = TRUE;
CREATE INDEX idx_generations_created ON public.generations(created_at DESC);

-- ============================================
-- USAGE LOGS TABLE
-- Audit trail for credit consumption
-- ============================================
CREATE TABLE public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    action TEXT NOT NULL 
        CHECK (action IN (
            'generation', 
            'youtube_extract', 
            'persona_analyze',
            'credit_purchase',
            'credit_subscription',
            'credit_reset',
            'credit_bonus'
        )),
    
    credits_delta INTEGER NOT NULL,
    credits_before INTEGER NOT NULL,
    credits_after INTEGER NOT NULL,
    
    -- Reference to related entity
    reference_type TEXT,
    reference_id UUID,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_usage_logs_user ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created ON public.usage_logs(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER personas_updated_at
    BEFORE UPDATE ON public.personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to deduct credits with logging
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_action TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_credits INTEGER;
BEGIN
    -- Get current balance with row lock
    SELECT credits_balance INTO v_current_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Check sufficient balance
    IF v_current_credits < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct credits
    UPDATE public.profiles
    SET credits_balance = credits_balance - p_amount
    WHERE id = p_user_id;
    
    -- Log the usage
    INSERT INTO public.usage_logs (
        user_id, action, credits_delta, 
        credits_before, credits_after,
        reference_type, reference_id, metadata
    ) VALUES (
        p_user_id, p_action, -p_amount,
        v_current_credits, v_current_credits - p_amount,
        p_reference_type, p_reference_id, p_metadata
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
