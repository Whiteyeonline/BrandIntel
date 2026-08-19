import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { BrandIdentity, TimelineEvent, SocialProfile, WebProperty, EvidenceEntry } from '../types/brand';

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';

export class WikipediaProvider implements IProvider {
  id = 'wikipedia';
  name = 'Wikipedia';
  description = 'Collects brand intelligence from Wikipedia API';
  config: ProviderConfig = {
    id: 'wikipedia',
    name: 'Wikipedia',
    description: 'Wikipedia public API',
    enabled: true,
    priority: 1,
    timeout: 8000,
  };

  isAvailable(): boolean {
    return true;
  }

  async collect(brand: string, signal?: AbortSignal): Promise<ProviderResult> {
    const sources: { url: string; publisher: string; date: string; type: string }[] = [];
    const evidence: EvidenceEntry[] = [];

    try {
      // Search for the brand on Wikipedia
      const searchUrl = `${WIKIPEDIA_API}/page/summary/${encodeURIComponent(brand)}`;
      const searchResp = await fetch(searchUrl, {
        signal,
        headers: { 'User-Agent': 'BrandIntel/1.0 (brandintelligence) Email: demo@brandintel.dev' },
      });

      if (!searchResp.ok) {
        // Try alternative search
        const altUrl = `${WIKIPEDIA_API}/search/page?q=${encodeURIComponent(brand)}&limit=1`;
        const altResp = await fetch(altUrl, { signal });
        if (!altResp.ok) {
          return { providerId: this.id, success: false, error: 'Brand not found on Wikipedia' };
        }
        const altData = await altResp.json();
        if (!altData.pages || altData.pages.length === 0) {
          return { providerId: this.id, success: false, error: 'No Wikipedia page found' };
        }
        const pageUrl = `${WIKIPEDIA_API}/page/summary/${encodeURIComponent(altData.pages[0].key)}`;
        const pageResp = await fetch(pageUrl, { signal });
        if (!pageResp.ok) {
          return { providerId: this.id, success: false, error: 'Could not fetch Wikipedia page' };
        }
        const pageData = await pageResp.json();
        return this.processPageData(pageData, brand, evidence, sources);
      }

      const data = await searchResp.json();
      return this.processPageData(data, brand, evidence, sources);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { providerId: this.id, success: false, error: 'Request aborted' };
      }
      return { providerId: this.id, success: false, error: err instanceof Error ? err.message : 'Wikipedia fetch failed' };
    }
  }

  private processPageData(
    data: any,
    brand: string,
    evidence: EvidenceEntry[],
    sources: { url: string; publisher: string; date: string; type: string }[]
  ): ProviderResult {
    const canonicalUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(brand)}`;
    sources.push({
      url: canonicalUrl,
      publisher: 'Wikipedia',
      date: new Date().toISOString().split('T')[0],
      type: 'wikipedia',
    });

    const identity: BrandIdentity = {
      name: data.title || brand,
      aliases: [],
      industry: this.extractIndustry(data.extract),
      description: data.extract || '',
      officialWebsite: '',
      headquarters: '',
    };

    // Extract infobox data from extract
    const websiteMatch = data.extract?.match(/\[Website\]\[:\s*(https?:\/\/[^\s\]]+)/i);
    if (websiteMatch) identity.officialWebsite = websiteMatch[1];

    const hqMatch = data.extract?.match(/(?:Headquarters|Headquarter)\s*(?::|is|are)\s*([^.\n]+)/i);
    if (hqMatch) identity.headquarters = hqMatch[1].trim();

    // Extract founded year
    const foundedMatch = data.extract?.match(/(?:Founded|Established|Incorporated)\s*(?::|in|on)\s*(\d{4})/i);
    if (foundedMatch) identity.foundedYear = parseInt(foundedMatch[1]);

    // Build timeline events from extract
    const timeline: TimelineEvent[] = [];
    if (foundedMatch) {
      timeline.push({
        date: foundedMatch[1],
        title: `${data.title} founded`,
        description: `${data.title} was founded.`,
        category: 'founding',
        source: canonicalUrl,
        confidence: 'high',
      });
    }

    // Extract year mentions for timeline
    const yearPattern = /(?:In\s+(\d{4})[,.]?\s*)([A-Z][^.]*\.)/g;
    let yearMatch;
    while ((yearMatch = yearPattern.exec(data.extract)) !== null) {
      timeline.push({
        date: yearMatch[1],
        title: yearMatch[2].substring(0, 60),
        description: yearMatch[2],
        category: 'milestone',
        source: canonicalUrl,
        confidence: 'medium',
      });
    }

    // Social profiles from Wikipedia infobox
    const social: SocialProfile[] = [];
    const socialPatterns: [RegExp, string][] = [
      [/(?:Twitter|X)\s*(?::|\|)\s*@?([a-zA-Z0-9_]+)/gi, 'X (Twitter)'],
      [/(?:LinkedIn)\s*(?::|\|)\s*(https?:\/\/[^\s\]]+)/gi, 'LinkedIn'],
      [/(?:Facebook)\s*(?::|\|)\s*(https?:\/\/[^\s\]]+)/gi, 'Facebook'],
      [/(?:Instagram)\s*(?::|\|)\s*(https?:\/\/[^\s\]]+)/gi, 'Instagram'],
      [/(?:YouTube)\s*(?::|\|)\s*(https?:\/\/[^\s\]]+)/gi, 'YouTube'],
    ];

    for (const [pattern, platform] of socialPatterns) {
      const match = pattern.exec(data.extract);
      if (match) {
        const handle = match[1].replace(/^https?:\/\//, '').split('/')[0];
        social.push({
          platform,
          url: match[1].startsWith('http') ? match[1] : `https://${platform.toLowerCase().includes('twitter') ? 'x.com/' : ''}${match[1]}`,
          handle,
          classification: 'Verified',
          source: canonicalUrl,
          evidence: `Found in Wikipedia infobox for ${data.title}`,
        });
      }
    }

    evidence.push({
      id: `wiki-identity-${Date.now()}`,
      claim: `${data.title} is a company in the ${this.extractIndustry(data.extract)} industry`,
      source: 'Wikipedia',
      url: canonicalUrl,
      timestamp: new Date().toISOString(),
      confidence: 'high',
      rationale: `Extracted from Wikipedia page summary for ${data.title}`,
      category: 'identity',
    });

    return {
      providerId: this.id,
      success: true,
      data: {
        identity,
        timeline,
        socialPresence: social,
        evidence,
      },
      sources,
    };
  }

  private extractIndustry(extract: string): string {
    const industries = [
      'technology', 'software', 'finance', 'healthcare', 'retail',
      'manufacturing', 'automotive', 'energy', 'telecommunications',
      'media', 'entertainment', 'education', 'e-commerce', 'food',
    ];
    for (const ind of industries) {
      if (extract?.toLowerCase().includes(ind)) return ind;
    }
    return 'General';
  }
            }
