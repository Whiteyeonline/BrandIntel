import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { NewsMention, EvidenceEntry } from '../types/brand';

const HN_API = 'https://hn.algolia.com/api/v1';

export class HackerNewsProvider implements IProvider {
  id = 'hackernews';
  name = 'Hacker News';
  description = 'Searches Hacker News for brand mentions';
  config: ProviderConfig = {
    id: 'hackernews',
    name: 'Hacker News',
    description: 'Hacker News Algolia API',
    enabled: true,
    priority: 6,
    timeout: 8000,
  };

  isAvailable(): boolean {
    return true;
  }

  async collect(brand: string, signal?: AbortSignal): Promise<ProviderResult> {
    const sources: { url: string; publisher: string; date: string; type: string }[] = [];
    const evidence: EvidenceEntry[] = [];

    try {
      const response = await fetch(
        `${HN_API}/search?query=${encodeURIComponent(brand)}&hitsPerPage=10&tags=story`,
        { signal, headers: { 'User-Agent': 'BrandIntel/1.0' } }
      );

      if (!response.ok) {
        return { providerId: this.id, success: false, error: 'HN API failed' };
      }

      const data = await response.json();
      if (!data.hits || data.hits.length === 0) {
        return { providerId: this.id, success: false, error: 'No HN mentions found' };
      }

      const mentions: NewsMention[] = [];
      for (const hit of data.hits) {
        mentions.push({
          title: hit.title,
          publisher: 'Hacker News',
          date: new Date(hit.created_at_i * 1000).toISOString().split('T')[0],
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          snippet: (hit.story_text || hit.title || '').replace(/<[^>]*>/g, '').substring(0, 200),
          relevance: 0.6,
          category: 'discussion',
        });

        sources.push({
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          publisher: 'Hacker News',
          date: new Date(hit.created_at_i * 1000).toISOString().split('T')[0],
          type: 'social',
        });
      }

      evidence.push({
        id: `hn-${Date.now()}`,
        claim: `${brand} mentioned in ${mentions.length} Hacker News stories`,
        source: 'Hacker News Algolia API',
        url: `https://hn.algolia.com/?query=${encodeURIComponent(brand)}`,
        timestamp: new Date().toISOString(),
        confidence: 'medium',
        rationale: `Found ${mentions.length} stories on Hacker News`,
        category: 'news',
      });

      return {
        providerId: this.id,
        success: true,
        data: { newsMentions: mentions, evidence },
        sources,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { providerId: this.id, success: false, error: 'Request aborted' };
      }
      return { providerId: this.id, success: false, error: err instanceof Error ? err.message : 'HN fetch failed' };
    }
  }
}
