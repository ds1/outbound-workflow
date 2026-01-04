// Industry target mapping for lead scraping
// Maps domain keywords to relevant target companies

export interface CompanyTarget {
  name: string;
  url: string;
  category: string;
}

// Keyword to company mappings
const INDUSTRY_TARGETS: Record<string, CompanyTarget[]> = {
  weather: [
    { name: "Meteomatics", url: "https://www.meteomatics.com", category: "Weather Drones" },
    { name: "Tomorrow.io", url: "https://www.tomorrow.io", category: "Weather Analytics" },
    { name: "Climavision", url: "https://climavision.com", category: "Weather Analytics" },
    { name: "WeatherXM", url: "https://weatherxm.com", category: "Weather IoT" },
    { name: "DTN", url: "https://www.dtn.com", category: "Weather Analytics" },
    { name: "Davis Instruments", url: "https://www.davisinstruments.com", category: "Weather Sensors" },
    { name: "Vaisala", url: "https://www.vaisala.com", category: "Weather Sensors" },
    { name: "AccuWeather", url: "https://www.accuweather.com", category: "Weather Services" },
  ],
  robot: [
    { name: "Boston Dynamics", url: "https://bostondynamics.com", category: "Robotics" },
    { name: "iRobot", url: "https://www.irobot.com", category: "Consumer Robotics" },
    { name: "Universal Robots", url: "https://www.universal-robots.com", category: "Industrial Robotics" },
    { name: "KUKA", url: "https://www.kuka.com", category: "Industrial Robotics" },
    { name: "ABB Robotics", url: "https://new.abb.com/products/robotics", category: "Industrial Robotics" },
  ],
  drone: [
    { name: "DJI", url: "https://www.dji.com", category: "Consumer Drones" },
    { name: "Skydio", url: "https://www.skydio.com", category: "Autonomous Drones" },
    { name: "ZenaDrone", url: "https://www.zenadrone.com", category: "Commercial Drones" },
    { name: "Autel Robotics", url: "https://www.autelrobotics.com", category: "Commercial Drones" },
    { name: "Black Swift Technologies", url: "https://www.blackswifttech.com", category: "Weather Drones" },
  ],
  ai: [
    { name: "OpenAI", url: "https://openai.com", category: "AI Research" },
    { name: "Anthropic", url: "https://www.anthropic.com", category: "AI Safety" },
    { name: "Hugging Face", url: "https://huggingface.co", category: "AI Platform" },
    { name: "Scale AI", url: "https://scale.com", category: "AI Data" },
    { name: "Cohere", url: "https://cohere.com", category: "Enterprise AI" },
  ],
  ocean: [
    { name: "Saildrone", url: "https://www.saildrone.com", category: "Ocean Robotics" },
    { name: "Sofar Ocean", url: "https://www.sofarocean.com", category: "Ocean Sensors" },
    { name: "Ocean Infinity", url: "https://oceaninfinity.com", category: "Ocean Exploration" },
    { name: "Liquid Robotics", url: "https://www.liquid-robotics.com", category: "Ocean Robotics" },
  ],
  farm: [
    { name: "John Deere", url: "https://www.deere.com", category: "AgTech" },
    { name: "SwarmFarm Robotics", url: "https://www.swarmfarm.com", category: "AgTech Robotics" },
    { name: "Blue River Technology", url: "https://bluerivertechnology.com", category: "AgTech AI" },
    { name: "Naio Technologies", url: "https://www.naio-technologies.com", category: "AgTech Robotics" },
    { name: "Trimble", url: "https://www.trimble.com", category: "Precision Ag" },
  ],
  agri: [
    { name: "John Deere", url: "https://www.deere.com", category: "AgTech" },
    { name: "SwarmFarm Robotics", url: "https://www.swarmfarm.com", category: "AgTech Robotics" },
    { name: "Blue River Technology", url: "https://bluerivertechnology.com", category: "AgTech AI" },
    { name: "Naio Technologies", url: "https://www.naio-technologies.com", category: "AgTech Robotics" },
  ],
  solar: [
    { name: "First Solar", url: "https://www.firstsolar.com", category: "Solar Manufacturing" },
    { name: "SunPower", url: "https://us.sunpower.com", category: "Solar Systems" },
    { name: "Enphase Energy", url: "https://enphase.com", category: "Solar Tech" },
    { name: "Tesla Energy", url: "https://www.tesla.com/energy", category: "Solar + Storage" },
  ],
  energy: [
    { name: "Tesla Energy", url: "https://www.tesla.com/energy", category: "Energy Storage" },
    { name: "Fluence", url: "https://fluenceenergy.com", category: "Energy Storage" },
    { name: "Stem Inc", url: "https://www.stem.com", category: "AI Energy" },
    { name: "Sunnova", url: "https://www.sunnova.com", category: "Energy Services" },
  ],
  health: [
    { name: "Epic Systems", url: "https://www.epic.com", category: "Healthcare IT" },
    { name: "Teladoc", url: "https://www.teladoc.com", category: "Telehealth" },
    { name: "Cerner", url: "https://www.cerner.com", category: "Healthcare IT" },
    { name: "Medidata", url: "https://www.medidata.com", category: "Clinical Research" },
  ],
  med: [
    { name: "Medtronic", url: "https://www.medtronic.com", category: "Medical Devices" },
    { name: "Boston Scientific", url: "https://www.bostonscientific.com", category: "Medical Devices" },
    { name: "Abbott", url: "https://www.abbott.com", category: "Healthcare" },
    { name: "Stryker", url: "https://www.stryker.com", category: "Medical Technology" },
  ],
  auto: [
    { name: "Tesla", url: "https://www.tesla.com", category: "Electric Vehicles" },
    { name: "Waymo", url: "https://waymo.com", category: "Autonomous Vehicles" },
    { name: "Cruise", url: "https://www.getcruise.com", category: "Autonomous Vehicles" },
    { name: "Rivian", url: "https://rivian.com", category: "Electric Vehicles" },
    { name: "Lucid Motors", url: "https://www.lucidmotors.com", category: "Electric Vehicles" },
  ],
  car: [
    { name: "Tesla", url: "https://www.tesla.com", category: "Electric Vehicles" },
    { name: "Rivian", url: "https://rivian.com", category: "Electric Vehicles" },
    { name: "Lucid Motors", url: "https://www.lucidmotors.com", category: "Electric Vehicles" },
    { name: "Polestar", url: "https://www.polestar.com", category: "Electric Vehicles" },
  ],
  fin: [
    { name: "Stripe", url: "https://stripe.com", category: "Fintech" },
    { name: "Plaid", url: "https://plaid.com", category: "Fintech" },
    { name: "Square", url: "https://squareup.com", category: "Fintech" },
    { name: "Brex", url: "https://www.brex.com", category: "Fintech" },
  ],
  pay: [
    { name: "Stripe", url: "https://stripe.com", category: "Payments" },
    { name: "PayPal", url: "https://www.paypal.com", category: "Payments" },
    { name: "Square", url: "https://squareup.com", category: "Payments" },
    { name: "Adyen", url: "https://www.adyen.com", category: "Payments" },
  ],
  cloud: [
    { name: "AWS", url: "https://aws.amazon.com", category: "Cloud" },
    { name: "Google Cloud", url: "https://cloud.google.com", category: "Cloud" },
    { name: "Microsoft Azure", url: "https://azure.microsoft.com", category: "Cloud" },
    { name: "Cloudflare", url: "https://www.cloudflare.com", category: "Cloud Security" },
  ],
  security: [
    { name: "CrowdStrike", url: "https://www.crowdstrike.com", category: "Cybersecurity" },
    { name: "Palo Alto Networks", url: "https://www.paloaltonetworks.com", category: "Cybersecurity" },
    { name: "Okta", url: "https://www.okta.com", category: "Identity" },
    { name: "Cloudflare", url: "https://www.cloudflare.com", category: "Web Security" },
  ],
  cyber: [
    { name: "CrowdStrike", url: "https://www.crowdstrike.com", category: "Cybersecurity" },
    { name: "Palo Alto Networks", url: "https://www.paloaltonetworks.com", category: "Cybersecurity" },
    { name: "SentinelOne", url: "https://www.sentinelone.com", category: "Endpoint Security" },
    { name: "Fortinet", url: "https://www.fortinet.com", category: "Network Security" },
  ],
  data: [
    { name: "Snowflake", url: "https://www.snowflake.com", category: "Data Cloud" },
    { name: "Databricks", url: "https://www.databricks.com", category: "Data Platform" },
    { name: "Palantir", url: "https://www.palantir.com", category: "Data Analytics" },
    { name: "Tableau", url: "https://www.tableau.com", category: "Data Visualization" },
  ],
  space: [
    { name: "SpaceX", url: "https://www.spacex.com", category: "Space Launch" },
    { name: "Planet Labs", url: "https://www.planet.com", category: "Earth Imaging" },
    { name: "Rocket Lab", url: "https://www.rocketlabusa.com", category: "Space Launch" },
    { name: "Spire Global", url: "https://spire.com", category: "Space Data" },
  ],
  logistics: [
    { name: "Flexport", url: "https://www.flexport.com", category: "Freight" },
    { name: "Project44", url: "https://www.project44.com", category: "Supply Chain" },
    { name: "Convoy", url: "https://convoy.com", category: "Trucking" },
    { name: "FourKites", url: "https://www.fourkites.com", category: "Supply Chain" },
  ],
  ship: [
    { name: "Flexport", url: "https://www.flexport.com", category: "Freight" },
    { name: "ShipBob", url: "https://www.shipbob.com", category: "Fulfillment" },
    { name: "Shippo", url: "https://goshippo.com", category: "Shipping API" },
  ],
};

