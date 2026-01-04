# DeepOutbound User Guide

A complete guide to using DeepOutbound for domain sales outreach.

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
10. [Troubleshooting](#troubleshooting)

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

### Navigation

The sidebar provides access to all main sections:
- **Dashboard** - Overview and quick actions
- **Domains** - Your domain portfolio
- **Leads** - Prospect management
- **Campaigns** - Email/voicemail campaigns
- **Templates** - Email and voicemail templates
- **Escalations** - Automation rules
- **Analytics** - Performance metrics
- **Settings** - Configuration and API keys

The sidebar also shows **Active Jobs** when lead scraping is in progress.

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

### Domain Actions

From the domain row's action menu (⋮):
- **Edit**: Update domain details
- **Find Leads**: Launch lead discovery for this domain
- **Delete**: Remove from portfolio

---

## Finding Leads

The Find Leads feature uses intelligent search strategies to discover companies that might want to buy your domain.

### Starting a Lead Search

**From Domains Page:**
1. Click the action menu (⋮) on any domain
2. Select **Find Leads**
3. The dialog opens with the domain pre-selected

**From Leads Page:**
1. Click **Find Leads** button
2. Select a domain from the dropdown
3. Choose your strategy

### Search Strategies

#### Domain Upgrade
**Best for**: Premium .com domains

Finds companies currently using inferior domain patterns:
- **Prefixes**: `getcompany.com`, `trycompany.com`, `usecompany.com`
- **Suffixes**: `companyapp.com`, `companyhq.com`, `companyai.com`
- **Alternate TLDs**: `company.io`, `company.co`, `company.ai`, `company.net`
- **Hyphenated**: `weather-robots.com`

**Why it works**: These companies already invested in the brand but compromised on the domain. They're prime candidates to upgrade to the premium .com.

**Example queries generated**:
- `"getweatherrobots.com"`
- `"weatherrobots.io"`
- `"weather-robots.com"`

#### SEO/PPC Bidders
**Best for**: Keyword-rich domains

Searches for companies ranking in search results for your domain's keywords:
- Finds businesses actively trying to acquire traffic for these terms
- May be paying for Google/Bing Ads on these keywords
- Would benefit from direct type-in traffic

**Example**: For `weatherrobots.com`, finds companies ranking for:
- "weather robots software"
- "weather robotics platform"
- "automated weather systems"

**Why it works**: These companies are already paying to acquire this traffic—owning the domain eliminates that cost.

#### Emerging Startups
**Best for**: Trendy/tech domains

Searches startup directories and news sources:
- ProductHunt launches
- Crunchbase company profiles
- Tech news mentions
- Startup funding announcements

**Why it works**: Early-stage startups often use non-premium domains and may want to upgrade as they grow and have more funding.

#### Market Leaders
**Best for**: Industry-specific domains

Uses keyword mapping to identify established companies in related industries:
- Returns instant results (no web search needed)
- Targets known players in the space
- Good for broad industry domains

**Note**: These are harder sells since established companies often already have premium domains.

### Search Progress

During web search (Domain Upgrade, SEO/PPC, Emerging Startups), you'll see:
- **Progress bar**: Visual indicator of search completion
- **Searches Complete**: X/Y queries processed
- **Current query**: The search term being executed
- **Live results**: Companies appearing as they're found

### Selecting Companies to Scrape

After search completes:
1. Review the list of discovered companies
2. Each shows:
   - Company name
   - Website URL
   - Category badge (e.g., "Domain Upgrade", "SEO Competitor")
3. Use checkboxes to select which companies to scrape
4. Click **Select All** / **Deselect All** for bulk selection
5. Add custom URLs manually if needed
6. Click **Scrape X Sites** to start

### Real-Time Lead Discovery

As sites are scraped, contacts are added to your Leads **immediately**:
- Watch the progress list update in real-time
- Each site shows its status:
  - ○ **Pending** - Waiting to be scraped
  - ⟳ **Scraping** - Currently extracting contacts
  - ✓ **Done** - Completed (shows lead count)
  - ✗ **Error** - Failed (shows error message)
- Green badges show leads added from each site
- Running totals update as leads are discovered

### Background Jobs

Lead scraping runs as a background job, allowing you to continue working:

#### Minimizing the Dialog

1. Click the **minimize button** (−) in the dialog header
2. Dialog shrinks to a floating card at bottom-right
3. Continue using the app normally
4. Progress updates in real-time on the floating card

#### Active Jobs in Sidebar

When jobs are running:
- **Active Jobs** section appears in the sidebar
- Shows each job with:
  - Domain name
  - Progress bar
  - Current status (searching/scraping)
  - Lead count (if any found)
- Click any job to reopen its full dialog

#### Floating Progress Cards

At bottom-right of screen:
- Minimized jobs show as compact cards
- Real-time progress updates
- Current site being scraped
- Running lead count

#### Job Completion

When a job finishes:
- Dialog stays open showing results (won't auto-close)
- If minimized, shows as **success toast**:
  - Green highlight if leads were found
  - Shows total leads added
  - Shows count with phone numbers
- **View Details** - Reopen full results dialog
- **View Leads** - Navigate to Leads page
- **Dismiss** (X) - Remove the notification

The completed job also appears in the sidebar until dismissed.

#### Multiple Jobs

You can run multiple lead-finding jobs simultaneously:
- Each job tracks its own progress independently
- All jobs visible in sidebar and as floating cards
- Jobs for different domains can run in parallel

### Adding Custom URLs

If you know specific company websites:
1. Enter URL in the **Add Custom URL** field
2. Click the **+** button
3. URL is added to the scrape list
4. Useful for companies you've researched manually

---

## Managing Leads

### Viewing Leads

The Leads page shows all prospects in a table:
- **Name**: First and last name
- **Email**: Contact email
- **Phone**: Phone number (if available)
- **Company**: Company name
- **Domain**: Domain they're associated with
- **Status**: Current funnel stage

### Filtering Leads

Use the status dropdown to filter:
- **All Statuses** - Show everything
- **New** - Just added, not yet contacted
- **Contacted** - Initial outreach sent
- **Engaged** - Responded or showed interest
- **Qualified** - Confirmed interest
- **Converted** - Sale completed
- **Unsubscribed** - Opted out

### Importing Leads via CSV

1. Click **Import CSV**
2. Upload a CSV file with columns:
   - `email` (required)
   - `first_name`, `last_name`
   - `company_name`
   - `phone`
3. Preview shows parsed data
4. Click **Import X Leads** to add them

### Lead Actions

From the action menu (⋮):
- **Edit**: Update contact information
- **Delete**: Remove the lead

### Lead Status Flow

Typical progression:
```
New → Contacted → Engaged → Qualified → Converted
                                    ↘ Unsubscribed
```

---

## Creating Templates

### Email Templates

1. Go to **Templates** in the sidebar
2. Click **New Email Template**
3. **Start from a Default** (optional):
   - Select a pre-written template from the dropdown
   - Form fields auto-populate with the template content
   - Customize as needed before saving
4. Enter or edit:
   - **Name**: Internal reference name
   - **Subject**: Email subject line (supports variables)
   - **Body**: HTML email content (supports variables)
5. Preview shows rendered template

#### Default Email Templates

| Template | Best For |
|----------|----------|
| **Initial Outreach** | First contact - friendly and direct introduction |
| **Domain Upgrade Pitch** | Companies using inferior domains (prefixes, alt TLDs) |
| **Follow-Up Email** | Second touch after no response |
| **Final Follow-Up** | Last message before closing the loop |
| **Value Proposition** | Emphasizing ROI and business benefits |

### Voicemail Templates

1. Go to **Templates**
2. Click **New Voicemail Template**
3. **Start from a Default** (optional):
   - Select a pre-written script from the dropdown
   - Form fields auto-populate with the script
   - Customize as needed before saving
4. Enter or edit:
   - **Name**: Internal reference name
   - **Script**: The voicemail script text

#### Default Voicemail Templates

| Template | Best For |
|----------|----------|
| **Initial Voicemail** | First voicemail drop - friendly introduction |
| **Follow-Up Voicemail** | Second touch after no response |
| **Value Proposition Voicemail** | Highlighting domain benefits |
| **Final Voicemail** | Last message before closing loop |

### Using Variables

Insert dynamic content using double curly braces:

```
Hi {{lead.first_name}},

I noticed your company {{lead.company}} might be interested in
{{domain.full}}. It's available for {{domain.price}}.

You can view it here: {{domain.url}}

Best regards,
{{sender.name}}
{{sender.phone}}
```

### Available Variables

| Variable | Description |
|----------|-------------|
| `{{lead.first_name}}` | Lead's first name |
| `{{lead.last_name}}` | Lead's last name |
| `{{lead.company}}` | Company name |
| `{{lead.email}}` | Lead's email |
| `{{domain.name}}` | Domain without TLD (e.g., "weatherrobots") |
| `{{domain.full}}` | Full domain (e.g., "weatherrobots.com") |
| `{{domain.price}}` | Buy now price |
| `{{domain.url}}` | Landing page URL |
| `{{sender.name}}` | Your name (from Settings) |
| `{{sender.email}}` | Your email |
| `{{sender.phone}}` | Your phone |

### AI Content Generation

If you have an Anthropic API key configured:
1. Click **Generate with AI** when creating a template
2. Describe what you want (e.g., "friendly initial outreach for a tech domain")
3. Review and edit the generated content
4. Variables are automatically included

---

## Running Campaigns

### Creating a Campaign

1. Go to **Campaigns** in the sidebar
2. Click **New Campaign**
3. Follow the wizard:

**Step 1: Details**
- Campaign name
- Type: Email, Voicemail, or Multi-channel
- Description (optional)

**Step 2: Steps**
- Add sequence steps
- For each step:
  - Select step type (email or voicemail)
  - Choose a template
  - Set delay (days after previous step)
- Example sequence:
  - Day 0: Email (Initial outreach)
  - Day 3: Voicemail (Follow-up)
  - Day 7: Email (Final follow-up)

**Step 3: Schedule**
- Start date/time
- Sending windows (e.g., weekdays 9am-5pm)
- Timezone

**Step 4: Prospects**
- Select leads to enroll
- Filter by status, domain interest
- Review before launching

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
3. Configure trigger, conditions, and actions

### Trigger Types

- **Email Opened**: Lead opened an email
- **Link Clicked**: Lead clicked a link
- **Reply Received**: Lead responded
- **No Response**: No activity after X days

### Conditions

- Minimum engagement score
- Specific campaigns
- Lead status

### Actions

- Send email notification
- Update lead status
- Add note to lead

### Example Rules

**Hot Lead Alert:**
- Trigger: Link clicked
- Condition: Clicked pricing link
- Action: Email notification immediately

**Follow-up Reminder:**
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
- **Charts**: Visual representation of metrics

### Cost Tracking

Monitor API usage costs:
- **Claude API**: Token usage for AI generation
- **ElevenLabs**: Character count for voice synthesis
- **Slybroadcast**: Voicemail drop count
- **Resend**: Email send count

### Setting Cost Alerts

1. Go to **Settings** > **Notifications**
2. Enable cost threshold alerts
3. Set your monthly budget
4. Receive alerts when approaching limit

---

## Settings

### Profile Settings

- Update your name and contact info
- These populate `{{sender.*}}` template variables
- Ensure accurate info for personalized outreach

### API Keys

Configure integrations:
- **Anthropic**: For AI content generation
- **ElevenLabs**: For voice synthesis
- **Resend**: For email delivery
- **Slybroadcast**: For voicemail drops

Keys are stored securely and never exposed in the UI after saving.

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
5. **Run multiple strategies** - different strategies find different prospects
6. **Use background jobs** - minimize and continue working while scraping

### Email Outreach

1. Keep subject lines short and specific
2. Personalize with company name and use case
3. Include clear call-to-action
4. Follow up 2-3 times, then stop
5. Use AI generation as a starting point, then customize

### Voicemail Drops

1. Keep scripts under 30 seconds
2. Speak naturally, not scripted
3. Leave callback number twice
4. Best times: Tuesday-Thursday, 10am-2pm
5. Use ElevenLabs for natural-sounding voice

### Campaign Strategy

1. Start with email, follow up with voicemail
2. Space steps 2-3 days apart
3. 3-5 touches per campaign maximum
4. Stop immediately on unsubscribe request
5. Monitor analytics and adjust

---

## Troubleshooting

### Lead Search Returns No Results

- Try a different strategy
- Check if domain name has recognizable keywords
- Market Leaders works for most industry terms
- Some niche domains may need custom URL additions

### Scraping Fails or Returns No Contacts

- Some websites block automated access
- Contact forms may not have visible emails
- Sites may use JavaScript-rendered contact info
- Try the company's LinkedIn or social profiles manually
- Corporate sites often hide emails behind forms

### Emails Not Sending

- Verify Resend API key in Settings
- Check sender email is verified in Resend
- Review bounce logs in campaign details
- Ensure email is properly formatted

### Voicemails Not Delivering

- Verify Slybroadcast credentials
- Check phone numbers are valid US numbers
- Review delivery status in campaign details
- Ensure sufficient Slybroadcast credits

### Dialog Won't Close After Job Completes

This is by design. Completed jobs require you to:
- Click **Dismiss** to close and remove the job
- Click **Minimize** to keep in background
- Click **Find More** to start a new search

### Jobs Disappear from Sidebar

Jobs are removed when:
- You click Dismiss on the completion notification
- You click X on the floating card
- The page is refreshed (jobs are in-memory only)

### Hydration Errors in Console

If you see "hydration mismatch" errors:
- This is usually harmless
- Refresh the page if UI looks wrong
- Jobs section loads after initial render (expected)

---

## Getting Help

- **Issues**: Report bugs at [GitHub Issues](https://github.com/ds1/deep-outbound/issues)
- **Documentation**: See [README](../README.md) for technical details
- **API Docs**: Check individual service documentation for API-specific issues:
  - [Resend Docs](https://resend.com/docs)
  - [ElevenLabs Docs](https://docs.elevenlabs.io)
  - [Slybroadcast Docs](https://www.slybroadcast.com/api-documentation.php)
  - [Anthropic Docs](https://docs.anthropic.com)
