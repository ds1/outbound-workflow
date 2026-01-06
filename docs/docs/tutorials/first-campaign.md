---
sidebar_position: 2
---

# Tutorial: Your First Campaign

Learn how to create an effective multi-step outreach campaign.

## Campaign Strategy

A good campaign follows this pattern:

```
Day 0: Email (Introduction)
Day 3: Voicemail (Personal touch)
Day 7: Email (Follow-up)
Day 10: Email (Final message)
```

This tutorial walks through creating this sequence.

## Prerequisites

- At least one domain added
- Some leads in your system
- Templates created (or use defaults)
- Resend API key configured

## Step 1: Plan Your Sequence

Before creating, decide:

1. **How many touches?** (3-5 recommended)
2. **What channels?** (email, voicemail, or both)
3. **What timing?** (2-4 days between touches)
4. **What messaging angle?** (value prop, urgency, etc.)

## Step 2: Create Templates

If you haven't already, create templates for each step:

### Email 1: Introduction

```
Subject: {{domain.full}} - perfect for {{lead.company}}?

Hi {{lead.first_name}},

I came across {{lead.company}} and thought {{domain.full}} could be
a great fit for your brand.

The domain is available for {{domain.price}}: {{domain.url}}

Would love to chat if you're interested.

{{sender.name}}
```

### Voicemail: Personal Touch

```
Hey {{lead.first_name}}, this is {{sender.name}}.

I sent you an email about {{domain.full}}. Thought it could be
a great fit for {{lead.company}}.

Give me a call at {{sender.phone}}. Again, {{sender.phone}}.

Thanks!
```

### Email 2: Follow-up

```
Subject: Following up on {{domain.full}}

Hi {{lead.first_name}},

Just following up on my previous email about {{domain.full}}.

I think it could really strengthen {{lead.company}}'s brand presence.

Happy to answer any questions: {{domain.url}}

{{sender.name}}
```

### Email 3: Final

```
Subject: Last note about {{domain.full}}

Hi {{lead.first_name}},

I'll keep this brief - wanted to give you one last chance to
grab {{domain.full}} before I move on.

If timing isn't right, no worries at all. Just let me know.

{{domain.url}}

{{sender.name}}
```

## Step 3: Create the Campaign

1. Go to **Campaigns** > **New Campaign**

2. **Details**:
   - Name: "WeatherRobots Full Sequence"
   - Type: Multi-channel
   - Description: "4-touch sequence over 10 days"

3. **Steps** - Add four steps:

   | Step | Type | Template | Delay |
   |------|------|----------|-------|
   | 1 | Email | Introduction | 0 days |
   | 2 | Voicemail | Personal Touch | 3 days |
   | 3 | Email | Follow-up | 4 days |
   | 4 | Email | Final | 3 days |

4. **Schedule**:
   - Start date: Tomorrow 9am
   - Window: Weekdays 9am-5pm
   - Timezone: Recipient's timezone

5. **Prospects**:
   - Select leads interested in your domain
   - Review the list
   - Confirm enrollment

6. Click **Start Campaign**

## Step 4: Monitor Performance

### During Campaign

Check daily for:
- Delivery status
- Open rates
- Click activity
- Any replies

### Key Metrics to Watch

| Metric | Good | Action if Low |
|--------|------|---------------|
| Open rate | >20% | Improve subject lines |
| Click rate | >2% | Better CTA |
| Reply rate | >1% | Stronger value prop |

## Step 5: Handle Responses

When leads reply:

1. **Interested**: Move to direct negotiation
2. **Questions**: Answer promptly
3. **Not interested**: Mark and exclude from future
4. **Unsubscribe**: Honor immediately

## Best Practices

### Timing

- Start on Tuesday/Wednesday
- Avoid Monday mornings, Friday afternoons
- Space steps 2-4 days apart

### Personalization

- Reference company name
- Mention specific domain benefits
- Be conversational, not salesy

### Compliance

- Include opt-out in every message
- Stop sequence on unsubscribe
- Honor do-not-contact requests

## Troubleshooting

### Low Open Rates

- Test different subject lines
- Send at different times
- Check sender reputation

### Low Response Rates

- Stronger value proposition
- More personalization
- Better call-to-action

### High Bounce Rate

- Verify email addresses
- Clean your lead list
- Check for spam triggers

## Next Steps

After this campaign completes:

1. [Review analytics](/features/analytics) for insights
2. Create A/B test with different templates
3. Try different lead sources
4. Adjust timing based on results