/**
 * Extract keywords from a domain name
 * Example: "WeatherRobots" -> ["weather", "robot"]
 */
export function extractKeywords(domainName: string): string[] {
  // Remove common TLDs and clean up
  const name = domainName
    .replace(/\.(com|net|org|io|co|ai|app|dev|tech|cloud)$/i, '')
    .toLowerCase();

  // Split by common patterns
  // CamelCase: "WeatherRobots" -> ["Weather", "Robots"]
  // Hyphen: "weather-robots" -> ["weather", "robots"]
  // Numbers at end: "ai2024" -> ["ai"]
  const camelCaseSplit = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  const words = camelCaseSplit
    .split(/[-_\s]+/)
    .map(w => w.toLowerCase())
    .filter(w => w.length >= 2)
    .filter(w => !/^\d+$/.test(w)); // Remove pure numbers

  // Also try partial matches for compound words
  const keywords = new Set<string>();

  for (const word of words) {
    keywords.add(word);

    // Check if any industry keyword is contained in the word
    for (const industryKeyword of Object.keys(INDUSTRY_TARGETS)) {
      if (word.includes(industryKeyword) || industryKeyword.includes(word)) {
        keywords.add(industryKeyword);
      }
    }
  }

  return Array.from(keywords);
}

/**
 * Get target companies for a domain based on its keywords
 */
export function getTargetsForDomain(domainName: string): CompanyTarget[] {
  const keywords = extractKeywords(domainName);
  const targets = new Map<string, CompanyTarget>(); // Use URL as key to dedupe

  for (const keyword of keywords) {
    const industryTargets = INDUSTRY_TARGETS[keyword] || [];
    for (const target of industryTargets) {
      targets.set(target.url, target);
    }
  }

  // Sort by category for better organization
  return Array.from(targets.values()).sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Get all available industry keywords
 */
export function getAvailableKeywords(): string[] {
  return Object.keys(INDUSTRY_TARGETS).sort();
}

/**
 * Get targets for specific keywords (for manual selection)
 */
export function getTargetsForKeywords(keywords: string[]): CompanyTarget[] {
  const targets = new Map<string, CompanyTarget>();

  for (const keyword of keywords) {
    const industryTargets = INDUSTRY_TARGETS[keyword.toLowerCase()] || [];
    for (const target of industryTargets) {
      targets.set(target.url, target);
    }
  }

  return Array.from(targets.values()).sort((a, b) => a.category.localeCompare(b.category));
}
