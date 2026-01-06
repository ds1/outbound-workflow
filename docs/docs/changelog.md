---
sidebar_position: 100
---

# Changelog

All notable changes to Deep Outbound.

## [Unreleased]

### Added
- User documentation site
- Public feedback portal (Fider)

---

## [1.0.0] - 2024-01-XX

### Added

#### Core Features
- Domain portfolio management
- Lead management with CSV import
- Email template editor with variables
- Voicemail template editor
- Multi-step campaign system
- Real-time analytics dashboard

#### Lead Discovery
- Domain Upgrade strategy (find companies using inferior domains)
- SEO/PPC Bidders strategy (find keyword rankers)
- Emerging Startups strategy (search startup directories)
- Market Leaders strategy (target established companies)
- Background job system for long-running scrapes
- Real-time lead creation during scraping

#### Integrations
- Claude API for AI content generation
- ElevenLabs for voice synthesis
- Resend for email delivery
- Slybroadcast for ringless voicemail
- Web scraping with contact extraction

#### Campaign Engine
- Email campaigns with tracking
- Voicemail campaigns
- Multi-channel sequences
- Scheduling with timezone support
- Prospect enrollment

#### Other
- Escalation rules for automation
- Cost tracking across all services
- User settings and preferences
- Activity logging

### Technical
- Next.js 16 with App Router
- Supabase for database and auth
- React Query for data fetching
- Zustand for state management
- shadcn/ui component library

---

## Version History Format

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Change Categories

- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Features to be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
