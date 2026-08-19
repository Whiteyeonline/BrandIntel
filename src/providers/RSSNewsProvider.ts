import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { NewsMention, EvidenceEntry } from '../types/brand';

const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

export class RSSNewsProvider implements IProvider {
  id = 'rss-news';
  name = 'RSS News';
  description = 'Collects news mentions via RSS feeds (Google News)';
  config: ProviderConfig = {
    id: 'rss-news',
    name: 'RSS News',
    description: 'RSS feed collection via rss2json',
    enabled: true,
    priority: 3,
    timeout: 10000,
  };

  isAvailable(): boolean {
    return true;
  }

  async collect(brand: string, signal?: AbortSignal): Promise<ProviderResult> {
    const sources: { url: string; publisher: string; date: string; type: string }[] = [];
    const evidence: EvidenceEntry[] = [];

    try {
      // Google News RSS
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(brand)}&hl=en-US&gl=US&ceid=US:en`;
      const response = await fetch(
        `${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}`,
        { signal }
      );

      if (!response.ok) {
        return { providerId: this.id, success: false, error: 'RSS feed fetch failed' };
      }

      const data = await response.json();
      if (data.status !== 'ok' || !data.items || data.items.length === 0) {
        return { providerId: this.id, success: false, error: 'No news items found' };
      }

      const newsMentions: NewsMention[] = [];
      for (const item of data.items.slice(0, 15)) {
        const pubDate = new Date(item.pubDate);
        newsMentions.push({
          title: item.title,
          publisher: this.extractPublisher(item.link) || item.author || 'Unknown',
          date: pubDate.toISOString().split('T')[0],
          url: item.link,
          snippet: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
          relevance: 0.7,
          category: this.categorizeNews(item.title, item.description),
        });

        sources.push({
          url: item.link,
          publisher: item.author || 'Unknown',
          date: pubDate.toISOString().split('T')[0],
          type: 'news',
        });
      }

      evidence.push({
        id: `news-rss-${Date.now()}`,
        claim: `${brand} has recent news coverage across ${newsMentions.length} articles`,
        source: 'Google News RSS',
        url: rssUrl,
        timestamp: new Date().toISOString(),
        confidence: 'high',
        rationale: `Retrieved ${newsMentions.length} news articles via RSS feed`,
        category: 'news',
      });

      return {
        providerId: this.id,
        success: true,
        data: { newsMentions, evidence },
        sources,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { providerId: this.id, success: false, error: 'Request aborted' };
      }
      return { providerId: this.id, success: false, error: err instanceof Error ? err.message : 'RSS fetch failed' };
    }
  }

  private extractPublisher(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return 'Unknown';
    }
  }

  private categorizeNews(title: string, description: string): string {
    const text = (title + ' ' + (description || '')).toLowerCase();
    if (text.includes('product') || text.includes('launch') || text.includes('release')) return 'product';
    if (text.includes('acquir') || text.includes('merger') || text.includes('buy')) return 'acquisition';
    if (text.includes('partner') || text.includes('collaborat')) return 'partnership';
    if (text.includes('law') || text.includes('sue') || text.includes('legal') || text.includes('regulat')) return 'legal';
    if (text.includes('earnings') || text.includes('revenue') || text.includes('financial')) return 'financial';
    if (text.includes('data breach') || text.includes('security') || text.includes('hack')) return 'security';
    return 'general';
  }
          }
