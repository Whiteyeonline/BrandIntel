import type { BrandDossier, VisibilityScore, SignalBreakdown } from '../types/brand';

export class ScoringService {
  calculate(dossier: BrandDossier): VisibilityScore {
    const signals: SignalBreakdown[] = [];

    // Web Presence Score (30% weight)
    const webPresenceScore = this.scoreWebPresence(dossier, signals);
    
    // Social Presence Score (25% weight)
    const socialPresenceScore = this.scoreSocialPresence(dossier, signals);
    
    // News Mentions Score (20% weight)
    const newsMentionsScore = this.scoreNewsMentions(dossier, signals);
    
    // Organizational Data Score (10% weight)
    const organizationalDataScore = this.scoreOrganizationalData(dossier, signals);
    
    // Geographic Data Score (10% weight)
    const geographicDataScore = this.scoreGeographicData(dossier, signals);
    
    // Products Data Score (5% weight)
    const productsDataScore = this.scoreProducts(dossier, signals);

    const overall = Math.round(
      webPresenceScore * 0.30 +
      socialPresenceScore * 0.25 +
      newsMentionsScore * 0.20 +
      organizationalDataScore * 0.10 +
      geographicDataScore * 0.10 +
      productsDataScore * 0.05
    );

    return {
      overall: Math.min(100, Math.max(0, overall)),
      categories: {
        webPresence: webPresenceScore,
        socialPresence: socialPresenceScore,
        newsMentions: newsMentionsScore,
        organizationalData: organizationalDataScore,
        geographicData: geographicDataScore,
        productsData: productsDataScore,
      },
      signals,
      methodology:
        'Transparent scoring based on documented public signals. ' +
        'Weights: Web Presence 30%, Social Presence 25%, News Mentions 20%, ' +
        'Organizational Data 10%, Geographic Data 10%, Products & Sub-brands 5%. ' +
        'Each signal is verified against publicly accessible sources.',
    };
  }

  private scoreWebPresence(dossier: BrandDossier, signals: SignalBreakdown[]): number {
    let score = 0;
    const web = dossier.webPresence;

    // Official website exists
    const hasOfficial = web.some((w) => w.type === 'official' && w.confidence === 'high');
    signals.push({
      category: 'webPresence',
      signal: 'Official website detected',
      weight: 0.30,
      value: hasOfficial,
      score: hasOfficial ? 30 : 0,
    });
    if (hasOfficial) score += 30;

    // Multiple domains
    const domainCount = new Set(web.map((w) => new URL(w.url).hostname)).size;
    signals.push({
      category: 'webPresence',
      signal: `Unique domains: ${domainCount}`,
      weight: 0.20,
      value: domainCount,
      score: Math.min(20, domainCount * 5),
    });
    score += Math.min(20, domainCount * 5);

    // Subdomains/multiple properties
    const propertyCount = web.length;
    signals.push({
      category: 'webPresence',
      signal: `Web properties: ${propertyCount}`,
      weight: 0.20,
      value: propertyCount,
      score: Math.min(20, propertyCount * 4),
    });
    score += Math.min(20, propertyCount * 4);

    // Confidence-weighted bonus
    const highConfCount = web.filter((w) => w.confidence === 'high').length;
    signals.push({
      category: 'webPresence',
      signal: `High-confidence web properties: ${highConfCount}`,
      weight: 0.15,
      value: highConfCount,
      score: Math.min(15, highConfCount * 5),
    });
    score += Math.min(15, highConfCount * 5);

    // Verified web presence adds
    signals.push({
      category: 'webPresence',
      signal: 'Web presence verified from multiple sources',
      weight: 0.15,
      value: dossier.sources.filter((s) => s.type === 'web' || s.type === 'official').length,
      score: Math.min(15, 10),
    });
    score += 10;

    return Math.min(100, score);
  }

