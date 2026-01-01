-- Outbound Sales Automation Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DOMAINS TABLE
-- ============================================
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(253) NOT NULL,
    tld VARCHAR(63) NOT NULL,
    full_domain VARCHAR(320) GENERATED ALWAYS AS (name || '.' || tld) STORED,
    buy_now_price DECIMAL(10, 2),
    floor_price DECIMAL(10, 2),
    landing_page_url TEXT,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'expired')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_domain UNIQUE (name, tld),
    CONSTRAINT valid_buy_price CHECK (buy_now_price IS NULL OR buy_now_price > 0),
    CONSTRAINT valid_floor_price CHECK (floor_price IS NULL OR floor_price > 0),
    CONSTRAINT floor_lt_buy CHECK (floor_price IS NULL OR buy_now_price IS NULL OR floor_price <= buy_now_price)
);

CREATE INDEX idx_domains_status ON domains(status);
CREATE INDEX idx_domains_full_domain ON domains(full_domain);

-- ============================================
-- PROSPECTS TABLE
-- ============================================
CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(320),
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    source VARCHAR(100) NOT NULL,
    source_details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'engaged', 'qualified', 'converted', 'unsubscribed')),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    timezone VARCHAR(50),
    do_not_contact BOOLEAN DEFAULT FALSE,
    unsubscribed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_prospects_email ON prospects(email);
CREATE INDEX idx_prospects_phone ON prospects(phone);
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_domain ON prospects(domain_id);

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'voicemail', 'multi_channel')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    schedule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_criteria JSONB DEFAULT '{}',
    total_enrolled INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_replied INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(998) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    preview_text VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- ============================================
-- VOICEMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE voicemail_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    script TEXT NOT NULL,
    audio_file_path TEXT,
    audio_duration_seconds INTEGER,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voicemail_templates_active ON voicemail_templates(is_active);

-- ============================================
-- CAMPAIGN PROSPECTS JUNCTION TABLE
-- ============================================
CREATE TABLE campaign_prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'paused', 'removed', 'unsubscribed')),
    current_step INTEGER DEFAULT 0,
    next_action_at TIMESTAMPTZ,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    voicemails_sent INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,

    CONSTRAINT unique_campaign_prospect UNIQUE (campaign_id, prospect_id)
);

CREATE INDEX idx_cp_campaign ON campaign_prospects(campaign_id);
CREATE INDEX idx_cp_prospect ON campaign_prospects(prospect_id);
CREATE INDEX idx_cp_status ON campaign_prospects(status);
CREATE INDEX idx_cp_next_action ON campaign_prospects(next_action_at) WHERE status = 'in_progress';

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_prospect ON activity_logs(prospect_id);
CREATE INDEX idx_activity_campaign ON activity_logs(campaign_id);
CREATE INDEX idx_activity_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- ============================================
-- ESCALATION RULES TABLE
-- ============================================
CREATE TABLE escalation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    actions JSONB NOT NULL,
    cooldown_hours INTEGER DEFAULT 24,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escalation_active ON escalation_rules(is_active);

-- ============================================
-- ESCALATION EVENTS TABLE
-- ============================================
CREATE TABLE escalation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES escalation_rules(id) ON DELETE SET NULL,
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    trigger_data JSONB,
    actions_taken JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escalation_events_rule ON escalation_events(rule_id);
CREATE INDEX idx_escalation_events_prospect ON escalation_events(prospect_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_voicemail_templates_updated_at BEFORE UPDATE ON voicemail_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_escalation_rules_updated_at BEFORE UPDATE ON escalation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicemail_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_events ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (single-tenant for now)
CREATE POLICY "Authenticated users can view all domains" ON domains FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage domains" ON domains FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all prospects" ON prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage prospects" ON prospects FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all campaigns" ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage campaigns" ON campaigns FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all email_templates" ON email_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage email_templates" ON email_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all voicemail_templates" ON voicemail_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage voicemail_templates" ON voicemail_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all activity_logs" ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage activity_logs" ON activity_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all escalation_rules" ON escalation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage escalation_rules" ON escalation_rules FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all campaign_prospects" ON campaign_prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage campaign_prospects" ON campaign_prospects FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all escalation_events" ON escalation_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage escalation_events" ON escalation_events FOR ALL TO authenticated USING (true);
