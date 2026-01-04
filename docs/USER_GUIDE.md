# Outbound Workflow User Guide

A complete guide to using Outbound Workflow for domain sales outreach.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Domains](#managing-domains)
3. [Finding Leads](#finding-leads)
4. [Managing Leads](#managing-leads)
5. [Creating Templates](#creating-templates)
6. [Running Campaigns](#running-campaigns)
7. [Escalation Rules](#escalation-rules)
8. [Analytics & Cost Tracking](#analytics--cost-tracking)
9. [Settings](#settings)

---

## Getting Started

### First-Time Setup

1. **Sign up** at the login page with your email and password
2. **Configure API keys** in Settings (optional, enables AI features):
   - Anthropic API key for AI content generation
   - ElevenLabs API key for voice synthesis
   - Resend API key for email delivery
   - Slybroadcast credentials for voicemail drops

### Dashboard Overview

The dashboard provides:
- **Quick stats**: Total domains, leads, active campaigns
- **Recent activity**: Latest outreach events
- **Quick actions**: Buttons to add domains, import leads, create campaigns
- **Setup progress**: Checklist of configuration steps

---

## Managing Domains

### Adding a Domain

1. Go to **Domains** in the sidebar
2. Click **Add Domain**
3. Fill in the domain details:
   - **Domain name**: e.g., `weatherrobots`
   - **TLD**: e.g., `com`
   - **Buy Now Price**: Your asking price
   - **Floor Price**: Minimum acceptable price
   - **Landing Page URL**: Your Spaceship.com or other landing page

### Domain Status

Domains can have these statuses:
- **Available**: Listed for sale
- **Reserved**: Temporarily held
- **Sold**: Transaction completed
- **Expired**: No longer owned

### Find Leads for a Domain

Click the **Find Leads** button on any domain to discover potential buyers. See [Finding Leads](#finding-leads) for details.

---

## Finding Leads

The Find Leads feature uses intelligent search strategies to discover companies that might want to buy your domain.

### How to Use

1. From the **Domains** or **Leads** page, click **Find Leads**
2. If on Leads page, select a domain first
3. Choose a search strategy
4. Wait for the search to complete
5. Review and select companies to scrape
6. The system extracts contact information from their websites

### Search Strategies

#### Domain Upgrade
**Best for**: Premium .com domains

Finds companies currently using inferior domain patterns:
- Prefixed domains: `getcompany.com`, `trycompany.com`
- Alternate TLDs: `company.io`, `company.co`, `company.ai`
- Hyphenated: `weather-robots.com`

**Why it works**: These companies already invested in the brand but compromised on the domain. They're likely to upgrade to the premium .com.

#### SEO/PPC Bidders
**Best for**: Keyword-rich domains

Searches for companies ranking in search results for your domain's keywords. These companies:
- Are actively trying to acquire traffic for these terms
- May be paying for Google Ads on these keywords
- Would benefit from direct type-in traffic

**Example**: For `weatherrobots.com`, finds companies ranking for "weather robots software", "weather robotics platform", etc.

#### Emerging Startups
**Best for**: Trendy/tech domains

Searches startup directories and news sources:
- ProductHunt launches
- Crunchbase company profiles
- Seed/Series A funding announcements
- Y Combinator companies

**Why it works**: Early-stage startups often use non-premium domains and may want to upgrade as they grow.

#### Market Leaders
**Best for**: Industry-specific domains

Uses keyword mapping to identify established companies in related industries. This strategy:
- Returns instant results (no web search needed)
- Targets known players in the space
- Good for broad industry domains

**Note**: These are harder sells since established companies often already have premium domains.

### Search Progress

During search, you'll see:
- **Searches Complete**: Progress through queries
- **Results Found**: Total matching websites
- **Unique Companies**: Deduplicated company count
- **Current query**: What's being searched
- **Query list**: All queries with status and result counts

### Scraping Leads

After search completes:
1. Review the list of discovered companies
2. Check the boxes next to companies you want to contact
3. Click **Scrape Selected**
4. The system visits each website and extracts:
   - Company name
   - Contact email addresses
   - Phone numbers (if available)
5. Extracted contacts are added to your Leads

---

## Managing Leads

### Importing Leads

1. Go to **Leads** in the sidebar
2. Click **Import CSV**
3. Upload a CSV file with columns:
   - `email` (required)
   - `first_name`, `last_name`
   - `company_name`
   - `phone`

### Lead Status

Track leads through your sales funnel:
- **New**: Just added, not yet contacted
- **Contacted**: Initial outreach sent
- **Engaged**: Responded or showed interest
- **Qualified**: Confirmed interest, negotiating
- **Converted**: Sale completed
- **Unsubscribed**: Opted out of communication

### Lead Actions

- **Edit**: Update contact information
- **View Activity**: See all interactions with this lead
- **Add to Campaign**: Enroll in an email/voicemail campaign
- **Do Not Contact**: Flag to prevent future outreach

---

## Creating Templates

### Email Templates

1. Go to **Templates** in the sidebar
2. Click **New Email Template**
3. Enter:
   - **Name**: Internal reference name
   - **Subject**: Email subject line (supports variables)
   - **Body**: HTML email content (supports variables)

### Voicemail Templates

1. Go to **Templates**
2. Click **New Voicemail Template**
3. Enter:
   - **Name**: Internal reference name
   - **Script**: The voicemail script text

### Using Variables

Insert dynamic content using double curly braces:

```
Hi {{lead.first_name}},

I noticed your company {{lead.company}} might be interested in
{{domain.full}}. It's available for {{domain.price}}.

Best regards,
{{sender.name}}
```

**Available Variables**:

| Variable | Description |
|----------|-------------|
| `{{lead.first_name}}` | Lead's first name |
| `{{lead.last_name}}` | Lead's last name |
| `{{lead.company}}` | Company name |
| `{{lead.email}}` | Lead's email |
| `{{domain.name}}` | Domain without TLD |
| `{{domain.full}}` | Full domain (e.g., example.com) |
| `{{domain.price}}` | Buy now price |
| `{{domain.url}}` | Landing page URL |
| `{{sender.name}}` | Your name |
| `{{sender.email}}` | Your email |
| `{{sender.phone}}` | Your phone |

### AI Content Generation

If you have an Anthropic API key configured:
1. Click **Generate with AI** when creating a template
2. Describe what you want (e.g., "friendly initial outreach for a tech domain")
3. Review and edit the generated content

---

## Running Campaigns

### Creating a Campaign

1. Go to **Campaigns** in the sidebar
2. Click **New Campaign**
3. Follow the wizard:

**Step 1: Details**
- Campaign name
- Type: Email, Voicemail, or Multi-channel
- Description

**Step 2: Steps**
- Add sequence steps (e.g., Day 1: Email, Day 3: Voicemail)
- Select templates for each step
- Set delays between steps

**Step 3: Schedule**
- Start date/time
- Sending windows (e.g., weekdays 9am-5pm)
- Timezone

**Step 4: Prospects**
- Select leads to enroll
- Filter by status, domain interest, etc.

### Campaign Status

- **Draft**: Still being configured
- **Scheduled**: Ready to start at scheduled time
- **Active**: Currently running
- **Paused**: Temporarily stopped
- **Completed**: All steps finished
- **Cancelled**: Manually stopped

### Monitoring Campaigns

View campaign metrics:
- **Enrolled**: Total prospects in campaign
- **Sent**: Messages delivered
- **Opened**: Email opens (with tracking)
- **Clicked**: Link clicks
- **Replied**: Responses received
- **Bounced**: Failed deliveries

---

## Escalation Rules

Automatically get notified when leads show high engagement.

### Creating Rules

1. Go to **Escalations** in the sidebar
2. Click **New Rule**
3. Configure:

**Trigger Types**:
- **Email Opened**: Lead opened an email
- **Link Clicked**: Lead clicked a link
- **Reply Received**: Lead responded
- **No Response**: No activity after X days

**Conditions**:
- Minimum engagement score
- Specific campaigns
- Lead status

**Actions**:
- Send email notification
- Update lead status
- Add note to lead

### Example Rules

**Hot Lead Alert**:
- Trigger: Link clicked
- Condition: Clicked pricing link
- Action: Email notification immediately

**Follow-up Reminder**:
- Trigger: No response
- Condition: 7 days since last contact
- Action: Email reminder to follow up

---

## Analytics & Cost Tracking

### Dashboard Metrics

The Analytics page shows:
- **Campaign Performance**: Opens, clicks, replies over time
- **Lead Funnel**: Conversion through stages
- **Activity Timeline**: Recent outreach events

### Cost Tracking

Monitor API usage costs:
- **Claude API**: Token usage for AI generation
- **ElevenLabs**: Character count for voice synthesis
- **Slybroadcast**: Voicemail drop count
- **Resend**: Email send count

Set cost alerts:
1. Go to **Settings** > **Notifications**
2. Enable cost threshold alerts
3. Set your monthly budget

---

## Settings

### Profile Settings

- Update your name and contact info
- These populate `{{sender.*}}` template variables

### API Keys

Configure integrations:
- **Anthropic**: For AI content generation
- **ElevenLabs**: For voice synthesis
- **Resend**: For email delivery
- **Slybroadcast**: For voicemail drops

### Notification Preferences

- Email alerts for escalations
- Cost threshold warnings
- Campaign completion notifications

---

## Tips & Best Practices

### Lead Finding

1. **Start with Domain Upgrade** for .com domains - highest conversion potential
2. **Use SEO Bidders** for keyword-rich domains - these companies want the traffic
3. **Try Emerging Startups** for trendy names - startups are more likely to buy
4. **Save Market Leaders** for fallback - harder sell but larger budgets

### Email Outreach

1. Keep subject lines short and specific
2. Personalize with company name and use case
3. Include clear call-to-action
4. Follow up 2-3 times, then stop

### Voicemail Drops

1. Keep scripts under 30 seconds
2. Speak naturally, not scripted
3. Leave callback number twice
4. Best times: Tuesday-Thursday, 10am-2pm

### Campaign Strategy

1. Start with email, follow up with voicemail
2. Space steps 2-3 days apart
3. 3-5 touches per campaign maximum
4. Stop immediately on unsubscribe request

---

## Troubleshooting

### Lead Search Returns No Results

- Try a different strategy
- Check if domain name has recognizable keywords
- Market Leaders works for most industry terms

### Scraping Fails

- Some websites block automated access
- Contact forms may not have visible emails
- Try the company's LinkedIn or social profiles manually

### Emails Not Sending

- Verify Resend API key in Settings
- Check sender email is verified in Resend
- Review bounce logs in campaign details

### Voicemails Not Delivering

- Verify Slybroadcast credentials
- Check phone numbers are valid US numbers
- Review delivery status in campaign details

---

## Getting Help

- **Issues**: Report bugs at [GitHub Issues](https://github.com/ds1/outbound-workflow/issues)
- **Documentation**: See [README](../README.md) for technical details
- **API Docs**: Check individual service documentation for API-specific issues
