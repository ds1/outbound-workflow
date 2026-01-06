---
sidebar_position: 2
---

# Leads

Manage your prospects and potential domain buyers.

## Overview

The Leads page shows all your prospects - companies and individuals who might be interested in buying your domains. Leads can be added manually, imported via CSV, or discovered automatically.

## Viewing Leads

The leads table displays:

| Column | Description |
|--------|-------------|
| **Name** | First and last name |
| **Email** | Contact email address |
| **Phone** | Phone number (if available) |
| **Company** | Company name |
| **Domain** | Domain they're associated with |
| **Status** | Current funnel stage |

## Filtering Leads

Use the status dropdown to filter your view:

- **All Statuses** - Show all leads
- **New** - Just added, not yet contacted
- **Contacted** - Initial outreach sent
- **Engaged** - Responded or showed interest
- **Qualified** - Confirmed interest in purchasing
- **Converted** - Sale completed
- **Unsubscribed** - Opted out of communications

## Adding Leads

### Manual Entry

1. Click **Add Lead**
2. Enter contact information
3. Select the domain they're interested in
4. Click **Save**

### CSV Import

1. Click **Import CSV**
2. Upload a CSV file with columns:
   - `email` (required)
   - `first_name`
   - `last_name`
   - `company_name`
   - `phone`
3. Preview the parsed data
4. Click **Import X Leads**

### Automatic Discovery

Use [Lead Discovery](/features/lead-discovery) to automatically find potential buyers.

## Lead Status Flow

Typical lead progression:

```
New → Contacted → Engaged → Qualified → Converted
                                     ↘ Unsubscribed
```

Update statuses as leads progress through your sales funnel.

## Lead Actions

Click the action menu (⋮) on any lead:

- **Edit** - Update contact information
- **Delete** - Remove the lead

## Quality Score

Leads have a quality score (0-100) based on:

- Contact information completeness
- Company information availability
- Source reliability
- Engagement history

Higher scores indicate more promising leads.

## Best Practices

### Data Quality

- Verify email addresses before outreach
- Include phone numbers when possible (enables voicemail)
- Keep company names accurate for personalization

### Segmentation

- Filter by domain interest for targeted campaigns
- Use status filters to focus on active prospects
- Export segments for analysis

### Compliance

- Honor unsubscribe requests immediately
- Mark "Do Not Contact" leads appropriately
- Keep records of consent

## Related

- [Lead Discovery](/features/lead-discovery) - Automatically find leads
- [Campaigns](/features/campaigns) - Reach out to leads
- [Templates](/features/templates) - Create personalized messages
