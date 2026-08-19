import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { NewsMention, EvidenceEntry } from '../types/brand';

export class RedditProvider implements IProvider {
  id = 'reddit';
  name = 'Reddit';
  description = 'Searches public Reddit mentions for the brand';
  config: ProviderConfig = {
    id: 'reddit',
    name: 'Reddit',
    description: 'Reddit public API',
    enabled: true,
    priority: 5,
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
        `https://www.reddit.com/search.json?q=${encodeURIComponent(brand)}&sort=new&limit=15&t=year`,
        {
          signal,
          headers: { 'User-Agent': 'BrandIntel/1.0 (by /u/brandintel_bot)' },
        }
      );

      if (!response.ok) {
        return { providerId: this.id, success: false, error: 'Reddit search failed' };
      }

      const data = await response.json();
      if (!data.data?.children || data.data.children.length === 0) {
        return { providerId: this.id, success: false, error: 'No Reddit mentions found' };
      }

      const mentions: NewsMention[] = [];
      for (const child of data.data.children.slice(0, 10)) {
        const post = child.data;
        mentions.push({
          title: post.title,
          publisher: `r/${post.subreddit}`,
          date: new Date(post.created_utc * 1000).toISOString().split('T')[0],
          url: `https://reddit.com${post.permalink}`,
          snippet: post.selftext?.substring(0, 200) || '[link post]',
          relevance: 0.5,
          category: 'discussion',
        });

        sources.push({
          url: `https://reddit.com${post.permalink}`,
          publisher: `r/${post.subreddit}`,
          date: new Date(post.created_utc * 1000).toISOString().split('T')[0],
          type: 'social',
        });
      }

      const totalScore = data.data.children.reduce((sum: number, c: any) => sum + (c.data.score || 0), 0);

      evidence.push({
        id: `reddit-${Date.now()}`,
        claim: `${brand} mentioned in ${mentions.length} Reddit discussions`,
        source: 'Reddit API',
        url: `https://www.reddit.com/search?q=${encodeURIComponent(brand)}`,
        timestamp: new Date().toISOString(),
        confidence: 'medium',
        rationale: `Found ${mentions.length} posts with combined score of ${totalScore}`,
        category: 'social',
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
      return { providerId: this.id, success: false, error: err instanceof Error ? err.message : 'Reddit fetch failed' };
    }
  }
            }
