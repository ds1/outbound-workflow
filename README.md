# Outbound Workflow

An outbound sales automation system for domain name sales. Automate email drip campaigns, ringless voicemail drops, and leverage AI for personalized content generation.

## Features

### Current (Phase 1-5)
- **Domain Management**: Track your domain portfolio with buy-it-now prices, floor prices, and spaceship.com landing page links
- **Lead Management**: Import prospects via CSV, track status through the sales funnel
- **Template System**: Create email and voicemail templates with variable placeholders
- **Activity Tracking**: Log and view all outreach activities
- **Dashboard**: Real-time stats, quick actions, and setup progress tracking
- **Authentication**: Secure login/signup with Supabase Auth
- **AI Content Generation**: Claude API for personalized email and voicemail scripts
- **Voice Synthesis**: ElevenLabs text-to-speech for natural voicemail audio
- **Email Delivery**: Send emails via Resend with tracking support
- **Voicemail Drops**: Ringless voicemail delivery via Slybroadcast
- **Lead Scraping**: Puppeteer-based web scraper for extracting contact info
- **Campaign Engine**: Multi-step campaigns with BullMQ job queue
- **Campaign Wizard**: Create campaigns with steps, scheduling, and prospect enrollment
- **Delivery Webhooks**: Track email opens, clicks, bounces; voicemail delivery status
- **Escalation Rules**: Automated alerts for high-engagement prospects and no-response triggers
- **Analytics Dashboard**: Campaign performance tracking with charts and metrics
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
| **State** | TanStack Query, Zustand |
| **Forms** | React Hook Form, Zod |
| **AI** | Claude API (Anthropic) |
| **Voice** | ElevenLabs |
| **Voicemail** | Slybroadcast |
| **Email** | Resend |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ds1/outbound-workflow.git
   cd outbound-workflow
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
   - Run the migration from `supabase/migrations/001_initial_schema.sql`
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

# Claude API (Phase 3)
ANTHROPIC_API_KEY=sk-ant-xxx

# ElevenLabs (Phase 3)
ELEVENLABS_API_KEY=xxx

# Slybroadcast (Phase 3)
SLYBROADCAST_EMAIL=your-email
SLYBROADCAST_PASSWORD=your-password
SLYBROADCAST_CALLER_ID=your-caller-id

# Resend (Phase 3)
RESEND_API_KEY=re_xxx

# Redis for job queue (Phase 4)
REDIS_URL=redis://localhost:6379

# Notifications
ESCALATION_NOTIFY_EMAIL=your-email@example.com
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, signup pages
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── campaigns/     # Campaign management
│   │   ├── dashboard/     # Main dashboard
│   │   ├── domains/       # Domain portfolio
│   │   ├── leads/         # Lead management
│   │   ├── settings/      # App settings
│   │   └── templates/     # Email/voicemail templates
│   └── api/               # API routes
├── components/
│   ├── layout/            # Sidebar, Header
│   └── ui/                # shadcn/ui components
├── hooks/                 # React Query data hooks
├── lib/
│   └── supabase/          # Supabase client setup
├── providers/             # React context providers
├── services/              # External API integrations
└── types/                 # TypeScript type definitions
```

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | Complete | Foundation: Next.js, Supabase, Auth, UI |
| **Phase 2** | Complete | Core CRUD: Domains, Leads, Templates, Activity |
| **Phase 3** | Complete | API Integrations: Claude, ElevenLabs, Resend, Slybroadcast, Scraper |
| **Phase 4** | Complete | Campaign Engine: BullMQ job queue, schedulers, webhooks |
| **Phase 5** | Complete | Advanced: Escalation rules, analytics, cost tracking |

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

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Cost Estimates

Estimated costs per 1,000 lead campaign:

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| Claude API | ~700K tokens | ~$14 |
| ElevenLabs | 1,000 voicemails | ~$16 |
| Slybroadcast | 1,000 drops | ~$80-100 |
| Resend | 1,000 emails | ~$0.90 |
| **Total** | | **~$110-130** |

## Contributing

This is a personal project. Feel free to fork and adapt for your own use.

## License

MIT

## Author

Built by Dan with Claude Code assistance.
