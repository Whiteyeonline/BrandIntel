import type { BrandDossier } from './brand';

export interface ProviderConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  rateLimit?: number;
  timeout?: number;
}

export interface ProviderResult {
  providerId: string;
  success: boolean;
  data?: Partial<BrandDossier>;
  error?: string;
  sources?: { url: string; publisher: string; date: string; type: string }[];
}

export interface IDataProvider {
  id: string;
  name: string;
  description: string;
  config: ProviderConfig;
  collect(brand: string, signal?: AbortSignal): Promise<ProviderResult>;
  isAvailable(): boolean;
}
