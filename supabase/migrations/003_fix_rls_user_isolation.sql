-- ============================================
-- FIX: User Data Isolation via RLS
-- Previously all policies used USING (true) which allowed
-- any authenticated user to see/modify all data
-- ============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all domains" ON domains;
DROP POLICY IF EXISTS "Authenticated users can manage domains" ON domains;
DROP POLICY IF EXISTS "Authenticated users can view all prospects" ON prospects;
DROP POLICY IF EXISTS "Authenticated users can manage prospects" ON prospects;
DROP POLICY IF EXISTS "Authenticated users can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON campaigns;
DROP POLICY IF EXISTS "Authenticated users can view all email_templates" ON email_templates;
DROP POLICY IF EXISTS "Authenticated users can manage email_templates" ON email_templates;
DROP POLICY IF EXISTS "Authenticated users can view all voicemail_templates" ON voicemail_templates;
DROP POLICY IF EXISTS "Authenticated users can manage voicemail_templates" ON voicemail_templates;
DROP POLICY IF EXISTS "Authenticated users can view all activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated users can manage activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated users can view all escalation_rules" ON escalation_rules;
DROP POLICY IF EXISTS "Authenticated users can manage escalation_rules" ON escalation_rules;
DROP POLICY IF EXISTS "Authenticated users can view all campaign_prospects" ON campaign_prospects;
DROP POLICY IF EXISTS "Authenticated users can manage campaign_prospects" ON campaign_prospects;
DROP POLICY IF EXISTS "Authenticated users can view all escalation_events" ON escalation_events;
DROP POLICY IF EXISTS "Authenticated users can manage escalation_events" ON escalation_events;

-- ============================================
-- DOMAINS - user_id column
-- ============================================
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

-- ============================================
-- PROSPECTS (leads) - user_id column
-- ============================================
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

-- ============================================
-- CAMPAIGNS - created_by column
-- ============================================
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

-- ============================================
-- EMAIL_TEMPLATES - created_by column
-- ============================================
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

-- ============================================
-- VOICEMAIL_TEMPLATES - created_by column
-- ============================================
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

-- ============================================
-- ACTIVITY_LOGS - created_by column
-- ============================================
CREATE POLICY "Users can view own activity_logs" ON activity_logs
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can insert own activity_logs" ON activity_logs
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Activity logs typically shouldn't be updated/deleted by users
-- but allowing for completeness
CREATE POLICY "Users can update own activity_logs" ON activity_logs
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete own activity_logs" ON activity_logs
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- ============================================
-- ESCALATION_RULES - created_by column
-- ============================================
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

-- ============================================
-- CAMPAIGN_PROSPECTS - access via campaign ownership
-- Users can only see/manage campaign_prospects for their own campaigns
-- ============================================
CREATE POLICY "Users can view own campaign_prospects" ON campaign_prospects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_prospects.campaign_id
            AND campaigns.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert own campaign_prospects" ON campaign_prospects
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_prospects.campaign_id
            AND campaigns.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update own campaign_prospects" ON campaign_prospects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_prospects.campaign_id
            AND campaigns.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete own campaign_prospects" ON campaign_prospects
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_prospects.campaign_id
            AND campaigns.created_by = auth.uid()
        )
    );

-- ============================================
-- ESCALATION_EVENTS - access via rule ownership
-- ============================================
CREATE POLICY "Users can view own escalation_events" ON escalation_events
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM escalation_rules
            WHERE escalation_rules.id = escalation_events.rule_id
            AND escalation_rules.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert own escalation_events" ON escalation_events
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM escalation_rules
            WHERE escalation_rules.id = escalation_events.rule_id
            AND escalation_rules.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete own escalation_events" ON escalation_events
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM escalation_rules
            WHERE escalation_rules.id = escalation_events.rule_id
            AND escalation_rules.created_by = auth.uid()
        )
    );

-- ============================================
-- FIX TABLES FROM MIGRATION 002
-- ============================================

-- Drop existing permissive policies from migration 002
DROP POLICY IF EXISTS "Service role can manage cost_logs" ON cost_logs;
DROP POLICY IF EXISTS "Service role can manage notification_preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Service role can manage user_settings" ON user_settings;

-- ============================================
-- COST_LOGS - add user_id column and RLS
-- ============================================
ALTER TABLE cost_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Users can view own cost_logs" ON cost_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cost_logs" ON cost_logs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- NOTIFICATION_PREFERENCES - user_id column exists
-- ============================================
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

-- ============================================
-- USER_SETTINGS - user_id column exists
-- ============================================
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
