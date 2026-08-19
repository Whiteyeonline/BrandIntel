import type { ProviderConfig, ProviderResult } from '../types/provider';

export interface IProvider {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly config: ProviderConfig;
  collect(brand: string, signal?: AbortSignal): Promise<ProviderResult>;
  isAvailable(): boolean;
}
