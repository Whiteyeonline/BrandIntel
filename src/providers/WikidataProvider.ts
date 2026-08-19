import type { IProvider } from './IProvider';
import type { ProviderConfig, ProviderResult } from '../types/provider';
import type { OrganizationDetail, GeographicPresence, WebProperty, EvidenceEntry } from '../types/brand';

const WIKIDATA_QUERY = 'https://query.wikidata.org/sparql';

export class WikidataProvider implements IProvider {
  id = 'wikidata';
  name = 'Wikidata';
  description = 'Structured business data from Wikidata SPARQL endpoint';
  config: ProviderConfig = {
    id: 'wikidata',
    name: 'Wikidata',
    description: 'Wikidata SPARQL API',
    enabled: true,
    priority: 2,
    timeout: 10000,
  };

  isAvailable(): boolean {
    return true;
  }

  async collect(brand: string, signal?: AbortSignal): Promise<ProviderResult> {
    const sources: { url: string; publisher: string; date: string; type: string }[] = [];
    const evidence: EvidenceEntry[] = [];

    try {
      // Search for the brand entity in Wikidata
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(brand)}&language=en&format=json&limit=5`;
      const searchResp = await fetch(searchUrl, { signal });
      if (!searchResp.ok) {
        return { providerId: this.id, success: false, error: 'Wikidata search failed' };
      }

      const searchData = await searchResp.json();
      if (!searchData.search || searchData.search.length === 0) {
        return { providerId: this.id, success: false, error: 'No Wikidata entity found' };
      }

      const entityId = searchData.search[0].id;
      const entityUrl = `https://www.wikidata.org/wiki/${entityId}`;
      sources.push({
        url: entityUrl,
        publisher: 'Wikidata',
        date: new Date().toISOString().split('T')[0],
        type: 'api',
      });

      // SPARQL query for detailed entity data
      const sparqlQuery = `
        SELECT ?property ?propertyLabel ?value ?valueLabel WHERE {
          wd:${entityId} ?p ?statement.
          ?statement ?ps ?value.
          ?property wikibase:claim ?p.
          ?property wikibase:statementProperty ?ps.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        } LIMIT 50
      `;

      const sparqlResp = await fetch(WIKIDATA_QUERY, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/sparql-query',
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'BrandIntel/1.0',
        },
        body: sparqlQuery,
      });

      if (!sparqlResp.ok) {
        return { providerId: this.id, success: false, error: 'SPARQL query failed' };
      }

      const sparqlData = await sparqlResp.json();
      const organization: OrganizationDetail[] = [];
      const geographic: GeographicPresence[] = [];
      const webProperties: WebProperty[] = [];

      for (const item of sparqlData.results?.bindings || []) {
        const propLabel = item.propertyLabel?.value || '';
        const value = item.value?.value || '';
        const valueLabel = item.valueLabel?.value || '';

        if (propLabel.includes('official website') && value) {
          webProperties.push({
            url: value,
            label: 'Official Website (Wikidata)',
            type: 'official',
            confidence: 'high',
            source: entityUrl,
          });
        }

        if (propLabel.includes('headquarters') || propLabel.includes('location')) {
          geographic.push({
            type: 'headquarters',
            location: valueLabel || value,
            source: entityUrl,
            confidence: 'high',
          });
        }

        if (propLabel.includes('country')) {
          geographic.push({
            type: 'country',
            location: valueLabel || value,
            source: entityUrl,
            confidence: 'medium',
          });
        }

        if (propLabel.includes('industry') || propLabel.includes('sector')) {
          organization.push({
            type: 'industry',
            value: valueLabel || value,
            source: entityUrl,
            confidence: 'high',
          });
        }

        if (propLabel.includes('founded') || propLabel.includes('inception')) {
          organization.push({
            type: 'founded',
            value: valueLabel || value,
            source: entityUrl,
            confidence: 'high',
          });
        }

        if (propLabel.includes('subsidiary') || propLabel.includes('parent')) {
          organization.push({
            type: 'corporate',
            value: valueLabel || value,
            source: entityUrl,
            confidence: 'medium',
          });
        }
      }

      evidence.push({
        id: `wikidata-org-${Date.now()}`,
        claim: `Wikidata provides structured organizational data for ${brand}`,
        source: 'Wikidata',
        url: entityUrl,
        timestamp: new Date().toISOString(),
        confidence: 'high',
        rationale: `Retrieved ${organization.length} organizational facts and ${geographic.length} geographic facts from Wikidata SPARQL endpoint`,
        category: 'organization',
      });

      return {
        providerId: this.id,
        success: true,
        data: {
          organization,
          geographic,
          webPresence: webProperties,
          evidence,
        },
        sources,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { providerId: this.id, success: false, error: 'Request aborted' };
      }
      return { providerId: this.id, success: false, error: err instanceof Error ? err.message : 'Wikidata fetch failed' };
    }
  }
}
