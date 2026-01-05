-- Fix escalation email default - remove hardcoded email address
-- The escalation_email should be empty by default, requiring users to set their own

-- Remove the default value so new users must set their own email
ALTER TABLE notification_preferences
  ALTER COLUMN escalation_email DROP DEFAULT;

-- Make the column nullable so it can be empty
ALTER TABLE notification_preferences
  ALTER COLUMN escalation_email DROP NOT NULL;

-- Clear any existing rows that have the old hardcoded default
-- (Only clear if it's the hardcoded value, not user-entered values)
UPDATE notification_preferences
  SET escalation_email = NULL
  WHERE escalation_email = 'danmakesthings@gmail.com';
