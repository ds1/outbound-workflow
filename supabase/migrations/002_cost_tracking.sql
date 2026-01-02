-- Cost tracking table for monitoring API usage costs
CREATE TABLE IF NOT EXISTS cost_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL, -- 'resend', 'slybroadcast', 'elevenlabs', 'claude'
    operation TEXT NOT NULL, -- 'email_sent', 'voicemail_sent', 'voice_generated', 'content_generated'
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT NOT NULL, -- 'email', 'voicemail', 'character', 'token'
    unit_cost DECIMAL(10, 6) NOT NULL,
    total_cost DECIMAL(10, 4) NOT NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_cost_logs_service ON cost_logs(service);
CREATE INDEX idx_cost_logs_created_at ON cost_logs(created_at);
CREATE INDEX idx_cost_logs_campaign_id ON cost_logs(campaign_id);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    escalation_email TEXT NOT NULL DEFAULT 'danmakesthings@gmail.com',
    daily_digest BOOLEAN NOT NULL DEFAULT true,
    reply_alerts BOOLEAN NOT NULL DEFAULT true,
    cost_alerts BOOLEAN NOT NULL DEFAULT false,
    cost_alert_threshold DECIMAL(10, 2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User settings table for storing API keys and other user-specific settings
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- Enable RLS
ALTER TABLE cost_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for cost_logs (service role can insert, users can view)
CREATE POLICY "Service role can manage cost_logs" ON cost_logs
    FOR ALL USING (true);

CREATE POLICY "Service role can manage notification_preferences" ON notification_preferences
    FOR ALL USING (true);

CREATE POLICY "Service role can manage user_settings" ON user_settings
    FOR ALL USING (true);

-- Function to get cost summary
CREATE OR REPLACE FUNCTION get_cost_summary(
    start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    service TEXT,
    total_operations BIGINT,
    total_cost DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cl.service,
        COUNT(*)::BIGINT as total_operations,
        SUM(cl.total_cost)::DECIMAL(10, 2) as total_cost
    FROM cost_logs cl
    WHERE cl.created_at BETWEEN start_date AND end_date
    GROUP BY cl.service
    ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql;
