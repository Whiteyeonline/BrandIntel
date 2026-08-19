import React, { useState, useCallback, useRef } from 'react';
import { BrandProvider, useBrand } from './store/BrandContext';
import { ProviderRegistry } from './providers/ProviderRegistry';
import { WikipediaProvider } from './providers/WikipediaProvider';
import { WikidataProvider } from './providers/WikidataProvider';
import { GitHubProvider } from './providers/GitHubProvider';
import { RSSNewsProvider } from './providers/RSSNewsProvider';
import { RedditProvider } from './providers/RedditProvider';
import { HackerNewsProvider } from './providers/HackerNewsProvider';
import { CollectionService } from './services/CollectionService';
import { ExportService } from './services/ExportService';
import { demoDossier } from './demo/demoData';
import type { BrandDossier } from './types/brand';

// Lazy load views
const DossierView = React.lazy(() => import('./components/dossier/DossierView'));

function AppContent() {
  const { state, dispatch } = useBrand();
  const [query, setQuery] = useState('');
  const [useDemoMode, setUseDemoMode] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async () => {
    const brand = query.trim();
    if (!brand) return;

    dispatch({ type: 'START_COLLECTION', payload: brand });

    // If demo mode enabled and default brand, show demo
    if (useDemoMode && (brand.toLowerCase() === 'acme corporation' || brand.toLowerCase() === 'acme')) {
      // Simulate progressive loading
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 10, status: 'Reading Wikipedia...' } });
      await delay(400);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 25, status: 'Fetching Wikidata...' } });
      await delay(300);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 40, status: 'Checking social presence...' } });
      await delay(400);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 55, status: 'Collecting news mentions...' } });
      await delay(300);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 70, status: 'Analyzing evidence...' } });
      await delay(400);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 85, status: 'Calculating visibility score...' } });
      await delay(300);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 100, status: 'Dossier complete' } });
      await delay(200);
      dispatch({ type: 'COLLECTION_COMPLETE', payload: demoDossier });
      return;
    }

    // Live collection
    try {
      abortRef.current = new AbortController();
      const registry = new ProviderRegistry();

      registry.register(new WikipediaProvider());
      registry.register(new WikidataProvider());
      registry.register(new GitHubProvider());
      registry.register(new RSSNewsProvider());
      registry.register(new RedditProvider());
      registry.register(new HackerNewsProvider());

      const collector = new CollectionService(registry);
      const dossier = await collector.collect(brand, (progress, status) => {
        dispatch({ type: 'UPDATE_PROGRESS', payload: { progress, status } });
      }, abortRef.current.signal);

      dispatch({ type: 'COLLECTION_COMPLETE', payload: dossier });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        dispatch({ type: 'COLLECTION_ERROR', payload: 'Collection was cancelled.' });
      } else {
        dispatch({ type: 'COLLECTION_ERROR', payload: err.message || 'Collection failed. Please try again.' });
      }
    }
  }, [query, useDemoMode, dispatch]);

  const handleExport = useCallback((format: 'html' | 'json' | 'csv') => {
    if (!state.currentDossier) return;
    const exportService = new ExportService();

    switch (format) {
      case 'html': {
        const html = exportService.generateHTML(state.currentDossier);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        downloadBlob(blob, `brandintel-${state.currentDossier.query}-dossier.html`);
        break;
      }
      case 'json': {
        const json = JSON.stringify(state.currentDossier, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, `brandintel-${state.currentDossier.query}-dossier.json`);
        break;
      }
      case 'csv': {
        const csv = exportService.generateCSV(state.currentDossier);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        downloadBlob(blob, `brandintel-${state.currentDossier.query}-dossier.csv`);
        break;
      }
    }
  }, [state.currentDossier]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">BI</div>
          <span className="header-logo-text">BrandIntel</span>
          <span className="header-badge">FREE</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useDemoMode}
              onChange={(e) => setUseDemoMode(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Demo
          </label>
          {state.currentDossier && (
            <div className="btn-group" style={{ gap: '0.3rem' }}>
              <button className="btn" onClick={() => handleExport('html')} title="Export as HTML (print-to-PDF)">
                📄 HTML
              </button>
              <button className="btn" onClick={() => handleExport('json')} title="Export as JSON">
                { } JSON
              </button>
              <button className="btn" onClick={() => handleExport('csv')} title="Export as CSV">
                CSV
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {state.isLoading ? (
        <LoadingView progress={state.progress} status={state.status} />
      ) : state.error ? (
        <ErrorView message={state.error} onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })} />
      ) : state.currentDossier ? (
        <React.Suspense fallback={<LoadingView progress={50} status="Loading dossier..." />}>
          <DossierView dossier={state.currentDossier} onNewSearch={() => {
            dispatch({ type: 'COLLECTION_COMPLETE', payload: state.currentDossier! });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </React.Suspense>
      ) : (
        <SearchView
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          useDemo={useDemoMode}
        />
      )}
    </div>
  );
}

function SearchView({ query, onQueryChange, onSearch, useDemo }: {
  query: string; onQueryChange: (v: string) => void; onSearch: () => void; useDemo: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSearch(); };
  return (
    <div className="search-section">
      <div className="search-header">
        <h1>Brand Intelligence OSINT</h1>
        <p>Enter a brand name to generate a professional, source-backed Brand Intelligence Dossier</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="search-box">
          <input
            className="search-input"
            type="text"
            placeholder={useDemo ? 'e.g. Acme Corporation (demo) or any real brand...' : 'Enter brand name...'}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
          />
          <button className="search-btn" type="submit" disabled={!query.trim()}>
            Generate Dossier
          </button>
        </div>
      </form>
      {useDemo && (
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🎯 Demo mode: enter "Acme Corporation" for a sample dossier, or disable Demo to collect live public data
        </div>
      )}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>✓ Wikipedia & Wikidata</span>
        <span>✓ RSS News Feeds</span>
        <span>✓ GitHub & Reddit</span>
        <span>✓ Hacker News</span>
        <span>✓ Source-backed scoring</span>
      </div>
    </div>
  );
}

function LoadingView({ progress, status }: { progress: number; status: string }) {
  return (
    <div className="loading-section">
      <h2>Collecting Intelligence</h2>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="status-text">{status}</div>
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Gathering publicly available information from multiple open sources...
      </div>
    </div>
  );
}

function ErrorView({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="error-section">
      <div className="error-card">
        <div className="error-title">Collection Error</div>
        <div className="error-msg">{message}</div>
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={onDismiss}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function App() {
  return (
    <BrandProvider>
      <AppContent />
    </BrandProvider>
  );
}

export default App;
