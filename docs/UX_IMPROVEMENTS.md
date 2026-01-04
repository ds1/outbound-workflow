# UX Improvements Roadmap

A prioritized list of user experience and workflow improvements to make the outbound sales flow tighter and more integrated.

## Priority Order

### Tier 1: High Impact, Lower Effort (Start Here)

#### 1. In-App Voice Preview & Generation
**Impact**: Huge time saver - eliminates need to leave the app
**Effort**: Medium
**APIs Used**: ElevenLabs, Slybroadcast

**Current Flow**:
1. Create voicemail script in app
2. Go to ElevenLabs website
3. Generate audio file
4. Download and upload to Slybroadcast
5. Get audio ID, reference in campaign

**Improved Flow**:
1. Create voicemail script in app
2. Click "Preview Voice" button
3. Select voice from dropdown (fetched from ElevenLabs)
4. Hear preview with sample lead/domain data substituted
5. Click "Save to Library" - uploads directly to Slybroadcast
6. Audio player embedded in template card for future reference

**Implementation Notes**:
- Add voice selector to voicemail template form
- Create `/api/voice/preview` endpoint that substitutes variables and synthesizes
- Store audio in Slybroadcast, save reference in voicemail_templates table
- Add audio_url and elevenlabs_voice_id columns to voicemail_templates

---

#### 2. Live Template Preview with Real Data
**Impact**: Builds confidence before sending
**Effort**: Low
**APIs Used**: None (client-side only)

**Current Flow**: See `{{lead.first_name}}` placeholders in preview

**Improved Flow**:
- Dropdown to select a real lead + domain from your data
- Preview shows actual personalized content
- Toggle between "Variables" and "Preview" modes
- For email: render HTML as recipient would see it (iframe or sanitized HTML)

**Implementation Notes**:
- Add lead/domain selector to template preview panel
- Create `substituteVariables(template, lead, domain)` utility
- For email, render in sandboxed iframe to show actual styling

---

#### 3. Send Test Email/Voicemail to Self
**Impact**: Reduces errors, builds confidence
**Effort**: Low
**APIs Used**: Resend, Slybroadcast

**Current Flow**: Create campaign, hope it looks right, send to real leads

**Improved Flow**:
- "Send Test" button on template editor and campaign review step
- Prompts for your email/phone (pre-filled from settings)
- Sends real message with sample data substituted
- Verify formatting, voice quality, variable substitution before sending to leads

**Implementation Notes**:
- Add "Send Test" button to template forms
- Create `/api/email/test` and `/api/voicemail/test` endpoints
- Use sender's contact info from user_settings table

---

#### 4. "Start Campaign" from Lead Results
**Impact**: Natural workflow continuation
**Effort**: Low
**APIs Used**: None

**Current Flow**:
1. Find leads → close dialog
2. Navigate to Campaigns
3. Create new campaign
4. In step 4, manually find and select the leads you just found

**Improved Flow**:
- After scraping completes, show "Start Campaign with These Leads" button
- Clicking opens campaign wizard at Step 2 (template selection)
- Leads pre-selected in Step 4
- Domain context carried through

**Implementation Notes**:
- Add button to FindLeadsDialog completion state
- Pass lead IDs via URL params or Zustand store
- Campaign wizard checks for pre-selected leads on mount

---

### Tier 2: High Impact, Medium Effort

#### 5. Quick Campaign Launcher
**Impact**: Reduces friction for repeat users
**Effort**: Medium
**APIs Used**: None

**Current Flow**: Full 4-step wizard every time

**Improved Flow**:
- "Quick Start" button on leads page
- Select leads with checkboxes
- Click "Quick Campaign"
- Modal shows: Campaign name, default sequence (Initial Email → Day 3 Follow-up → Day 7 Final)
- One-click launch with sensible defaults
- Advanced wizard still available via "Customize" button

**Implementation Notes**:
- Create QuickCampaignModal component
- Define default campaign sequence in config
- Auto-generate campaign name: "{Domain} Outreach - {Date}"

