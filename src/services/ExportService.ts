import type { BrandDossier } from '../types/brand';

export class ExportService {
  generateHTML(dossier: BrandDossier): string {
    const { identity, webPresence, socialPresence, newsMentions, products, organization, geographic, timeline, evidence, sources, score } = dossier;

    const identityHtml = identity ? `
      <div class="section">
        <h2>Brand Identity</h2>
        <table>
          <tr><th>Name</th><td>${esc(identity.name)}</td></tr>
          <tr><th>Aliases</th><td>${esc(identity.aliases.join(', ') || 'None')}</td></tr>
          <tr><th>Industry</th><td>${esc(identity.industry)}</td></tr>
          <tr><th>Description</th><td>${esc(identity.description)}</td></tr>
          <tr><th>Website</th><td><a href="${esc(identity.officialWebsite)}" target="_blank">${esc(identity.officialWebsite)}</a></td></tr>
          <tr><th>Founded</th><td>${identity.foundedYear || 'Unknown'}</td></tr>
          <tr><th>Headquarters</th><td>${esc(identity.headquarters || 'Unknown')}</td></tr>
        </table>
      </div>
    ` : '';

    const webHtml = webPresence.length ? `
      <div class="section">
        <h2>Web Presence <span class="count">(${webPresence.length})</span></h2>
        <table>
          <tr><th>URL</th><th>Label</th><th>Type</th><th>Confidence</th></tr>
          ${webPresence.map(w => `<tr><td><a href="${esc(w.url)}" target="_blank">${esc(trunc(w.url))}</a></td><td>${esc(w.label)}</td><td>${esc(w.type)}</td><td>${badge(w.confidence)}</td></tr>`).join('')}
        </table>
      </div>
    ` : '';

    const socialHtml = socialPresence.length ? `
      <div class="section">
        <h2>Social Presence <span class="count">(${socialPresence.length})</span></h2>
        <table>
          <tr><th>Platform</th><th>Handle</th><th>Classification</th><th>Followers</th></tr>
          ${socialPresence.map(s => `<tr><td><strong>${esc(s.platform)}</strong></td><td><a href="${esc(s.url)}" target="_blank">@${esc(s.handle)}</a></td><td>${clsBadge(s.classification)}</td><td>${s.followers?.toLocaleString() || '—'}</td></tr>`).join('')}
        </table>
      </div>
    ` : '';

    const newsHtml = newsMentions.length ? `
      <div class="section">
        <h2>News Intelligence <span class="count">(${newsMentions.length})</span></h2>
        ${newsMentions.map(n => `
          <div class="evidence-card">
            <div class="evidence-title"><a href="${esc(n.url)}" target="_blank">${esc(n.title)}</a></div>
            <div class="evidence-meta">${esc(n.publisher)} &middot; ${esc(n.date)} &middot; <span class="tag">${esc(n.category)}</span></div>
            <div class="evidence-snippet">${esc(n.snippet)}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const productsHtml = products.length ? `
      <div class="section">
        <h2>Products & Sub-brands <span class="count">(${products.length})</span></h2>
        <table>
          <tr><th>Name</th><th>Type</th><th>Description</th><th>Confidence</th></tr>
          ${products.map(p => `<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.type)}</td><td>${esc(p.description)}</td><td>${badge(p.confidence)}</td></tr>`).join('')}
        </table>
      </div>
    ` : '';

    const orgHtml = organization.length ? `
      <div class="section">
        <h2>Organization Intelligence <span class="count">(${organization.length})</span></h2>
        <div class="grid">
          ${organization.map(o => `
            <div class="org-card">
              <div class="org-type">${esc(o.type)}</div>
              <div class="org-value">${esc(o.value)}</div>
              <div class="org-meta">${badge(o.confidence)} <span class="source">${esc(trunc(o.source))}</span></div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const geoHtml = geographic.length ? `
      <div class="section">
        <h2>Geographic Presence <span class="count">(${geographic.length})</span></h2>
        <table>
          <tr><th>Type</th><th>Location</th><th>Confidence</th><th>Source</th></tr>
          ${geographic.map(g => `<tr><td>${esc(g.type)}</td><td><strong>${esc(g.location)}</strong></td><td>${badge(g.confidence)}</td><td class="source">${esc(trunc(g.source))}</td></tr>`).join('')}
        </table>
      </div>
    ` : '';

    const timelineHtml = timeline.length ? `
      <div class="section">
        <h2>Intelligence Timeline <span class="count">(${timeline.length})</span></h2>
        <div class="timeline">
          ${timeline.map(e => `
            <div class="tl-item">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <div class="tl-date">${esc(e.date)}</div>
                <div class="tl-title">${esc(e.title)}</div>
                <div class="tl-desc">${esc(e.description)}</div>
                <div class="tl-meta">${badge(e.confidence)} <span class="tag">${esc(e.category)}</span> <span class="source">${esc(trunc(e.source))}</span></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const evidenceHtml = evidence.length ? `
      <div class="section">
        <h2>Evidence Register <span class="count">(${evidence.length})</span></h2>
        ${evidence.map(e => `
          <div class="evidence-card">
            <div class="evidence-claim">${esc(e.claim)}</div>
            <div class="evidence-meta">${badge(e.confidence)} &middot; ${esc(e.source)} &middot; ${new Date(e.timestamp).toLocaleDateString()} &middot; <span class="tag">${esc(e.category)}</span></div>
            <div class="evidence-rationale">${esc(e.rationale)}</div>
            <div class="evidence-source"><a href="${esc(e.url)}" target="_blank">Source &#8594; ${esc(trunc(e.url))}</a></div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const sourcesHtml = sources.length ? `
      <div class="section">
        <h2>Source Register <span class="count">(${sources.length})</span></h2>
        <table>
          <tr><th>URL</th><th>Publisher</th><th>Date</th><th>Type</th><th>Reliability</th></tr>
          ${sources.map(s => `<tr><td><a href="${esc(s.url)}" target="_blank">${esc(trunc(s.url))}</a></td><td>${esc(s.publisher)}</td><td>${esc(s.date)}</td><td>${esc(s.type)}</td><td>${Math.round(s.reliability * 100)}%</td></tr>`).join('')}
        </table>
      </div>
    ` : '';

    const scoreHtml = score ? `
      <div class="section">
        <h2>Visibility Score</h2>
        <div class="score-box">
          <div class="score-main">
            <div class="score-ring-big">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#2a2a3a" stroke-width="6"/>
                <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor(score.overall)}" stroke-width="6" stroke-dasharray="${2 * Math.PI * 52}" stroke-dashoffset="${2 * Math.PI * 52 * (1 - score.overall / 100)}" stroke-linecap="round" transform="rotate(-90 60 60)"/>
              </svg>
              <div class="score-number" style="color:${scoreColor(score.overall)}">${score.overall}</div>
            </div>
            <div class="score-breakdown">
              ${Object.entries(score.categories).map(([k, v]) => `
                <div class="score-row">
                  <span>${fmtCat(k)}</span>
                  <span style="color:${scoreColor(v)};font-weight:600">${v}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="score-method">${esc(score.methodology)}</div>
        </div>
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrandIntel Dossier — ${esc(dossier.query)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; line-height: 1.6; padding: 2rem; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; }
    h2 { font-size: 1.35rem; font-weight: 600; color: #a0a0f0; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #2a2a3a; padding-bottom: 0.5rem; }
    .meta { color: #8888a0; font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; }
    .meta span { display: flex; align-items: center; gap: 0.3rem; }
    a { color: #a0a0f8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
    th, td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid #2a2a3a; }
    th { color: #8888a0; font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    tr:last-child td { border-bottom: none; }
    .source { color: #8888a0; font-size: 0.8rem; word-break: break-all; }
    .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-high { background: rgba(80,200,120,0.15); color: #50c878; border: 1px solid rgba(80,200,120,0.3); }
    .badge-medium { background: rgba(240,192,64,0.15); color: #f0c040; border: 1px solid rgba(240,192,64,0.3); }
    .badge-low { background: rgba(240,128,64,0.15); color: #f08040; border: 1px solid rgba(240,128,64,0.3); }
    .badge-unverified { background: rgba(240,64,64,0.15); color: #f04040; border: 1px solid rgba(240,64,64,0.3); }
    .cls-verified { background: rgba(80,200,120,0.15); color: #50c878; }
    .cls-likely { background: rgba(64,128,240,0.15); color: #4080f0; }
    .cls-possible { background: rgba(240,192,64,0.15); color: #f0c040; }
    .cls-unverified { background: rgba(240,128,64,0.15); color: #f08040; }
    .cls-V, .cls-verified { background: rgba(80,200,120,0.15); color: #50c878; }
    .tag { display: inline-block; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.7rem; background: rgba(124,124,240,0.1); color: #a0a0f8; }
    .section { margin-bottom: 1.5rem; }
    .evidence-card { background: #111118; border: 1px solid #2a2a3a; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
    .evidence-title { font-weight: 500; margin-bottom: 0.4rem; }
    .evidence-meta { color: #8888a0; font-size: 0.8rem; margin-bottom: 0.4rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .evidence-snippet { font-size: 0.85rem; color: #8888a0; }
    .evidence-claim { font-weight: 500; margin-bottom: 0.4rem; }
    .evidence-rationale { font-size: 0.85rem; color: #8888a0; margin-bottom: 0.4rem; }
    .evidence-source { font-size: 0.8rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
    .org-card { background: #111118; border: 1px solid #2a2a3a; border-radius: 8px; padding: 0.75rem; }
    .org-type { font-size: 0.7rem; color: #8888a0; text-transform: uppercase; letter-spacing: 0.04em; }
    .org-value { font-weight: 500; margin: 0.15rem 0 0.3rem; }
    .org-meta { display: flex; gap: 0.5rem; align-items: center; font-size: 0.8rem; }
    .timeline { position: relative; padding-left: 2rem; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #2a2a3a; }
    .tl-item { position: relative; margin-bottom: 1.25rem; }
    .tl-dot { position: absolute; left: -1.7rem; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #7c7cf0; border: 2px solid #0a0a0f; }
    .tl-date { font-size: 0.8rem; color: #8888a0; font-family: 'JetBrains Mono', monospace; }
    .tl-title { font-weight: 500; margin: 0.15rem 0; }
    .tl-desc { font-size: 0.85rem; color: #8888a0; }
    .tl-meta { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.3rem; font-size: 0.8rem; flex-wrap: wrap; }
    .score-box { }
    .score-main { display: flex; gap: 2rem; align-items: center; flex-wrap: wrap; }
    .score-ring-big { position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .score-number { position: absolute; font-size: 2rem; font-weight: 700; }
    .score-breakdown { flex: 1; min-width: 200px; }
    .score-row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #2a2a3a; font-size: 0.9rem; }
    .score-row:last-child { border-bottom: none; }
    .score-method { font-size: 0.8rem; color: #8888a0; margin-top: 0.75rem; padding: 0.75rem; background: #111118; border-radius: 8px; }
    .footer { text-align: center; padding: 2rem 0; color: #555568; font-size: 0.8rem; border-top: 1px solid #2a2a3a; margin-top: 2rem; }
    @media print {
      body { background: #fff; color: #111; padding: 1cm; }
      a { color: #1155cc; }
      h2 { color: #333; }
      .badge-high { background: #e8f5e9; color: #2e7d32; }
      .badge-medium { background: #fff8e1; color: #f57f17; }
      .badge-low { background: #fbe9e7; color: #d84315; }
      .badge-unverified { background: #ffebee; color: #c62828; }
      table th { color: #666; }
      .source, .evidence-meta, .evidence-snippet, .evidence-rationale, .org-type, .tl-date, .tl-desc, .score-method, .meta { color: #666; }
      .evidence-card, .org-card, .score-method { background: #f5f5f5; border-color: #ddd; }
      .timeline::before { background: #ddd; }
      .tl-dot { background: #333; border-color: #fff; }
      .cls-V { background: #e8f5e9; color: #2e7d32; }
      .cls-L { background: #e3f2fd; color: #1565c0; }
      .cls-P { background: #fff8e1; color: #f57f17; }
      .cls-U { background: #ffebee; color: #c62828; }
      .tag { background: #e8eaf6; color: #283593; }
      .score-row { border-color: #eee; }
      .score-method { border: 1px solid #eee; }
      .footer { border-color: #ddd; color: #999; }
    }
    @media (max-width: 640px) {
      body { padding: 1rem; }
      h1 { font-size: 1.5rem; }
      table { font-size: 0.8rem; }
      th, td { padding: 0.4rem 0.5rem; }
      .grid { grid-template-columns: 1fr; }
      .score-main { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>BrandIntel Dossier: ${esc(dossier.query)}</h1>
    <div class="meta">
      <span>Generated: ${new Date(dossier.generatedAt).toLocaleString()}</span>
      <span>Sources: ${sources.length}</span>
      <span>Evidence: ${evidence.length}</span>
      <span>Dossier ID: ${dossier.id.substring(0, 8)}</span>
    </div>

    ${identityHtml}
    ${webHtml}
    ${socialHtml}
    ${newsHtml}
    ${productsHtml}
    ${orgHtml}
    ${geoHtml}
    ${timelineHtml}
    ${scoreHtml}
    ${evidenceHtml}
    ${sourcesHtml}

    <div class="footer">
      <p>BrandIntel — Free Brand Intelligence OSINT Platform</p>
      <p>Powered by public data sources &middot; No paid APIs required</p>
    </div>
  </div>
</body>
</html>`;
  }

  generateCSV(dossier: BrandDossier): string {
    const rows: string[][] = [];

    // Metadata header
    rows.push(['BrandIntel Dossier Export', dossier.query, new Date().toISOString()]);
    rows.push([]);

    // Identity
    if (dossier.identity) {
      rows.push(['=== BRAND IDENTITY ===']);
      rows.push(['Name', dossier.identity.name]);
      rows.push(['Aliases', dossier.identity.aliases.join('; ')]);
      rows.push(['Industry', dossier.identity.industry]);
      rows.push(['Description', dossier.identity.description]);
      rows.push(['Website', dossier.identity.officialWebsite]);
      rows.push(['Founded', dossier.identity.foundedYear?.toString() || '']);
      rows.push(['Headquarters', dossier.identity.headquarters || '']);
      rows.push([]);
    }

    // Web Presence
    if (dossier.webPresence.length > 0) {
      rows.push(['=== WEB PRESENCE ===']);
      rows.push(['URL', 'Label', 'Type', 'Confidence', 'Source']);
      for (const w of dossier.webPresence) {
        rows.push([w.url, w.label, w.type, w.confidence, w.source]);
      }
      rows.push([]);
    }

    // Social Presence
    if (dossier.socialPresence.length > 0) {
      rows.push(['=== SOCIAL PRESENCE ===']);
      rows.push(['Platform', 'Handle', 'URL', 'Classification', 'Followers', 'Source']);
      for (const s of dossier.socialPresence) {
        rows.push([s.platform, s.handle, s.url, s.classification, s.followers?.toString() || '', s.source]);
      }
      rows.push([]);
    }

    // News Mentions
    if (dossier.newsMentions.length > 0) {
      rows.push(['=== NEWS MENTIONS ===']);
      rows.push(['Title', 'Publisher', 'Date', 'URL', 'Snippet', 'Category']);
      for (const n of dossier.newsMentions) {
        rows.push([n.title, n.publisher, n.date, n.url, n.snippet, n.category]);
      }
      rows.push([]);
    }

    // Products
    if (dossier.products.length > 0) {
      rows.push(['=== PRODUCTS & SUB-BRANDS ===']);
      rows.push(['Name', 'Type', 'Description', 'URL', 'Confidence', 'Source']);
      for (const p of dossier.products) {
        rows.push([p.name, p.type, p.description, p.url || '', p.confidence, p.source]);
      }
      rows.push([]);
    }

    // Organization
    if (dossier.organization.length > 0) {
      rows.push(['=== ORGANIZATION INTELLIGENCE ===']);
      rows.push(['Type', 'Value', 'Confidence', 'Source']);
      for (const o of dossier.organization) {
        rows.push([o.type, o.value, o.confidence, o.source]);
      }
      rows.push([]);
    }

    // Geographic
    if (dossier.geographic.length > 0) {
      rows.push(['=== GEOGRAPHIC PRESENCE ===']);
      rows.push(['Type', 'Location', 'Confidence', 'Source']);
      for (const g of dossier.geographic) {
        rows.push([g.type, g.location, g.confidence, g.source]);
      }
      rows.push([]);
    }

    // Timeline
    if (dossier.timeline.length > 0) {
      rows.push(['=== INTELLIGENCE TIMELINE ===']);
      rows.push(['Date', 'Title', 'Description', 'Category', 'Confidence', 'Source']);
      for (const t of dossier.timeline) {
        rows.push([t.date, t.title, t.description, t.category, t.confidence, t.source]);
      }
      rows.push([]);
    }

    // Evidence
    if (dossier.evidence.length > 0) {
      rows.push(['=== EVIDENCE REGISTER ===']);
      rows.push(['Claim', 'Source', 'URL', 'Timestamp', 'Confidence', 'Rationale', 'Category']);
      for (const e of dossier.evidence) {
        rows.push([e.claim, e.source, e.url, e.timestamp, e.confidence, e.rationale, e.category]);
      }
      rows.push([]);
    }

    // Sources
    if (dossier.sources.length > 0) {
      rows.push(['=== SOURCE REGISTER ===']);
      rows.push(['URL', 'Publisher', 'Date', 'Type', 'Reliability']);
      for (const s of dossier.sources) {
        rows.push([s.url, s.publisher, s.date, s.type, s.reliability.toString()]);
      }
      rows.push([]);
    }

    // Score
    if (dossier.score) {
      rows.push(['=== VISIBILITY SCORE ===']);
      rows.push(['Overall', dossier.score.overall.toString()]);
      rows.push(['Web Presence', dossier.score.categories.webPresence.toString()]);
      rows.push(['Social Presence', dossier.score.categories.socialPresence.toString()]);
      rows.push(['News Mentions', dossier.score.categories.newsMentions.toString()]);
      rows.push(['Organizational Data', dossier.score.categories.organizationalData.toString()]);
      rows.push(['Geographic Data', dossier.score.categories.geographicData.toString()]);
      rows.push(['Products & Sub-brands', dossier.score.categories.productsData.toString()]);
    }

    return rows.map(row => row.map(cell => {
      const str = cell ?? '';
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')).join('\n');
  }

  gen
