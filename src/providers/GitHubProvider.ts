import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { SocialProfile, WebProperty, EvidenceEntry } from '../types/brand';

const GITHUB_API = 'https://api.github.com';

export class GitHubProvider implements IProvider {
  id = 'github';
  name = 'GitHub';
  description = 'Searches for brand-related GitHub organizations and repositories';
  config: ProviderConfig = {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub public API (unauthenticated, rate-limited)',
    enabled: true,
    priority: 4,
    rateLimit: 60,
    timeout: 8000,
  };

  isAvailable(): boolean {
    return true;
  }

  async collect(brand: string, signal?: AbortSignal): Promise<ProviderResult> {
    const sources: { url: string; publisher: string; date: string; type: string }[] = [];
    const evidence: EvidenceEntry[] = [];

    try {
      // Search for organization
      const orgResp = await fetch(`${GITHUB_API}/orgs/${encodeURIComponent(brand)}`, {
        signal,
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'BrandIntel/1.0' },
      });

      const social: SocialProfile[] = [];
      const web: WebProperty[] = [];

      if (orgResp.ok) {
        const org = await orgResp.json();
        social.push({
          platform: 'GitHub',
          url: org.html_url,
          handle: org.login,
          classification: 'Verified',
          followers: org.followers,
          source: org.html_url,
          evidence: `Official GitHub organization: ${org.name || org.login} (${org.public_repos} public repos)`,
        });

        if (org.blog) {
          web.push({
            url: org.blog,
            label: `${org.login} GitHub-listed website`,
            type: 'official',
            confidence: 'high',
            source: org.html_url,
          });
        }

        sources.push({
          url: org.html_url,
          publisher: 'GitHub',
          date: new Date().toISOString().split('T')[0],
          type: 'api',
        });

        evidence.push({
          id: `github-org-${Date.now()}`,
          claim: `${brand} has a verified GitHub organization`,
          source: 'GitHub API',
          url: org.html_url,
          timestamp: new Date().toISOString(),
          confidence: 'high',
          rationale: `Found GitHub organization with ${org.public_repos} public repositories and ${org.followers} followers`,
          category: 'social',
        });
      } else {
        // Search for repositories related to the brand
        const searchResp = await fetch(
          `${GITHUB_API}/search/repositories?q=${encodeURIComponent(brand)}+in:name&sort=stars&per_page=5`,
          { signal, headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'BrandIntel/1.0' } }
        );

        if (searchResp.ok) {
          const searchData = await searchResp.json();
          if (searchData.items && searchData.items.length > 0) {
            for (const repo of searchData.items.slice(0, 3)) {
              web.push({
                url: repo.html_url,
                label: `Repository: ${repo.full_name}`,
                type: 'community',
                confidence: 'medium',
                source: repo.html_url,
              });
            }
          }
        }
      }

      return {
        providerId: this.id,
        success: true,
        data: { socialPresence: social, webPresence: web, evidence },
        sources,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { providerId: this.id, success: false, error: 'Request aborted' };
      }
      return { providerId: this.id, success: false, error: err instanceof Error ? err.message : 'GitHub fetch failed' };
    }
  }
          }
