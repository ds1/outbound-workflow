-- Migration: Add started_at and completed_at columns to campaigns table
-- These columns are referenced by useStartCampaign() and useCompleteCampaign() hooks

-- Add started_at column (set when campaign is started)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Add completed_at column (set when campaign is completed)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add index for querying active campaigns by start time
CREATE INDEX IF NOT EXISTS idx_campaigns_started_at ON campaigns(started_at);
