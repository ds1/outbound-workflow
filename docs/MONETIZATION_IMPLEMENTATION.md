# Deep Outbound Monetization Implementation Plan

> Base Credit Price: **$0.20/credit**
> Generated: January 2026

This document outlines the complete implementation plan for Deep Outbound's paid subscription and credit system.

---

## Table of Contents

1. [Pricing Structure Overview](#1-pricing-structure-overview)
2. [Database Schema Changes](#2-database-schema-changes)
3. [Stripe Integration](#3-stripe-integration)
4. [Usage Tracking System](#4-usage-tracking-system)
5. [Credit System](#5-credit-system)
6. [Feature Gating](#6-feature-gating)
7. [UI/UX Changes](#7-uiux-changes)
8. [API Route Changes](#8-api-route-changes)
9. [Migration Strategy](#9-migration-strategy)
10. [Testing Checklist](#10-testing-checklist)
11. [User Flows & Experience Design](#11-user-flows--experience-design)
    - [11.1 User Journey Maps](#111-user-journey-maps)
    - [11.2 Detailed User Flows](#112-detailed-user-flows)
    - [11.3 UX Design Principles](#113-ux-design-principles)
    - [11.4 Loading States & Feedback](#114-loading-states--feedback)
    - [11.5 Animations & Micro-interactions](#115-animations--micro-interactions)
    - [11.6 Accessibility Standards](#116-accessibility-standards)
    - [11.7 Mobile Responsiveness](#117-mobile-responsiveness)
    - [11.8 Microcopy Guidelines](#118-microcopy-guidelines)
    - [11.9 Edge Case Handling](#119-edge-case-handling)
    - [11.10 A/B Testing Considerations](#1110-ab-testing-considerations)
    - [11.11 Component Specifications](#1111-component-specifications)
    - [11.12 State Management](#1112-state-management-for-monetization)
    - [11.13 UX Implementation Checklist](#1113-implementation-checklist-ux)

---

## 1. Pricing Structure Overview

### Subscription Tiers

| Feature | Standard ($49/mo) | Pro ($149/mo) | Advanced ($349/mo) |
|---------|-------------------|---------------|-------------------|
| Lead Discovery | 100/month | 500/month | 2,000/month |
| AI Generations | 50/month | 200/month | 1,000/month |
| Domains | 10 | Unlimited | Unlimited |
| Concurrent Campaigns | 2 | 5 | Unlimited |
| Analytics Retention | 30 days | 90 days | 90 days |
| Escalation Rules | 2 | Unlimited | Unlimited |
| BYOK (Bring Your Own Keys) | No | Yes | Yes |
| Priority Support | No | No | Yes |

### Included Credits Per Tier

| Tier | Emails Included | Voicemails Included | Total Credits | Credit Value |
|------|-----------------|---------------------|---------------|--------------|
| Standard | 100 | 10 | 200 | $40 |
| Pro | 500 | 50 | 1,000 | $200 |
| Advanced | 2,000 | 200 | 4,000 | $800 |

### Free Trial

- **100 credits** included with every new account (no credit card required)
- Credits never expire, but cannot be refilled without subscription
- Trial credits value: $20

### Credit Costs (at $0.20/credit)

| Action | Credits | Cost to User | Your Cost | Margin |
|--------|---------|--------------|-----------|--------|
| Send 1 email | 1 | $0.20 | $0.001 | 99.5% |
| Voicemail drop | 10 | $2.00 | $0.05 | 97.5% |
| Voice synthesis (short, 500 chars) | 15 | $3.00 | $0.08 | 97.3% |
| Voice synthesis (long, 1000 chars) | 30 | $6.00 | $0.17 | 97.2% |
| Lead scraping | 0 | Free (limited) | ~$0 | - |
| AI generation | 0 | Free (limited) | $0.02 | - |

### Credit Packages (Add-Ons)

| Package | Credits | Price | Per Credit | Discount |
|---------|---------|-------|------------|----------|
| Small Top-Up | 100 | $20 | $0.200 | 0% |
| Standard | 500 | $80 | $0.160 | 20% |
| Bulk | 1,000 | $140 | $0.140 | 30% |

---

## 2. Database Schema Changes

### New Tables

```sql
-- Subscription management
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('trial', 'standard', 'pro', 'advanced')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Credit balance and transactions
CREATE TABLE credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  included_balance INTEGER NOT NULL DEFAULT 0, -- Monthly included credits (resets)
  purchased_balance INTEGER NOT NULL DEFAULT 0, -- Purchased credits (never expire)
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive = add, Negative = deduct
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trial_grant', 'subscription_grant', 'purchase', 'spend', 'refund', 'adjustment')),
  description TEXT,
  metadata JSONB, -- Store action details (email_id, campaign_id, etc.)
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (resets monthly for subscription limits)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  leads_scraped INTEGER DEFAULT 0,
  ai_generations INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  voicemails_sent INTEGER DEFAULT 0,
  voice_syntheses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);
```

### Modify Existing Tables

```sql
-- Add tier limits to user_settings for BYOK
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS byok_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS byok_anthropic_key TEXT,
ADD COLUMN IF NOT EXISTS byok_elevenlabs_key TEXT,
ADD COLUMN IF NOT EXISTS byok_resend_key TEXT,
ADD COLUMN IF NOT EXISTS byok_slybroadcast_email TEXT,
ADD COLUMN IF NOT EXISTS byok_slybroadcast_password TEXT;
```

### RLS Policies

```sql
-- Subscriptions: users can only see their own
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Credit balances: users can only see their own
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit balance"
  ON credit_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage credit balances"
  ON credit_balances FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Credit transactions: users can only see their own
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage credit transactions"
  ON credit_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Usage tracking: users can only see their own
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON usage_tracking FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 3. Stripe Integration

### Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Product IDs (create in Stripe Dashboard)
STRIPE_PRODUCT_STANDARD=prod_xxx
STRIPE_PRODUCT_PRO=prod_xxx
STRIPE_PRODUCT_ADVANCED=prod_xxx

# Price IDs (monthly recurring)
STRIPE_PRICE_STANDARD=price_xxx  # $49/month
STRIPE_PRICE_PRO=price_xxx       # $149/month
STRIPE_PRICE_ADVANCED=price_xxx  # $349/month

# Credit package Price IDs (one-time)
STRIPE_PRICE_CREDITS_SMALL=price_xxx   # $20 for 100 credits
STRIPE_PRICE_CREDITS_STANDARD=price_xxx # $80 for 500 credits
STRIPE_PRICE_CREDITS_BULK=price_xxx    # $140 for 1000 credits
```

### Stripe Products Setup

Create these in Stripe Dashboard:

**Subscriptions (recurring):**
1. **Deep Outbound Standard** - $49/month
2. **Deep Outbound Pro** - $149/month
3. **Deep Outbound Advanced** - $349/month

**Credit Packages (one-time):**
1. **100 Credits (Small)** - $20
2. **500 Credits (Standard)** - $80
3. **1,000 Credits (Bulk)** - $140

### API Routes to Create

#### `src/app/api/stripe/checkout/route.ts`

Creates Stripe Checkout session for subscriptions or credit purchases.

```typescript
// POST /api/stripe/checkout
// Body: { type: 'subscription' | 'credits', tier?: string, package?: string }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP = {
  subscription: {
    standard: process.env.STRIPE_PRICE_STANDARD,
    pro: process.env.STRIPE_PRICE_PRO,
    advanced: process.env.STRIPE_PRICE_ADVANCED,
  },
  credits: {
    small: process.env.STRIPE_PRICE_CREDITS_SMALL,
    standard: process.env.STRIPE_PRICE_CREDITS_STANDARD,
    bulk: process.env.STRIPE_PRICE_CREDITS_BULK,
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, tier, package: pkg } = body;

  // Get or create Stripe customer
  let customerId = await getOrCreateStripeCustomer(user.id, user.email!);

  if (type === 'subscription') {
    const priceId = PRICE_MAP.subscription[tier as keyof typeof PRICE_MAP.subscription];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: { user_id: user.id, tier },
    });

    return NextResponse.json({ url: session.url });
  }

  if (type === 'credits') {
    // Check if user has active subscription (credits require subscription)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({
        error: 'Active subscription required to purchase credits'
      }, { status: 403 });
    }

    const priceId = PRICE_MAP.credits[pkg as keyof typeof PRICE_MAP.credits];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?credits_purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: { user_id: user.id, package: pkg },
    });

    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
```

#### `src/app/api/stripe/webhook/route.ts`

Handles Stripe webhook events.

```typescript
// POST /api/stripe/webhook

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CREDIT_AMOUNTS = {
  small: 100,
  standard: 500,
  bulk: 1000,
};

const INCLUDED_CREDITS = {
  standard: 200,  // 100 emails + 10 VMs
  pro: 1000,      // 500 emails + 50 VMs
  advanced: 4000, // 2000 emails + 200 VMs
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;

      if (session.mode === 'subscription') {
        // New subscription
        const tier = session.metadata?.tier;
        await handleNewSubscription(userId!, session.subscription as string, tier!);
      } else if (session.mode === 'payment') {
        // Credit purchase
        const pkg = session.metadata?.package;
        await handleCreditPurchase(userId!, pkg!, session.payment_intent as string);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await handleSubscriptionRenewal(invoice);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleNewSubscription(userId: string, subscriptionId: string, tier: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Create/update subscription record
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: subscription.customer as string,
    tier,
    status: 'active',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  // Grant included credits
  const includedCredits = INCLUDED_CREDITS[tier as keyof typeof INCLUDED_CREDITS] || 0;
  await grantIncludedCredits(userId, includedCredits, tier);

  // Reset usage tracking for new period
  await resetUsageTracking(userId);
}

async function handleCreditPurchase(userId: string, pkg: string, paymentIntentId: string) {
  const credits = CREDIT_AMOUNTS[pkg as keyof typeof CREDIT_AMOUNTS] || 0;

  // Update balance
  const { data: balance } = await supabase
    .from('credit_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  const newPurchasedBalance = (balance?.purchased_balance || 0) + credits;
  const newTotalBalance = (balance?.included_balance || 0) + newPurchasedBalance;

  await supabase.from('credit_balances').upsert({
    user_id: userId,
    balance: newTotalBalance,
    included_balance: balance?.included_balance || 0,
    purchased_balance: newPurchasedBalance,
  });

  // Record transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: credits,
    balance_after: newTotalBalance,
    type: 'purchase',
    description: `Purchased ${credits} credits (${pkg} package)`,
    stripe_payment_intent_id: paymentIntentId,
  });
}

async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  // Get subscription to find tier
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

  // Find user by customer ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id, tier')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (sub) {
    // Reset included credits for new billing period
    const includedCredits = INCLUDED_CREDITS[sub.tier as keyof typeof INCLUDED_CREDITS] || 0;
    await grantIncludedCredits(sub.user_id, includedCredits, sub.tier);

    // Reset usage tracking
    await resetUsageTracking(sub.user_id);

    // Update subscription period
    await supabase.from('subscriptions').update({
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    }).eq('user_id', sub.user_id);
  }
}

async function grantIncludedCredits(userId: string, credits: number, tier: string) {
  const { data: balance } = await supabase
    .from('credit_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Reset included balance, keep purchased balance
  const purchasedBalance = balance?.purchased_balance || 0;
  const newTotalBalance = credits + purchasedBalance;

  await supabase.from('credit_balances').upsert({
    user_id: userId,
    balance: newTotalBalance,
    included_balance: credits,
    purchased_balance: purchasedBalance,
  });

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: credits,
    balance_after: newTotalBalance,
    type: 'subscription_grant',
    description: `Monthly ${tier} credits granted`,
  });
}

async function resetUsageTracking(userId: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await supabase.from('usage_tracking').upsert({
    user_id: userId,
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0],
    leads_scraped: 0,
    ai_generations: 0,
    emails_sent: 0,
    voicemails_sent: 0,
    voice_syntheses: 0,
  });
}
```

#### `src/app/api/stripe/portal/route.ts`

Opens Stripe Customer Portal for subscription management.

```typescript
// POST /api/stripe/portal

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get customer ID from subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
```

---

## 4. Usage Tracking System

### Tier Limits Configuration

```typescript
// src/lib/tier-limits.ts

export const TIER_LIMITS = {
  trial: {
    leads_scraped: 0,      // Must subscribe to scrape
    ai_generations: 10,    // Limited AI to try
    domains: 3,
    campaigns: 0,          // Must subscribe for campaigns
    analytics_days: 7,
    escalation_rules: 1,
    byok: false,
  },
  standard: {
    leads_scraped: 100,
    ai_generations: 50,
    domains: 10,
    campaigns: 2,
    analytics_days: 30,
    escalation_rules: 2,
    byok: false,
  },
  pro: {
    leads_scraped: 500,
    ai_generations: 200,
    domains: Infinity,
    campaigns: 5,
    analytics_days: 90,
    escalation_rules: Infinity,
    byok: true,
  },
  advanced: {
    leads_scraped: 2000,
    ai_generations: 1000,
    domains: Infinity,
    campaigns: Infinity,
    analytics_days: 90,
    escalation_rules: Infinity,
    byok: true,
  },
} as const;

export type Tier = keyof typeof TIER_LIMITS;
```

### Usage Tracking Hook

```typescript
// src/hooks/useUsage.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TIER_LIMITS, Tier } from '@/lib/tier-limits';

interface Usage {
  leads_scraped: number;
  ai_generations: number;
  emails_sent: number;
  voicemails_sent: number;
  voice_syntheses: number;
}

interface UsageWithLimits extends Usage {
  tier: Tier;
  limits: typeof TIER_LIMITS[Tier];
  period_start: string;
  period_end: string;
}

export function useUsage() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['usage'],
    queryFn: async (): Promise<UsageWithLimits> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get subscription tier
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const tier = (subscription?.tier || 'trial') as Tier;

      // Get current period usage
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0];

      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_start', periodStart)
        .single();

      return {
        leads_scraped: usage?.leads_scraped || 0,
        ai_generations: usage?.ai_generations || 0,
        emails_sent: usage?.emails_sent || 0,
        voicemails_sent: usage?.voicemails_sent || 0,
        voice_syntheses: usage?.voice_syntheses || 0,
        tier,
        limits: TIER_LIMITS[tier],
        period_start: usage?.period_start || periodStart,
        period_end: usage?.period_end || '',
      };
    },
  });
}

export function useIncrementUsage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (field: keyof Usage) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0];
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0];

      // Upsert and increment
      const { error } = await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_field: field,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
  });
}
```

### Database Function for Atomic Increment

```sql
-- Add to migration
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_field TEXT,
  p_period_start DATE,
  p_period_end DATE
) RETURNS void AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, period_start, period_end)
  VALUES (p_user_id, p_period_start, p_period_end)
  ON CONFLICT (user_id, period_start) DO NOTHING;

  EXECUTE format(
    'UPDATE usage_tracking SET %I = %I + 1, updated_at = NOW() WHERE user_id = $1 AND period_start = $2',
    p_field, p_field
  ) USING p_user_id, p_period_start;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Credit System

### Credit Balance Hook

```typescript
// src/hooks/useCredits.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface CreditBalance {
  balance: number;
  included_balance: number;
  purchased_balance: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  description: string;
  created_at: string;
}

export function useCreditBalance() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['credit-balance'],
    queryFn: async (): Promise<CreditBalance> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('credit_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        balance: data?.balance || 100, // Default 100 trial credits
        included_balance: data?.included_balance || 100,
        purchased_balance: data?.purchased_balance || 0,
      };
    },
  });
}

export function useCreditTransactions(limit = 20) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['credit-transactions', limit],
    queryFn: async (): Promise<CreditTransaction[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useSpendCredits() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      metadata
    }: {
      amount: number;
      description: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use database function for atomic spend
      const { data, error } = await supabase.rpc('spend_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description,
        p_metadata: metadata || {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
  });
}
```

### Credit Spend Database Function

```sql
-- Atomic credit spending with proper balance deduction
CREATE OR REPLACE FUNCTION spend_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_balance credit_balances%ROWTYPE;
  v_new_balance INTEGER;
  v_new_included INTEGER;
  v_new_purchased INTEGER;
  v_deduct_from_included INTEGER;
  v_deduct_from_purchased INTEGER;
BEGIN
  -- Lock the row for update
  SELECT * INTO v_balance
  FROM credit_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user has balance record
  IF NOT FOUND THEN
    -- Create initial balance with trial credits
    INSERT INTO credit_balances (user_id, balance, included_balance, purchased_balance)
    VALUES (p_user_id, 100, 100, 0)
    RETURNING * INTO v_balance;
  END IF;

  -- Check sufficient balance
  IF v_balance.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Balance: %, Required: %', v_balance.balance, p_amount;
  END IF;

  -- Deduct from included first, then purchased
  v_deduct_from_included := LEAST(p_amount, v_balance.included_balance);
  v_deduct_from_purchased := p_amount - v_deduct_from_included;

  v_new_included := v_balance.included_balance - v_deduct_from_included;
  v_new_purchased := v_balance.purchased_balance - v_deduct_from_purchased;
  v_new_balance := v_new_included + v_new_purchased;

  -- Update balance
  UPDATE credit_balances
  SET
    balance = v_new_balance,
    included_balance = v_new_included,
    purchased_balance = v_new_purchased,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, amount, balance_after, type, description, metadata
  ) VALUES (
    p_user_id, -p_amount, v_new_balance, 'spend', p_description, p_metadata
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_new_balance,
    'spent', p_amount
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Feature Gating

### Gating Utility

```typescript
// src/lib/feature-gating.ts

import { createClient } from '@/lib/supabase/server';
import { TIER_LIMITS, Tier } from './tier-limits';

export interface GatingResult {
  allowed: boolean;
  reason?: string;
  upgrade_required?: boolean;
  current_usage?: number;
  limit?: number;
}

export async function checkFeatureAccess(
  feature: 'leads' | 'ai' | 'domains' | 'campaigns' | 'email' | 'voicemail' | 'voice' | 'byok'
): Promise<GatingResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, reason: 'Not authenticated' };
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .single();

  const tier = (subscription?.tier || 'trial') as Tier;
  const isActive = subscription?.status === 'active';
  const limits = TIER_LIMITS[tier];

  // Check feature-specific limits
  switch (feature) {
    case 'leads': {
      if (!isActive && tier !== 'trial') {
        return { allowed: false, reason: 'Subscription required', upgrade_required: true };
      }
      const usage = await getCurrentUsage(user.id, 'leads_scraped');
      if (usage >= limits.leads_scraped) {
        return {
          allowed: false,
          reason: `Lead limit reached (${usage}/${limits.leads_scraped})`,
          upgrade_required: true,
          current_usage: usage,
          limit: limits.leads_scraped,
        };
      }
      return { allowed: true, current_usage: usage, limit: limits.leads_scraped };
    }

    case 'ai': {
      const usage = await getCurrentUsage(user.id, 'ai_generations');
      if (usage >= limits.ai_generations) {
        return {
          allowed: false,
          reason: `AI generation limit reached (${usage}/${limits.ai_generations})`,
          upgrade_required: true,
          current_usage: usage,
          limit: limits.ai_generations,
        };
      }
      return { allowed: true, current_usage: usage, limit: limits.ai_generations };
    }

    case 'domains': {
      const { count } = await supabase
        .from('domains')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if ((count || 0) >= limits.domains) {
        return {
          allowed: false,
          reason: `Domain limit reached (${count}/${limits.domains})`,
          upgrade_required: true,
          current_usage: count || 0,
          limit: limits.domains,
        };
      }
      return { allowed: true, current_usage: count || 0, limit: limits.domains };
    }

    case 'campaigns': {
      if (!isActive) {
        return { allowed: false, reason: 'Active subscription required for campaigns', upgrade_required: true };
      }
      const { count } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['active', 'scheduled']);

      if ((count || 0) >= limits.campaigns) {
        return {
          allowed: false,
          reason: `Campaign limit reached (${count}/${limits.campaigns})`,
          upgrade_required: true,
          current_usage: count || 0,
          limit: limits.campaigns,
        };
      }
      return { allowed: true, current_usage: count || 0, limit: limits.campaigns };
    }

    case 'email':
    case 'voicemail':
    case 'voice': {
      if (!isActive) {
        return { allowed: false, reason: 'Active subscription required for sending', upgrade_required: true };
      }
      // Credit check happens at send time
      return { allowed: true };
    }

    case 'byok': {
      if (!limits.byok) {
        return { allowed: false, reason: 'BYOK requires Pro or Advanced tier', upgrade_required: true };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}

async function getCurrentUsage(userId: string, field: string): Promise<number> {
  const supabase = await createClient();
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0];

  const { data } = await supabase
    .from('usage_tracking')
    .select(field)
    .eq('user_id', userId)
    .eq('period_start', periodStart)
    .single();

  return data?.[field] || 0;
}
```

### API Route Middleware

```typescript
// src/lib/api-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { checkFeatureAccess, GatingResult } from './feature-gating';

type Feature = 'leads' | 'ai' | 'domains' | 'campaigns' | 'email' | 'voicemail' | 'voice' | 'byok';

export async function withFeatureGating(
  feature: Feature,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const result = await checkFeatureAccess(feature);

  if (!result.allowed) {
    return NextResponse.json({
      error: result.reason,
      upgrade_required: result.upgrade_required,
      current_usage: result.current_usage,
      limit: result.limit,
    }, { status: 403 });
  }

  return handler();
}
```

---

## 7. UI/UX Changes

### New Components Needed

#### Usage Meter Component

```typescript
// src/components/UsageMeter.tsx

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
}

export function UsageMeter({ label, current, limit, unit = '' }: UsageMeterProps) {
  const percentage = limit === Infinity ? 0 : (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : ''}>
          {current} / {limit === Infinity ? '∞' : limit} {unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
```

#### Upgrade Prompt Component

```typescript
// src/components/UpgradePrompt.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  feature: string;
  currentLimit?: number;
  requiredTier?: 'standard' | 'pro' | 'advanced';
}

export function UpgradePrompt({ feature, currentLimit, requiredTier = 'standard' }: UpgradePromptProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Upgrade Required
        </CardTitle>
        <CardDescription>
          {currentLimit !== undefined
            ? `You've reached your ${feature} limit (${currentLimit}). Upgrade to continue.`
            : `${feature} requires a ${requiredTier} subscription or higher.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/settings?tab=billing">
            Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Credit Balance Display

```typescript
// src/components/CreditBalance.tsx

import { useCreditBalance } from '@/hooks/useCredits';
import { Coins } from 'lucide-react';

export function CreditBalance() {
  const { data: balance, isLoading } = useCreditBalance();

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium">{balance?.balance || 0} credits</span>
    </div>
  );
}
```

### Pages to Modify

#### Settings Page - Add Billing Tab

Add a new "Billing" tab to `/settings` with:
- Current plan display
- Usage meters for all tracked limits
- Upgrade/downgrade buttons
- Credit balance and purchase options
- Transaction history
- Manage subscription (Stripe Portal) button

#### Sidebar - Add Credit Balance

Show credit balance in the sidebar header next to user info.

#### Dashboard - Add Usage Summary

Add usage summary cards showing:
- Leads scraped this month
- AI generations remaining
- Credit balance
- Quick upgrade CTA if near limits

### Modal/Dialog Updates

#### Find Leads Dialog

Before starting lead scraping:
1. Check `leads` feature access
2. If at limit, show upgrade prompt
3. If allowed, proceed with scraping

#### Campaign Creation

Before creating campaign:
1. Check `campaigns` feature access
2. If no subscription, show subscription required prompt
3. If at concurrent campaign limit, show upgrade prompt

#### Send Email/Voicemail

Before sending:
1. Check credit balance
2. If insufficient, show "Buy Credits" prompt
3. If sufficient, deduct credits and proceed

---

## 8. API Route Changes

### Routes Requiring Feature Gating

| Route | Feature Check | Credit Check |
|-------|---------------|--------------|
| `POST /api/leads/scrape` | `leads` | No |
| `POST /api/generate/email` | `ai` | No |
| `POST /api/generate/voicemail` | `ai` | No |
| `POST /api/generate/subjects` | `ai` | No |
| `POST /api/domains` | `domains` | No |
| `POST /api/campaigns` | `campaigns` | No |
| `POST /api/campaigns/[id]/start` | `campaigns` | No |
| `POST /api/email/send` | `email` | 1 credit/email |
| `POST /api/voicemail/send` | `voicemail` | 10 credits/drop |
| `POST /api/voice/synthesize` | `voice` | 15-30 credits |

### Example: Updated Email Send Route

```typescript
// src/app/api/email/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkFeatureAccess } from '@/lib/feature-gating';
import { sendEmail } from '@/services/resend';

const CREDITS_PER_EMAIL = 1;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check feature access
  const access = await checkFeatureAccess('email');
  if (!access.allowed) {
    return NextResponse.json({
      error: access.reason,
      upgrade_required: access.upgrade_required,
    }, { status: 403 });
  }

  // Check credit balance
  const { data: balance } = await supabase
    .from('credit_balances')
    .select('balance')
    .eq('user_id', user.id)
    .single();

  if (!balance || balance.balance < CREDITS_PER_EMAIL) {
    return NextResponse.json({
      error: 'Insufficient credits',
      balance: balance?.balance || 0,
      required: CREDITS_PER_EMAIL,
    }, { status: 402 }); // Payment Required
  }

  const body = await request.json();
  const { to, subject, html, prospect_id, campaign_id } = body;

  try {
    // Send email
    const result = await sendEmail({ to, subject, html });

    // Deduct credits
    await supabase.rpc('spend_credits', {
      p_user_id: user.id,
      p_amount: CREDITS_PER_EMAIL,
      p_description: `Email sent to ${to}`,
      p_metadata: { prospect_id, campaign_id, email_id: result.id },
    });

    // Increment usage
    await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_field: 'emails_sent',
      p_period_start: new Date().toISOString().slice(0, 7) + '-01',
      p_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString().split('T')[0],
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

---

## 9. Migration Strategy

### Phase 1: Database Setup (Week 1)

1. Create migration file with all new tables
2. Run migration on Supabase
3. Create database functions (increment_usage, spend_credits)
4. Set up RLS policies
5. Test with manual SQL queries

### Phase 2: Stripe Setup (Week 1)

1. Create Stripe account (if not exists)
2. Create products and prices in Stripe Dashboard
3. Configure webhook endpoint
4. Set up Customer Portal
5. Add environment variables
6. Test checkout flow in Stripe test mode

### Phase 3: Backend Implementation (Week 2)

1. Implement tier limits configuration
2. Create usage tracking hooks and functions
3. Create credit system hooks and functions
4. Implement feature gating utility
5. Update all gated API routes
6. Test all API routes with different tiers

### Phase 4: Frontend Implementation (Week 3)

1. Create UI components (UsageMeter, UpgradePrompt, CreditBalance)
2. Add billing tab to settings page
3. Update sidebar with credit balance
4. Add usage summary to dashboard
5. Update all feature dialogs with gating checks
6. Test complete user flows

### Phase 5: Testing & QA (Week 4)

1. Test trial user flow (signup → trial credits → hit limits → upgrade prompt)
2. Test subscription flow (checkout → credits granted → usage reset)
3. Test credit purchase flow (buy → balance updated → spend → deducted)
4. Test tier upgrade/downgrade
5. Test subscription cancellation
6. Load testing for concurrent users

### Phase 6: Launch (Week 4)

1. Switch Stripe to live mode
2. Deploy to production
3. Monitor error rates and usage
4. Gradual rollout with feature flag (optional)

---

## 10. Testing Checklist

### Trial User Tests

- [ ] New user gets 100 trial credits
- [ ] Trial user can use 10 AI generations
- [ ] Trial user cannot create campaigns
- [ ] Trial user cannot scrape leads
- [ ] Trial user sees upgrade prompts appropriately
- [ ] Trial credits persist after logout/login

### Subscription Tests

- [ ] Checkout creates subscription in Stripe
- [ ] Webhook creates subscription record in DB
- [ ] User tier is correctly set after subscription
- [ ] Included credits are granted on subscription
- [ ] Usage limits are enforced per tier
- [ ] Subscription renewal resets included credits
- [ ] Subscription renewal resets usage counters
- [ ] Subscription cancellation updates status
- [ ] Canceled user loses access at period end

### Credit System Tests

- [ ] Credit purchase adds to balance
- [ ] Purchased credits are separate from included
- [ ] Spending deducts from included first
- [ ] Spending deducts from purchased when included exhausted
- [ ] Transaction history is accurate
- [ ] Insufficient balance blocks sending
- [ ] Balance updates in real-time

### Feature Gating Tests

- [ ] Lead scraping respects tier limits
- [ ] AI generation respects tier limits
- [ ] Domain creation respects tier limits
- [ ] Campaign creation respects tier limits
- [ ] BYOK only available on Pro/Advanced
- [ ] Upgrade prompts appear at correct times

### Edge Cases

- [ ] User upgrades mid-month (usage preserved, limits increased)
- [ ] User downgrades mid-month (excess usage allowed until reset)
- [ ] Payment failure puts subscription in past_due
- [ ] Webhook retry handles duplicate events
- [ ] Concurrent credit spends don't overdraft

---

## Environment Variables Summary

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STANDARD=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_ADVANCED=price_xxx
STRIPE_PRICE_CREDITS_SMALL=price_xxx
STRIPE_PRICE_CREDITS_STANDARD=price_xxx
STRIPE_PRICE_CREDITS_BULK=price_xxx

# App
NEXT_PUBLIC_APP_URL=https://deepoutbound.com
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/lib/tier-limits.ts` | Tier configuration constants |
| `src/lib/feature-gating.ts` | Feature access checking |
| `src/lib/api-middleware.ts` | API route middleware |
| `src/hooks/useUsage.ts` | Usage tracking hook |
| `src/hooks/useCredits.ts` | Credit balance hook |
| `src/hooks/useSubscription.ts` | Subscription state hook |
| `src/app/api/stripe/checkout/route.ts` | Stripe checkout |
| `src/app/api/stripe/webhook/route.ts` | Stripe webhooks |
| `src/app/api/stripe/portal/route.ts` | Customer portal |
| `src/components/UsageMeter.tsx` | Usage display |
| `src/components/UpgradePrompt.tsx` | Upgrade CTA |
| `src/components/CreditBalance.tsx` | Balance display |
| `supabase/migrations/003_monetization.sql` | New tables |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/(dashboard)/settings/page.tsx` | Add billing tab |
| `src/components/layout/Sidebar.tsx` | Add credit balance |
| `src/app/(dashboard)/dashboard/page.tsx` | Add usage summary |
| `src/components/FindLeadsDialog.tsx` | Add gating check |
| `src/app/api/leads/scrape/route.ts` | Add gating |
| `src/app/api/generate/*/route.ts` | Add gating |
| `src/app/api/email/send/route.ts` | Add credits |
| `src/app/api/voicemail/send/route.ts` | Add credits |
| `src/app/api/voice/synthesize/route.ts` | Add credits |
| `src/app/api/campaigns/route.ts` | Add gating |
| `src/app/api/domains/route.ts` | Add gating |

---

## Cost Estimates

### Stripe Fees

- 2.9% + $0.30 per transaction
- $49 subscription: $1.72 fee (3.5%)
- $149 subscription: $4.62 fee (3.1%)
- $349 subscription: $10.42 fee (3.0%)
- $20 credit purchase: $0.88 fee (4.4%)

### Breakeven Analysis

| Tier | Price | Stripe Fee | Fixed Cost Share | Net | Users for $400 Fixed |
|------|-------|------------|------------------|-----|---------------------|
| Standard | $49 | $1.72 | $3 | $44.28 | 9 users |
| Pro | $149 | $4.62 | $5 | $139.38 | 3 users |
| Advanced | $349 | $10.42 | $15 | $323.58 | 2 users |

**Blended breakeven: ~4-5 paying users**

---

## 11. User Flows & Experience Design

This section details comprehensive user journeys, interaction patterns, and UX standards to ensure a world-class monetization experience.

### 11.1 User Journey Maps

#### Journey 1: New User → Trial → Subscriber

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEW USER ACQUISITION JOURNEY                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AWARENESS        SIGNUP          ACTIVATION       CONVERSION    RETENTION  │
│  ─────────        ──────          ──────────       ──────────    ─────────  │
│                                                                             │
│  Landing    →   Create    →   Dashboard    →   Hit Limit   →   Subscribe   │
│  Page           Account       Tutorial         Upgrade          Renew       │
│                               ↓                Prompt           ↓           │
│                          100 Credits           ↓            Monthly         │
│                          Granted           View Plans       Credits         │
│                               ↓                ↓            Reset           │
│                          Try Features     Select Tier                       │
│                          (AI, Templates)       ↓                            │
│                               ↓            Checkout                         │
│                          First Lead        ↓                                │
│                          Scraped       Payment                              │
│                                            ↓                                │
│                                        Welcome                              │
│                                        Email                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Touchpoints & Emotional States:**

| Stage | User Goal | Emotional State | Key Metric |
|-------|-----------|-----------------|------------|
| Awareness | "Does this solve my problem?" | Curious, skeptical | Time on landing page |
| Signup | "Get me in quickly" | Impatient, hopeful | Signup completion rate |
| Activation | "Show me the value" | Excited, exploring | Features tried in first session |
| Conversion | "Is this worth paying for?" | Evaluating, decisive | Trial-to-paid rate |
| Retention | "Am I getting ROI?" | Satisfied or frustrated | Monthly churn rate |

#### Journey 2: Existing User Credit Purchase

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CREDIT PURCHASE JOURNEY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRIGGER           AWARENESS         DECISION         PURCHASE    SUCCESS   │
│  ───────           ─────────         ────────         ────────    ───────   │
│                                                                             │
│  Low Balance  →   Warning    →   View Credit   →   Select    →  Instant    │
│  Alert            Banner         Packages         Package      Balance      │
│      OR               ↓              ↓               ↓         Update       │
│  Send Action      Tooltip       Compare            Stripe          ↓        │
│  Blocked          "15 credits   Savings            Checkout    Success      │
│                   remaining"         ↓               ↓         Toast        │
│                                 Calculator      1-Click            ↓        │
│                                 "500 credits   (saved card)   Continue      │
│                                 = 500 emails"                 Workflow      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 11.2 Detailed User Flows

#### Flow A: First-Time User Onboarding

```typescript
// State Machine: Onboarding Flow
type OnboardingState =
  | 'signup_form'
  | 'email_verification'
  | 'profile_setup'
  | 'welcome_tour'
  | 'first_action_prompt'
  | 'completed';

interface OnboardingStep {
  state: OnboardingState;
  component: string;
  canSkip: boolean;
  nextAction: string;
}

const ONBOARDING_FLOW: OnboardingStep[] = [
  {
    state: 'signup_form',
    component: 'SignupForm',
    canSkip: false,
    nextAction: 'Verify your email',
  },
  {
    state: 'email_verification',
    component: 'EmailVerificationPrompt',
    canSkip: false, // Required for security
    nextAction: 'Complete your profile',
  },
  {
    state: 'profile_setup',
    component: 'ProfileSetupForm',
    canSkip: true, // Can complete later
    nextAction: 'Take a quick tour',
  },
  {
    state: 'welcome_tour',
    component: 'WelcomeTourModal',
    canSkip: true,
    nextAction: 'Add your first domain',
  },
  {
    state: 'first_action_prompt',
    component: 'FirstActionCard',
    canSkip: true,
    nextAction: 'Explore dashboard',
  },
];
```

**Visual Flow:**

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Signup Form    │────▶│  Email Verify    │────▶│  Profile Setup   │
│                  │     │                  │     │                  │
│ • Email          │     │ • Check inbox    │     │ • Name           │
│ • Password       │     │ • Enter code     │     │ • Company        │
│ • Terms checkbox │     │ • Resend option  │     │ • Use case       │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Dashboard       │◀────│  First Action    │◀────│  Welcome Tour    │
│                  │     │                  │     │                  │
│ • Usage stats    │     │ • Add domain     │     │ • 4 step tour    │
│ • Quick actions  │     │ • Find leads     │     │ • Feature intro  │
│ • Trial banner   │     │ • Create template│     │ • Skip option    │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

#### Flow B: Upgrade to Paid Subscription

```
User Action                    System Response                UI Feedback
───────────                    ───────────────                ───────────

1. Clicks "Upgrade"      →    Fetch current plan data   →    Show loading skeleton
                              Check user eligibility          on pricing cards

2. Views pricing page    →    Display 3 tier cards      →    Highlight recommended
                              Pre-select current tier         tier (Pro) with badge
                              Show usage comparison           Animate value props

3. Selects tier          →    Validate selection        →    Button changes to
                              Calculate prorated cost         "Continue to checkout"
                                                              Show price summary

4. Clicks checkout       →    Create Stripe session     →    Show "Redirecting..."
                              Redirect to Stripe              with spinner
                              Log checkout_started event

5. Completes payment     →    Stripe webhook fires      →    Stripe success page
   (on Stripe)                Create subscription             with Deep Outbound
                              Grant credits                   branding
                              Send welcome email

6. Returns to app        →    Detect session_id param   →    Show success modal
                              Verify subscription             with confetti animation
                              Update UI state                 "Welcome to Pro!"

7. Closes modal          →    Refresh dashboard         →    Update all usage
                              Show new limits                 meters and badges
```

#### Flow C: Hitting a Usage Limit

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LIMIT REACHED EXPERIENCE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  APPROACHING (80%)      AT LIMIT (100%)        BLOCKED                      │
│  ─────────────────      ────────────────       ───────                      │
│                                                                             │
│  • Yellow progress   →  • Red progress bar  →  • Action disabled            │
│    bar                  • "Limit reached"      • Inline upgrade prompt      │
│  • Tooltip warning        toast notification   • Clear explanation          │
│  • Sidebar badge        • Modal with options   • One-click upgrade CTA      │
│  • Dashboard alert      • Usage breakdown      • Alternative actions        │
│                                                  (export data, etc.)        │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
│  │ ████████░░ 80%  │    │ ██████████ 100% │    │ ⚠️ Lead Limit Reached   │ │
│  │ 80/100 leads    │    │ 100/100 leads   │    │                         │ │
│  │                 │    │                 │    │ You've discovered 100   │ │
│  │ Running low!    │    │ Upgrade to      │    │ leads this month.       │ │
│  │ Upgrade for     │    │ continue        │    │                         │ │
│  │ more leads      │    │ finding leads   │    │ [Upgrade to Pro →]      │ │
│  └─────────────────┘    └─────────────────┘    │ [View discovered leads] │ │
│                                                └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Flow D: Insufficient Credits for Action

```typescript
// Credit Check Flow with UX States
interface CreditCheckResult {
  hasEnough: boolean;
  balance: number;
  required: number;
  shortage: number;
}

// User attempts to send email campaign to 50 leads
async function handleSendCampaign(leadCount: number) {
  const creditsNeeded = leadCount * CREDITS_PER_EMAIL; // 50 credits

  // Step 1: Pre-flight check with optimistic UI
  showLoadingState('Preparing campaign...');

  // Step 2: Check balance
  const check = await checkCreditBalance(creditsNeeded);

  if (!check.hasEnough) {
    // Step 3a: Insufficient credits flow
    showInsufficientCreditsModal({
      balance: check.balance,        // 30
      required: check.required,      // 50
      shortage: check.shortage,      // 20
      suggestedPackage: 'small',     // 100 credits for $20
      // Show contextual messaging
      message: `You need ${check.shortage} more credits to send this campaign.`,
      // Quick actions
      actions: [
        { label: 'Buy 100 credits ($20)', action: 'purchase_small', primary: true },
        { label: 'Send to fewer leads', action: 'reduce_recipients' },
        { label: 'Save as draft', action: 'save_draft' },
      ],
    });
    return;
  }

  // Step 3b: Sufficient credits - confirm and proceed
  const confirmed = await showConfirmationDialog({
    title: 'Ready to send',
    message: `This will use ${creditsNeeded} credits. You'll have ${check.balance - creditsNeeded} remaining.`,
    confirmLabel: 'Send Campaign',
    cancelLabel: 'Cancel',
  });

  if (confirmed) {
    await executeCampaign();
    showSuccessToast(`Campaign sent! ${creditsNeeded} credits used.`);
    invalidateCreditBalance(); // Refresh balance display
  }
}
```

---

### 11.3 UX Design Principles

#### Core Principles

| Principle | Implementation | Example |
|-----------|----------------|---------|
| **Transparency** | Always show credit costs before actions | "Sending 50 emails will use 50 credits" |
| **Progressive Disclosure** | Show limits only when relevant | Usage meter appears at 50%+ |
| **Forgiving Design** | Allow undo, save drafts, retry | "Oops! Something went wrong. [Retry]" |
| **Immediate Feedback** | Real-time balance updates | Credit counter animates on spend |
| **Clear Value Exchange** | Explain what user gets | "Pro includes 500 leads/month" |

#### Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Hidden limits | Feels deceptive, causes frustration | Show limits upfront in pricing |
| Blocking without explanation | User doesn't know what to do | Explain why + give options |
| Aggressive upsells | Feels manipulative | Contextual, helpful suggestions |
| Confusing credit math | Users can't plan usage | Clear equivalents (1 credit = 1 email) |
| No grace period | Punishes loyal users | Allow 10% overage, warn user |

---

### 11.4 Loading States & Feedback

#### Loading State Specifications

```typescript
// Loading state durations and behaviors
const LOADING_BEHAVIORS = {
  // Instant (0-300ms): No loading indicator
  instant: {
    maxDuration: 300,
    indicator: 'none',
    example: 'Toggling a setting',
  },

  // Quick (300ms-1s): Subtle spinner
  quick: {
    maxDuration: 1000,
    indicator: 'inline-spinner',
    example: 'Fetching credit balance',
  },

  // Standard (1-3s): Skeleton + progress
  standard: {
    maxDuration: 3000,
    indicator: 'skeleton-loader',
    example: 'Loading pricing page',
  },

  // Long (3s+): Progress bar with status
  long: {
    maxDuration: Infinity,
    indicator: 'progress-bar-with-status',
    example: 'Processing Stripe checkout',
  },
};
```

#### Skeleton Loaders

```tsx
// Pricing Card Skeleton
function PricingCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="h-6 w-24" /> {/* Tier name */}
        <Skeleton className="h-10 w-32 mt-2" /> {/* Price */}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full" /> {/* Features */}
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-6" /> {/* CTA button */}
      </CardContent>
    </Card>
  );
}

// Credit Balance Skeleton
function CreditBalanceSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full animate-pulse">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
```

#### Success/Error States

```tsx
// Success Toast with Animation
function SuccessToast({ message, creditChange }: { message: string; creditChange?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-4"
    >
      <CheckCircle className="h-5 w-5 text-green-500" />
      <div>
        <p className="font-medium">{message}</p>
        {creditChange && (
          <p className="text-sm text-muted-foreground">
            {creditChange > 0 ? '+' : ''}{creditChange} credits
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Error State with Recovery Options
function ErrorState({
  error,
  onRetry,
  onCancel,
}: {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

### 11.5 Animations & Micro-interactions

#### Credit Balance Animation

```tsx
// Animated credit counter that smoothly transitions between values
function AnimatedCreditBalance({ balance }: { balance: number }) {
  const [displayValue, setDisplayValue] = useState(balance);
  const previousBalance = usePrevious(balance);

  useEffect(() => {
    if (previousBalance === undefined) return;

    const diff = balance - previousBalance;
    if (diff === 0) return;

    // Animate count
    const duration = 600; // ms
    const steps = 20;
    const stepValue = diff / steps;
    let current = previousBalance;

    const interval = setInterval(() => {
      current += stepValue;
      if ((diff > 0 && current >= balance) || (diff < 0 && current <= balance)) {
        setDisplayValue(balance);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [balance, previousBalance]);

  const isIncreasing = previousBalance !== undefined && balance > previousBalance;
  const isDecreasing = previousBalance !== undefined && balance < previousBalance;

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
      animate={{
        scale: isIncreasing || isDecreasing ? [1, 1.1, 1] : 1,
        backgroundColor: isIncreasing
          ? ['hsl(var(--muted))', 'hsl(142 76% 36% / 0.2)', 'hsl(var(--muted))']
          : isDecreasing
          ? ['hsl(var(--muted))', 'hsl(0 84% 60% / 0.2)', 'hsl(var(--muted))']
          : 'hsl(var(--muted))',
      }}
      transition={{ duration: 0.6 }}
    >
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-sm font-medium tabular-nums">{displayValue} credits</span>
      {isIncreasing && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: [10, 0, -10] }}
          className="text-xs text-green-500 font-medium"
        >
          +{balance - previousBalance!}
        </motion.span>
      )}
    </motion.div>
  );
}
```

#### Upgrade Success Celebration

```tsx
// Confetti animation on successful subscription
function UpgradeSuccessModal({ tier, onClose }: { tier: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        {/* Confetti effect */}
        <Confetti
          width={400}
          height={300}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to {tier}!</DialogTitle>
          <DialogDescription>
            Your account has been upgraded. You now have access to all {tier} features.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted rounded-lg p-4 mt-4">
          <h4 className="font-medium mb-2">What's new for you:</h4>
          <ul className="text-sm text-left space-y-1">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {tier === 'Pro' ? '500' : '2,000'} leads per month
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {tier === 'Pro' ? '1,000' : '4,000'} credits included
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {tier === 'Pro' ? '5' : 'Unlimited'} concurrent campaigns
            </li>
          </ul>
        </div>

        <Button onClick={onClose} className="w-full mt-4">
          Start Using {tier}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

#### Progress Bar for Long Operations

```tsx
// Multi-stage progress indicator
interface ProgressStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

function MultiStageProgress({ stages }: { stages: ProgressStage[] }) {
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3"
        >
          {/* Status icon */}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            stage.status === 'completed' && 'bg-green-500/10',
            stage.status === 'active' && 'bg-primary/10',
            stage.status === 'pending' && 'bg-muted',
            stage.status === 'error' && 'bg-destructive/10',
          )}>
            {stage.status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
            {stage.status === 'active' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
            {stage.status === 'pending' && <Circle className="h-4 w-4 text-muted-foreground" />}
            {stage.status === 'error' && <X className="h-4 w-4 text-destructive" />}
          </div>

          {/* Label */}
          <span className={cn(
            'text-sm',
            stage.status === 'active' && 'font-medium',
            stage.status === 'pending' && 'text-muted-foreground',
          )}>
            {stage.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Usage example for checkout flow
const checkoutStages: ProgressStage[] = [
  { id: 'validate', label: 'Validating payment', status: 'completed' },
  { id: 'process', label: 'Processing subscription', status: 'active' },
  { id: 'credits', label: 'Granting credits', status: 'pending' },
  { id: 'complete', label: 'Finalizing account', status: 'pending' },
];
```

---

### 11.6 Accessibility Standards

#### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | All text meets 4.5:1 ratio; UI elements meet 3:1 |
| **Keyboard Navigation** | Full tab navigation, visible focus rings |
| **Screen Reader Support** | ARIA labels on all interactive elements |
| **Motion Preferences** | Respect `prefers-reduced-motion` |
| **Error Identification** | Errors announced via `aria-live` regions |

#### Accessible Components

```tsx
// Accessible Usage Meter
function AccessibleUsageMeter({ label, current, limit }: UsageMeterProps) {
  const percentage = limit === Infinity ? 0 : Math.round((current / limit) * 100);
  const status = percentage >= 100 ? 'at limit' : percentage >= 80 ? 'near limit' : 'normal';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span id={`${label}-label`}>{label}</span>
        <span aria-hidden="true">
          {current} / {limit === Infinity ? '∞' : limit}
        </span>
      </div>

      {/* Progress bar with proper ARIA */}
      <div
        role="progressbar"
        aria-labelledby={`${label}-label`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={limit === Infinity ? undefined : limit}
        aria-valuetext={`${current} of ${limit === Infinity ? 'unlimited' : limit} ${label}, ${status}`}
        className="h-2 bg-muted rounded-full overflow-hidden"
      >
        <div
          className={cn(
            'h-full transition-all',
            percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-primary'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Screen reader only status */}
      <span className="sr-only">
        {status === 'at limit' && 'You have reached your limit.'}
        {status === 'near limit' && 'You are approaching your limit.'}
      </span>
    </div>
  );
}

// Accessible Pricing Card
function AccessiblePricingCard({ tier, price, features, isPopular, onSelect }: PricingCardProps) {
  return (
    <article
      className={cn(
        'relative rounded-lg border p-6',
        isPopular && 'border-primary ring-2 ring-primary'
      )}
      aria-labelledby={`${tier}-heading`}
    >
      {isPopular && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium"
          aria-label="Most popular plan"
        >
          Most Popular
        </span>
      )}

      <h3 id={`${tier}-heading`} className="text-lg font-semibold">
        {tier}
      </h3>

      <p className="mt-2">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground">/month</span>
      </p>

      <ul className="mt-6 space-y-3" aria-label={`${tier} plan features`}>
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className="w-full mt-6"
        aria-label={`Subscribe to ${tier} plan for $${price} per month`}
      >
        Get Started
      </Button>
    </article>
  );
}
```

#### Motion Preferences

```tsx
// Hook for respecting reduced motion preference
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage in animation components
function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

---

### 11.7 Mobile Responsiveness

#### Responsive Pricing Page

```tsx
// Mobile-first pricing layout
function PricingPage() {
  return (
    <div className="container max-w-6xl py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="text-muted-foreground mt-2">Start free, upgrade when you need more</p>
      </header>

      {/* Mobile: Vertical stack | Desktop: 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <PricingCard tier="Standard" price={49} />
        <PricingCard tier="Pro" price={149} isPopular />
        <PricingCard tier="Advanced" price={349} />
      </div>

      {/* Mobile-friendly comparison table */}
      <div className="mt-12">
        {/* Desktop: Full table */}
        <div className="hidden md:block">
          <FeatureComparisonTable />
        </div>

        {/* Mobile: Collapsible sections */}
        <div className="md:hidden">
          <MobileFeatureComparison />
        </div>
      </div>
    </div>
  );
}

// Mobile feature comparison with accordion
function MobileFeatureComparison() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="leads">
        <AccordionTrigger>Lead Discovery</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Standard</span>
              <span className="font-medium">100/month</span>
            </div>
            <div className="flex justify-between">
              <span>Pro</span>
              <span className="font-medium">500/month</span>
            </div>
            <div className="flex justify-between">
              <span>Advanced</span>
              <span className="font-medium">2,000/month</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      {/* More accordion items... */}
    </Accordion>
  );
}
```

#### Touch-Friendly Credit Purchase

```tsx
// Mobile-optimized credit package selector
function MobileCreditPurchase() {
  const [selected, setSelected] = useState<string | null>(null);

  const packages = [
    { id: 'small', credits: 100, price: 20, perCredit: 0.20 },
    { id: 'standard', credits: 500, price: 80, perCredit: 0.16, savings: '20%' },
    { id: 'bulk', credits: 1000, price: 140, perCredit: 0.14, savings: '30%' },
  ];

  return (
    <div className="space-y-4">
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => setSelected(pkg.id)}
          className={cn(
            'w-full p-4 rounded-lg border text-left transition-all',
            // Large touch target (min 44px height)
            'min-h-[72px]',
            // Clear selected state
            selected === pkg.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border hover:border-primary/50',
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{pkg.credits} Credits</div>
              <div className="text-sm text-muted-foreground">
                ${pkg.perCredit.toFixed(2)}/credit
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">${pkg.price}</div>
              {pkg.savings && (
                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                  Save {pkg.savings}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}

      <Button
        disabled={!selected}
        className="w-full h-12 text-base"
      >
        Purchase Credits
      </Button>
    </div>
  );
}
```

---

### 11.8 Microcopy Guidelines

#### Voice & Tone

| Context | Tone | Example |
|---------|------|---------|
| Success | Celebratory, brief | "You're all set! Credits added." |
| Error | Helpful, solution-focused | "Payment failed. Please check your card details." |
| Limit warning | Informative, not alarming | "You're using 80% of your monthly leads." |
| Upgrade prompt | Value-focused, not pushy | "Unlock 5x more leads with Pro." |
| Confirmation | Clear, specific | "Send 50 emails for 50 credits?" |

#### Button Labels

| Context | Good | Bad |
|---------|------|-----|
| Subscribe | "Get Started" or "Start Free Trial" | "Submit" or "Buy" |
| Upgrade | "Upgrade to Pro" | "Upgrade" (too vague) |
| Purchase credits | "Buy 500 Credits – $80" | "Purchase" (no details) |
| Cancel | "Keep My Subscription" / "Cancel Anyway" | "Yes" / "No" |

#### Error Messages

```typescript
const ERROR_MESSAGES = {
  // Payment errors
  'card_declined': {
    title: 'Payment declined',
    description: 'Your card was declined. Please try a different payment method.',
    action: 'Try another card',
  },
  'insufficient_funds': {
    title: 'Insufficient funds',
    description: 'Your card has insufficient funds. Please try a different card.',
    action: 'Use different card',
  },

  // Usage errors
  'limit_reached': {
    title: 'Limit reached',
    description: 'You\'ve used all your {feature} for this month.',
    action: 'Upgrade for more',
  },
  'insufficient_credits': {
    title: 'Not enough credits',
    description: 'You need {required} credits but only have {balance}.',
    action: 'Buy credits',
  },

  // System errors
  'network_error': {
    title: 'Connection issue',
    description: 'We couldn\'t reach our servers. Please check your connection.',
    action: 'Try again',
  },
  'unknown_error': {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Our team has been notified.',
    action: 'Try again',
  },
};
```

#### Empty States

```tsx
// Empty state for no subscription
function NoSubscriptionEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Zap className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">Start your outbound journey</h3>
      <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
        Subscribe to Deep Outbound to discover leads, create campaigns, and start selling domains.
      </p>
      <Button className="mt-4" asChild>
        <Link href="/pricing">View Plans</Link>
      </Button>
    </div>
  );
}

// Empty state for no credits
function NoCreditsEmptyState() {
  return (
    <div className="text-center py-8 px-4 bg-muted/50 rounded-lg">
      <Coins className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <h4 className="font-medium">No credits remaining</h4>
      <p className="text-sm text-muted-foreground mt-1">
        Purchase credits to send emails and voicemails.
      </p>
      <Button size="sm" className="mt-3">
        Buy Credits
      </Button>
    </div>
  );
}
```

---

### 11.9 Edge Case Handling

#### Concurrent Session Handling

```typescript
// Handle credit spend race conditions
async function safeCreditSpend(amount: number, action: string) {
  const lockKey = `credit_spend_${userId}`;

  // Optimistic lock with retry
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await supabase.rpc('spend_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: action,
      });

      if (result.error?.code === 'INSUFFICIENT_CREDITS') {
        // Show UI immediately
        showInsufficientCreditsModal(result.error.details);
        return { success: false, reason: 'insufficient_credits' };
      }

      return { success: true, newBalance: result.data.balance };
    } catch (error) {
      if (error.code === 'SERIALIZATION_FAILURE' && attempt < 2) {
        // Retry on race condition
        await sleep(100 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
}
```

#### Subscription State Edge Cases

```typescript
// Handle various subscription states in UI
function SubscriptionStatusBanner({ subscription }: { subscription: Subscription }) {
  if (!subscription) {
    return <TrialBanner />;
  }

  switch (subscription.status) {
    case 'active':
      return null; // No banner needed

    case 'past_due':
      return (
        <Banner variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <span>Payment failed. Please update your payment method to avoid service interruption.</span>
          <Button size="sm" variant="outline" asChild>
            <Link href="/settings?tab=billing">Update Payment</Link>
          </Button>
        </Banner>
      );

    case 'canceled':
      if (new Date(subscription.current_period_end) > new Date()) {
        // Access until period end
        return (
          <Banner variant="info">
            <Info className="h-4 w-4" />
            <span>
              Your subscription ends on {formatDate(subscription.current_period_end)}.
              You'll retain access until then.
            </span>
            <Button size="sm" variant="outline">Resubscribe</Button>
          </Banner>
        );
      }
      // Access expired
      return (
        <Banner variant="destructive">
          <XCircle className="h-4 w-4" />
          <span>Your subscription has ended. Resubscribe to regain access.</span>
          <Button size="sm">Resubscribe</Button>
        </Banner>
      );

    case 'paused':
      return (
        <Banner variant="info">
          <Pause className="h-4 w-4" />
          <span>Your subscription is paused. Resume anytime to continue.</span>
          <Button size="sm" variant="outline">Resume</Button>
        </Banner>
      );

    default:
      return null;
  }
}
```

#### Offline Handling

```tsx
// Offline-aware credit display
function OfflineAwareCreditBalance() {
  const { data: balance, isError, isLoading } = useCreditBalance();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <Tooltip content="You're offline. Balance may be outdated.">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full opacity-60">
          <WifiOff className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">-- credits</span>
        </div>
      </Tooltip>
    );
  }

  if (isLoading) return <CreditBalanceSkeleton />;
  if (isError) return <CreditBalanceError />;

  return <CreditBalance balance={balance?.balance || 0} />;
}
```

---

### 11.10 A/B Testing Considerations

#### Testable Elements

| Element | Variants to Test | Success Metric |
|---------|------------------|----------------|
| Pricing page headline | Value-focused vs. feature-focused | Click-through to checkout |
| CTA button text | "Get Started" vs. "Start Free Trial" | Signup rate |
| Trial credit amount | 50 vs. 100 vs. 200 | Trial-to-paid conversion |
| Upgrade prompt timing | At 50% vs. 80% vs. 100% usage | Upgrade rate |
| Credit package sizes | Current vs. larger packages | ARPU |

#### Feature Flag Integration

```typescript
// Feature flag configuration for A/B tests
const EXPERIMENTS = {
  pricing_headline: {
    variants: ['value', 'features'],
    default: 'value',
  },
  trial_credits: {
    variants: [50, 100, 200],
    default: 100,
  },
  upgrade_prompt_threshold: {
    variants: [0.5, 0.8, 1.0],
    default: 0.8,
  },
};

// Usage in components
function PricingHeadline() {
  const variant = useExperiment('pricing_headline');

  const headlines = {
    value: 'Sell more domains with less effort',
    features: 'AI-powered lead discovery and outreach',
  };

  return <h1>{headlines[variant]}</h1>;
}

function UsageMeter({ current, limit }: UsageMeterProps) {
  const threshold = useExperiment('upgrade_prompt_threshold');
  const percentage = current / limit;

  const showWarning = percentage >= threshold;

  return (
    <div>
      <ProgressBar value={percentage} />
      {showWarning && <UpgradePrompt />}
    </div>
  );
}
```

#### Analytics Events

```typescript
// Comprehensive event tracking for monetization
const ANALYTICS_EVENTS = {
  // Pricing page
  'pricing_page_viewed': { page: 'pricing' },
  'pricing_tier_selected': { tier: string, price: number },
  'pricing_faq_expanded': { question: string },

  // Checkout
  'checkout_started': { tier: string, source: string },
  'checkout_completed': { tier: string, value: number },
  'checkout_abandoned': { tier: string, step: string },

  // Credits
  'credits_low_warning_shown': { balance: number, threshold: number },
  'credits_purchase_started': { package: string },
  'credits_purchase_completed': { package: string, amount: number },
  'credits_insufficient_blocked': { action: string, required: number, balance: number },

  // Usage limits
  'usage_limit_warning_shown': { feature: string, percentage: number },
  'usage_limit_reached': { feature: string },
  'upgrade_prompt_shown': { feature: string, source: string },
  'upgrade_prompt_clicked': { feature: string, source: string },

  // Subscription lifecycle
  'subscription_upgraded': { from: string, to: string },
  'subscription_downgraded': { from: string, to: string },
  'subscription_cancelled': { tier: string, reason?: string },
  'subscription_reactivated': { tier: string },
};

// Track event helper
function trackEvent<T extends keyof typeof ANALYTICS_EVENTS>(
  event: T,
  properties: typeof ANALYTICS_EVENTS[T]
) {
  // Send to analytics provider (Mixpanel, Amplitude, etc.)
  analytics.track(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    user_id: getCurrentUserId(),
  });
}
```

---

### 11.11 Component Specifications

#### Complete Billing Settings Page

```tsx
// Full specification for billing tab in settings
function BillingSettings() {
  const { data: subscription } = useSubscription();
  const { data: balance } = useCreditBalance();
  const { data: usage } = useUsage();
  const { data: transactions } = useCreditTransactions(10);

  return (
    <div className="space-y-8">
      {/* Section 1: Current Plan */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
        <CurrentPlanCard subscription={subscription} />
      </section>

      {/* Section 2: Usage This Month */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Usage This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UsageMeter
            label="Leads Discovered"
            current={usage?.leads_scraped || 0}
            limit={usage?.limits.leads_scraped || 0}
          />
          <UsageMeter
            label="AI Generations"
            current={usage?.ai_generations || 0}
            limit={usage?.limits.ai_generations || 0}
          />
          <UsageMeter
            label="Emails Sent"
            current={usage?.emails_sent || 0}
            limit={Infinity}
            unit="(unlimited with credits)"
          />
          <UsageMeter
            label="Voicemails Sent"
            current={usage?.voicemails_sent || 0}
            limit={Infinity}
            unit="(unlimited with credits)"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Resets on {formatDate(usage?.period_end)}
        </p>
      </section>

      {/* Section 3: Credit Balance */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Credit Balance</h2>
          <Button variant="outline" size="sm">
            Buy Credits
          </Button>
        </div>
        <CreditBalanceCard balance={balance} />
      </section>

      {/* Section 4: Transaction History */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <TransactionHistory transactions={transactions} />
      </section>

      {/* Section 5: Manage Subscription */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Manage Subscription</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openStripePortal}>
            Manage in Stripe
          </Button>
          {subscription?.status === 'active' && (
            <Button variant="ghost" className="text-destructive">
              Cancel Subscription
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
```

---

### 11.12 State Management for Monetization

```typescript
// Zustand store for monetization state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MonetizationState {
  // Subscription
  subscription: Subscription | null;
  isSubscriptionLoading: boolean;

  // Credits
  creditBalance: number;
  includedBalance: number;
  purchasedBalance: number;
  isCreditLoading: boolean;

  // Usage
  usage: UsageData | null;
  isUsageLoading: boolean;

  // UI state
  showUpgradeModal: boolean;
  upgradeModalSource: string | null;
  showCreditPurchaseModal: boolean;
  creditPurchaseContext: CreditPurchaseContext | null;

  // Actions
  setSubscription: (sub: Subscription | null) => void;
  setCreditBalance: (balance: CreditBalance) => void;
  setUsage: (usage: UsageData) => void;
  openUpgradeModal: (source: string) => void;
  closeUpgradeModal: () => void;
  openCreditPurchaseModal: (context: CreditPurchaseContext) => void;
  closeCreditPurchaseModal: () => void;
  deductCredits: (amount: number) => void;
}

export const useMonetizationStore = create<MonetizationState>()(
  persist(
    (set) => ({
      // Initial state
      subscription: null,
      isSubscriptionLoading: true,
      creditBalance: 0,
      includedBalance: 0,
      purchasedBalance: 0,
      isCreditLoading: true,
      usage: null,
      isUsageLoading: true,
      showUpgradeModal: false,
      upgradeModalSource: null,
      showCreditPurchaseModal: false,
      creditPurchaseContext: null,

      // Actions
      setSubscription: (subscription) => set({ subscription, isSubscriptionLoading: false }),
      setCreditBalance: ({ balance, included_balance, purchased_balance }) =>
        set({
          creditBalance: balance,
          includedBalance: included_balance,
          purchasedBalance: purchased_balance,
          isCreditLoading: false,
        }),
      setUsage: (usage) => set({ usage, isUsageLoading: false }),
      openUpgradeModal: (source) => set({ showUpgradeModal: true, upgradeModalSource: source }),
      closeUpgradeModal: () => set({ showUpgradeModal: false, upgradeModalSource: null }),
      openCreditPurchaseModal: (context) =>
        set({ showCreditPurchaseModal: true, creditPurchaseContext: context }),
      closeCreditPurchaseModal: () =>
        set({ showCreditPurchaseModal: false, creditPurchaseContext: null }),
      deductCredits: (amount) =>
        set((state) => {
          // Deduct from included first, then purchased
          let remaining = amount;
          let newIncluded = state.includedBalance;
          let newPurchased = state.purchasedBalance;

          if (newIncluded >= remaining) {
            newIncluded -= remaining;
            remaining = 0;
          } else {
            remaining -= newIncluded;
            newIncluded = 0;
            newPurchased -= remaining;
          }

          return {
            creditBalance: newIncluded + newPurchased,
            includedBalance: newIncluded,
            purchasedBalance: newPurchased,
          };
        }),
    }),
    {
      name: 'monetization-store',
      partialize: (state) => ({
        // Only persist non-sensitive data
        creditBalance: state.creditBalance,
      }),
    }
  )
);
```

---

### 11.13 Implementation Checklist: UX

#### Pre-Launch UX Checklist

- [ ] **Loading States**
  - [ ] All async operations show appropriate loading indicators
  - [ ] Skeleton loaders match final component dimensions
  - [ ] Loading states respect reduced motion preferences

- [ ] **Error Handling**
  - [ ] All API errors display user-friendly messages
  - [ ] Error states provide recovery actions
  - [ ] Network errors are handled gracefully

- [ ] **Accessibility**
  - [ ] All interactive elements are keyboard accessible
  - [ ] Color contrast meets WCAG AA standards
  - [ ] Screen reader testing completed
  - [ ] Focus management is correct in modals

- [ ] **Mobile**
  - [ ] All pages tested on iPhone SE (375px)
  - [ ] Touch targets are minimum 44x44px
  - [ ] Forms work with mobile keyboards
  - [ ] Pricing page is readable on mobile

- [ ] **User Flows**
  - [ ] New user signup → dashboard tested end-to-end
  - [ ] Trial → paid upgrade flow tested
  - [ ] Credit purchase flow tested
  - [ ] Limit reached → upgrade flow tested
  - [ ] Subscription cancellation flow tested

- [ ] **Microcopy**
  - [ ] All button labels are action-oriented
  - [ ] Error messages are helpful, not technical
  - [ ] Success messages confirm what happened
  - [ ] Empty states guide users to next action

- [ ] **Analytics**
  - [ ] All monetization events are tracked
  - [ ] Funnel tracking is configured
  - [ ] A/B test infrastructure is ready
