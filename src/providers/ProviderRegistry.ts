import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { BrandDossier } from '../types/brand';

export class ProviderRegistry {
  private providers: Map<string, IProvider> = new Map();
  private results: Map<string, ProviderResult> = new Map();

  register(provider: IProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregister(id: string): void {
    this.providers.delete(id);
  }

  getProvider(id: string): IProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values()).sort(
      (a, b) => a.config.priority - b.config.priority
    );
  }

  getEnabledProviders(): IProvider[] {
    return this.getAllProviders().filter((p) => p.config.enabled);
  }

  hasProvider(id: string): boolean {
    return this.providers.has(id);
  }

  getResult(providerId: string): ProviderResult | undefined {
    return this.results.get(providerId);
  }

  setResult(providerId: string, result: ProviderResult): void {
    this.results.set(providerId, result);
  }

  getAllResults(): Map<string, ProviderResult> {
    return this.results;
  }

  async collectFromAll(
    brand: string,
    signal?: AbortSignal
  ): Promise<Map<string, ProviderResult>> {
    const enabled = this.getEnabledProviders();
    const results = new Map<string, ProviderResult>();

    await Promise.allSettled(
      enabled.map(async (provider) => {
        try {
          const result = await provider.collect(brand, signal);
          results.set(provider.id, result);
          this.results.set(provider.id, result);
        } catch (err) {
          const errorResult: ProviderResult = {
            providerId: provider.id,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          };
          results.set(provider.id, errorResult);
          this.results.set(provider.id, errorResult);
        }
      })
    );

    return results;
  }

  mergeResults(): Partial<BrandDossier> {
    const merged: Partial<BrandDossier> = {
      identity: null,
      webPresence: [],
      socialPresence: [],
      newsMentions: [],
      products: [],
      organization: [],
      geographic: [],
      timeline: [],
      evidence: [],
      sources: [],
    };

    for (const result of this.results.values()) {
      if (!result.success || !result.data) continue;
      const d = result.data;

      if (d.identity && !merged.identity) merged.identity = d.identity;
      if (d.webPresence) merged.webPresence!.push(...d.webPresence);
      if (d.socialPresence) merged.socialPresence!.push(...d.socialPresence);
      if (d.newsMentions) merged.newsMentions!.push(...d.newsMentions);
      if (d.products) merged.products!.push(...d.products);
      if (d.organization) merged.organization!.push(...d.organization);
      if (d.geographic) merged.geographic!.push(...d.geographic);
      if (d.timeline) merged.timeline!.push(...d.timeline);
      if (d.evidence) merged.evidence!.push(...d.evidence);
      if (result.sources) {
        merged.sources!.push(
          ...result.sources.map((s) => ({
            url: s.url,
            publisher: s.publisher,
            date: s.date,
            type: s.type as any,
            reliability: 0.7,
          }))
        );
      }
    }

    return merged;
  }
  }
