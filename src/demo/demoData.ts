import type { BrandDossier, BrandIdentity, SocialProfile, NewsMention, TimelineEvent, EvidenceEntry, SourceEntry, WebProperty, OrganizationDetail, GeographicPresence, VisibilityScore } from '../types/brand';

const identity: BrandIdentity = {
  name: 'Acme Corporation',
  aliases: ['Acme Corp', 'AcmeCo', 'Acme Inc.'],
  industry: 'Technology',
  description: 'Acme Corporation is a multinational technology company specializing in cloud computing, artificial intelligence, and enterprise software solutions. Founded in 2015, the company has grown to serve over 10,000 businesses globally.',
  officialWebsite: 'https://acme-corp.example.com',
  foundedYear: 2015,
  headquarters: 'San Francisco, California, USA',
};

const webPresence: WebProperty[] = [
  { url: 'https://acme-corp.example.com', label: 'Official Website', type: 'official', confidence: 'high', source: 'Wikipedia' },
  { url: 'https://blog.acme-corp.example.com', label: 'Engineering Blog', type: 'blog', confidence: 'high', source: 'Web search' },
  { url: 'https://docs.acme-corp.example.com', label: 'Documentation', type: 'docs', confidence: 'high', source: 'Web search' },
  { url: 'https://status.acme-corp.example.com', label: 'Service Status', type: 'subdomain', confidence: 'medium', source: 'DNS enumeration' },
  { url: 'https://community.acme-corp.example.com', label: 'Community Forum', type: 'community', confidence: 'medium', source: 'Web search' },
];

const socialPresence: SocialProfile[] = [
  { platform: 'LinkedIn', url: 'https://linkedin.com/company/acmecorp', handle: 'acmecorp', classification: 'Verified', followers: 45000, source: 'LinkedIn', evidence: 'LinkedIn company page with 45K followers' },
  { platform: 'X (Twitter)', url: 'https://x.com/acme_corp', handle: 'acme_corp', classification: 'Verified', followers: 28500, source: 'X (Twitter)', evidence: 'Verified account with blue checkmark' },
  { platform: 'Facebook', url: 'https://facebook.com/AcmeCorpOfficial', handle: 'AcmeCorpOfficial', classification: 'Likely', source: 'Facebook', evidence: 'Company page with consistent branding' },
  { platform: 'Instagram', url: 'https://instagram.com/acme_corp', handle: 'acme_corp', classification: 'Verified', followers: 12000, source: 'Instagram', evidence: 'Verified business account' },
  { platform: 'YouTube', url: 'https://youtube.com/@AcmeCorp', handle: 'AcmeCorp', classification: 'Verified', followers: 32000, source: 'YouTube', evidence: 'Official YouTube channel with product demos' },
  { platform: 'GitHub', url: 'https://github.com/acmecorp', handle: 'acmecorp', classification: 'Verified', followers: 5800, source: 'GitHub', evidence: 'GitHub organization with 120+ public repos' },
  { platform: 'TikTok', url: 'https://tiktok.com/@acme_corp', handle: 'acme_corp', classification: 'Possible', source: 'TikTok', evidence: 'Account exists with limited activity' },
];

