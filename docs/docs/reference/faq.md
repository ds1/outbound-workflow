---
sidebar_position: 4
---

# FAQ

Frequently asked questions about Deep Outbound.

## General

### What is Deep Outbound?

Deep Outbound is an automated outbound sales system for domain sellers. It helps you find potential buyers, create personalized outreach, and run multi-channel campaigns via email and voicemail.

### Who is it for?

- Domain investors with portfolios to sell
- Businesses selling premium domains
- Anyone doing outbound sales for domains

### Do I need technical skills?

No. Deep Outbound is designed for non-technical users. The interface guides you through each step.

## Account & Setup

### How do I get started?

1. Sign up for an account
2. Add your domains
3. Find leads using our discovery tools
4. Create templates
5. Run campaigns

See the [Quick Start Guide](/getting-started/quick-start) for details.

### What API keys do I need?

For full functionality:
- **Resend** - For sending emails
- **Anthropic** - For AI content generation (optional)
- **ElevenLabs** - For voice synthesis (optional)
- **Slybroadcast** - For voicemail drops (optional)

You can use Deep Outbound without these, but features will be limited.

### Is my data secure?

Yes. API keys are encrypted, data is stored securely in Supabase, and we follow security best practices.

## Lead Discovery

### How does lead finding work?

Deep Outbound searches the web for companies that might want your domain, then scrapes their websites for contact information.

### What search strategies are available?

1. **Domain Upgrade** - Find companies using inferior domain patterns
2. **SEO/PPC Bidders** - Find companies ranking for your keywords
3. **Emerging Startups** - Search startup directories
4. **Market Leaders** - Target known companies in industries

### Why do some websites fail to scrape?

Some websites block automated access, hide contact info behind forms, or use JavaScript that our scraper can't execute. Try the company's social media or LinkedIn instead.

### Can I add leads manually?

Yes. You can add leads one-by-one or import via CSV file.

## Campaigns

### What's a multi-channel campaign?

A sequence that uses both email and voicemail. For example:
- Day 0: Email
- Day 3: Voicemail
- Day 7: Email

### How many touches should I send?

3-5 is typical. More than that can feel like spam.

### What's the best timing for outreach?

- **Days**: Tuesday, Wednesday, Thursday
- **Times**: 10am-12pm, 2pm-4pm (recipient's timezone)
- **Avoid**: Monday mornings, Friday afternoons, weekends

### How do I track responses?

Campaign analytics show opens, clicks, and replies. Escalation rules can alert you to hot leads.

## Templates

### What are template variables?

Placeholders that get replaced with real data. `{{lead.first_name}}` becomes "John" when sent.

### Can I use AI to write templates?

Yes, if you have an Anthropic API key configured. Click "Generate with AI" when creating templates.

### What's the best email length?

Under 150 words. Short, focused emails perform better.

## Voicemail

### What is ringless voicemail?

A voicemail delivered directly to the recipient's inbox without their phone ringing. Less intrusive than calling.

### Do I need my own voice?

No. ElevenLabs can synthesize natural-sounding voices. Or you can record and upload your own audio.

### What phone numbers work?

US phone numbers only. Both mobile and landline, though mobile delivery rates are typically higher.

## Pricing & Costs

### What does Deep Outbound cost?

Check our website for current pricing plans.

### What are the external API costs?

Each integrated service has its own pricing:
- **Resend**: Free up to 3,000 emails/month
- **Anthropic**: ~$0.01 per AI generation
- **ElevenLabs**: ~$0.30 per 1,000 characters
- **Slybroadcast**: ~$0.04-0.05 per voicemail

### How can I monitor my API usage?

The Analytics page shows cost tracking across all services. You can set budget alerts in Settings.

## Compliance

### Is this legal?

Yes, when used appropriately. However:
- Follow CAN-SPAM for email
- Follow TCPA for voicemail
- Honor unsubscribe requests immediately
- Only contact business addresses

### How do I handle unsubscribes?

When someone requests to unsubscribe:
1. Stop all campaigns to that person immediately
2. Mark them as "Do Not Contact" in the system
3. Never contact them again

### Do I need consent to send voicemails?

Business-to-business voicemails generally don't require prior consent, but laws vary. Consult legal counsel for your specific situation.

## Troubleshooting

### Emails aren't sending

Check:
1. Resend API key in Settings
2. Sender domain verified in Resend
3. Email template is valid

### Lead search returns nothing

Try:
1. Different search strategy
2. More common keywords
3. Market Leaders strategy
4. Adding custom URLs

### Voicemails failing

Check:
1. Slybroadcast credentials
2. Account credits balance
3. Phone number format
4. Caller ID verification

See [Troubleshooting Guide](/reference/troubleshooting) for more.

## Feature Requests

### How do I request a feature?

Visit [feedback.deepoutbound.com](https://feedback.deepoutbound.com) to:
- Submit feature requests
- Vote on existing ideas
- Report bugs
- View our public roadmap

### Can I see what's planned?

Yes! Check our [public roadmap](https://feedback.deepoutbound.com/roadmap).
