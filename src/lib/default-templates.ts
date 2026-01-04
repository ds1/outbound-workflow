// Default email and voicemail templates for domain sales outreach

export interface DefaultEmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body_html: string;
  preview_text?: string;
}

export interface DefaultVoicemailTemplate {
  id: string;
  name: string;
  description: string;
  script: string;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultEmailTemplate[] = [
  {
    id: "initial-outreach",
    name: "Initial Outreach",
    description: "First contact email - friendly and direct",
    subject: "Quick question about {{domain.full}}",
    preview_text: "I noticed your company might benefit from this domain",
    body_html: `Hi {{lead.first_name}},

I came across {{lead.company}} and thought you might be interested in the domain <strong>{{domain.full}}</strong>.

This domain could be a great fit for your business - it's memorable, professional, and easy for customers to find you.

The domain is available for {{domain.price}}. You can view more details here: {{domain.url}}

Would you be open to a quick chat about it?

Best regards,
{{sender.name}}
{{sender.email}}
{{sender.phone}}`,
  },
  {
    id: "domain-upgrade",
    name: "Domain Upgrade Pitch",
    description: "For companies using inferior domains (prefixes, alt TLDs)",
    subject: "Upgrade to {{domain.full}}?",
    preview_text: "Own the premium .com for your brand",
    body_html: `Hi {{lead.first_name}},

I noticed {{lead.company}} is doing great work, and I wanted to reach out about an opportunity.

The premium domain <strong>{{domain.full}}</strong> is available, and I think it could help strengthen your online presence. A clean, memorable .com domain:

- Builds instant credibility
- Makes it easier for customers to find you
- Protects your brand from competitors

I'd be happy to discuss flexible terms. The domain is currently listed at {{domain.price}}, but I'm open to offers.

More details: {{domain.url}}

Interested in chatting?

Best,
{{sender.name}}
{{sender.phone}}`,
  },
  {
    id: "follow-up",
    name: "Follow-Up Email",
    description: "Second touch after no response",
    subject: "Following up on {{domain.full}}",
    preview_text: "Just wanted to make sure you saw my previous email",
    body_html: `Hi {{lead.first_name}},

I wanted to follow up on my previous email about <strong>{{domain.full}}</strong>.

I know you're busy, so I'll keep this brief - if you have any interest in the domain, I'd love to chat. Even if the timing isn't right now, I'm happy to answer any questions.

Domain details: {{domain.url}}

Let me know either way - I appreciate your time.

Best,
{{sender.name}}
{{sender.email}}`,
  },
  {
    id: "final-follow-up",
    name: "Final Follow-Up",
    description: "Last touch before closing the loop",
    subject: "Last note about {{domain.full}}",
    preview_text: "Closing the loop on the domain opportunity",
    body_html: `Hi {{lead.first_name}},

I wanted to send one final note about <strong>{{domain.full}}</strong>.

I haven't heard back, so I'll assume the timing isn't right. No problem at all - I just wanted to make sure you had the opportunity before I move on.

If anything changes, feel free to reach out anytime. The domain details are here: {{domain.url}}

Wishing you and {{lead.company}} continued success!

Best regards,
{{sender.name}}
{{sender.email}}`,
  },
  {
    id: "value-proposition",
    name: "Value Proposition",
    description: "Emphasizes business benefits and ROI",
    subject: "{{domain.full}} - premium domain for {{lead.company}}",
    preview_text: "A domain investment that pays for itself",
    body_html: `Hi {{lead.first_name}},

I'll get straight to the point - <strong>{{domain.full}}</strong> is available and could be valuable for {{lead.company}}.

Why this domain matters:

<strong>Direct Traffic</strong> - Premium domains get typed directly into browsers. No ads needed.

<strong>SEO Advantage</strong> - Exact-match domains still carry weight in search rankings.

<strong>Brand Protection</strong> - Own it before a competitor does.

<strong>One-Time Investment</strong> - Unlike ads, you pay once and own it forever.

The domain is available at {{domain.price}}. I'm also open to discussing payment plans if that helps.

View details: {{domain.url}}

Worth a quick conversation?

{{sender.name}}
{{sender.phone}}`,
  },
];

export const DEFAULT_VOICEMAIL_TEMPLATES: DefaultVoicemailTemplate[] = [
  {
    id: "initial-voicemail",
    name: "Initial Voicemail",
    description: "First voicemail drop - friendly introduction",
    script: `Hi {{lead.first_name}}, this is {{sender.name}}.

I'm reaching out because I have a premium domain, {{domain.full}}, that I think could be perfect for {{lead.company}}.

I'd love to chat with you about it. You can reach me at {{sender.phone}}, that's {{sender.phone}}.

Looking forward to connecting!`,
  },
  {
    id: "follow-up-voicemail",
    name: "Follow-Up Voicemail",
    description: "Second voicemail after no response",
    script: `Hey {{lead.first_name}}, {{sender.name}} again.

Just following up on the domain {{domain.full}}. I sent you an email about it too.

If you're interested at all, give me a call at {{sender.phone}}. That's {{sender.phone}}.

Hope to hear from you!`,
  },
  {
    id: "value-voicemail",
    name: "Value Proposition Voicemail",
    description: "Highlights domain benefits",
    script: `Hi {{lead.first_name}}, this is {{sender.name}} calling about a quick business opportunity.

The domain {{domain.full}} is available, and I immediately thought of {{lead.company}}. A premium domain like this can really boost your online credibility and make it easier for customers to find you.

I'd love to discuss it. Call me back at {{sender.phone}}, again that's {{sender.phone}}.

Talk soon!`,
  },
  {
    id: "final-voicemail",
    name: "Final Voicemail",
    description: "Last voicemail before closing loop",
    script: `Hi {{lead.first_name}}, {{sender.name}} here one last time.

I've been trying to reach you about {{domain.full}}. I'll assume the timing isn't right, but if anything changes, my number is {{sender.phone}}.

Best of luck with {{lead.company}}. Take care!`,
  },
];

// Helper function to get a template by ID
export function getDefaultEmailTemplate(id: string): DefaultEmailTemplate | undefined {
  return DEFAULT_EMAIL_TEMPLATES.find((t) => t.id === id);
}

export function getDefaultVoicemailTemplate(id: string): DefaultVoicemailTemplate | undefined {
  return DEFAULT_VOICEMAIL_TEMPLATES.find((t) => t.id === id);
}