const newsMentions: NewsMention[] = [
  { title: 'Acme Corporation Raises $200M Series D at $2B Valuation', publisher: 'TechCrunch', date: '2026-08-15', url: 'https://techcrunch.example.com/2026/08/15/acme-series-d', snippet: 'Acme Corporation, the cloud infrastructure startup, has raised $200 million in Series D funding...', relevance: 0.95, category: 'financial' },
  { title: 'Acme Corp Launches New AI-Powered Analytics Platform', publisher: 'VentureBeat', date: '2026-07-22', url: 'https://venturebeat.example.com/2026/07/22/acme-ai-analytics', snippet: 'Acme Corporation today announced the launch of Acme Analytics Pro...', relevance: 0.9, category: 'product' },
  { title: 'Acme Partners with GlobalSys for Enterprise Distribution', publisher: 'Business Wire', date: '2026-06-10', url: 'https://businesswire.example.com/2026/06/10/acme-globalsys-partnership', snippet: 'Strategic partnership to expand enterprise reach across EMEA...', relevance: 0.85, category: 'partnership' },
  { title: 'Acme Corporation Named in Forbes Cloud 100 List', publisher: 'Forbes', date: '2026-05-05', url: 'https://forbes.example.com/2026/05/05/acme-forbes-cloud-100', snippet: 'Acme Corporation has been named to the Forbes Cloud 100 list for the third consecutive year...', relevance: 0.9, category: 'milestone' },
  { title: 'Inside Acme Corp\'s Engineering Culture and Remote-First Approach', publisher: 'InfoWorld', date: '2026-04-18', url: 'https://infoworld.example.com/2026/04/18/acme-engineering-culture', snippet: 'A deep dive into how Acme Corporation built a world-class remote engineering team...', relevance: 0.7, category: 'general' },
  { title: 'Acme Corporation Acquires DataStream AI for $75M', publisher: 'Reuters', date: '2026-03-01', url: 'https://reuters.example.com/2026/03/01/acme-acquires-datastream', snippet: 'Acme Corporation has acquired AI startup DataStream AI...', relevance: 0.95, category: 'acquisition' },
  { title: 'Acme Corp Achieves SOC 2 Type II Certification', publisher: 'PR Newswire', date: '2026-02-12', url: 'https://prnewswire.example.com/2026/02/12/acme-soc2', snippet: 'Security milestone as Acme achieves SOC 2 Type II compliance...', relevance: 0.8, category: 'security' },
  { title: 'How Acme Corporation is Redefining Cloud Infrastructure', publisher: 'Wired', date: '2026-01-20', url: 'https://wired.example.com/2026/01/20/acme-cloud-infrastructure', snippet: 'Feature article exploring Acme\'s innovative approach to cloud infrastructure...', relevance: 0.75, category: 'general' },
];

const products: any[] = [
  { name: 'Acme Cloud Platform', type: 'product', description: 'Multi-cloud management and orchestration platform', url: 'https://acme-corp.example.com/cloud', confidence: 'high', source: 'Official website' },
  { name: 'Acme AI', type: 'product', description: 'Enterprise AI/ML suite for predictive analytics', url: 'https://acme-corp.example.com/ai', confidence: 'high', source: 'Official website' },
  { name: 'Acme Security Suite', type: 'product', description: 'Zero-trust security platform', url: 'https://acme-corp.example.com/security', confidence: 'medium', source: 'Product documentation' },
  { name: 'AcmeDev', type: 'subbrand', description: 'Developer tools division offering SDKs and APIs', url: 'https://dev.acme-corp.example.com', confidence: 'medium', source: 'Web search' },
  { name: 'AcmeAnalytics', type: 'product', description: 'Business intelligence and data visualization', url: 'https://acme-corp.example.com/analytics', confidence: 'high', source: 'Official website' },
];

const organization: OrganizationDetail[] = [
  { type: 'industry', value: 'Technology / Cloud Computing', source: 'Wikipedia', confidence: 'high' },
  { type: 'founded', value: '2015', source: 'Wikipedia', confidence: 'high' },
  { type: 'employees', value: '1,500-2,000', source: 'LinkedIn', confidence: 'medium' },
  { type: 'funding', value: '$450M total (Series A-D)', source: 'Crunchbase', confidence: 'medium' },
  { type: 'corporate', value: 'Privately held', source: 'Reuters', confidence: 'high' },
  { type: 'leadership', value: 'CEO: Jane Smith, CTO: Dr. Raj Patel', source: 'Official website', confidence: 'high' },
];

const geographic: GeographicPresence[] = [
  { type: 'headquarters', location: 'San Francisco, California, USA', source: 'Wikipedia', confidence: 'high' },
  { type: 'office', location: 'New York, New York, USA', source: 'LinkedIn', confidence: 'medium' },
  { type: 'office', location: 'London, United Kingdom', source: 'Company blog', confidence: 'medium' },
  { type: 'office', location: 'Bangalore, India', source: 'Job postings', confidence: 'medium' },
  { type: 'market', location: 'North America', source: 'Official website', confidence: 'high' },
  { type: 'market', location: 'Europe (EMEA)', source: 'Press release', confidence: 'high' },
  { type: 'market', location: 'Asia-Pacific', source: 'Press release', confidence: 'high' },
  { type: 'country', location: 'United States', source: 'Wikipedia', confidence: 'high' },
  { type: 'country', location: 'United Kingdom', source: 'Official website', confidence: 'high' },
  { type: 'country', location: 'India', source: 'Job postings', confidence: 'medium' },
];

