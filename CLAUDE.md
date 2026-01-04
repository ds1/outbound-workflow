# CLAUDE.md - Project Context for AI Assistants

This document provides comprehensive context about the Outbound Workflow project for AI assistants like Claude.

## Project Overview

**Outbound Workflow** is an outbound sales automation system designed for selling domain names. It automates email drip campaigns, ringless voicemail drops, leverages AI for content generation, and includes intelligent lead discovery to find potential domain buyers.

### Key Business Goals
- Automate outreach to potential domain buyers
- Generate personalized email and voicemail content using AI
- Track prospect engagement and escalate high-value leads
- Integrate with spaceship.com landing pages for domain sales
- Find potential buyers through intelligent search strategies

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16 (App Router) | SSR, routing, API routes |
| UI Framework | React 19 + TypeScript | Component architecture |
| Styling | Tailwind CSS + shadcn/ui | Design system |
| Database | Supabase (PostgreSQL) | Data persistence, auth, realtime |
| State Management | TanStack Query + Zustand | Server state + client state |
| Forms | React Hook Form + Zod | Validation and form handling |
| AI Content | Claude API (Anthropic) | Email/voicemail script generation |
| Voice Synthesis | ElevenLabs | Voice cloning and TTS |
| Voicemail Delivery | Slybroadcast | Ringless voicemail drops |
| Email Delivery | Resend | Transactional email |
| Web Search | DuckDuckGo HTML Search | Lead discovery |
| Web Scraping | Puppeteer | Contact extraction |
| Job Queue | BullMQ + Redis | Scheduled campaigns |

## Project Structure

