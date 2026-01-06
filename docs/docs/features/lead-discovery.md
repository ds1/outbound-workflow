---
sidebar_position: 3
---

# Lead Discovery

Automatically find companies that might want to buy your domains.

## Overview

Lead Discovery uses intelligent search strategies to find potential buyers. It searches the web, analyzes results, and scrapes contact information from company websites.

## Starting a Search

### From the Domains Page

1. Click the action menu (⋮) on any domain
2. Select **Find Leads**
3. The dialog opens with the domain pre-selected

### From the Leads Page

1. Click the **Find Leads** button
2. Select a domain from the dropdown
3. Choose your strategy

## Search Strategies

### Domain Upgrade

**Best for**: Premium .com domains

Finds companies currently using inferior domain patterns:

| Pattern | Example |
|---------|---------|
| **Prefixes** | `getcompany.com`, `trycompany.com`, `usecompany.com` |
| **Suffixes** | `companyapp.com`, `companyhq.com`, `companyai.com` |
| **Alternate TLDs** | `company.io`, `company.co`, `company.net` |
| **Hyphenated** | `weather-robots.com` |

**Why it works**: These companies already invested in the brand but compromised on the domain. They're prime candidates to upgrade.

### SEO/PPC Bidders

**Best for**: Keyword-rich domains

Searches for companies ranking for your domain's keywords:

- Finds businesses actively acquiring traffic for these terms
- May be paying for ads on these keywords
- Would benefit from direct type-in traffic

**Why it works**: Companies paying for this traffic could save money by owning the domain.

### Emerging Startups

**Best for**: Trendy/tech domains

Searches startup directories and news:

- ProductHunt launches
- Crunchbase profiles
- Tech news mentions
- Funding announcements

**Why it works**: Early-stage startups often use non-premium domains and may upgrade as they grow.

### Market Leaders

**Best for**: Industry-specific domains

Uses keyword mapping to identify established companies:

- Returns instant results (no web search needed)
- Targets known players in the space
- Good for broad industry domains

**Note**: Harder sells since established companies often have premium domains already.

## Search Progress

During the search phase, you'll see:

- **Progress bar** - Visual completion indicator
- **Searches Complete** - X/Y queries processed
- **Current query** - The search term being executed
- **Live results** - Companies appearing as found

## Selecting Companies

After search completes:

1. Review the list of discovered companies
2. Each shows:
   - Company name
   - Website URL
   - Category badge (strategy that found it)
3. Use checkboxes to select which to scrape
4. **Select All** / **Deselect All** for bulk selection
5. Add custom URLs manually if needed
6. Click **Scrape X Sites**

## Scraping Progress

As sites are scraped, contacts appear in real-time:

| Status | Meaning |
|--------|---------|
| ○ **Pending** | Waiting to be scraped |
| ⟳ **Scraping** | Currently extracting contacts |
| ✓ **Done** | Completed (shows lead count) |
| ✗ **Error** | Failed (shows error message) |

Leads are added to your database immediately as they're found.

## Background Jobs

Lead discovery runs as a background job:

### Minimizing

1. Click the minimize button (−) in the dialog header
2. Dialog shrinks to a floating card at bottom-right
3. Continue using the app normally
4. Progress updates in real-time

### Active Jobs in Sidebar

When jobs are running:
- **Active Jobs** section appears in the sidebar
- Shows progress and lead count
- Click any job to reopen its dialog

### Job Completion

When finished:
- Dialog shows results summary
- If minimized, shows success notification
- Options: **View Details**, **View Leads**, **Dismiss**

## Adding Custom URLs

If you know specific companies:

1. Enter URL in the **Add Custom URL** field
2. Click the **+** button
3. URL is added to the scrape list

## Strategy Recommendations

| Domain Type | Recommended Strategy |
|-------------|---------------------|
| Premium .com | Domain Upgrade |
| Keyword-rich | SEO/PPC Bidders |
| Tech/trendy | Emerging Startups |
| Industry terms | Market Leaders |

**Pro tip**: Run multiple strategies for comprehensive coverage.

## Troubleshooting

### No Search Results

- Try a different strategy
- Check if domain has recognizable keywords
- Market Leaders works for most industry terms

### Scraping Fails

- Some websites block automated access
- Contact forms may hide emails
- Try the company's social profiles manually

## Related

- [Leads Management](/features/leads) - Manage discovered leads
- [Campaigns](/features/campaigns) - Reach out to leads
