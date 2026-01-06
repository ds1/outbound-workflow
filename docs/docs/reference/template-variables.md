---
sidebar_position: 2
---

# Template Variables

Complete reference for all template variables available in Deep Outbound.

## Overview

Template variables let you personalize emails and voicemails with dynamic content. Use double curly braces: `{{variable.name}}`

## Lead Variables

Information about the recipient.

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{lead.first_name}}` | Lead's first name | John |
| `{{lead.last_name}}` | Lead's last name | Smith |
| `{{lead.email}}` | Lead's email address | john@acme.com |
| `{{lead.phone}}` | Lead's phone number | (555) 123-4567 |
| `{{lead.company}}` | Company name | Acme Inc |

### Usage Example

```
Hi {{lead.first_name}},

I'm reaching out to {{lead.company}} about an opportunity...

Best regards,
Dan
```

**Output:**
```
Hi John,

I'm reaching out to Acme Inc about an opportunity...

Best regards,
Dan
```

## Domain Variables

Information about the domain you're selling.

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{domain.name}}` | Domain without TLD | weatherrobots |
| `{{domain.full}}` | Full domain with TLD | weatherrobots.com |
| `{{domain.price}}` | Buy now price (formatted) | $5,000 |
| `{{domain.url}}` | Landing page URL | https://dan.spaceship.com/weatherrobots.com |

### Usage Example

```
I own {{domain.full}} and think it could be a great fit for your company.

It's available for {{domain.price}}: {{domain.url}}
```

**Output:**
```
I own weatherrobots.com and think it could be a great fit for your company.

It's available for $5,000: https://dan.spaceship.com/weatherrobots.com
```

## Sender Variables

Your contact information (configured in Settings).

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{sender.name}}` | Your name | Dan |
| `{{sender.email}}` | Your email | dan@example.com |
| `{{sender.phone}}` | Your phone number | (555) 987-6543 |

### Usage Example

```
Feel free to reach out:
{{sender.name}}
{{sender.email}}
{{sender.phone}}
```

**Output:**
```
Feel free to reach out:
Dan
dan@example.com
(555) 987-6543
```

## Variable Behavior

### Missing Values

If a variable has no value:
- `{{lead.first_name}}` with no name → Empty string
- Consider using fallbacks in your templates

### Formatting

- **Prices** are automatically formatted with `$` and commas
- **Phone numbers** maintain their stored format
- **Names** are displayed as entered

## Best Practices

### Always Include

Every template should have:
- `{{lead.first_name}}` - Personal greeting
- `{{domain.full}}` - What you're offering
- `{{sender.name}}` - Your sign-off

### Personalization Tips

**More effective:**
```
Hi {{lead.first_name}},

I noticed {{lead.company}} is in the weather tech space...
```

**Less effective:**
```
Hello,

I noticed your company is in the tech space...
```

### Handling Missing Data

Design templates to work even with missing fields:

**Risky:**
```
Dear {{lead.first_name}} {{lead.last_name}},
```
Could become: "Dear  ," if names are missing

**Safer:**
```
Hi {{lead.first_name}},
```
Could become: "Hi ," but less awkward

### Testing

Before sending campaigns:
1. Preview with real lead data
2. Check how variables render
3. Verify links work
4. Test with leads that have missing fields

## Email vs Voicemail

### Email Templates

Can use all variables plus HTML formatting:
```html
<p>Hi {{lead.first_name}},</p>
<p>Check out <a href="{{domain.url}}">{{domain.full}}</a></p>
```

### Voicemail Templates

Use all variables but remember they'll be spoken:
- Spell out numbers: `{{domain.price}}` → "five thousand dollars"
- Avoid URLs in voicemail (too long to remember)
- Say phone numbers twice
