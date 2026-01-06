---
sidebar_position: 1
---

# API Reference

Deep Outbound API endpoints for programmatic access.

## Overview

Deep Outbound provides API endpoints for key functionality. All endpoints are accessible at `https://deepoutbound.com/api/`.

## Authentication

API requests require authentication via session cookie (for browser-based access) or API key (coming soon).

## Endpoints

### Domains

#### List Domains

```
GET /api/domains
```

Returns all domains in your portfolio.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "weatherrobots",
      "tld": "com",
      "full_domain": "weatherrobots.com",
      "buy_now_price": 5000,
      "floor_price": 2500,
      "landing_page_url": "https://...",
      "status": "available"
    }
  ]
}
```

#### Check Domain Variants

```
POST /api/domains/check
```

Check if domain variants are registered.

**Request:**
```json
{
  "domain": "weatherrobots",
  "variants": ["getweatherrobots.com", "weatherrobots.io"]
}
```

### Leads

#### List Leads

```
GET /api/leads
```

Returns all leads.

**Query Parameters:**
- `domain_id` - Filter by domain
- `status` - Filter by status

### Search

#### Web Search

```
POST /api/search
```

Search the web for potential leads.

**Request:**
```json
{
  "query": "weather robots software company",
  "limit": 20
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "WeatherTech Robotics",
      "url": "https://weathertechrobotics.com",
      "snippet": "..."
    }
  ]
}
```

### Scraper

#### Scrape Website

```
POST /api/scraper
```

Extract contact information from a website.

**Request:**
```json
{
  "url": "https://example.com",
  "domain_id": "uuid"
}
```

**Response:**
```json
{
  "contacts": [
    {
      "email": "contact@example.com",
      "name": "John Smith",
      "phone": "555-123-4567"
    }
  ]
}
```

### AI Generation

#### Generate Email Content

```
POST /api/generate/email
```

Generate email content using Claude AI.

**Request:**
```json
{
  "prompt": "Write an initial outreach email for a premium domain",
  "domain": "weatherrobots.com",
  "variables": ["lead.first_name", "lead.company"]
}
```

#### Generate Voicemail Script

```
POST /api/generate/voicemail
```

Generate voicemail script using Claude AI.

#### Generate Subject Lines

```
POST /api/generate/subjects
```

Generate email subject line variations.

### Voice Synthesis

#### List Voices

```
GET /api/voice/voices
```

List available ElevenLabs voices.

#### Synthesize Speech

```
POST /api/voice/synthesize
```

Convert text to speech.

**Request:**
```json
{
  "text": "Hello, this is a test message.",
  "voice_id": "voice_123"
}
```

### Email

#### Send Email

```
POST /api/email/send
```

Send an email via Resend.

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Your subject",
  "html": "<p>Email body</p>",
  "from": "sender@yourdomain.com"
}
```

### Voicemail

#### Send Voicemail

```
POST /api/voicemail/send
```

Send a ringless voicemail via Slybroadcast.

**Request:**
```json
{
  "phone": "5551234567",
  "audio_url": "https://...",
  "caller_id": "5559876543"
}
```

#### List Audio Files

```
GET /api/voicemail/audio
```

List uploaded Slybroadcast audio files.

### Campaigns

#### Start Campaign

```
POST /api/campaigns/:id/start
```

Start a campaign.

#### Get Campaign Stats

```
GET /api/campaigns/:id/stats
```

Get campaign performance metrics.

## Webhooks

### Email Events

```
POST /api/webhooks/email
```

Receives Resend webhook events for:
- `email.sent`
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.bounced`

### Voicemail Events

```
POST /api/webhooks/voicemail
```

Receives Slybroadcast callback events for delivery status.

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Search | 10/minute |
| Scraper | 20/minute |
| AI Generation | 20/minute |
| Voice Synthesis | 10/minute |
| Email Send | 100/minute |
| Voicemail Send | 50/minute |

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `RATE_LIMITED` - Too many requests
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error
