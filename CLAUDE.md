# CLAUDE.md - Project Context for AI Assistants

This document provides comprehensive context about the Outbound Workflow project for AI assistants like Claude.

## Project Overview

**Outbound Workflow** is an outbound sales automation system designed for selling domain names. It automates email drip campaigns, ringless voicemail drops, and leverages AI for content generation.

### Key Business Goals
- Automate outreach to potential domain buyers
- Generate personalized email and voicemail content using AI
- Track prospect engagement and escalate high-value leads
- Integrate with spaceship.com landing pages for domain sales

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
| Job Queue | BullMQ + Redis | Scheduled campaigns (planned) |

## Project Structure

```
outbound-workflow/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Public auth pages
│   │   │   ├── login/            # Login page
│   │   │   └── signup/           # Signup page
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── campaigns/        # Campaign management
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── domains/          # Domain portfolio
│   │   │   ├── leads/            # Lead/prospect management
│   │   │   ├── settings/         # App settings
│   │   │   └── templates/        # Email/voicemail templates
│   │   ├── api/                  # API routes
│   │   │   ├── auth/callback/    # Supabase auth callback
│   │   │   ├── generate/         # AI content generation endpoints
│   │   │   ├── voice/            # Voice synthesis endpoints
│   │   │   ├── email/            # Email delivery endpoints
│   │   │   ├── voicemail/        # Voicemail campaign endpoints
│   │   │   └── scraper/          # Web scraping endpoint
│   │   ├── layout.tsx            # Root layout with providers
│   │   └── page.tsx              # Landing page (redirects)
│   ├── components/
│   │   ├── layout/               # Sidebar, Header components
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # React Query hooks
│   │   ├── useActivityLogs.ts    # Activity logging
│   │   ├── useDomains.ts         # Domain CRUD
│   │   ├── useLeads.ts           # Lead/prospect CRUD
│   │   └── useTemplates.ts       # Template CRUD
│   ├── lib/
│   │   └── supabase/             # Supabase client configuration
│   │       ├── client.ts         # Browser client
│   │       ├── middleware.ts     # Auth middleware
│   │       └── server.ts         # Server client
│   ├── providers/
│   │   └── QueryProvider.tsx     # TanStack Query provider
│   ├── services/                 # External API integrations
│   │   ├── claude/               # Claude API for AI content generation
│   │   ├── elevenlabs/           # ElevenLabs for voice synthesis
│   │   ├── resend/               # Resend for email delivery
│   │   ├── scraper/              # Puppeteer web scraper
│   │   └── slybroadcast/         # Slybroadcast for voicemail drops
│   └── types/
│       └── database.ts           # Supabase database types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema
├── .env.example                  # Environment template
└── .env.local                    # Local environment (gitignored)
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
- [x] Claude API service for content generation (`src/services/claude/`)
- [x] ElevenLabs service for voice synthesis (`src/services/elevenlabs/`)
- [x] Resend service for email delivery (`src/services/resend/`)
- [x] Slybroadcast service for voicemail drops (`src/services/slybroadcast/`)
- [x] Web scraper for lead generation (`src/services/scraper/`)
- [x] API route endpoints:
  - `/api/generate/email` - AI email generation
  - `/api/generate/voicemail` - AI voicemail script generation
  - `/api/generate/subjects` - AI subject line generation
  - `/api/voice/synthesize` - Text-to-speech synthesis
  - `/api/voice/voices` - List available voices
  - `/api/email/send` - Send email via Resend
  - `/api/voicemail/send` - Single voicemail drop
  - `/api/voicemail/campaign` - Bulk voicemail campaigns
  - `/api/voicemail/audio` - List Slybroadcast audio files
  - `/api/scraper` - Web scraping for contacts

### Phase 4: Campaign Engine (PLANNED)
- [ ] Campaign creation wizard
- [ ] BullMQ job queue setup
- [ ] Drip campaign scheduler
- [ ] Bulk voicemail processor
- [ ] Webhook handlers for delivery events

### Phase 5: Advanced Features (PLANNED)
- [ ] Escalation rules engine
- [ ] Email notifications (danmakesthings@gmail.com)
- [ ] Analytics dashboard
- [ ] Cost tracking and alerts

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

### Type Safety
- Database types in `src/types/database.ts`
- Export helper types: `Domain`, `DomainInsert`, `DomainUpdate`, etc.
- Use `Json` type for JSONB columns

### Authentication
- Supabase Auth with email/password
- Middleware protects `/dashboard/*` routes
- Auth state checked in layout via `getUser()`

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

# API Keys (for Phase 3+)
ANTHROPIC_API_KEY=sk-ant-xxx
ELEVENLABS_API_KEY=xxx
RESEND_API_KEY=re_xxx

# Slybroadcast (for Phase 3+)
SLYBROADCAST_EMAIL=xxx
SLYBROADCAST_PASSWORD=xxx
SLYBROADCAST_CALLER_ID=xxx

# Redis (for Phase 4+)
REDIS_URL=redis://localhost:6379

# Notifications
ESCALATION_NOTIFY_EMAIL=danmakesthings@gmail.com
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

## Important Notes for AI Assistants

1. **Always use existing hooks** from `src/hooks/` for data operations
2. **Supabase types** use the `Relationships` array format - don't remove it
3. **Form validation** - use Zod schemas, avoid `.default()` modifier with react-hook-form
4. **Toast notifications** - use `sonner` (not deprecated `toast` component)
5. **Status enums** - must match database enum types exactly
6. **Json type** - use imported `Json` type from database.ts for JSONB fields
7. **Middleware** - Next.js shows deprecation warning but it still works
8. **Price fields** - stored as numbers, displayed with `$` formatting