```
outbound-workflow/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Public auth pages
│   │   │   ├── login/                # Login page
│   │   │   └── signup/               # Signup page
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── analytics/            # Analytics dashboard with charts
│   │   │   ├── campaigns/            # Campaign management
│   │   │   │   ├── [id]/             # Campaign detail page
│   │   │   │   └── new/              # Campaign creation wizard
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── domains/              # Domain portfolio
│   │   │   ├── escalations/          # Escalation rules management
│   │   │   ├── leads/                # Lead/prospect management
│   │   │   ├── settings/             # App settings
│   │   │   └── templates/            # Email/voicemail templates
│   │   ├── api/                      # API routes
│   │   │   ├── auth/callback/        # Supabase auth callback
│   │   │   ├── campaigns/            # Campaign start/stats endpoints
│   │   │   ├── domains/              # Domain endpoints
│   │   │   │   └── check/            # DNS/HTTP check for variants
│   │   │   ├── generate/             # AI content generation
│   │   │   │   ├── email/            # Generate email content
│   │   │   │   ├── voicemail/        # Generate voicemail script
│   │   │   │   └── subjects/         # Generate subject lines
│   │   │   ├── search/               # DuckDuckGo web search
│   │   │   ├── scraper/              # Web scraping endpoint
│   │   │   ├── voice/                # Voice synthesis
│   │   │   │   ├── synthesize/       # Text-to-speech
│   │   │   │   └── voices/           # List available voices
│   │   │   ├── email/                # Email delivery
│   │   │   │   └── send/             # Send via Resend
│   │   │   ├── voicemail/            # Voicemail delivery
│   │   │   │   ├── send/             # Single voicemail drop
│   │   │   │   ├── campaign/         # Bulk voicemail campaigns
│   │   │   │   └── audio/            # List Slybroadcast audio files
│   │   │   └── webhooks/             # Delivery event webhooks
│   │   │       ├── email/            # Resend email events
│   │   │       └── voicemail/        # Slybroadcast events
│   │   ├── layout.tsx                # Root layout with providers
│   │   └── page.tsx                  # Landing page (redirects)
│   ├── components/
│   │   ├── FindLeadsDialog.tsx       # Lead discovery dialog with background jobs
│   │   ├── MinimizedJobs.tsx         # Floating job progress cards
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx           # Navigation sidebar with Active Jobs
│   │   │   ├── Header.tsx            # Page header
│   │   │   └── DashboardClient.tsx   # Client wrapper for MinimizedJobs
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/                        # React Query hooks
│   │   ├── useActivityLogs.ts        # Activity logging
│   │   ├── useAnalytics.ts           # Analytics data and cost estimates
│   │   ├── useCampaigns.ts           # Campaign CRUD and enrollment
│   │   ├── useDomains.ts             # Domain CRUD
│   │   ├── useEscalationRules.ts     # Escalation rules CRUD
│   │   ├── useLeads.ts               # Lead/prospect CRUD
│   │   ├── useSettings.ts            # User settings and notification prefs
│   │   └── useTemplates.ts           # Template CRUD
│   ├── lib/
│   │   ├── lead-strategies.ts        # Lead finding strategy definitions
│   │   ├── lead-targets.ts           # Market leader keyword mappings
│   │   ├── domain-variants.ts        # Domain pattern variant generator
│   │   ├── utils.ts                  # Utility functions (cn, etc.)
│   │   └── supabase/                 # Supabase client configuration
│   │       ├── client.ts             # Browser client
│   │       ├── middleware.ts         # Auth middleware
│   │       └── server.ts             # Server client
│   ├── providers/
│   │   └── QueryProvider.tsx         # TanStack Query provider
│   ├── services/                     # External API integrations
│   │   ├── claude/                   # Claude API for AI content
│   │   │   └── index.ts              # Content generation service
│   │   ├── cost-tracking.ts          # API usage cost logging
│   │   ├── elevenlabs/               # ElevenLabs for voice synthesis
│   │   │   └── index.ts              # Voice synthesis service
│   │   ├── resend/                   # Resend for email delivery
│   │   │   └── index.ts              # Email delivery service
│   │   ├── scraper/                  # Puppeteer web scraper
│   │   │   └── index.ts              # Contact extraction service
│   │   ├── slybroadcast/             # Slybroadcast for voicemail
│   │   │   └── index.ts              # Voicemail delivery service
│   │   └── web-search/               # DuckDuckGo search
│   │       └── index.ts              # Web search service
│   ├── stores/                       # Zustand state stores
│   │   └── useJobsStore.ts           # Background job tracking
│   └── types/
│       └── database.ts               # Supabase database types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Core database schema
│       └── 002_cost_tracking.sql     # Cost logs, notifications, user settings
├── docs/
│   └── USER_GUIDE.md                 # User documentation
├── .env.example                      # Environment template
└── .env.local                        # Local environment (gitignored)
```

## Database Schema

### Core Tables

**domains** - Domain portfolio
- `id`, `name`, `tld`, `full_domain` (computed)
- `buy_now_price`, `floor_price`
- `landing_page_url` (spaceship.com URL)
- `status`: available | sold | reserved | expired

**prospects** - Leads/contacts
- `id`, `email`, `phone`, `first_name`, `last_name`, `company_name`
- `domain_id` (FK) - domain of interest
- `source`: manual | import | scraped
- `status`: new | contacted | engaged | qualified | converted | unsubscribed
- `do_not_contact`, `quality_score`

**campaigns** - Outreach campaigns
- `id`, `name`, `description`
- `type`: email | voicemail | multi_channel
- `status`: draft | scheduled | active | paused | completed | cancelled
- `schedule_config` (JSONB), `steps` (JSONB)
- Stats: `total_enrolled`, `total_sent`, `total_opened`, `total_clicked`, etc.

**email_templates** / **voicemail_templates**
- `id`, `name`, `subject`/`script`, `body_html`
- `variables` (JSONB) - placeholder definitions
- `is_active`, `audio_file_path` (voicemail only)

**activity_logs** - Event tracking
- `id`, `prospect_id`, `campaign_id`, `domain_id`
- `activity_type`, `description`, `metadata` (JSONB)

**escalation_rules** - Automation rules
- `trigger_type`, `trigger_config`, `conditions`, `actions`
- `cooldown_hours`, `notification_email`

**campaign_prospects** - Many-to-many with status tracking
- `campaign_id`, `prospect_id`, `status`, `current_step`
- Engagement stats per prospect

