---
sidebar_position: 5
---

# Templates

Create reusable email and voicemail templates with dynamic personalization.

## Overview

Templates are the foundation of your outreach. Create them once, use them in multiple campaigns with automatic personalization.

## Email Templates

### Creating an Email Template

1. Go to **Templates** in the sidebar
2. Click **New Email Template**
3. Optionally select a default template to start with
4. Fill in the fields:
   - **Name**: Internal reference
   - **Subject**: Email subject line
   - **Body**: HTML email content
5. Preview your template
6. Click **Save**

### Default Email Templates

| Template | Best For |
|----------|----------|
| **Initial Outreach** | First contact - friendly introduction |
| **Domain Upgrade Pitch** | Companies using inferior domains |
| **Follow-Up Email** | Second touch after no response |
| **Final Follow-Up** | Last message before closing |
| **Value Proposition** | Emphasizing ROI and benefits |

## Voicemail Templates

### Creating a Voicemail Template

1. Go to **Templates**
2. Click **New Voicemail Template**
3. Optionally select a default template
4. Enter the script text
5. Preview with voice synthesis (if configured)
6. Click **Save**

### Default Voicemail Templates

| Template | Best For |
|----------|----------|
| **Initial Voicemail** | First voicemail - friendly intro |
| **Follow-Up Voicemail** | Second touch after no response |
| **Value Proposition** | Highlighting domain benefits |
| **Final Voicemail** | Last message before closing |

## Using Variables

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

| Variable | Description | Example |
|----------|-------------|---------|
| `{{lead.first_name}}` | Lead's first name | John |
| `{{lead.last_name}}` | Lead's last name | Smith |
| `{{lead.company}}` | Company name | Acme Inc |
| `{{lead.email}}` | Lead's email | john@acme.com |
| `{{domain.name}}` | Domain without TLD | weatherrobots |
| `{{domain.full}}` | Full domain | weatherrobots.com |
| `{{domain.price}}` | Buy now price | $5,000 |
| `{{domain.url}}` | Landing page URL | https://dan.spaceship.com/... |
| `{{sender.name}}` | Your name | Dan |
| `{{sender.email}}` | Your email | dan@example.com |
| `{{sender.phone}}` | Your phone | (555) 123-4567 |

## AI Content Generation

With an Anthropic API key configured:

1. Click **Generate with AI** when creating a template
2. Describe what you want:
   - "Friendly initial outreach for a tech domain"
   - "Follow-up emphasizing SEO benefits"
3. Review the generated content
4. Edit and customize as needed
5. Variables are automatically included

## Preview

The preview panel shows:
- Rendered template with sample data
- How variables will appear
- Email formatting (for email templates)

## Best Practices

### Subject Lines

- Keep under 50 characters
- Be specific, not salesy
- Include the domain name
- A/B test different approaches

### Email Body

- Keep it brief (under 150 words)
- One clear call-to-action
- Personalize with company name
- Include your contact info

### Voicemail Scripts

- Keep under 30 seconds
- Sound natural, not scripted
- Leave callback number twice
- End with clear next step

### General Tips

- Test templates with your own email first
- Review how variables render
- Update templates based on response rates

## Related

- [Campaigns](/features/campaigns) - Use templates in campaigns
- [Template Variables Reference](/reference/template-variables) - Full variable list
