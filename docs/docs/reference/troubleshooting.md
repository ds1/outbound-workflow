---
sidebar_position: 3
---

# Troubleshooting

Common issues and solutions for Deep Outbound.

## Lead Discovery Issues

### No Search Results

**Symptoms:** Search completes but no companies found.

**Solutions:**
1. Try a different strategy (Domain Upgrade → SEO Bidders)
2. Check if domain has recognizable keywords
3. Use Market Leaders for generic industry terms
4. Add custom URLs manually

### Scraping Returns No Contacts

**Symptoms:** Sites scraped but no leads added.

**Causes:**
- Websites blocking automated access
- Contact info behind forms or login
- JavaScript-rendered content
- No public contact information

**Solutions:**
1. Try company's LinkedIn page manually
2. Check "Contact Us" pages directly
3. Look for press/media contacts
4. Search for company on social media

### Scraping Fails with Error

**Symptoms:** Site shows ✗ Error status.

**Common errors:**
- `Timeout` - Site too slow or blocking
- `Access denied` - Site blocking scrapers
- `Not found` - Invalid URL

**Solutions:**
1. Skip problematic sites
2. Visit site manually to verify it exists
3. Try the company's main domain instead of subpages

## Email Issues

### Emails Not Sending

**Symptoms:** Campaign stuck, no emails delivered.

**Check:**
1. Resend API key configured in Settings
2. Sender email verified in Resend
3. Resend account has sending capacity
4. Email template has valid HTML

**Solutions:**
1. Re-enter Resend API key
2. Verify your sending domain in Resend dashboard
3. Check Resend dashboard for errors

### High Bounce Rate

**Symptoms:** Many emails bouncing.

**Causes:**
- Invalid email addresses
- Full mailboxes
- Spam filters
- Domain reputation issues

**Solutions:**
1. Verify email addresses before sending
2. Remove bounced emails from future campaigns
3. Improve email content (avoid spam triggers)
4. Warm up your sending domain

### Low Open Rates

**Symptoms:** Emails sent but not opened (< 10%).

**Solutions:**
1. Improve subject lines (shorter, more specific)
2. Test different send times
3. Check sender reputation
4. Personalize subject with company name

## Voicemail Issues

### Voicemails Not Delivering

**Symptoms:** Voicemails queued but not delivered.

**Check:**
1. Slybroadcast credentials in Settings
2. Slybroadcast account has credits
3. Caller ID is verified
4. Phone numbers are valid US numbers

**Solutions:**
1. Re-enter Slybroadcast credentials
2. Purchase more credits
3. Verify caller ID in Slybroadcast dashboard
4. Check phone number format (10 digits, no country code)

### Poor Audio Quality

**Symptoms:** Voice sounds robotic or unclear.

**Solutions:**
1. Simplify script (avoid complex words)
2. Try different ElevenLabs voice
3. Remove special characters from script
4. Record your own audio instead

### Audio Not Generating

**Symptoms:** Preview button doesn't work.

**Check:**
1. ElevenLabs API key configured
2. ElevenLabs account has characters remaining

**Solutions:**
1. Re-enter ElevenLabs API key
2. Check ElevenLabs usage in their dashboard

## Campaign Issues

### Campaign Won't Start

**Symptoms:** Campaign stays in Draft status.

**Check:**
1. At least one step defined
2. At least one prospect enrolled
3. Schedule configured
4. Templates selected for each step

### Campaign Stuck

**Symptoms:** Campaign active but no progress.

**Causes:**
- API issues (email/voicemail services)
- All prospects processed
- Schedule window closed

**Solutions:**
1. Check API configurations
2. Review prospect status in campaign
3. Verify schedule includes current time

## UI Issues

### Dialog Won't Close

**Symptoms:** Find Leads dialog won't dismiss.

**This is intentional.** After a job completes:
- Click **Dismiss** to close and remove
- Click **Minimize** to keep in background
- Escape key is disabled to prevent accidental close

### Jobs Disappear

**Symptoms:** Active jobs gone from sidebar.

**Causes:**
- Page was refreshed (jobs are in-memory)
- Job was dismissed

**Note:** Job results are saved (leads remain), but job progress UI is session-only.

### Hydration Errors

**Symptoms:** Console shows "hydration mismatch" errors.

**Solutions:**
1. Refresh the page
2. This is usually harmless
3. Jobs section loads after initial render (expected behavior)

## API Configuration Issues

### "Invalid API Key" Errors

**Solutions:**
1. Re-copy the API key from the provider
2. Check for leading/trailing spaces
3. Ensure key is for correct environment (not test/sandbox)
4. Verify key hasn't been revoked

### Rate Limiting

**Symptoms:** Operations failing intermittently.

**Solutions:**
1. Slow down campaign send rate
2. Wait before retrying
3. Check provider's rate limit docs

## General Tips

### Clear Browser Cache

Many issues resolve by:
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear site data
3. Try incognito window

### Check Browser Console

For technical issues:
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### Contact Support

If issues persist:
- [Submit feedback](https://feedback.deepoutbound.com)
- Include: steps to reproduce, error messages, browser info
