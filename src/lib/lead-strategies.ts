// Lead Strategy System
// Defines different approaches for finding leads based on the domain being sold

import type { Domain } from '@/types/database';
import { generateDomainVariants, getVariantSalesPitch, type DomainVariant } from './domain-variants';
import { getTargetsForDomain, type CompanyTarget } from './lead-targets';

export type LeadStrategy =
  | 'domain-upgrade'
  | 'seo-bidders'
  | 'emerging-startups'
  | 'market-leaders';

export interface StrategyInfo {
  id: LeadStrategy;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  recommended?: boolean;
  salesPitch: string;
}

export interface StrategyTarget extends CompanyTarget {
  salesPitch?: string;
  priority?: number;
  snippet?: string;
}

// Strategy definitions
export const LEAD_STRATEGIES: StrategyInfo[] = [
  {
    id: 'domain-upgrade',
    name: 'Domain Upgrade',
    description: 'Find companies using inferior domain patterns like getexample.com, example.io, or example-app.com who could benefit from upgrading to the premium .com',
    shortDescription: 'Find companies using prefix/suffix/alt-TLD domains',
    icon: 'ArrowUpCircle',
    recommended: true,
    salesPitch: 'Upgrade to the premium, exact-match domain for better brand recognition and direct type-in traffic.',
  },
  {
    id: 'seo-bidders',
    name: 'SEO/PPC Bidders',
    description: 'Find companies paying for Google Ads on your domain keywords. They\'re already investing to acquire this traffic - owning the domain could replace ad spend.',
    shortDescription: 'Find companies paying for ads on these keywords',
    icon: 'Search',
    salesPitch: 'Own direct type-in traffic instead of paying per click. The domain pays for itself over time.',
  },
  {
    id: 'emerging-startups',
    name: 'Emerging Startups',
    description: 'Search ProductHunt, startup directories, and recent launches for early-stage companies in this space who haven\'t secured premium domains yet.',
    shortDescription: 'Search startup directories for new companies',
    icon: 'Rocket',
    salesPitch: 'Secure the premium domain early before competitors. First-mover advantage in brand recognition.',
  },
  {
    id: 'market-leaders',
    name: 'Market Leaders',
    description: 'Target established companies in the industry based on domain keywords. Best for domains that could serve as product names or expansion brands.',
    shortDescription: 'Target established companies in the industry',
    icon: 'Building',
    salesPitch: 'Acquire a brandable domain for a new product line, acquisition defense, or marketing campaign.',
  },
];

/**
 * Get strategy info by ID
 */
export function getStrategy(id: LeadStrategy): StrategyInfo | undefined {
  return LEAD_STRATEGIES.find(s => s.id === id);
}

/**
 * Generate targets for the Domain Upgrade strategy
 * Returns domain variants that need to be checked for active websites
 */
export function generateUpgradeTargets(domain: Domain): DomainVariant[] {
  return generateDomainVariants(domain.name, domain.tld);
}

/**
 * Convert checked domain variants to strategy targets
 */
export function variantsToTargets(activeVariants: Array<DomainVariant & { isActive: boolean }>): StrategyTarget[] {
  return activeVariants
    .filter(v => v.isActive)
    .map(v => ({
      name: v.domain,
      url: `https://${v.domain}`,
      category: getCategoryForVariantType(v.type),
      salesPitch: getVariantSalesPitch(v.type),
      priority: getPriorityForVariantType(v.type),
    }))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

function getCategoryForVariantType(type: DomainVariant['type']): string {
  switch (type) {
    case 'prefix': return 'Prefix Domain';
    case 'suffix': return 'Suffix Domain';
    case 'alt-tld': return 'Alternate TLD';
    case 'hyphenated': return 'Hyphenated Domain';
    default: return 'Domain Variant';
  }
}

function getPriorityForVariantType(type: DomainVariant['type']): number {
  // Higher priority = more likely to convert
  switch (type) {
    case 'prefix': return 90;      // get/try prefixes are common, good targets
    case 'alt-tld': return 85;     // .io/.co users often want .com
    case 'hyphenated': return 80;  // hyphenated domains are hard to share verbally
    case 'suffix': return 75;      // suffix domains may be intentional branding
    default: return 50;
  }
}

/**
 * Generate targets for the Market Leaders strategy (existing keyword-based approach)
 */
export function generateMarketLeaderTargets(domain: Domain): StrategyTarget[] {
  const targets = getTargetsForDomain(domain.name);
  return targets.map(t => ({
    ...t,
    salesPitch: 'Premium domain for brand expansion, product naming, or acquisition defense.',
    priority: 50,
  }));
}

/**
 * Generate search queries for SEO/PPC strategy
 */
export function generateSEOSearchQueries(domain: Domain): string[] {
  const baseName = domain.name.toLowerCase();

  // Split camelCase or hyphenated names
  const processedName = baseName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .toLowerCase();

  const wordList = processedName.split(/\s+/);
  const longWords = wordList.filter(w => w.length > 2);

  // Use long words if available, otherwise fall back to the original domain name
  const words = longWords.length > 0 ? longWords : [baseName];

  const queries: string[] = [];

  // Full name as query (always include)
  queries.push(words.join(' '));

  // Individual significant words (for longer words)
  for (const word of words) {
    if (word.length >= 4) {
      queries.push(word);
    }
  }

  // Combinations (if multiple words)
  if (words.length >= 2) {
    queries.push(`${words[0]} ${words[1]}`);
  }

  // Filter out empty strings and deduplicate
  return [...new Set(queries.filter(q => q.trim().length > 0))];
}

/**
 * Generate search queries for Emerging Startups strategy
 */
export function generateStartupSearchQueries(domain: Domain): string[] {
  // Similar to SEO queries but might include industry terms
  return generateSEOSearchQueries(domain);
}

/**
 * Get the recommended strategy for a domain based on its characteristics
 */
export function getRecommendedStrategy(domain: Domain): LeadStrategy {
  const tld = domain.tld.toLowerCase();

  // Premium .com domains are best for Domain Upgrade strategy
  if (tld === 'com') {
    return 'domain-upgrade';
  }

  // .ai domains might be good for emerging startups
  if (tld === 'ai') {
    return 'emerging-startups';
  }

  // Default to domain upgrade for most premium TLDs
  return 'domain-upgrade';
}

/**
 * Estimate the number of potential targets for each strategy
 */
export function estimateTargetCounts(domain: Domain): Record<LeadStrategy, { min: number; max: number }> {
  const variants = generateDomainVariants(domain.name, domain.tld);
  const marketLeaders = getTargetsForDomain(domain.name);

  return {
    'domain-upgrade': {
      min: Math.floor(variants.length * 0.05), // ~5% might be active
      max: Math.floor(variants.length * 0.15), // ~15% at most
    },
    'seo-bidders': {
      min: 2,
      max: 10,
    },
    'emerging-startups': {
      min: 3,
      max: 15,
    },
    'market-leaders': {
      min: marketLeaders.length,
      max: marketLeaders.length,
    },
  };
}