---

#### 6. AI Lead Scoring
**Impact**: Focus efforts on best prospects
**Effort**: Medium-High
**APIs Used**: Claude

**Current Flow**: All leads treated equally, manual review

**Improved Flow**:
- After scraping, Claude analyzes each company
- Scores 1-100 based on:
  - Current domain quality (using inferior domain = higher score)
  - Company size/stage indicators
  - Industry fit with domain keywords
  - Funding signals (if found)
- Sort/filter leads by score
- "High Priority" badge on top leads
- Campaign wizard can filter to "Score > 70" leads

**Implementation Notes**:
- Create `/api/leads/score` endpoint
- Add `quality_score` field to prospects table (already exists)
- Batch process with Claude to avoid per-lead API calls
- Cache scores, re-score on demand

---

#### 7. Company Research Summary
**Impact**: Better personalization, informed outreach
**Effort**: Medium
**APIs Used**: Claude, Web Scraper

**Current Flow**: Just see company name and URL

**Improved Flow**:
- "Research" button on lead row or detail panel
- Scrapes company website (already have scraper)
- Claude summarizes:
  - What they do
  - Why they'd want this domain
  - Current domain analysis
  - Suggested pitch angle
  - Key talking points
- Cached per company URL
- Shown in expandable lead detail panel

**Implementation Notes**:
- Create `/api/leads/research` endpoint
- Add `research_summary` JSONB column to prospects
- Rate limit to avoid excessive API usage
- Show "Research" badge on leads that have summaries

---

#### 8. Voicemail Audio Library
**Impact**: Better organization, easy reuse
**Effort**: Medium
**APIs Used**: Slybroadcast, ElevenLabs

**Current Flow**: Audio files managed externally in Slybroadcast

**Improved Flow**:
- New "Audio Library" section in Templates page
- Shows all generated voicemail recordings
- Each entry shows:
  - Name, duration, voice used
  - Play button with inline audio player
  - Which templates/campaigns use this audio
  - "Re-generate" button (new voice or updated script)
- Upload custom recordings option

**Implementation Notes**:
- Create `voicemail_audio` table
- Fetch audio list from Slybroadcast API
- Store metadata locally for fast access
- Link audio to voicemail_templates

---

### Tier 3: High Impact, Higher Effort

#### 9. Reply Detection & Surfacing
**Impact**: Close the loop on engagement
**Effort**: High
**APIs Used**: Resend webhooks

**Current Flow**: Manually check email for replies

**Improved Flow**:
- Configure Resend inbound webhook
- When reply detected:
  - Parse sender email, match to prospect
  - Auto-update lead status to "Engaged"
  - Store reply content
  - Send notification (email or in-app)
- "Replies" tab in campaign detail page
- Reply thread view showing full conversation
- Hot lead alert for quick replies

**Implementation Notes**:
- Set up Resend inbound parsing
- Create `/api/webhooks/email/inbound` endpoint
- Add `replies` table or JSONB field on campaign_prospects
- Create notification system for hot leads

---

#### 10. Suggested Response Generator
**Impact**: Faster follow-up on engaged leads
**Effort**: Medium
**APIs Used**: Claude

**Current Flow**: Write follow-up response manually

**Improved Flow**:
- When reply detected, show "Generate Response" button
- Claude drafts contextual reply based on:
  - Original outreach template
  - Their response content
  - Domain details and pricing
  - Conversation history
- Preview in modal
- "Send" button or "Edit First" option
- Response saved to conversation thread

**Implementation Notes**:
- Create `/api/generate/response` endpoint
- Pass full context to Claude
- Integrate with email sending flow

---

#### 11. A/B Test Templates
**Impact**: Optimize conversion over time
**Effort**: High
**APIs Used**: None (logic only)

**Current Flow**: Single template per campaign step

**Improved Flow**:
- When adding step to campaign, option to "Add Variant"
- Create 2-4 template variants
- System auto-splits audience randomly
- Track per-variant metrics:
  - Open rate
  - Click rate
  - Reply rate
