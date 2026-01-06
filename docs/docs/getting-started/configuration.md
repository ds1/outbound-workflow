---
sidebar_position: 3
---

# Configuration

Configure Deep Outbound settings and API integrations for full functionality.

## Settings Overview

Access settings from the sidebar by clicking **Settings**.

### Profile Settings

Configure your personal information that appears in outreach:

- **Name**: Your name (used in `{{sender.name}}` variable)
- **Email**: Your reply-to email address
- **Phone**: Your callback number (for voicemail templates)

These values populate the sender variables in your templates, so make sure they're accurate.

## API Keys

Deep Outbound integrates with several external services. Configure API keys to enable each feature.

### Anthropic (Claude AI)

**Enables**: AI content generation for emails and voicemail scripts

1. Visit [anthropic.com](https://anthropic.com) and create an account
2. Generate an API key from your dashboard
3. Paste into the **Anthropic API Key** field in Settings

**Cost**: Pay-per-use based on tokens generated

### ElevenLabs

**Enables**: Voice synthesis for voicemail audio

1. Visit [elevenlabs.io](https://elevenlabs.io) and create an account
2. Copy your API key from your profile
3. Paste into the **ElevenLabs API Key** field

**Cost**: Character-based pricing, free tier available

### Resend

**Enables**: Email delivery with tracking

1. Visit [resend.com](https://resend.com) and create an account
2. Add and verify your sending domain
3. Generate an API key
4. Paste into the **Resend API Key** field

**Cost**: Free tier up to 3,000 emails/month

### Slybroadcast

**Enables**: Ringless voicemail drops

1. Visit [slybroadcast.com](https://slybroadcast.com) and create an account
2. Get your credentials from your account dashboard
3. Enter in Settings:
   - **Slybroadcast Email**: Your account email
   - **Slybroadcast Password**: Your account password
   - **Caller ID**: Your verified callback number

**Cost**: Per-voicemail pricing, purchase credits in advance

## Notification Preferences

Configure when and how you receive alerts:

### Cost Alerts

- **Enable cost threshold alerts**: Get notified when API usage approaches your budget
- **Monthly budget**: Set your spending limit

### Escalation Notifications

- **Email address**: Where to send escalation alerts
- **Notification types**: Choose which events trigger emails

## Security Notes

- API keys are encrypted and stored securely
- Keys are never displayed in full after saving
- You can update keys at any time
- Revoking keys in the provider's dashboard disables the integration

## Testing Your Configuration

After configuring API keys:

1. **Test email**: Create a test template and send to yourself
2. **Test AI**: Use "Generate with AI" when creating a template
3. **Test voice**: Preview a voicemail script with voice synthesis

## Next Steps

- [Add domains to your portfolio](/features/domains)
- [Start finding leads](/features/lead-discovery)
