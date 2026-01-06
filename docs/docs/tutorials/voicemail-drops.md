---
sidebar_position: 5
---

# Tutorial: Voicemail Drops

Send ringless voicemails that get callbacks.

## What is Ringless Voicemail?

Ringless voicemail (RVM) delivers your message directly to voicemail without the recipient's phone ringing. Benefits:

- Less intrusive than calling
- More personal than email
- Higher engagement than text
- Recipient listens on their schedule

## Setup Requirements

Before sending voicemails:

1. **Slybroadcast account** - Create at [slybroadcast.com](https://www.slybroadcast.com)
2. **Verified caller ID** - Your callback number
3. **Credits** - Purchase voicemail credits
4. **Configure in Settings** - Add credentials to Deep Outbound

Optional:
- **ElevenLabs account** - For AI voice synthesis

## Writing Voicemail Scripts

### The Perfect Structure

```
[Greeting] - 2 seconds
[Who you are] - 3 seconds
[Why you're calling] - 10 seconds
[Call to action] - 5 seconds
[Callback number x2] - 5 seconds
[Sign off] - 2 seconds
```

**Total: Under 30 seconds**

### Example Script

```
Hey {{lead.first_name}}, this is {{sender.name}}.

I'm reaching out because I have a domain - {{domain.full}} - that I
think could be perfect for {{lead.company}}.

If you're interested in hearing more, give me a call back at
{{sender.phone}}. Again, that's {{sender.phone}}.

Thanks, talk soon!
```

### Key Elements

1. **Casual greeting** - "Hey" not "Hello, Mr. Smith"
2. **Quick intro** - Just your name, no company pitch
3. **One clear reason** - Why they should care
4. **Specific CTA** - Call back, not "let me know"
5. **Number twice** - So they can write it down

## Creating a Voicemail Template

### Step 1: Write Your Script

Using the structure above, write a script that:
- Sounds natural when spoken
- Includes key personalization
- Stays under 30 seconds

### Step 2: Create Template

1. Go to **Templates**
2. Click **New Voicemail Template**
3. Enter:
   - Name: "Initial Voicemail"
   - Script: Your voicemail text
4. Save

### Step 3: Preview with Voice (Optional)

If ElevenLabs is configured:

1. Select a voice from the dropdown
2. Click **Preview**
3. Listen to the synthesized audio
4. Adjust script if needed

## Voice Selection Tips

ElevenLabs offers various voices. Choose based on:

| Factor | Recommendation |
|--------|----------------|
| Your gender | Match your actual voice gender |
| Tone | Professional but friendly |
| Accent | Neutral American usually works best |
| Speed | Medium pace, not rushed |

Test multiple voices to find one that sounds authentic.

## Using Voicemail in Campaigns

### Adding Voicemail Steps

1. Create or edit a campaign
2. In the Steps section, click **Add Step**
3. Select **Voicemail** as the type
4. Choose your voicemail template
5. Set the delay from previous step

### Recommended Sequence

```
Day 0: Email (Introduction)
Day 3: Voicemail (Personal follow-up)
Day 7: Email (Final email)
```

The voicemail adds a personal touch between emails.

## Script Templates

### Initial Voicemail

```
Hey {{lead.first_name}}, this is {{sender.name}}.

I sent you an email about a domain I have - {{domain.full}}.
I think it could be a great fit for {{lead.company}}.

Give me a call at {{sender.phone}} if you want to chat.
Again, {{sender.phone}}.

Thanks!
```

### Follow-Up Voicemail

```
Hi {{lead.first_name}}, {{sender.name}} here.

Just following up on my previous message about {{domain.full}}.
Still available and thought of {{lead.company}}.

My number is {{sender.phone}}. That's {{sender.phone}}.

Talk soon.
```

### Value Proposition Voicemail

```
{{lead.first_name}}, it's {{sender.name}}.

Quick message - owning {{domain.full}} could give {{lead.company}}
better brand recognition and direct type-in traffic.

If that sounds interesting, call me at {{sender.phone}}.
Again, {{sender.phone}}.

Thanks!
```

## Best Practices

### Timing

**Best days:**
- Tuesday, Wednesday, Thursday

**Best times:**
- 10am-12pm
- 2pm-4pm
- Recipient's timezone

**Avoid:**
- Monday mornings
- Friday afternoons
- Weekends

### Delivery

- Only US phone numbers supported
- Verify numbers are valid
- Mobile numbers work best
- Landlines may have lower delivery

### Content

DO:
- Sound natural and conversational
- Get to the point quickly
- Say your callback number twice
- Use contractions ("I'm" not "I am")

DON'T:
- Sound scripted or robotic
- Include long pauses
- Speak too fast
- Leave multiple voicemails in one day

## Tracking Results

View voicemail status in campaigns:

| Status | Meaning |
|--------|---------|
| Queued | Waiting to send |
| Sent | Delivered to carrier |
| Delivered | Confirmed in voicemail |
| Failed | Delivery failed |

### Measuring Success

Track:
- **Delivery rate** - Aim for 85%+
- **Callback rate** - 1-3% is typical
- **Response quality** - Are callbacks turning into conversations?

## Troubleshooting

### Voicemails Not Delivering

1. Check Slybroadcast credits balance
2. Verify phone number format (10 digits)
3. Confirm US phone number
4. Review Slybroadcast dashboard for errors

### Poor Audio Quality

1. Simplify the script (avoid complex words)
2. Try different ElevenLabs voice
3. Remove special characters from script
4. Consider recording your own audio

### Low Callback Rate

1. Make script more compelling
2. Say callback number more clearly
3. Try different timing
4. Test different voice/tone