const timeline: TimelineEvent[] = [
  { date: '2015-03', title: 'Acme Corporation founded', description: 'Founded in San Francisco by Jane Smith and Dr. Raj Patel', category: 'founding', source: 'Wikipedia', confidence: 'high' },
  { date: '2016-06', title: 'Seed funding of $5M', description: 'Raised $5M seed round from Valley Ventures', category: 'milestone', source: 'Crunchbase', confidence: 'high' },
  { date: '2017-09', title: 'Launch of Acme Cloud Platform v1', description: 'First public release of the cloud management platform', category: 'product', source: 'Press release', confidence: 'high' },
  { date: '2018-04', title: 'Series A: $15M', description: 'Series A funding led by Capital Partners', category: 'milestone', source: 'TechCrunch', confidence: 'high' },
  { date: '2019-11', title: '1,000th enterprise customer', description: 'Crossed 1,000 enterprise customer milestone', category: 'milestone', source: 'Company blog', confidence: 'high' },
  { date: '2020-07', title: 'Acme AI Suite launched', description: 'Expanded into AI/ML with new product line', category: 'product', source: 'VentureBeat', confidence: 'high' },
  { date: '2021-03', title: 'Series B: $50M', description: 'Series B at $500M valuation', category: 'milestone', source: 'TechCrunch', confidence: 'high' },
  { date: '2022-01', title: 'Expansion to EMEA market', description: 'Opened London office and began European operations', category: 'milestone', source: 'Forbes', confidence: 'high' },
  { date: '2023-06', title: 'Series C: $120M', description: 'Series C funding at $1.2B valuation (unicorn status)', category: 'milestone', source: 'Reuters', confidence: 'high' },
  { date: '2024-03', title: 'Acme Security Suite launched', description: 'New zero-trust security product line', category: 'product', source: 'PR Newswire', confidence: 'high' },
  { date: '2025-02', title: 'SOC 2 Type II certification', description: 'Achieved SOC 2 Type II compliance certification', category: 'milestone', source: 'Company blog', confidence: 'high' },
  { date: '2026-03', title: 'DataStream AI acquisition', description: 'Acquired AI startup DataStream AI for $75M', category: 'acquisition', source: 'Reuters', confidence: 'high' },
  { date: '2026-08', title: 'Series D: $200M at $2B valuation', description: 'Latest funding round doubles valuation', category: 'milestone', source: 'TechCrunch', confidence: 'high' },
];

