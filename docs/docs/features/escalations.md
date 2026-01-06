---
sidebar_position: 8
---

# Escalation Rules

Automatically respond to high-engagement leads.

## Overview

Escalation rules let you automate responses when leads show specific behaviors. Get notified immediately when a prospect opens your email multiple times or clicks a link.

## Creating Rules

1. Go to **Escalations** in the sidebar
2. Click **New Rule**
3. Configure trigger, conditions, and actions

## Trigger Types

| Trigger | Description |
|---------|-------------|
| **Email Opened** | Lead opened an email |
| **Link Clicked** | Lead clicked a link in email |
| **Reply Received** | Lead responded to email |
| **No Response** | No activity after X days |

## Conditions

Refine when rules fire:

- **Minimum engagement score** - Only for leads above threshold
- **Specific campaigns** - Only for certain campaigns
- **Lead status** - Only for leads in specific statuses
- **Time window** - Only during business hours

## Actions

What happens when rule triggers:

| Action | Description |
|--------|-------------|
| **Email notification** | Send alert to your email |
| **Update status** | Change lead's status |
| **Add note** | Add internal note to lead |

## Example Rules

### Hot Lead Alert

Notify immediately when someone clicks your pricing link:

- **Trigger**: Link clicked
- **Condition**: Link contains "pricing" or landing page URL
- **Action**: Email notification immediately

### Engaged Prospect

Update status when prospect shows interest:

- **Trigger**: Email opened
- **Condition**: Opened 3+ times
- **Action**: Update status to "Engaged"

### Follow-up Reminder

Get reminded when leads go cold:

- **Trigger**: No response
- **Condition**: 7 days since last contact
- **Action**: Email reminder to follow up

### Reply Alert

Instant notification on replies:

- **Trigger**: Reply received
- **Condition**: None (always trigger)
- **Action**: Email notification immediately

## Cooldown

Prevent notification spam:

- Set cooldown period (e.g., 24 hours)
- Same rule won't fire again for same lead until cooldown expires
- Different rules can still fire

## Managing Rules

### Enable/Disable

Toggle rules on/off without deleting:
1. Find rule in list
2. Click the toggle switch

### Priority

Rules are evaluated in order:
1. Higher priority rules fire first
2. Lower priority rules check remaining leads
3. Drag to reorder

### Testing

Before going live:
1. Set notification email to yourself
2. Trigger rule manually
3. Verify notification received
4. Adjust as needed

## Best Practices

### Start Simple

Begin with these rules:
1. Alert on any reply
2. Alert on pricing link clicks
3. Reminder after 7 days no response

### Avoid Alert Fatigue

- Use conditions to filter noise
- Set appropriate cooldowns
- Don't create too many rules

### Review Regularly

- Check rule effectiveness
- Disable rules that don't add value
- Add rules for new scenarios

## Related

- [Campaigns](/features/campaigns) - Where engagement happens
- [Leads](/features/leads) - Manage your prospects
- [Analytics](/features/analytics) - Track performance
