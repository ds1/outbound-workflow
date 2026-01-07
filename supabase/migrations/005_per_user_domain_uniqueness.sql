-- Migration: Allow multiple users to list the same domain
-- Changes unique constraint from global (name, tld) to per-user (user_id, name, tld)

-- Drop the existing global unique constraint
ALTER TABLE domains DROP CONSTRAINT IF EXISTS unique_domain;

-- Add new per-user unique constraint
-- This allows different users to list the same domain while preventing
-- a single user from adding duplicate domains to their own portfolio
ALTER TABLE domains ADD CONSTRAINT unique_domain_per_user UNIQUE (user_id, name, tld);

-- Note: Existing domains without user_id will need to be cleaned up or assigned
-- Run this query to find orphaned domains:
-- SELECT * FROM domains WHERE user_id IS NULL;