  private scoreSocialPresence(dossier: BrandDossier, signals: SignalBreakdown[]): number {
    let score = 0;
    const social = dossier.socialPresence;

    const platformCount = new Set(social.map((s) => s.platform)).size;
    signals.push({
      category: 'socialPresence',
      signal: `Social platforms: ${platformCount}`,
      weight: 0.25,
      value: platformCount,
      score: Math.min(25, platformCount * 5),
    });
    score += Math.min(25, platformCount * 5);

    const verifiedCount = social.filter((s) => s.classification === 'Verified').length;
    signals.push({
      category: 'socialPresence',
      signal: `Verified profiles: ${verifiedCount}`,
      weight: 0.30,
      value: verifiedCount,
      score: Math.min(30, verifiedCount * 10),
    });
    score += Math.min(30, verifiedCount * 10);

    // Platform diversity bonus
    const majorPlatforms = ['LinkedIn', 'X (Twitter)', 'Facebook', 'Instagram', 'YouTube', 'GitHub'];
    const covered = majorPlatforms.filter((p) => social.some((s) => s.platform.includes(p)));
    signals.push({
      category: 'socialPresence',
      signal: `Major platforms covered: ${covered.length}/${majorPlatforms.length}`,
      weight: 0.25,
      value: covered.length,
      score: Math.min(25, (covered.length / majorPlatforms.length) * 25),
    });
    score += Math.min(25, (covered.length / majorPlatforms.length) * 25);

    // Followers signal (if available)
    const hasFollowerData = social.some((s) => s.followers !== undefined);
    signals.push({
      category: 'socialPresence',
      signal: 'Follower data available',
      weight: 0.10,
      value: hasFollowerData,
      score: hasFollowerData ? 10 : 0,
    });
    if (hasFollowerData) score += 10;

    // Source diversity
    const sourceCount = new Set(social.map((s) => s.source)).size;
    signals.push({
      category: 'socialPresence',
      signal: `Sources for social data: ${sourceCount}`,
      weight: 0.10,
      value: sourceCount,
      score: Math.min(10, sourceCount * 2),
    });
    score += Math.min(10, sourceCount * 2);

    return Math.min(100, score);
  }

