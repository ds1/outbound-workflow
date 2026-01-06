---
sidebar_position: 4
---

# Tutorial: Email Templates

Create effective email templates that get responses.

## Email Template Fundamentals

### Anatomy of a Good Outreach Email

```
Subject: [Short, specific, includes domain name]

Hi {{lead.first_name}},  ← Personal greeting

[1-2 sentences: Why you're reaching out]  ← Hook

[1-2 sentences: Value proposition]  ← Benefit

[Clear call-to-action]  ← Next step

{{sender.name}}  ← Sign-off
```

**Total length**: Under 150 words

## Creating Your First Template

### Step 1: Choose Your Angle

Different angles work for different situations:

| Angle | Best For | Example Hook |
|-------|----------|--------------|
| Brand upgrade | Companies with inferior domains | "I noticed you're using companyname.io..." |
| SEO benefit | Companies paying for keywords | "You're ranking for 'weather robots'..." |
| Growth opportunity | Startups | "Congrats on the recent funding..." |
| Direct pitch | General outreach | "I have a domain that fits your brand..." |

### Step 2: Write the Subject Line

Good subject lines:
- "Quick question about weatherrobots.com"
- "weatherrobots.com - for `{{lead.company}}`?"
- "Domain opportunity for `{{lead.company}}`"

Bad subject lines:
- ❌ "AMAZING DOMAIN FOR SALE!!!"
- ❌ "You need to see this"
- ❌ "Re: Your inquiry" (deceptive)

### Step 3: Write the Body

**Template: Initial Outreach**

```html
Hi {{lead.first_name}},

I came across {{lead.company}} and thought {{domain.full}} could be
a perfect fit for your brand.

This exact-match domain could help with:
- Brand recognition and recall
- Type-in traffic from people searching for you
- SEO benefits for your primary keywords

It's available for {{domain.price}}: {{domain.url}}

Would you have 5 minutes for a quick call this week?

Best,
{{sender.name}}
{{sender.phone}}
```

### Step 4: Create in Deep Outbound

1. Go to **Templates**
2. Click **New Email Template**
3. Enter:
   - Name: "Initial Outreach - Value Prop"
   - Subject: Your subject line
   - Body: Your email body
4. Preview to verify variables
5. **Save**

## Template Examples

### For Domain Upgrade Leads

Companies using inferior domain patterns:

```html
Hi {{lead.first_name}},

I noticed {{lead.company}} is currently using [their-domain.io/getdomain.com].

I happen to own {{domain.full}} - the exact .com match. If you've ever
considered upgrading your domain, this could be a good fit.

Available for {{domain.price}}: {{domain.url}}

Happy to chat if you're interested.

{{sender.name}}
```

### For SEO/PPC Leads

Companies ranking for keywords:

```html
Hi {{lead.first_name}},

I see {{lead.company}} is ranking well for "{{domain.name}}" keywords.

Owning {{domain.full}} would give you:
- Direct type-in traffic
- Stronger brand authority
- One less competitor owning it

Currently available: {{domain.url}}

Worth a quick conversation?

{{sender.name}}
```

### Follow-Up Template

After no response:

```html
Hi {{lead.first_name}},

Just following up on my previous email about {{domain.full}}.

I know you're busy, so I'll be brief: this domain is still
available and I think it's a great match for {{lead.company}}.

{{domain.url}}

If timing isn't right, just let me know and I won't follow up again.

{{sender.name}}
```

### Final Follow-Up

Last touch:

```html
Hi {{lead.first_name}},

This will be my last email about {{domain.full}}.

If you're interested, I'm happy to discuss. If not, no worries -
I appreciate your time.

{{domain.url}}

Best,
{{sender.name}}
```

## Using AI Generation

If you have Claude API configured:

1. Click **Generate with AI** when creating template
2. Enter a prompt describing what you want:
   - "Write a friendly initial outreach for a premium domain"
   - "Create a follow-up email emphasizing urgency"
3. Review the generated content
4. Edit and personalize
5. Save

## Best Practices

### Subject Lines

- Keep under 50 characters
- Include domain name when possible
- Ask a question or create curiosity
- Don't use all caps or excessive punctuation

### Email Body

- **First sentence**: Hook that's about them, not you
- **Value prop**: What they get, not what you're selling
- **CTA**: One clear next step
- **Length**: 3-4 short paragraphs max

### Variables

Always include:
- `{{lead.first_name}}` - Personal touch
- `{{lead.company}}` - Shows you researched them
- `{{domain.full}}` - What you're offering
- `{{sender.name}}` - Your sign-off

### Testing

Before sending campaigns:
1. Send test to your own email
2. Check formatting
3. Verify variables render
4. Click all links
5. Check mobile display

## Common Mistakes

### Too Long
❌ 500-word essays about domain history
✅ 100-150 words maximum

### Too Salesy
❌ "INCREDIBLE ONCE-IN-A-LIFETIME OPPORTUNITY!!!"
✅ "Thought this might be a good fit"

### No Personalization
❌ "Dear Sir/Madam"
✅ "Hi `{{lead.first_name}}`"

### Weak CTA
❌ "Let me know your thoughts"
✅ "Would you have 5 minutes for a quick call this week?"

### Missing Contact Info
❌ No way to reply
✅ Include email and phone number
