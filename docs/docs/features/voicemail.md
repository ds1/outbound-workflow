---
sidebar_position: 6
---

# Voicemail Drops

Send ringless voicemails to prospects using Slybroadcast integration.

## Overview

Ringless voicemail (RVM) delivers your message directly to voicemail without the phone ringing. It's less intrusive than calling and more personal than email.

## How It Works

1. Create a voicemail template with your script
2. Generate audio using ElevenLabs voice synthesis (or upload your own)
3. Send via Slybroadcast to prospects' phones
4. Message appears in their voicemail

## Setup Requirements

### Slybroadcast Account

1. Create account at [slybroadcast.com](https://www.slybroadcast.com)
2. Verify your caller ID number
3. Purchase credits
4. Enter credentials in Deep Outbound Settings

### ElevenLabs (Optional)

For AI voice synthesis:

1. Create account at [elevenlabs.io](https://elevenlabs.io)
2. Copy your API key
3. Enter in Deep Outbound Settings

## Creating Voicemail Content

### Writing Scripts

Good voicemail scripts:
- **Length**: Under 30 seconds
- **Tone**: Conversational, not scripted
- **Structure**:
  1. Quick intro (who you are)
  2. Why you're calling
  3. What you want them to do
  4. Callback number (say it twice)

### Example Script

```
Hi {{lead.first_name}}, this is {{sender.name}}.

I noticed your company is in the weather technology space, and I have
the domain {{domain.full}} available. It could be a great fit for
{{lead.company}}.

Give me a call back at {{sender.phone}}. Again, that's {{sender.phone}}.

Thanks!
```

### Voice Synthesis

With ElevenLabs configured:

1. Create your voicemail template
2. Select a voice from the dropdown
3. Click **Preview** to hear the audio
4. Adjust script if needed
5. Save when satisfied

## Sending Voicemails

### In Campaigns

1. Add a voicemail step to your campaign
2. Select your voicemail template
3. Set the delay from previous step
4. Prospects with phone numbers receive voicemails

### Individual Sends

1. Go to a lead's detail page
2. Click **Send Voicemail**
3. Select template
4. Confirm and send

## Best Practices

### Timing

- **Best days**: Tuesday, Wednesday, Thursday
- **Best times**: 10am-12pm, 2pm-4pm
- **Avoid**: Mondays, Fridays, weekends

### Content

- Sound authentic, not salesy
- Keep it brief and focused
- Include clear callback number
- Mention a specific benefit

### Compliance

- Only contact business numbers
- Honor do-not-call requests
- Follow TCPA guidelines
- Keep records of consent

## Tracking

View voicemail status in campaigns:

| Status | Meaning |
|--------|---------|
| **Queued** | Waiting to send |
| **Sent** | Delivered to carrier |
| **Delivered** | Confirmed in voicemail |
| **Failed** | Delivery failed |

## Troubleshooting

### Voicemails Not Delivering

- Verify phone numbers are valid US numbers
- Check Slybroadcast credits balance
- Review delivery status in Slybroadcast dashboard
- Ensure caller ID is verified

### Audio Quality Issues

- Keep scripts clear and simple
- Avoid complex words
- Test different ElevenLabs voices
- Consider recording your own audio

## Related

- [Templates](/features/templates) - Create voicemail scripts
- [Campaigns](/features/campaigns) - Include voicemail steps
- [Configuration](/getting-started/configuration) - Set up integrations
