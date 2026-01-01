# Outbound Workflow

Outbound sales automation for domain name sales. Features email drip campaigns, ringless voicemail drops, AI-generated content, and lead management.

## Features

- **Domain Management**: Track your domain portfolio with buy-it-now and floor prices
- **Lead Management**: Import and manage prospects with status tracking
- **Email Campaigns**: AI-generated personalized drip campaigns via Resend
- **Voicemail Campaigns**: Voice-cloned ringless voicemail drops via Slybroadcast
- **Content Generation**: Claude AI for email and voicemail script generation
- **Voice Synthesis**: ElevenLabs for natural voice cloning
- **Escalation System**: Automated alerts for high-engagement prospects

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude API (Anthropic)
- **Voice**: ElevenLabs
- **Voicemail**: Slybroadcast
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ds1/outbound-workflow.git
   cd outbound-workflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

4. Set up your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migration SQL in `supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and anon key to `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `ANTHROPIC_API_KEY` - Claude API key for content generation
- `ELEVENLABS_API_KEY` - ElevenLabs API key for voice synthesis
- `SLYBROADCAST_EMAIL` / `SLYBROADCAST_PASSWORD` - Slybroadcast credentials
- `RESEND_API_KEY` - Resend API key for email delivery

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components
├── lib/
│   └── supabase/          # Supabase client
├── types/                 # TypeScript types
└── services/              # External API integrations (coming soon)
```

## License

MIT
