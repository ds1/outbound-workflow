---
sidebar_position: 1
---

# Tutorial: Getting Started

A step-by-step walkthrough to set up Deep Outbound and send your first outreach.

## Prerequisites

- Deep Outbound account
- At least one domain to sell
- (Optional) API keys for full functionality

## Part 1: Initial Setup

### Configure Your Profile

1. Go to **Settings** in the sidebar
2. Fill in your profile information:
   - Name (appears in templates as `{{sender.name}}`)
   - Email (your reply-to address)
   - Phone (for voicemail callbacks)
3. Click **Save**

### Add API Keys (Optional)

For full functionality, add these API keys in Settings:

- **Resend** - Required for sending emails
- **Anthropic** - Enables AI content generation
- **ElevenLabs** - Enables voice synthesis
- **Slybroadcast** - Required for voicemail drops

## Part 2: Add Your First Domain

1. Go to **Domains** in the sidebar
2. Click **Add Domain**
3. Enter your domain details:
   ```
   Domain name: weatherrobots
   TLD: com
   Buy Now Price: $5,000
   Floor Price: $2,500
   Landing Page: https://dan.spaceship.com/weatherrobots.com
   ```
4. Click **Save**

You should now see your domain in the list.

## Part 3: Find Leads

### Start Lead Discovery

1. On your domain row, click the action menu (⋮)
2. Select **Find Leads**
3. In the dialog:
   - Your domain is pre-selected
   - Choose **Domain Upgrade** strategy
4. Click **Start Search**

### Watch the Search

- Progress bar shows completion
- Companies appear as they're found
- Wait for search to complete

### Select and Scrape

1. Review the discovered companies
2. Check the ones you want to contact
3. Click **Scrape X Sites**

### Monitor Scraping

- Watch contacts appear in real-time
- Green badges show leads found per site
- Wait for completion

### Complete

1. Note the summary: leads found, leads with phone
2. Click **Dismiss** or **View Leads**

## Part 4: Create a Template

### Create Email Template

1. Go to **Templates**
2. Click **New Email Template**
3. Select **Initial Outreach** from defaults
4. Review and customize the template:
   ```
   Subject: Quick question about {{domain.full}}

   Hi {{lead.first_name}},

   I noticed {{lead.company}} is in a space where {{domain.full}}
   could be a perfect fit for your brand.

   The domain is available for {{domain.price}}.
   You can view it here: {{domain.url}}

   Would you be interested in a quick chat?

   Best,
   {{sender.name}}
   ```
5. Click **Save**

## Part 5: Send Your First Campaign

### Create the Campaign

1. Go to **Campaigns**
2. Click **New Campaign**
3. **Step 1 - Details**:
   - Name: "WeatherRobots Initial Outreach"
   - Type: Email
4. **Step 2 - Steps**:
   - Add email step
   - Select your template
   - Delay: 0 days (send immediately)
5. **Step 3 - Schedule**:
   - Start: Now
   - Window: Business hours
6. **Step 4 - Prospects**:
   - Select your new leads
7. Click **Start Campaign**

### Monitor Progress

- View campaign status
- Check delivery metrics
- Watch for opens and clicks

## What's Next?

Congratulations! You've completed the basics. Next steps:

1. [Create more templates](/tutorials/email-templates) with different angles
2. [Add voicemail steps](/tutorials/voicemail-drops) for multi-channel outreach
3. [Set up escalation rules](/features/escalations) for hot leads
4. [Review analytics](/features/analytics) to optimize performance

## Tips

- Start with email-only campaigns until comfortable
- Test templates with your own email first
- Monitor responses and adjust messaging
- Follow up 2-3 times, then stop