**cost_logs** - API usage tracking
- `service`, `operation`, `cost`, `units`
- Timestamps for cost aggregation

**user_settings** - User preferences
- API keys, profile info, notification preferences

## Implementation Status

### Phase 1: Foundation (COMPLETED)
- [x] Next.js project setup with TypeScript
- [x] Supabase integration (client, server, middleware)
- [x] Authentication (login, signup, auth callback)
- [x] Dashboard layout (sidebar, header)
- [x] Database schema and migrations
- [x] shadcn/ui component library

### Phase 2: Core CRUD (COMPLETED)
- [x] Domain management (create, read, update, delete)
- [x] Lead management with CSV import
- [x] Email template editor with preview
- [x] Voicemail template editor with preview
- [x] Activity logging hooks
- [x] Dashboard with real-time stats
- [x] React Query data fetching layer

### Phase 3: API Integrations (COMPLETED)
- [x] Claude API service for content generation
- [x] ElevenLabs service for voice synthesis
- [x] Resend service for email delivery
- [x] Slybroadcast service for voicemail drops
- [x] Web scraper for contact extraction (Puppeteer)
- [x] All API route endpoints

### Phase 4: Campaign Engine (COMPLETED)
- [x] Campaign creation wizard
- [x] BullMQ job queue setup with Redis
- [x] Drip campaign scheduler
- [x] Email campaign processor
- [x] Voicemail campaign processor
- [x] Webhook handlers for delivery events

### Phase 5: Advanced Features (COMPLETED)
- [x] Escalation rules management UI
- [x] Analytics dashboard with charts
- [x] Cost tracking service
- [x] Notification preferences in settings
- [x] User settings hooks

### Lead Finding System (COMPLETED)
- [x] Four lead finding strategies:
  - **Domain Upgrade**: Find companies using inferior domains (prefixes, alt TLDs, hyphens)
  - **SEO/PPC Bidders**: Find companies ranking for domain keywords
  - **Emerging Startups**: Search startup directories (ProductHunt, Crunchbase)
  - **Market Leaders**: Target established companies by keyword mapping
- [x] Domain variant generator (`src/lib/domain-variants.ts`)
- [x] DuckDuckGo web search service (`src/services/web-search/`)
- [x] Background job system with Zustand (`src/stores/useJobsStore.ts`)
- [x] Real-time lead creation during scraping
- [x] Minimizable dialog with floating progress cards
- [x] Active Jobs section in sidebar
- [x] Job reopen functionality (click to maximize)
- [x] Persistent completion notifications

## Key Patterns and Conventions

### Data Fetching
- Use React Query hooks from `src/hooks/` for all data operations
- Hooks follow naming: `use{Entity}s()`, `use{Entity}(id)`, `useCreate{Entity}()`, etc.
- Mutations invalidate relevant query keys on success

### Form Handling
- React Hook Form with Zod validation
- Schema defined at component top, type inferred from schema
- Form errors displayed inline below inputs

### Component Structure
- Page components in `src/app/(dashboard)/*/page.tsx`
- UI components from shadcn/ui in `src/components/ui/`
- Layout components in `src/components/layout/`
- Feature components in `src/components/` root

### Type Safety
- Database types in `src/types/database.ts`
- Export helper types: `Domain`, `DomainInsert`, `DomainUpdate`, etc.
- Use `Json` type for JSONB columns

### Authentication
- Supabase Auth with email/password
- Middleware protects `/dashboard/*` routes
- Auth state checked in layout via `getUser()`

### Background Jobs (Client-Side)

The lead scraping feature uses a Zustand store for client-side job management:

**Store Structure** (`src/stores/useJobsStore.ts`):
```typescript
interface JobsState {
  jobs: Map<string, Job>;           // All jobs by ID
  minimizedJobs: Set<string>;       // IDs of minimized jobs
  reopenJobId: string | null;       // Job to reopen in dialog

  // Actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  minimizeJob: (id: string) => void;
  maximizeJob: (id: string) => void;  // Sets reopenJobId
  clearReopenJob: () => void;
  // ... getters
}
```

