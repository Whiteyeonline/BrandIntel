import React, { useState } from 'react';
import type { BrandDossier, ConfidenceLevel, SocialProfile, WebProperty } from '../../types/brand';

interface Props {
  dossier: BrandDossier;
  onNewSearch: () => void;
}

export default function DossierView({ dossier, onNewSearch }: Props) {
  return (
    <div className="dossier">
      {/* Header */}
      <div className="dossier-header">
        <div className="dossier-title">
          <h1>{dossier.identity?.name || dossier.query}</h1>
          {dossier.score && (
            <div className="score-display" style={{ flex: 1, justifyContent: 'flex-end' }}>
              <div className="score-ring">
                <svg viewBox="0 0 80 80">
                  <circle className="score-ring-bg" cx="40" cy="40" r="35" />
                  <circle
                    className="score-ring-fill"
                    cx="40" cy="40" r="35"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - dossier.score.overall / 100)}`}
                    stroke={dossier.score.overall >= 70 ? 'var(--green)' : dossier.score.overall >= 40 ? 'var(--yellow)' : 'var(--red)'}
                  />
                </svg>
                <span style={{ color: dossier.score.overall >= 70 ? 'var(--green)' : dossier.score.overall >= 40 ? 'var(--yellow)' : 'var(--red)' }}>
                  {dossier.score.overall}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="dossier-meta">
          <span>Generated: {new Date(dossier.generatedAt).toLocaleString()}</span>
          <span>Sources: {dossier.sources.length}</span>
          <span>Evidence: {dossier.evidence.length}</span>
          <span>ID: {dossier.id.substring(0, 8)}</span>
          <button className="btn" onClick={onNewSearch} style={{ marginLeft: 'auto' }}>
            ← New Search
          </button>
        </div>
      </div>

      {/* Brand Identity */}
      {dossier.identity && (
        <CollapsibleSection title="Brand Identity" count={1} defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            <InfoField label="Official Name" value={dossier.identity.name} />
            <InfoField label="Aliases" value={dossier.identity.aliases.join(', ') || 'None detected'} />
            <InfoField label="Industry" value={dossier.identity.industry} />
            <InfoField label="Founded" value={dossier.identity.foundedYear?.toString() || 'Unknown'} />
            <InfoField label="Headquarters" value={dossier.identity.headquarters || 'Unknown'} />
            <InfoField label="Description" value={dossier.identity.description} multiline />
            <InfoField label="Official Website" value={dossier.identity.officialWebsite || 'Unknown'} isLink />
          </div>
        </CollapsibleSection>
      )}

      {/* Web Presence */}
      {dossier.webPresence.length > 0 && (
        <CollapsibleSection title="Web Presence" count={dossier.webPresence.length} defaultOpen>
          <table className="data-table">
            <thead>
              <tr><th>URL</th><th>Label</th><th>Type</th><th>Confidence</th></tr>
            </thead>
            <tbody>
              {dossier.webPresence.map((w, i) => (
                <tr key={i}>
                  <td><a href={w.url} target="_blank" rel="noopener noreferrer">{truncateUrl(w.url)}</a></td>
                  <td>{w.label}</td>
                  <td><span className="classification-badge classification-{w.type}">{w.type}</span></td>
                  <td><ConfidenceBadge level={w.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Social Presence */}
      {dossier.socialPresence.length > 0 && (
        <CollapsibleSection title="Social Presence" count={dossier.socialPresence.length} defaultOpen>
          <table className="data-table">
            <thead>
              <tr><th>Platform</th><th>Handle</th><th>Classification</th><th>Followers</th><th>Source</th></tr>
            </thead>
            <tbody>
              {dossier.socialPresence.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.platform}</strong></td>
                  <td><a href={s.url} target="_blank" rel="noopener noreferrer">@{s.handle}</a></td>
                  <td><span className={`classification-badge classification-${s.classification}`}>{s.classification}</span></td>
                  <td>{s.followers?.toLocaleString() || '—'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{truncateUrl(s.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* News Intelligence */}
      {dossier.newsMentions.length > 0 && (
        <CollapsibleSection title="News Intelligence" count={dossier.newsMentions.length} defaultOpen>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {dossier.newsMentions.map((n, i) => (
              <div className="evidence-card" key={i}>
                <div className="evidence-claim">
                  <a href={n.url} target="_blank" rel="noopener noreferrer">{n.title}</a>
                </div>
                <div className="evidence-meta">
                  <span>{n.publisher}</span>
                  <span>{n.date}</span>
                  <span className={`confidence-badge confidence-medium`}>{n.category}</span>
                </div>
                <div className="evidence-rationale">{n.snippet}</div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Products & Sub-brands */}
      {dossier.products.length > 0 && (
        <CollapsibleSection title="Products & Sub-brands" count={dossier.products.length}>
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Description</th><th>Confidence</th></tr>
            </thead>
            <tbody>
              {dossier.products.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className={`classification-badge classification-${p.type === 'subbrand' ? 'Likely' : 'Verified'}`}>{p.type}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.description}</td>
                  <td><ConfidenceBadge level={p.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Organization Intelligence */}
      {dossier.organization.length > 0 && (
        <CollapsibleSection title="Organization Intelligence" count={dossier.organization.length}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {dossier.organization.map((o, i) => (
              <div key={i} className="evidence-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{o.type}</div>
                <div style={{ fontWeight: 500, marginTop: '0.2rem' }}>{o.value}</div>
                <div className="evidence-meta" style={{ marginTop: '0.3rem' }}>
                  <ConfidenceBadge level={o.confidence} />
                  <span style={{ fontSize: '0.75rem' }}>{truncateUrl(o.source)}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Geographic Presence */}
      {dossier.geographic.length > 0 && (
        <CollapsibleSection title="Geographic Presence" count={dossier.geographic.length}>
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Location</th><th>Confidence</th><th>Source</th></tr>
            </thead>
            <tbody>
              {dossier.geographic.map((g, i) => (
                <tr key={i}>
                  <td><span className={`classification-badge classification-${g.confidence === 'high' ? 'Verified' : 'Likely'}`}>{g.type}</span></td>
                  <td><strong>{g.location}</strong></td>
                  <td><ConfidenceBadge level={g.confidence} /></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{truncateUrl(g.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Intelligence Timeline */}
      {dossier.timeline.length > 0 && (
        <CollapsibleSection title="Intelligence Timeline" count={dossier.timeline.length} defaultOpen>
          <div className="timeline">
            {dossier.timeline.map((e, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-date">{e.date}</div>
                <div className="timeline-title">{e.title}</div>
                <div className="timeline-desc">{e.description}</div>
                <div className="evidence-meta" style={{ marginTop: '0.3rem' }}>
                  <span className={`confidence-badge confidence-${e.confidence}`}>{e.confidence}</span>
                  <span className={`classification-badge`}>{e.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{truncateUrl(e.source)}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Visibility Score */}
      {dossier.score && (
        <CollapsibleSection title="Visibility Score" count={1}>
          <div className="score-display">
            <div className="score-ring" style={{ width: 120, height: 120 }}>
              <svg viewBox="0 0 120 120" style={{ width: 120, height: 120 }}>
                <circle className="score-ring-bg" cx="60" cy="60" r="52" strokeWidth="6" />
                <circle
                  className="score-ring-fill"
                  cx="60" cy="60" r="52" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - dossier.score.overall / 100)}`}
                  stroke={dossier.score.overall >= 70 ? 'var(--green)' : dossier.score.overall >= 40 ? 'var(--yellow)' : 'var(--red)'}
                />
              </svg>
              <span style={{ fontSize: '2rem', position: 'absolute', color: dossier.score.overall >= 70 ? 'var(--green)' : dossier.score.overall >= 40 ? 'var(--yellow)' : 'var(--red)' }}>
                {dossier.score.overall}
              </span>
            </div>
            <div className="score-details">
              {Object.entries(dossier.score.categories).map(([key, val]) => (
                <div className="score-row" key={key}>
                  <span className="score-label">{formatCategory(key)}</span>
                  <span style={{ color: val >= 70 ? 'var(--green)' : val >= 40 ? 'var(--yellow)' : 'var(--red)', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
              <div className="score-method">{dossier.score.methodology}</div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Evidence Register */}
      {dossier.evidence.length > 0 && (
        <CollapsibleSection title="Evidence Register" count={dossier.evidence.length}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {dossier.evidence.map((e) => (
              <div className="evidence-card" key={e.id}>
                <div className="evidence-claim">{e.claim}</div>
                <div className="evidence-meta">
                  <ConfidenceBadge level={e.confidence} />
                  <span>{e.source}</span>
                  <span>{new Date(e.timestamp).toLocaleDateString()}</span>
                  <span className="classification-badge">{e.category}</span>
                </div>
                <div className="evidence-rationale">{e.rationale}</div>
                <a className="evidence-source" href={e.url} target="_blank" rel="noopener noreferrer">Source → {truncateUrl(e.url)}</a>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Source Register */}
      {dossier.sources.length > 0 && (
        <CollapsibleSection title="Source Register" count={dossier.sources.length}>
          <table className="data-table">
            <thead>
              <tr><th>URL</th><th>Publisher</th><th>Date</th><th>Type</th><th>Reliability</th></tr>
            </thead>
            <tbody>
              {dossier.sources.map((s, i) => (
                <tr key={i}>
                  <td><a href={s.url} target="_blank" rel="noopener noreferrer">{truncateUrl(s.url)}</a></td>
                  <td>{s.publisher}</td>
                  <td>{s.date}</td>
                  <td><span className={`classification-badge`}>{s.type}</span></td>
                  <td>{Math.round(s.reliability * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>BrandIntel — Free Brand Intelligence OSINT Platform</p>
        <p style={{ marginTop: '0.3rem' }}>Powered by public data sources. No paid APIs required.</p>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, count, defaultOpen, children }: {
  title: string; count: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <h2>{title} <span className="count">({count})</span></h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return <span className={`confidence-badge confidence-${level}`}>{level}</span>;
}

function InfoField({ label, value, multiline, isLink }: {
  label: string; value: string; multiline?: boolean; isLink?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{label}</div>
      {isLink && value.startsWith('http') ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>{value}</a>
      ) : (
        <div style={{ fontSize: '0.9rem', ...(multiline ? { lineHeight: 1.5, maxHeight: '4.5em', overflow: 'hidden' } : {}) }}>
          {value}
        </div>
      )}
    </div>
  );
}

function truncateUrl(url: string, maxLen = 45): string {
  return url.length > maxLen ? url.substring(0, maxLen) + '…' : url;
}

function formatCategory(key: string): string {
  const map: Record<string, string> = {
    webPresence: 'Web Presence',
    socialPresence: 'Social Presence',
    newsMentions: 'News Mentions',
    organizationalData: 'Organizational Data',
    geographicData: 'Geographic Data',
    productsData: 'Products & Sub-brands',
  };
  return map[key] || key;
      }
