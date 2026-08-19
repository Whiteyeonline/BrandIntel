export interface BrandIdentity {
  name: string;
  aliases: string[];
  industry: string;
  description: string;
  officialWebsite: string;
  foundedYear?: number;
  headquarters?: string;
  parentCompany?: string;
}

export interface WebProperty {
  url: string;
  label: string;
  type: 'official' | 'blog' | 'docs' | 'community' | 'store' | 'subdomain';
  confidence: ConfidenceLevel;
  source: string;
}

export interface SocialProfile {
  platform: string;
  url: string;
  handle: string;
  classification: 'Verified' | 'Likely' | 'Possible' | 'Unverified';
  followers?: number;
  source: string;
  evidence: string;
}

export interface NewsMention {
  title: string;
  publisher: string;
  date: string;
  url: string;
  snippet: string;
  relevance: number;
  category: string;
}

export interface ProductSubBrand {
  name: string;
  type: 'product' | 'service' | 'subbrand';
  description: string;
  url?: string;
  launchDate?: string;
  confidence: ConfidenceLevel;
  source: string;
}

export interface OrganizationDetail {
  type: string;
  value: string;
  source: string;
  confidence: ConfidenceLevel;
}

export interface GeographicPresence {
  type: 'headquarters' | 'office' | 'market' | 'region' | 'country';
  location: string;
  source: string;
  confidence: ConfidenceLevel;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  category: 'founding' | 'product' | 'acquisition' | 'partnership' | 'milestone' | 'news' | 'legal' | 'other';
  source: string;
  confidence: ConfidenceLevel;
}

export interface EvidenceEntry {
  id: string;
  claim: string;
  source: string;
  url: string;
  timestamp: string;
  confidence: ConfidenceLevel;
  rationale: string;
  category: string;
}

export interface SourceEntry {
  url: string;
  publisher: string;
  date: string;
  type: 'wikipedia' | 'news' | 'social' | 'official' | 'rss' | 'api' | 'web';
  reliability: number;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';

export interface VisibilityScore {
  overall: number;
  categories: {
    webPresence: number;
    socialPresence: number;
    newsMentions: number;
    organizationalData: number;
    geographicData: number;
    productsData: number;
  };
  signals: SignalBreakdown[];
  methodology: string;
}

export interface SignalBreakdown {
  category: string;
  signal: string;
  weight: number;
  value: boolean | number;
  score: number;
}

export interface BrandDossier {
  id: string;
  query: string;
  generatedAt: string;
  status: 'pending' | 'collecting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  identity: BrandIdentity | null;
  webPresence: WebProperty[];
  socialPresence: SocialProfile[];
  newsMentions: NewsMention[];
  products: ProductSubBrand[];
  organization: OrganizationDetail[];
  geographic: GeographicPresence[];
  timeline: TimelineEvent[];
  evidence: EvidenceEntry[];
  sources: SourceEntry[];
  score: VisibilityScore | null;
  error?: string;
}
