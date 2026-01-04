// Domain variant generator for finding companies using "inferior" domains
// Used by the Domain Upgrade lead strategy

export interface DomainVariant {
  domain: string;
  type: 'prefix' | 'suffix' | 'alt-tld' | 'hyphenated';
  description: string;
}

// Prefixes that indicate "not the premium .com"
const UPGRADE_PREFIXES = [
  'get', 'try', 'use', 'go', 'my', 'the', 'hello', 'meet',
  'hey', 'hi', 'join', 'with', 'at', 'on', 'about'
];

// Suffixes that indicate "not the premium .com"
const UPGRADE_SUFFIXES = [
  'app', 'hq', 'io', 'ai', 'labs', 'team', 'now', 'inc',
  'co', 'online', 'site', 'web', 'tech', 'digital', 'cloud'
];

// Alternate TLDs to check (when selling .com)
const ALTERNATE_TLDS = [
  'io', 'co', 'net', 'org', 'ai', 'app', 'dev', 'tech',
  'xyz', 'me', 'us', 'info', 'biz', 'cc', 'gg', 'so'
];

/**
 * Generate all domain variants for a base domain name
 * @param baseName - The base domain name (without TLD), e.g., "weatherrobots"
 * @param sellingTld - The TLD being sold, e.g., "com"
 * @returns Array of domain variants to check
 */
export function generateDomainVariants(baseName: string, sellingTld: string): DomainVariant[] {
  const variants: DomainVariant[] = [];
  const normalizedBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedTld = sellingTld.toLowerCase().replace(/^\./, '');

  // 1. Prefix variants (e.g., getweatherrobots.com)
  for (const prefix of UPGRADE_PREFIXES) {
    variants.push({
      domain: `${prefix}${normalizedBase}.${normalizedTld}`,
      type: 'prefix',
      description: `Uses "${prefix}" prefix`,
    });
  }

  // 2. Suffix variants (e.g., weatherrobotsapp.com)
  for (const suffix of UPGRADE_SUFFIXES) {
    // Skip if suffix matches selling TLD (e.g., don't suggest weatherrobotsio.com when selling .io)
    if (suffix === normalizedTld) continue;

    variants.push({
      domain: `${normalizedBase}${suffix}.${normalizedTld}`,
      type: 'suffix',
      description: `Uses "${suffix}" suffix`,
    });
  }

  // 3. Alternate TLD variants (e.g., weatherrobots.io)
  for (const tld of ALTERNATE_TLDS) {
    // Skip if it's the same TLD being sold
    if (tld === normalizedTld) continue;

    variants.push({
      domain: `${normalizedBase}.${tld}`,
      type: 'alt-tld',
      description: `Uses .${tld} instead of .${normalizedTld}`,
    });
  }

  // 4. Hyphenated variants
  // Try to intelligently split the name and add hyphens
  const hyphenatedVersions = generateHyphenatedVersions(normalizedBase);
  for (const hyphenated of hyphenatedVersions) {
    variants.push({
      domain: `${hyphenated}.${normalizedTld}`,
      type: 'hyphenated',
      description: 'Uses hyphenated version',
    });
  }

  return variants;
}

/**
 * Try to intelligently split a domain name with hyphens
 * e.g., "weatherrobots" -> ["weather-robots"]
 */
function generateHyphenatedVersions(baseName: string): string[] {
  const versions: string[] = [];

  // Common word boundaries we can detect
  const commonWords = [
    'weather', 'robot', 'robots', 'drone', 'drones', 'ai', 'tech', 'data',
    'cloud', 'auto', 'solar', 'energy', 'health', 'med', 'fin', 'pay',
    'cyber', 'security', 'space', 'farm', 'agri', 'ocean', 'ship', 'app',
    'web', 'net', 'smart', 'digital', 'online', 'mobile', 'fast', 'quick',
    'easy', 'super', 'mega', 'ultra', 'pro', 'plus', 'max', 'hub', 'lab',
    'labs', 'studio', 'works', 'shop', 'store', 'market', 'trade', 'flow'
  ];

  // Sort by length descending to match longer words first
  const sortedWords = [...commonWords].sort((a, b) => b.length - a.length);

  // Try to find word boundaries
  let remaining = baseName;
  const parts: string[] = [];

  while (remaining.length > 0) {
    let found = false;
    for (const word of sortedWords) {
      if (remaining.startsWith(word) && remaining.length > word.length) {
        parts.push(word);
        remaining = remaining.slice(word.length);
        found = true;
        break;
      }
    }
    if (!found) {
      // If no match, take the rest as one part
      parts.push(remaining);
      break;
    }
  }

  // Only add hyphenated version if we found at least 2 parts
  if (parts.length >= 2) {
    versions.push(parts.join('-'));
  }

  return versions;
}

/**
 * Get the sales pitch for a domain variant type
 */
export function getVariantSalesPitch(type: DomainVariant['type']): string {
  switch (type) {
    case 'prefix':
      return 'Upgrade to the exact-match .com without the awkward prefix';
    case 'suffix':
      return 'Own the clean, memorable domain without the suffix';
    case 'alt-tld':
      return 'Upgrade to the premium .com TLD for better brand recognition';
    case 'hyphenated':
      return 'Get the non-hyphenated version for easier brand recall';
    default:
      return 'Upgrade to the premium domain';
  }
}

/**
 * Get all variant types with descriptions
 */
export function getVariantTypes(): { type: DomainVariant['type']; label: string; example: string }[] {
  return [
    { type: 'prefix', label: 'Prefix variants', example: 'getexample.com' },
    { type: 'suffix', label: 'Suffix variants', example: 'exampleapp.com' },
    { type: 'alt-tld', label: 'Alternate TLDs', example: 'example.io' },
    { type: 'hyphenated', label: 'Hyphenated', example: 'ex-ample.com' },
  ];
}
