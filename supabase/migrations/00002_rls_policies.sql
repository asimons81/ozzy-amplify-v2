-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Using Clerk JWT verification
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JWT HELPER FUNCTION
-- Extracts Clerk user ID from JWT
-- ============================================
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
BEGIN
    -- Clerk stores user ID in 'sub' claim
    RETURN NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper to get internal profile ID from Clerk ID
CREATE OR REPLACE FUNCTION auth.current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles 
    WHERE clerk_id = auth.clerk_user_id()
    LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (clerk_id = auth.clerk_user_id());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (clerk_id = auth.clerk_user_id())
    WITH CHECK (clerk_id = auth.clerk_user_id());

-- INSERT handled by webhook (service role)

-- ============================================
-- PERSONAS POLICIES
-- ============================================
CREATE POLICY "Users can view own personas"
    ON public.personas FOR SELECT
    USING (user_id = auth.current_profile_id());

CREATE POLICY "Users can create personas"
    ON public.personas FOR INSERT
    WITH CHECK (user_id = auth.current_profile_id());

CREATE POLICY "Users can update own personas"
    ON public.personas FOR UPDATE
    USING (user_id = auth.current_profile_id());

CREATE POLICY "Users can delete own personas"
    ON public.personas FOR DELETE
    USING (user_id = auth.current_profile_id());

-- ============================================
-- GENERATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own generations"
    ON public.generations FOR SELECT
    USING (user_id = auth.current_profile_id());

CREATE POLICY "Users can create generations"
    ON public.generations FOR INSERT
    WITH CHECK (user_id = auth.current_profile_id());

CREATE POLICY "Users can update own generations"
    ON public.generations FOR UPDATE
    USING (user_id = auth.current_profile_id());

CREATE POLICY "Users can delete own generations"
    ON public.generations FOR DELETE
    USING (user_id = auth.current_profile_id());

-- ============================================
-- USAGE LOGS POLICIES
-- ============================================
CREATE POLICY "Users can view own usage logs"
    ON public.usage_logs FOR SELECT
    USING (user_id = auth.current_profile_id());

-- INSERT handled by functions/service role
