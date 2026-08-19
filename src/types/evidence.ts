import type { ConfidenceLevel } from './brand';

export interface EvidenceLink {
  claim: string;
  source: string;
  url: string;
  timestamp: string;
  confidence: ConfidenceLevel;
  rationale: string;
}