const evidence: EvidenceEntry[] = [
  { id: 'demo-1', claim: 'Acme Corporation is a technology company in cloud computing', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Acme_Corporation', timestamp: '2026-08-19T10:00:00Z', confidence: 'high', rationale: 'Extracted from Wikipedia page summary', category: 'identity' },
  { id: 'demo-2', claim: 'Acme raised $200M Series D at $2B valuation', source: 'TechCrunch', url: 'https://techcrunch.example.com/2026/08/15/acme-series-d', timestamp: '2026-08-15T14:30:00Z', confidence: 'high', rationale: 'Verified by multiple news sources', category: 'financial' },
  { id: 'demo-3', claim: 'Acme has verified social presence on 6 major platforms', source: 'Social Media Audit', url: 'https://x.com/acme_corp', timestamp: '2026-08-19T10:00:00Z', confidence: 'high', rationale: 'Verified accounts or consistent branding on LinkedIn, X, Instagram, YouTube, GitHub, Facebook', category: 'social' },
  { id: 'demo-4', claim: 'Headquarters in San Francisco, California', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Acme_Corporation', timestamp: '2026-08-19T10:00:00Z', confidence: 'high', rationale: 'Confirmed on Wikipedia and official website', category: 'geographic' },
  { id: 'demo-5', claim: '5 major products and sub-brands identified', source: 'Official Website', url: 'https://acme-corp.example.com', timestamp: '2026-08-19T10:00:00Z', confidence: 'high', rationale: 'Products listed on official website with documentation', category: 'products' },
  { id: 'demo-6', claim: 'Acquiring DataStream AI for $75M', source: 'Reuters', url: 'https://reuters.example.com/2026/03/01/acme-acquires-datastream', timestamp: '2026-03-01T09:00:00Z', confidence: 'high', rationale: 'Reported by Reuters and confirmed by company announcement', category: 'acquisition' },
  { id: 'demo-7', claim: '8 recent news articles from 7 unique publishers', source: 'Google News RSS', url: 'https://news.google.com/search?q=acme+corporation', timestamp: '2026-08-19T10:00:00Z', confidence: 'high', rationale: 'Articles from TechCrunch, VentureBeat, Forbes, Reuters, Wired, Business Wire, and InfoWorld', category: 'news' },
  { id: 'demo-8', claim: 'GitHub organization with 120+ public repositories', source: 'GitHub API', url: 'https://github.com/acmecorp', timestamp: '2026-08-19T10:00:00Z', confidence: 'high', rationale: 'Verified GitHub organization account', category: 'technical' },
];

const sources: SourceEntry[] = [
  { url: 'https://en.wikipedia.org/wiki/Acme_Corporation', publisher: 'Wikipedia', date: '2026-08-19', type: 'wikipedia', reliability: 0.85 },
  { url: 'https://acme-corp.example.com', publisher: 'Acme Corporation', date: '2026-08-19', type: 'official', reliability: 0.95 },
  { url: 'https://techcrunch.example.com/2026/08/15/acme-series-d', publisher: 'TechCrunch', date: '2026-08-15', type: 'news', reliability: 0.8 },
  { url: 'https://venturebeat.example.com/2026/07/22/acme-ai-analytics', publisher: 'VentureBeat', date: '2026-07-22', type: 'news', reliability: 0.8 },
  { url: 'https://reuters.example.com/2026/03/01/acme-acquires-datastream', publisher: 'Reuters', date: '2026-03-01', type: 'news', reliability: 0.9 },
  { url: 'https://forbes.example.com/2026/05/05/acme-forbes-cloud-100', publisher: 'Forbes', date: '2026-05-05', type: 'news', reliability: 0.85 },
  { url: 'https://linkedin.com/company/acmecorp', publisher: 'LinkedIn', date: '2026-08-19', type: 'social', reliability: 0.9 },
  { url: 'https://github.com/acmecorp', publisher: 'GitHub', date: '2026-08-19', type: 'api', reliability: 0.9 },
  { url: 'https://x.com/acme_corp', publisher: 'X (Twitter)', date: '2026-08-19', type: 'social', reliability: 0.85 },
  { url: 'https://news.google.com/search?q=acme+corporation', publisher: 'Google News', date: '2026-08-19', type: 'rss', reliability: 0.7 },
];

const score: VisibilityScore = {
  overall: 78,
  categories: {
    webPresence: 82,
    socialPresence: 85,
    newsMentions: 72,
    organizationalData: 80,
    geographicData: 75,
    productsData: 68,
  },
  signals: [
    { category: 'webPresence', signal: 'Official website detected', weight: 0.30, value: true, score: 30 },
    { category: 'webPresence', signal: 'Unique domains: 5', weight: 0.20, value: 5, score: 20 },
    { category: 'webPresence', signal: 'Web properties: 5', weight: 0.20, value: 5, score: 20 },
    { category: 'socialPresence', signal: 'Social platforms: 7', weight: 0.25, value: 7, score: 25 },
    { category: 'socialPresence', signal: 'Verified profiles: 5', weight: 0.30, value: 5, score: 30 },
    { category: 'newsMentions', signal: 'News articles: 8', weight: 0.30, value: 8, score: 24 },
    { category: 'newsMentions', signal: 'Unique publishers: 7', weight: 0.25, value: 7, score: 21 },
  ],
  methodology: 'Transparent scoring based on documented public signals. Weights: Web Presence 30%, Social Presence 25%, News Mentions 20%, Organizational Data 10%, Geographic Data 10%, Products & Sub-brands 5%.',
};

export const demoDossier: BrandDossier = {
  id: 'demo-acme-corporation',
  query: 'Acme Corporation',
  generatedAt: '2026-08-19T10:00:00Z',
  status: 'complete',
  progress: 100,
  identity,
  webPresence,
  socialPresence,
  newsMentions,
  products,
  organization,
  geographic,
  timeline,
  evidence,
  sources,
  score,
};
