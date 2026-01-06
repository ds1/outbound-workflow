---
sidebar_position: 4
---

# Campaigns

Create and manage automated outreach campaigns.

## Overview

Campaigns automate your outreach with multi-step sequences of emails and voicemails. Set up once, and Deep Outbound handles the rest.

## Creating a Campaign

1. Go to **Campaigns** in the sidebar
2. Click **New Campaign**
3. Follow the wizard steps

### Step 1: Details

- **Campaign name**: Internal reference
- **Type**: Email, Voicemail, or Multi-channel
- **Description**: Optional notes

### Step 2: Steps

Add sequence steps for your outreach:

1. Click **Add Step**
2. For each step configure:
   - **Type**: Email or Voicemail
   - **Template**: Select from your templates
   - **Delay**: Days after previous step

**Example sequence:**
- Day 0: Email (Initial outreach)
- Day 3: Voicemail (Follow-up)
- Day 7: Email (Final follow-up)

### Step 3: Schedule

- **Start date/time**: When to begin
- **Sending windows**: e.g., weekdays 9am-5pm
- **Timezone**: Recipient's timezone

### Step 4: Prospects

- Select leads to enroll
- Filter by status or domain interest
- Review before launching

## Campaign Status

| Status | Description |
|--------|-------------|
| **Draft** | Still being configured |
| **Scheduled** | Ready to start at scheduled time |
| **Active** | Currently running |
| **Paused** | Temporarily stopped |
| **Completed** | All steps finished |
| **Cancelled** | Manually stopped |

## Managing Campaigns

### Pausing

Click **Pause** to temporarily stop a campaign:
- No new messages sent
- Enrolled prospects stay in queue
- Resume anytime

### Viewing Progress

Click a campaign to see:
- Current step for each prospect
- Delivery status
- Engagement metrics

## Campaign Metrics

Track performance in real-time:

| Metric | Description |
|--------|-------------|
| **Enrolled** | Total prospects in campaign |
| **Sent** | Messages delivered |
| **Opened** | Email opens (with tracking) |
| **Clicked** | Link clicks |
| **Replied** | Responses received |
| **Bounced** | Failed deliveries |

## Best Practices

### Sequence Design

- Start with email (less intrusive)
- Follow up with voicemail (more personal)
- Space steps 2-3 days apart
- Maximum 3-5 touches per campaign

### Timing

- Best days: Tuesday-Thursday
- Best times: 10am-2pm recipient time
- Avoid weekends and holidays

### Personalization

- Use template variables for names/companies
- Reference specific domains
- Include clear call-to-action

### Compliance

- Stop immediately on unsubscribe
- Honor Do Not Contact flags
- Include opt-out in every message

## Related

- [Templates](/features/templates) - Create message templates
- [Leads](/features/leads) - Manage your prospects
- [Analytics](/features/analytics) - Track performance