**Job Interface** (`LeadScrapingJob`):
```typescript
interface LeadScrapingJob {
  id: string;
  type: "lead-scraping";
  status: "searching" | "scraping" | "done" | "error";
  domainName: string;
  strategyName: string;
  searchQueriesTotal: number;
  searchQueriesComplete: number;
  sitesTotal: number;
  sitesComplete: number;
  progress: ScrapeJobProgress[];
  totalLeadsAdded: number;
  leadsWithPhone: number;
  startedAt: Date;
  completedAt?: Date;
}
```

**Job Reopen Mechanism**:
1. User clicks job in sidebar or floating card
2. `maximizeJob(id)` is called, which sets `reopenJobId`
3. Domains/Leads pages have `useEffect` listening for `reopenJobId`
4. When set, page opens FindLeadsDialog with `resumeJobId` prop
5. Dialog restores job state and shows current progress

**Hydration Fix**:
Components that use the jobs store add a `mounted` state:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// Only render job-related content after mount
const activeJobs = mounted ? Array.from(jobs.values()).filter(...) : [];
```
This prevents server/client HTML mismatch since Zustand state differs.

### Lead Finding Strategies

**Strategy Definitions** (`src/lib/lead-strategies.ts`):
```typescript
type LeadStrategy = 'domain-upgrade' | 'seo-bidders' | 'emerging-startups' | 'market-leaders';

interface StrategyConfig {
  id: LeadStrategy;
  name: string;
  description: string;
  icon: string;
  generateTargets: (domain: Domain) => Promise<CompanyTarget[]>;
}
```

**Domain Variants** (`src/lib/domain-variants.ts`):
- Generates prefix variants: get-, try-, use-, go-, my-, hello-, meet-
- Generates suffix variants: -app, -hq, -ai, -labs, -team, -now
- Generates TLD variants: .io, .co, .net, .org, .ai, .app, .dev
- Generates hyphenated variants

**Web Search Service** (`src/services/web-search/`):
- Uses DuckDuckGo HTML search (Google blocked by CAPTCHA)
- Parses HTML results page
- Filters blocked domains (100+ news/blog/directory sites)
- Returns company name and URL

**Blocked Domains**: News sites, directories, research sites filtered:
- wikipedia.org, reddit.com, linkedin.com, facebook.com
- techcrunch.com, forbes.com, bloomberg.com
- yelp.com, yellowpages.com, bbb.org
- And 90+ more

### Dialog Close Behavior

The FindLeadsDialog has specific close behaviors:
- **During job**: Clicking outside/escape minimizes instead of closing
- **After completion**: User must click "Dismiss" to close
- **handleClose**: Returns early if job is done (prevents accidental close)
- **handleDismiss**: Removes job and closes dialog

## Template Variables

Templates support these placeholders (double curly braces):

**Lead Variables**
- `{{lead.first_name}}`, `{{lead.last_name}}`
- `{{lead.company}}`, `{{lead.email}}`

**Domain Variables**
- `{{domain.name}}`, `{{domain.full}}`
- `{{domain.price}}`, `{{domain.url}}`

**Sender Variables**
- `{{sender.name}}`, `{{sender.email}}`, `{{sender.phone}}`

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# API Keys (for integrations)
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=xxx
RESEND_API_KEY=re_xxx

# Slybroadcast
SLYBROADCAST_EMAIL=xxx
SLYBROADCAST_PASSWORD=xxx
SLYBROADCAST_CALLER_ID=xxx

# Redis (for campaign job queue)
REDIS_URL=redis://localhost:6379

# Notifications
ESCALATION_NOTIFY_EMAIL=your-email@example.com
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run migrations in Supabase dashboard SQL editor
```

## Setup Status

**Completed by user:**
- [x] Migration 001 (initial schema) - run in Supabase
- [x] Migration 002 (cost tracking) - run in Supabase
- [x] Supabase environment variables configured

