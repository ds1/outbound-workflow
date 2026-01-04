# Deep Outbound

An AI-powered outbound sales automation system for domain name sales. Live at [deepoutbound.com](https://deepoutbound.com).

Automate email drip campaigns, ringless voicemail drops, and leverage intelligent lead discovery to find potential domain buyers.

## Landing Page

The public landing page features:
- Animated liquid gradient background with Framer Motion
- Four sections: Strategic Buyer Discovery, Generate Content, Scheduled Drip Campaigns, Advanced Analytics
- Lead-finding strategies showcase (Domain Upgrade, SEO/PPC Bidders, Emerging Startups, Market Leaders)
- Responsive design with Instrument Serif and Outfit typography
- Dark oceanic color scheme (#050d18, #0a1525, #0d1a2d)

## Features

### Lead Discovery
- **Intelligent Search Strategies**: Four AI-powered strategies to find potential domain buyers
- **Domain Upgrade**: Find companies using inferior domains (prefixed, hyphenated, alt-TLDs)
- **SEO/PPC Bidders**: Find companies ranking for domain keywords who may want direct traffic
- **Emerging Startups**: Search startup directories for early-stage companies
- **Market Leaders**: Target established companies by keyword mapping
- **Real-Time Scraping**: Watch contacts appear as websites are scraped
- **Background Jobs**: Minimize dialogs and continue working while scraping runs

### Domain Management
- Track your domain portfolio with buy-it-now prices, floor prices
- Spaceship.com landing page integration
- Domain status tracking (available, sold, reserved, expired)

### Lead Management
- Import prospects via CSV
- Track status through the sales funnel (new → contacted → engaged → qualified → converted)
- Associate leads with domains of interest
- Real-time lead creation during web scraping

### Outreach Automation
- **Email Campaigns**: Multi-step drip campaigns via Resend
- **Voicemail Drops**: Ringless voicemail delivery via Slybroadcast
- **AI Content Generation**: Claude API for personalized email and voicemail scripts
- **Voice Synthesis**: ElevenLabs text-to-speech for natural voicemail audio
- **Template System**: Create templates with variable placeholders

### Campaign Engine
- Multi-step campaign wizard
- BullMQ job queue for scheduled delivery
- Delivery webhooks for tracking opens, clicks, bounces
- Campaign performance analytics

### Advanced Features
- **Escalation Rules**: Automated alerts for high-engagement prospects
- **Analytics Dashboard**: Campaign performance tracking with charts
- **Cost Tracking**: API usage cost monitoring and projections
- **Notification Preferences**: Configurable email alerts and cost thresholds

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **State** | TanStack Query (server), Zustand (client) |
| **Forms** | React Hook Form, Zod |
| **AI** | Claude API (Anthropic) |
| **Voice** | ElevenLabs |
| **Voicemail** | Slybroadcast |
| **Email** | Resend |
| **Search** | DuckDuckGo HTML Search |
| **Scraping** | Puppeteer |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ds1/deep-outbound.git
   cd deep-outbound
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials (see [Environment Variables](#environment-variables))

4. **Set up Supabase database**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor
   - Run the migrations from `supabase/migrations/` in order
   - Copy your project URL and anon key to `.env.local`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Claude API (for AI content generation)
ANTHROPIC_API_KEY=sk-ant-xxx

# ElevenLabs (for voice synthesis)
ELEVENLABS_API_KEY=xxx

# Slybroadcast (for voicemail drops)
SLYBROADCAST_EMAIL=your-email
SLYBROADCAST_PASSWORD=your-password
SLYBROADCAST_CALLER_ID=your-caller-id

# Resend (for email delivery)
RESEND_API_KEY=re_xxx

# Redis for job queue (for campaign scheduling)
REDIS_URL=redis://localhost:6379

# Notifications
ESCALATION_NOTIFY_EMAIL=your-email@example.com
```

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Login, signup pages
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── analytics/          # Analytics dashboard with charts
│   │   ├── campaigns/          # Campaign management & wizard
│   │   ├── dashboard/          # Main dashboard
│   │   ├── domains/            # Domain portfolio
│   │   ├── escalations/        # Escalation rules management
│   │   ├── leads/              # Lead management
│   │   ├── settings/           # App settings
│   │   └── templates/          # Email/voicemail templates
│   └── api/                    # API routes
│       ├── generate/           # AI content generation
│       ├── search/             # Web search for lead finding
│       ├── scraper/            # Web scraping for contacts
│       ├── voice/              # Voice synthesis
│       ├── email/              # Email delivery
│       ├── voicemail/          # Voicemail delivery
│       └── webhooks/           # Delivery event webhooks
├── components/
│   ├── FindLeadsDialog.tsx     # Lead discovery dialog with background jobs
│   ├── MinimizedJobs.tsx       # Floating job progress cards
│   ├── layout/                 # Sidebar, Header, DashboardClient
│   └── ui/                     # shadcn/ui components
├── hooks/                      # React Query data hooks
├── lib/
│   ├── lead-strategies.ts      # Lead finding strategy definitions
│   ├── lead-targets.ts         # Market leader keyword mappings
│   ├── domain-variants.ts      # Domain pattern variant generator
│   └── supabase/               # Supabase client setup
├── services/                   # External API integrations
│   ├── claude/                 # Claude API for AI generation
│   ├── elevenlabs/             # ElevenLabs for voice synthesis
│   ├── resend/                 # Resend for email delivery
│   ├── slybroadcast/           # Slybroadcast for voicemail
│   ├── scraper/                # Puppeteer web scraper
│   └── web-search/             # DuckDuckGo search service
├── stores/                     # Zustand state stores
│   └── useJobsStore.ts         # Background job tracking
├── providers/                  # React context providers
└── types/                      # TypeScript type definitions
```

## Lead Finding Strategies

Find potential buyers using four intelligent search strategies:

| Strategy | Best For | How It Works |
|----------|----------|--------------|
| **Domain Upgrade** | Premium .com domains | Finds companies using inferior domains (getcompany.com, company.io, company-name.com) who might want to upgrade |
| **SEO/PPC Bidders** | Keyword-rich domains | Finds companies ranking for domain keywords who may want direct type-in traffic |
| **Emerging Startups** | Trendy/tech domains | Searches startup directories (ProductHunt, Crunchbase) for early-stage companies |
| **Market Leaders** | Industry domains | Uses keyword mapping to target established companies in related industries |

### Background Job System

Lead scraping runs as background jobs with full progress tracking:

- **Minimize Dialog**: Click the minimize button (−) to shrink to a floating card
- **Continue Working**: Browse the app while scraping runs in the background
- **Active Jobs Sidebar**: See progress for all running jobs in the sidebar
- **Floating Progress Cards**: Real-time status at bottom-right of screen
- **Persistent Completion**: Success toast persists until manually dismissed
- **Reopen Anytime**: Click any job to reopen its full dialog
- **Multiple Jobs**: Run several lead-finding jobs simultaneously

### Real-Time Lead Creation

Contacts are added to your Leads immediately as they're discovered:
- No waiting for scraping to complete
- Watch leads appear in real-time
- Each site shows status (pending → scraping → done/error)
- Automatic email deduplication and filtering

See [User Guide](docs/USER_GUIDE.md) for detailed usage instructions.

## Template Variables

Use these placeholders in your email and voicemail templates:

| Category | Variables |
|----------|-----------|
| **Lead** | `{{lead.first_name}}`, `{{lead.last_name}}`, `{{lead.company}}`, `{{lead.email}}` |
| **Domain** | `{{domain.name}}`, `{{domain.full}}`, `{{domain.price}}`, `{{domain.url}}` |
| **Sender** | `{{sender.name}}`, `{{sender.email}}`, `{{sender.phone}}` |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database Schema

The application uses the following main tables:

- **domains** - Domain portfolio with pricing and status
- **prospects** - Lead/contact information and engagement status
- **campaigns** - Email and voicemail campaign configurations
- **email_templates** - Email template content and variables
- **voicemail_templates** - Voicemail script templates
- **activity_logs** - Event tracking for all activities
- **escalation_rules** - Automation trigger configurations
- **campaign_prospects** - Many-to-many campaign enrollment
- **cost_logs** - API usage cost tracking
- **user_settings** - User preferences and API keys
- **notification_preferences** - Alert configuration

See `supabase/migrations/` for the complete schema.

## Cost Estimates

Estimated costs per 1,000 lead campaign:

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| Claude API | ~700K tokens | ~$14 |
| ElevenLabs | 1,000 voicemails | ~$16 |
| Slybroadcast | 1,000 drops | ~$80-100 |
| Resend | 1,000 emails | ~$0.90 |
| **Total** | | **~$110-130** |

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | Complete | Foundation: Next.js, Supabase, Auth, UI |
| **Phase 2** | Complete | Core CRUD: Domains, Leads, Templates, Activity |
| **Phase 3** | Complete | API Integrations: Claude, ElevenLabs, Resend, Slybroadcast, Scraper |
| **Phase 4** | Complete | Campaign Engine: BullMQ job queue, schedulers, webhooks |
| **Phase 5** | Complete | Advanced: Escalation rules, analytics, cost tracking |
| **Lead Finding** | Complete | Intelligent search strategies, background jobs, real-time scraping |

## Contributing

This is a personal project. Feel free to fork and adapt for your own use.

## License

MIT

## Author

Built by Dan with Claude Code assistance.
