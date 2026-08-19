import { ProviderRegistry } from '../providers/ProviderRegistry';
import type { BrandDossier } from '../types/brand';
import { ScoringService } from './ScoringService';
import { TimelineService } from './TimelineService';

export class CollectionService {
  private registry: ProviderRegistry;
  private scoringService: ScoringService;
  private timelineService: TimelineService;

  constructor(registry: ProviderRegistry) {
    this.registry = registry;
    this.scoringService = new ScoringService();
    this.timelineService = new TimelineService();
  }

  async collect(
    brand: string,
    onProgress?: (progress: number, status: string) => void,
    signal?: AbortSignal
  ): Promise<BrandDossier> {
    const dossier: BrandDossier = {
      id: crypto.randomUUID?.() || `bi-${Date.now()}`,
      query: brand,
      generatedAt: new Date().toISOString(),
      status: 'collecting',
      progress: 0,
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
      score: null,
    };

    onProgress?.(5, 'Initializing collection');

    // Phase 1: Collect from all providers
    onProgress?.(10, 'Collecting from public sources...');
    await this.registry.collectFromAll(brand, signal);

    onProgress?.(40, 'Merging intelligence data...');

    // Phase 2: Merge results
    const merged = this.registry.mergeResults();
    Object.assign(dossier, merged);

    // Phase 3: Deduplicate
    onProgress?.(55, 'Deduplicating evidence...');
    this.deduplicateDossier(dossier);

    // Phase 4: Build timeline
    onProgress?.(65, 'Building intelligence timeline...');
    if (merged.timeline) {
      dossier.timeline = this.timelineService.buildTimeline(merged.timeline);
    }

    // Phase 5: Score visibility
    onProgress?.(75, 'Calculating visibility score...');
    dossier.score = this.scoringService.calculate(dossier);

    // Phase 6: Finalize
    onProgress?.(90, 'Finalizing dossier...');
    dossier.status = 'complete';
    dossier.progress = 100;
    dossier.generatedAt = new Date().toISOString();

    return dossier;
  }

  private deduplicateDossier(dossier: BrandDossier): void {
    // Deduplicate web presence by URL
    const seenWeb = new Set<string>();
    dossier.webPresence = dossier.webPresence.filter((w) => {
      const key = w.url.toLowerCase();
      if (seenWeb.has(key)) return false;
      seenWeb.add(key);
      return true;
    });

    // Deduplicate social by platform+handle
    const seenSocial = new Set<string>();
    dossier.socialPresence = dossier.socialPresence.filter((s) => {
      const key = `${s.platform.toLowerCase()}:${s.handle.toLowerCase()}`;
      if (seenSocial.has(key)) return false;
      seenSocial.add(key);
      return true;
    });

    // Deduplicate news by URL
    const seenNews = new Set<string>();
    dossier.newsMentions = dossier.newsMentions.filter((n) => {
      const key = n.url.toLowerCase();
      if (seenNews.has(key)) return false;
      seenNews.add(key);
      return true;
    });

    // Deduplicate evidence by claim text (fuzzy)
    const seenEvidence = new Set<string>();
    dossier.evidence = dossier.evidence.filter((e) => {
      const key = e.claim.substring(0, 50).toLowerCase();
      if (seenEvidence.has(key)) return false;
      seenEvidence.add(key);
      return true;
    });
  }
  }