- After sufficient data, show winner
- "Promote Winner" button to use for all future sends

**Implementation Notes**:
- Modify campaign steps schema to support variants
- Add variant_id to campaign_prospects
- Aggregate stats by variant in analytics

---

#### 12. Smart Send Time Optimization
**Impact**: Better open rates
**Effort**: Medium
**APIs Used**: None (logic only)

**Current Flow**: Manual schedule setting, same time for all

**Improved Flow**:
- "Optimal timing" toggle in campaign schedule
- System determines best send time per recipient:
  - Infer timezone from phone area code or company location
  - Avoid weekends, before 9am, after 6pm local time
  - Prefer Tuesday-Thursday mid-morning
- Preview shows "Send times will vary by recipient timezone"
- Analytics show which times performed best

**Implementation Notes**:
- Add timezone inference utility (area code lookup)
- Modify campaign scheduler to per-recipient scheduling
- Store send_time preferences in campaign config

---

### Tier 4: Nice to Have

#### 13. Template Performance Comparison
**Impact**: Learn what works
**Effort**: Low
**APIs Used**: None

Show per-template aggregate metrics across all campaigns:
- Open rate, click rate, reply rate
- "Best performing" badge
- Suggestions for improvement

---

#### 14. AI Template Refinement Actions
**Impact**: Faster iteration
**Effort**: Medium
**APIs Used**: Claude

Quick action buttons on templates:
- "Make Shorter"
- "More Urgent"
- "Friendlier Tone"
- "Add Social Proof"
- Side-by-side comparison

---

#### 15. Domain-Centric Campaign View
**Impact**: Better organization
**Effort**: Low
**APIs Used**: None

On domain detail page:
- Show all campaigns targeting this domain's leads
- "New Campaign" pre-filters to this domain's leads
- Activity timeline for the domain

---

#### 16. Guided First Campaign Wizard
**Impact**: Better onboarding
**Effort**: Medium
**APIs Used**: All

Step-by-step wizard for new users:
1. Add your first domain
2. Find 5 leads (guided strategy selection)
3. Pick or generate a template
4. Launch mini-campaign
5. Celebrate first send

---

#### 17. Voice Clone Setup Flow
**Impact**: Personalized voicemails
**Effort**: High
**APIs Used**: ElevenLabs

In-app voice cloning:
- Record 30-second sample in browser
- Upload to ElevenLabs
- Create instant voice clone
- Set as default for all voicemails

---

#### 18. Talking Points Generator
**Impact**: Better personalization
**Effort**: Medium
**APIs Used**: Claude

Per-lead contextual suggestions:
- Analyzes their current domain
- Company description
- Generates 3-5 talking points
- "They're using getweatherrobots.io - emphasize .com credibility"

---

## Summary by Priority

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **1** | In-App Voice Preview | Medium | Very High |
| **2** | Live Template Preview | Low | High |
| **3** | Send Test to Self | Low | High |
| **4** | Start Campaign from Leads | Low | High |
| **5** | Quick Campaign Launcher | Medium | High |
| **6** | AI Lead Scoring | Medium-High | High |
| **7** | Company Research Summary | Medium | High |
| **8** | Voicemail Audio Library | Medium | Medium |
| **9** | Reply Detection | High | Very High |
| **10** | Suggested Response Generator | Medium | High |
| **11** | A/B Test Templates | High | High |
| **12** | Smart Send Time | Medium | Medium |
| **13+** | Nice to Have items | Varies | Medium |

---

## Quick Start Recommendation

For your next session, start with items 1-4 (Tier 1). They provide the biggest UX improvement with reasonable effort:

1. **In-App Voice Preview** - This single feature eliminates the biggest workflow friction
2. **Live Template Preview** - Quick win, client-side only
3. **Send Test to Self** - Builds confidence, prevents errors
4. **Start Campaign from Leads** - Natural flow continuation

These four changes would transform the app from "tool that connects to other tools" to "complete outbound workflow solution."