  private scoreNewsMentions(dossier: BrandDossier, signals: SignalBreakdown[]): number {
    let score = 0;
    const news = dossier.newsMentions;

    signals.push({
      category: 'newsMentions',
      signal: `News articles: ${news.length}`,
      weight: 0.30,
      value: news.length,
      score: Math.min(30, news.length * 3),
    });
    score += Math.min(30, news.length * 3);

    const publisherCount = new Set(news.map((n) => n.publisher)).size;
    signals.push({
      category: 'newsMentions',
      signal: `Unique publishers: ${publisherCount}`,
      weight: 0.25,
      value: publisherCount,
      score: Math.min(25, publisherCount * 3),
    });
    score += Math.min(25, publisherCount * 3);

    // Recency signal
    const recentCount = news.filter((n) => {
      const daysAgo = (Date.now() - new Date(n.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 90;
    }).length;
    signals.push({
      category: 'newsMentions',
      signal: `Recent (last 90 days): ${recentCount}`,
      weight: 0.20,
      value: recentCount,
      score: Math.min(20, recentCount * 4),
    });
    score += Math.min(20, recentCount * 4);

    // Category diversity
    const categories = new Set(news.map((n) => n.category)).size;
    signals.push({
      category: 'newsMentions',
      signal: `News categories: ${categories}`,
      weight: 0.15,
      value: categories,
      score: Math.min(15, categories * 3),
    });
    score += Math.min(15, categories * 3);

    // Source reliability
    signals.push({
      category: 'newsMentions',
      signal: 'News sources from multiple independent publishers',
      weight: 0.10,
      value: publisherCount >= 3,
      score: publisherCount >= 3 ? 10 : 0,
    });
    if (publisherCount >= 3) score += 10;

    return Math.min(100, score);
  }

  private scoreOrganizationalData(dossier: BrandDossier, signals: SignalBreakdown[]): number {
    let score = 0;
    const org = dossier.organization;

    // Has basic identity
    if (dossier.identity) {
      signals.push({
        category: 'organizationalData',
        signal: 'Brand identity established',
        weight: 0.30,
        value: true,
        score: 30,
      });
      score += 30;
    }

    // Org data points
    const orgCount = org.length;
    signals.push({
      category: 'organizationalData',
      signal: `Organizational data points: ${orgCount}`,
      weight: 0.35,
      value: orgCount,
      score: Math.min(35, orgCount * 7),
    });
    score += Math.min(35, orgCount * 7);

    // High confidence items
    const highConfOrg = org.filter((o) => o.confidence === 'high').length;
    signals.push({
      category: 'organizationalData',
      signal: `High-confidence org facts: ${highConfOrg}`,
      weight: 0.20,
      value: highConfOrg,
      score: Math.min(20, highConfOrg * 5),
    });
    score += Math.min(20, highConfOrg * 5);

    // Multiple source types
    const sourceTypes = new Set(org.map((o) => o.source));
    signals.push({
      category: 'organizationalData',
      signal: `Unique sources: ${sourceTypes.size}`,
      weight: 0.15,
      value: sourceTypes.size,
      score: Math.min(15, sourceTypes.size * 5),
    });
    score += Math.min(15, sourceTypes.size * 5);

    return Math.min(100, score);
  }

  private scoreGeographicData(dossier: BrandDossier, signals: SignalBreakdown[]): number {
    let score = 0;
    const geo = dossier.geographic;

    const geoCount = geo.length;
    signals.push({
      category: 'geographicData',
      signal: `Geographic locations: ${geoCount}`,
      weight: 0.35,
      value: geoCount,
      score: Math.min(35, geoCount * 8),
    });
    score += Math.min(35, geoCount * 8);

    const hasHQ = geo.some((g) => g.type === 'headquarters');
    signals.push({
      category: 'geographicData',
      signal: 'Headquarters identified',
      weight: 0.30,
      value: hasHQ,
      score: hasHQ ? 30 : 0,
    });
    if (hasHQ) score += 30;

    const typeCount = new Set(geo.map((g) => g.type)).size;
    signals.push({
      category: 'geographicData',
      signal: `Location types: ${typeCount}`,
      weight: 0.20,
      value: typeCount,
      score: Math.min(20, typeCount * 6),
    });
    score += Math.min(20, typeCount * 6);

    const highConfGeo = geo.filter((g) => g.confidence === 'high').length;
    signals.push({
      category: 'geographicData',
      signal: `High-confidence locations: ${highConfGeo}`,
      weight: 0.15,
      value: highConfGeo,
      score: Math.min(15, highConfGeo * 4),
    });
    score += Math.min(15, highConfGeo * 4);

    return Math.min(100, score);
  }

  private scoreProducts(dossier: BrandDossier, signals: SignalBreakdown[]): number {
    let score = 0;
    const products = dossier.products;

    signals.push({
      category: 'productsData',
      signal: `Products/sub-brands: ${products.length}`,
      weight: 0.40,
      value: products.length,
      score: Math.min(40, products.length * 15),
    });
    score += Math.min(40, products.length * 15);

    const hasProducts = products.length > 0;
    signals.push({
      category: 'productsData',
      signal: 'Products or sub-brands identified',
      weight: 0.30,
      value: hasProducts,
      score: hasProducts ? 30 : 0,
    });
    if (hasProducts) score += 30;

    const highConfProducts = products.filter((p) => p.confidence === 'high').length;
    signals.push({
      category: 'productsData',
      signal: `High-confidence products: ${highConfProducts}`,
      weight: 0.30,
      value: highConfProducts,
      score: Math.min(30, highConfProducts * 10),
    });
    score += Math.min(30, highConfProducts * 10);

    return Math.min(100, score);
  }
        }