**Not yet configured:**
- [ ] Redis for campaign job queue
- [ ] Anthropic API key (Claude)
- [ ] ElevenLabs API key
- [ ] Slybroadcast credentials
- [ ] Resend API key

## Important Notes for AI Assistants

### General Patterns
1. **Always use existing hooks** from `src/hooks/` for data operations
2. **Supabase types** use the `Relationships` array format - don't remove it
3. **Form validation** - use Zod schemas, avoid `.default()` modifier with react-hook-form
4. **Toast notifications** - use `sonner` (not deprecated `toast` component)
5. **Status enums** - must match database enum types exactly
6. **Json type** - use imported `Json` type from database.ts for JSONB fields
7. **Middleware** - Next.js shows deprecation warning but it still works
8. **Price fields** - stored as numbers, displayed with `$` formatting

### State Management
9. **Memoize derived objects in hooks** - wrap computed objects with `useMemo` to prevent infinite render loops
10. **Zustand stores** - use for client-side state that persists across component unmounts
11. **Hydration fix** - add `mounted` state check for components using Zustand to prevent SSR mismatch

### External Services
12. **DuckDuckGo search** - Google search blocked by CAPTCHA; use DuckDuckGo HTML search (`html.duckduckgo.com`)
13. **Puppeteer** - use regular `puppeteer` package, not `puppeteer-extra` (causes build errors)
14. **Blocked domains** - web search filters 100+ news/blog/directory sites; see `web-search/index.ts`

### Lead Finding Dialog
15. **Dialog close behavior** - completed jobs block escape/outside click; user must click Dismiss
16. **Job reopen** - maximizeJob sets reopenJobId; pages listen and open dialog with resumeJobId
17. **Real-time leads** - leads are created during scraping, not after; use mutation per discovered contact

### Component Patterns
18. **FindLeadsDialog phases**: strategy → setup → searching → scraping → done
19. **MinimizedJobs** - fixed position bottom-right, renders only minimized jobs
20. **Sidebar Active Jobs** - shows all jobs (running + done), click to maximize/reopen

## UX Improvements Roadmap

See `docs/UX_IMPROVEMENTS.md` for the full prioritized list of planned improvements.

### Priority Summary

**Tier 1 - High Impact, Start Here:**
1. **In-App Voice Preview** - Generate voicemail audio from template text with ElevenLabs, preview in-app, save to Slybroadcast without leaving the app
2. **Live Template Preview** - Select real lead/domain to see personalized content instead of `{{variables}}`
3. **Send Test to Self** - Test email/voicemail with your own contact info before sending to leads
4. **Start Campaign from Leads** - After finding leads, button to start campaign with those leads pre-selected

**Tier 2 - High Impact, Medium Effort:**
5. Quick Campaign Launcher - One-click campaign with default sequence
6. AI Lead Scoring - Claude analyzes companies, scores 1-100
7. Company Research Summary - AI generates talking points per lead
8. Voicemail Audio Library - Manage all generated audio in-app

**Tier 3 - High Impact, Higher Effort:**
9. Reply Detection - Webhook detects email replies, surfaces in UI
10. Suggested Response Generator - AI drafts reply based on conversation
11. A/B Test Templates - Test variants, track performance
12. Smart Send Time Optimization - Per-recipient timezone scheduling

### Key Integration Points

These improvements leverage existing APIs:
- **Claude API**: Lead scoring, research summaries, response generation, template refinement
- **ElevenLabs**: In-app voice preview and generation
- **Slybroadcast**: Direct audio upload, audio library management
- **Resend**: Test emails, reply detection via inbound webhooks

### Implementation Notes

The voice preview feature (Tier 1, Item 1) would:
1. Add voice selector dropdown to voicemail template form (fetch from `/api/voice/voices`)
2. Create `/api/voice/preview` endpoint that substitutes variables and synthesizes
3. Add audio player to template preview panel
4. Add "Save to Library" button that uploads to Slybroadcast
5. Store `audio_url` and `elevenlabs_voice_id` on voicemail_templates
