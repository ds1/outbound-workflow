-- CRITICAL SECURITY FIX: User Data Isolation
-- This migration adds user_id to all tables and updates RLS policies
-- to ensure users can only see their own data

-- ============================================
-- ADD USER_ID COLUMNS
-- ============================================

-- Add user_id to domains (required - core table)
ALTER TABLE domains ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);

-- Add user_id to prospects (required - core table)
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON prospects(user_id);

-- Add user_id to campaign_prospects (for direct querying)
ALTER TABLE campaign_prospects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_campaign_prospects_user_id ON campaign_prospects(user_id);

-- Add user_id to escalation_events
ALTER TABLE escalation_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_escalation_events_user_id ON escalation_events(user_id);

-- Add user_id to cost_logs
ALTER TABLE cost_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_cost_logs_user_id ON cost_logs(user_id);

-- ============================================
-- DROP OLD PERMISSIVE POLICIES
-- ============================================

-- Domains
DROP POLICY IF EXISTS "Authenticated users can view all domains" ON domains;
DROP POLICY IF EXISTS "Authenticated users can manage domains" ON domains;

-- Prospects
DROP POLICY IF EXISTS "Authenticated users can view all prospects" ON prospects;
DROP POLICY IF EXISTS "Authenticated users can manage prospects" ON prospects;

-- Campaigns
DROP POLICY IF EXISTS "Authenticated users can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON campaigns;

-- Email Templates
DROP POLICY IF EXISTS "Authenticated users can view all email_templates" ON email_templates;
DROP POLICY IF EXISTS "Authenticated users can manage email_templates" ON email_templates;

-- Voicemail Templates
DROP POLICY IF EXISTS "Authenticated users can view all voicemail_templates" ON voicemail_templates;
DROP POLICY IF EXISTS "Authenticated users can manage voicemail_templates" ON voicemail_templates;

-- Activity Logs
DROP POLICY IF EXISTS "Authenticated users can view all activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated users can manage activity_logs" ON activity_logs;

-- Escalation Rules
DROP POLICY IF EXISTS "Authenticated users can view all escalation_rules" ON escalation_rules;
DROP POLICY IF EXISTS "Authenticated users can manage escalation_rules" ON escalation_rules;

-- Campaign Prospects
DROP POLICY IF EXISTS "Authenticated users can view all campaign_prospects" ON campaign_prospects;
DROP POLICY IF EXISTS "Authenticated users can manage campaign_prospects" ON campaign_prospects;

-- Escalation Events
DROP POLICY IF EXISTS "Authenticated users can view all escalation_events" ON escalation_events;
DROP POLICY IF EXISTS "Authenticated users can manage escalation_events" ON escalation_events;

-- Cost Logs
DROP POLICY IF EXISTS "Service role can manage cost_logs" ON cost_logs;

-- Notification Preferences
DROP POLICY IF EXISTS "Service role can manage notification_preferences" ON notification_preferences;

-- User Settings
DROP POLICY IF EXISTS "Service role can manage user_settings" ON user_settings;

-- ============================================
-- CREATE NEW USER-SCOPED POLICIES
-- ============================================

-- DOMAINS: Users can only see/manage their own domains
CREATE POLICY "Users can view own domains" ON domains
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own domains" ON domains
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own domains" ON domains
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own domains" ON domains
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- PROSPECTS: Users can only see/manage their own prospects
CREATE POLICY "Users can view own prospects" ON prospects
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own prospects" ON prospects
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own prospects" ON prospects
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own prospects" ON prospects
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- CAMPAIGNS: Users can only see/manage their own campaigns (using created_by)
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- EMAIL TEMPLATES: Users can only see/manage their own templates (using created_by)
CREATE POLICY "Users can view own email_templates" ON email_templates
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert own email_templates" ON email_templates
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own email_templates" ON email_templates
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own email_templates" ON email_templates
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- VOICEMAIL TEMPLATES: Users can only see/manage their own templates (using created_by)
CREATE POLICY "Users can view own voicemail_templates" ON voicemail_templates
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert own voicemail_templates" ON voicemail_templates
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own voicemail_templates" ON voicemail_templates
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own voicemail_templates" ON voicemail_templates
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- ACTIVITY LOGS: Users can only see/manage their own logs (using created_by)
CREATE POLICY "Users can view own activity_logs" ON activity_logs
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert own activity_logs" ON activity_logs
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own activity_logs" ON activity_logs
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own activity_logs" ON activity_logs
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- ESCALATION RULES: Users can only see/manage their own rules (using created_by)
CREATE POLICY "Users can view own escalation_rules" ON escalation_rules
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert own escalation_rules" ON escalation_rules
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own escalation_rules" ON escalation_rules
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own escalation_rules" ON escalation_rules
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- CAMPAIGN PROSPECTS: Users can only see/manage their own (using user_id)
CREATE POLICY "Users can view own campaign_prospects" ON campaign_prospects
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own campaign_prospects" ON campaign_prospects
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaign_prospects" ON campaign_prospects
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own campaign_prospects" ON campaign_prospects
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ESCALATION EVENTS: Users can only see/manage their own (using user_id)
CREATE POLICY "Users can view own escalation_events" ON escalation_events
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own escalation_events" ON escalation_events
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own escalation_events" ON escalation_events
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own escalation_events" ON escalation_events
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- COST LOGS: Users can only see/manage their own
CREATE POLICY "Users can view own cost_logs" ON cost_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cost_logs" ON cost_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- NOTIFICATION PREFERENCES: Users can only see/manage their own
CREATE POLICY "Users can view own notification_preferences" ON notification_preferences
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification_preferences" ON notification_preferences
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification_preferences" ON notification_preferences
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notification_preferences" ON notification_preferences
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- USER SETTINGS: Users can only see/manage their own
CREATE POLICY "Users can view own user_settings" ON user_settings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own user_settings" ON user_settings
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user_settings" ON user_settings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own user_settings" ON user_settings
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());
