'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { encodeConfig, decodeConfig, AddonConfig, CatalogEntry, DEFAULT_CONFIG, isConfigValid } from '@/lib/config';

// ── Icons ──────────────────────────────────────────────────────────────────────
const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
    <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ArrowDownIcon = () => ( // Recenti prima
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const ArrowUpIcon = () => ( // Meno recenti prima
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const FlameIcon = () => ( // Popolarità
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// ── Translations ───────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    sub: 'Your favorite actors, directors and sagas on Stremio',
    catalogsTitle: 'Your Catalogs',
    emptyCatalogs: 'No catalogs added yet. Use the search below to start.',
    addCatalogLabel: 'Add a new catalog',
    searchActor: '👤 Actor/Director',
    searchCollection: '🎞️ Saga (Collection)',
    searchActorPlaceholder: 'Search Nicolas Cage, Steven Spielberg...',
    searchCollectionPlaceholder: 'Search Harry Potter, Star Wars...',
    searching: 'Searching...',
    noResults: 'No results found.',
    typeActor: 'Actor',
    typeDirector: 'Director / Crew',
    typeSaga: 'Cinematic Saga',
    installTitle: 'Addon URL — ready to install',
    installPlaceholder: 'Add at least one catalog to generate your link...',
    installStremio: 'Install in Stremio',
    installWeb: 'Stremio Web',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    faqTitle: 'FREQUENTLY ASKED QUESTIONS',
    faq1q: 'What is Cagelog?',
    faq1a: 'Cagelog is a Stremio add-on that allows you to create custom movie catalogs. You can track all the films of your favorite actors, follow your favorite directors, or create catalogs for entire sagas (like Star Wars or Marvel) in chronological order.',
    faq2q: 'How does the sorting work?',
    faq2a: 'For each actor or director catalog, you can use the dropdown menu next to the trash can to change how their movies are sorted. You can sort by newest first, oldest first, or by popularity. Sagas are always sorted chronologically.',
    faq3q: 'How often do the catalogs update?',
    faq3a: 'The chronological and popularity-sorted catalogs update automatically whenever a new movie is added to TMDB. The "Random Mix" catalog changes its order exactly every 24 hours at midnight.',
    faq4q: 'Do I need an API key?',
    faq4a: 'No! Cagelog works out of the box — no API key required. Just add your catalogs and install.',
    sortNewest: 'Newest First',
    sortOldest: 'Oldest First',
    sortPopular: 'Popularity',
    sortRandom: 'Random Mix (Daily)',
    support: 'Support me on Ko-fi',
    voteText: 'Support me with a vote',
    // Ratings on Posters
    ratingsTitle: 'Ratings on Posters',
    ratingsDesc: 'Enter your RPDB or OpenPosterDB API Key to enable posters with Letterboxd/IMDb ratings.',
    rpdbProviderLabel: 'Provider',
    rpdbKeyLabel: 'API Key',
    rpdbVerify: 'Verify',
    rpdbValidKey: 'Valid API Key',
    rpdbInvalidKey: 'Invalid API Key or Error',
    rpdbGetKey: 'Get your RPDB API key here',
    rpdbGetKeyOpen: 'Get your OpenPosterDB API key here',
    rpdbStyleLabel: 'Poster Style',
    rpdbStyleDefault: 'Default (Title & Ratings)',
    rpdbStyleRatings: 'Ratings Only',
    rpdbStyleClean: 'Clean (No Overlay)',
    // Global Settings
    globalTitle: 'Global Settings',
    catalogPrefixLabel: 'Catalog Name Prefix',
    catalogPrefixPlaceholder: 'e.g. Cagelog',
    catalogPrefixHint: 'Catalogs will appear as',
    hideAddonNameLabel: 'Hide Addon Name',
    hideHyphenLabel: 'Hide Hyphen',
    posterLanguageLabel: 'Poster Language',
  },
  it: {
    sub: 'I tuoi attori, registi e saghe preferite su Stremio',
    catalogsTitle: 'I Tuoi Cataloghi',
    emptyCatalogs: 'Nessun catalogo aggiunto. Usa la ricerca qui sotto per iniziare.',
    addCatalogLabel: 'Aggiungi nuovo catalogo',
    searchActor: '👤 Attore/Regista',
    searchCollection: '🎞️ Saga (Collection)',
    searchActorPlaceholder: 'Cerca Nicolas Cage, Steven Spielberg...',
    searchCollectionPlaceholder: 'Cerca Harry Potter, Star Wars...',
    searching: 'Ricerca in corso...',
    noResults: 'Nessun risultato.',
    typeActor: 'Attore',
    typeDirector: 'Regista / Crew',
    typeSaga: 'Saga Cinematografica',
    installTitle: 'URL Addon — pronto per l\'installazione',
    installPlaceholder: 'Aggiungi almeno un catalogo per generare il tuo link...',
    installStremio: 'Installa in Stremio',
    installWeb: 'Stremio Web',
    copyLink: 'Copia Link',
    copied: 'Copiato!',
    faqTitle: 'FREQUENTLY ASKED QUESTIONS',
    faq1q: 'Cos\'è Cagelog?',
    faq1a: 'Cagelog è un add-on per Stremio che ti permette di creare cataloghi personalizzati di film. Puoi tracciare tutti i film dei tuoi attori preferiti, seguire i tuoi registi del cuore o creare cataloghi per intere saghe cinematografiche (come Star Wars o Marvel) in ordine di uscita.',
    faq2q: 'Come funziona l\'ordinamento dei film?',
    faq2a: 'Per ogni catalogo di un attore o regista, puoi usare il menù a tendina vicino al cestino per cambiare l\'ordine in cui vengono mostrati i film. Puoi ordinarli dai più recenti, dai più vecchi, oppure per popolarità. Le saghe sono sempre ordinate cronologicamente.',
    faq3q: 'Ogni quanto si aggiornano i cataloghi?',
    faq3a: 'I cataloghi ordinati per data e popolarità si aggiornano automaticamente ogni volta che un nuovo film viene inserito su TMDB. Il catalogo "Casuale" rimescola il suo ordine esattamente ogni 24 ore a mezzanotte.',
    faq4q: 'Ho bisogno di una API Key?',
    faq4a: 'No! Cagelog funziona subito, senza bisogno di nessuna API key. Aggiungi i tuoi cataloghi e installa.',
    sortNewest: 'Più recenti',
    sortOldest: 'Meno recenti',
    sortPopular: 'Popolarità',
    sortRandom: 'Casuale (Giornaliero)',
    support: 'Supportami su Ko-fi',
    voteText: 'Supportami con un voto',
    // Ratings on Posters
    ratingsTitle: 'Rating sui Poster',
    ratingsDesc: 'Inserisci la tua API Key RPDB o OpenPosterDB per abilitare i poster con i rating di Letterboxd/IMDb.',
    rpdbProviderLabel: 'Provider',
    rpdbKeyLabel: 'API Key',
    rpdbVerify: 'Verifica',
    rpdbValidKey: 'API Key Valida',
    rpdbInvalidKey: 'API Key Non Valida o Errore',
    rpdbGetKey: 'Ottieni la tua API key RPDB qui',
    rpdbGetKeyOpen: 'Ottieni la tua API key OpenPosterDB qui',
    rpdbStyleLabel: 'Stile Poster',
    rpdbStyleDefault: 'Default (Titolo & Rating)',
    rpdbStyleRatings: 'Solo Rating',
    rpdbStyleClean: 'Pulito (Senza Overlay)',
    // Global Settings
    globalTitle: 'Impostazioni Globali',
    catalogPrefixLabel: 'Prefisso Nome Catalogo',
    catalogPrefixPlaceholder: 'es. Cagelog',
    catalogPrefixHint: 'I cataloghi appariranno come',
    hideAddonNameLabel: 'Nascondi Nome Addon',
    hideHyphenLabel: 'Nascondi Trattino',
    posterLanguageLabel: 'Lingua Poster',
  }
};

export default function ConfigPage() {
  const [uiLang, setUiLang] = useState<'it'|'en'>('en');
  const t = TRANSLATIONS[uiLang];

  const [config, setConfig] = useState<AddonConfig>(DEFAULT_CONFIG);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // RPDB Key state
  const [showRpdbKey, setShowRpdbKey] = useState(false);
  const [rpdbValidating, setRpdbValidating] = useState(false);
  const [rpdbStatus, setRpdbStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'person' | 'collection'>('person');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const restore = params.get('restore');
      if (restore) {
        const restored = decodeConfig(restore);
        setConfig(restored);
      }
    }
  }, []);

  useEffect(() => {
    if (!isConfigValid(config)) {
      setEncodedUrl('');
      return;
    }
    setEncodedUrl(`${baseUrl}/${encodeConfig(config)}/manifest.json`);
  }, [config, baseUrl]);

  const updateConfig = useCallback(<K extends keyof AddonConfig>(key: K, value: AddonConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  async function validateRpdbKey() {
    if (!config.rpdbKey) return;
    setRpdbValidating(true);
    setRpdbStatus('idle');
    try {
      const res = await fetch(`/api/validate-rpdb?key=${config.rpdbKey}&provider=${config.rpdbProvider || 'rpdb'}`);
      const data = await res.json();
      setRpdbStatus(data.valid ? 'ok' : 'err');
    } catch {
      setRpdbStatus('err');
    }
    setRpdbValidating(false);
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchType]);

  async function performSearch(query: string) {
    setIsSearching(true);
    try {
      const endpoint = searchType === 'person' ? '/api/search/person' : '/api/search/collection';
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&lang=${config.language}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Search error", err);
      setSearchResults([]);
    }
    setIsSearching(false);
  }

  function addCatalog(item: any) {
    const isPerson = searchType === 'person';
    let type: 'cast' | 'crew' | 'collection' = 'collection';
    
    if (isPerson) {
      type = item.knownFor === 'Acting' ? 'cast' : 'crew';
    }

    const newCatalog: CatalogEntry = {
      id: item.id,
      name: item.name,
      type,
      sort: config.sort || 'release_date.desc',
      image: item.profilePath || item.posterPath || undefined
    };

    if (!config.catalogs.some(c => c.id === newCatalog.id && c.type === newCatalog.type)) {
      updateConfig('catalogs', [...config.catalogs, newCatalog]);
    }
    setSearchQuery('');
    setSearchResults([]);
  }

  function removeCatalog(index: number) {
    const newCatalogs = [...config.catalogs];
    newCatalogs.splice(index, 1);
    updateConfig('catalogs', newCatalogs);
  }

  function renameCatalog(index: number, newName: string) {
    const newCatalogs = [...config.catalogs];
    newCatalogs[index] = { ...newCatalogs[index], name: newName };
    updateConfig('catalogs', newCatalogs);
  }

  function moveCatalog(index: number, direction: 'up' | 'down') {
    const newCatalogs = [...config.catalogs];
    const item = newCatalogs.splice(index, 1)[0];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newCatalogs.splice(newIndex, 0, item);
    updateConfig('catalogs', newCatalogs);
  }

  function setCatalogSort(index: number, sortMode: string) {
    const newCatalogs = [...config.catalogs];
    newCatalogs[index] = { ...newCatalogs[index], sort: sortMode };
    updateConfig('catalogs', newCatalogs);
  }

  async function handleCopy() {
    try { 
      await navigator.clipboard.writeText(encodedUrl); 
    } catch {
      const ta = document.createElement('textarea');
      ta.value = encodedUrl;
      document.body.appendChild(ta); 
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  };

  const CatalogItem = ({ item, index }: { item: CatalogEntry; index: number }) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.name);

    let typeLabel = '';
    if (item.type === 'cast') typeLabel = t.typeActor;
    if (item.type === 'crew') typeLabel = t.typeDirector;
    if (item.type === 'collection') typeLabel = t.typeSaga;

    const currentSort = item.sort || 'release_date.desc';
    const isCollection = item.type === 'collection';

    return (
      <div className="catalog-item">
        <div className="catalog-arrows">
          <button type="button" onClick={() => moveCatalog(index, 'up')} style={{ visibility: index > 0 ? 'visible' : 'hidden' }}>▲</button>
          <button type="button" onClick={() => moveCatalog(index, 'down')} style={{ visibility: index < config.catalogs.length - 1 ? 'visible' : 'hidden' }}>▼</button>
        </div>

        <div className="catalog-info" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {item.image ? (
            <img src={item.image} alt={item.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-3)', flexShrink: 0 }}>?</div>
          )}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="catalog-name-row">
              {editing ? (
                <input
                  autoFocus
                  className="catalog-name-input"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => { renameCatalog(index, editValue); setEditing(false); }}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                />
              ) : (
                <>
                  <span className="catalog-name" onClick={() => setEditing(true)}>{item.name}</span>
                  <button type="button" className="edit-btn" onClick={() => setEditing(!editing)}><PencilIcon /></button>
                </>
              )}
            </div>
            <div className="catalog-sub">{typeLabel}</div>
          </div>
        </div>

        <div className="catalog-right">
          {!isCollection && (
            <div style={{ marginRight: '10px', flexShrink: 0 }}>
              <select 
                className="select" 
                style={{ padding: '6px 10px', fontSize: '12px', height: 'auto', backgroundPosition: 'right 8px center', paddingRight: '28px' }}
                value={currentSort}
                onChange={(e) => setCatalogSort(index, e.target.value)}
              >
                <option value="release_date.desc">{t.sortNewest}</option>
                <option value="release_date.asc">{t.sortOldest}</option>
                <option value="popularity.desc">{t.sortPopular}</option>
                <option value="random">{t.sortRandom}</option>
              </select>
            </div>
          )}

          <button type="button" className="catalog-delete" onClick={() => removeCatalog(index)}>
            <TrashIcon />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: '8px', zIndex: 10 }}>
        <button className={`btn btn-sm ${uiLang === 'it' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setUiLang('it')}>IT</button>
        <button className={`btn btn-sm ${uiLang === 'en' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setUiLang('en')}>EN</button>
      </div>

      <div className="container">

        {/* ── Header ── */}
        <header className="header">
          <div className="logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <div className="logo-mark" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src="/icon.png" alt="Cagelog Logo" width={40} height={40} style={{ borderRadius: '10px' }} />
            </div>
            <span className="logo-name" style={{ marginRight: '8px' }}>Cagelog</span>
            <span style={{ fontSize: '13px', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, background: 'var(--surface-2)', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              v0.2.0
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}></span>
            </span>
          </div>
          <p className="header-sub">{t.sub}</p>
        </header>


        {/* ── Configurazione Cataloghi ── */}
        <div className="card">
          <div className="card-head">
            <div className="card-icon">📚</div>
            <span className="card-title">{t.catalogsTitle}</span>
          </div>
          <div className="card-body">
            
            <div className="catalog-list">
              {config.catalogs.length > 0 ? (
                config.catalogs.map((item, i) => (
                  <CatalogItem key={`${item.type}-${item.id}-${i}`} item={item} index={i} />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🍿</div>
                  <p className="empty-state-text">{t.emptyCatalogs}</p>
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="field">
              <label className="label">{t.addCatalogLabel}</label>
              
              <div className="input-row" style={{ marginBottom: '8px' }}>
                <button 
                  className={`btn btn-sm ${searchType === 'person' ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={() => setSearchType('person')}
                  style={{ flex: 1 }}
                >
                  {t.searchActor}
                </button>
                <button 
                  className={`btn btn-sm ${searchType === 'collection' ? 'btn-primary' : 'btn-ghost'}`} 
                  onClick={() => setSearchType('collection')}
                  style={{ flex: 1 }}
                >
                  {t.searchCollection}
                </button>
              </div>

              <input
                className="input"
                type="text"
                placeholder={searchType === 'person' ? t.searchActorPlaceholder : t.searchCollectionPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              {searchQuery && (
                <div className="search-results">
                  {isSearching ? (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>{t.searching}</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(item => (
                      <div key={item.id} className="search-item" onClick={() => addCatalog(item)}>
                        <img 
                          src={item.profilePath || item.posterPath || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'%3E%3Crect width='32' height='48' fill='%23333'/%3E%3C/svg%3E"} 
                          alt={item.name} 
                          className="search-item-img" 
                        />
                        <div className="search-item-info">
                          <span className="search-item-name">{item.name}</span>
                          {searchType === 'person' && item.knownForTitles && (
                            <span className="search-item-sub">{item.knownForTitles.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>{t.noResults}</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Ratings on Posters ── */}
        <div className="card">
          <div className="card-head">
            <div className="card-icon">⭐</div>
            <span className="card-title">{t.ratingsTitle}</span>
            <span className="card-badge">OPTIONAL</span>
          </div>
          <div className="card-body">
            <p className="card-desc">{t.ratingsDesc}</p>

            <div className="field">
              <label className="label">{t.rpdbProviderLabel}</label>
              <select
                className="select"
                value={config.rpdbProvider || 'rpdb'}
                onChange={e => {
                  updateConfig('rpdbProvider', e.target.value as 'rpdb' | 'openposterdb');
                  setRpdbStatus('idle');
                }}
              >
                <option value="rpdb">RPDB</option>
                <option value="openposterdb">OpenPosterDB</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="rpdb-key">{t.rpdbKeyLabel}</label>
              <div className="input-row">
                <div className="input-with-icon">
                  <input
                    id="rpdb-key"
                    className="input input-has-icon"
                    type={showRpdbKey ? 'text' : 'password'}
                    placeholder={config.rpdbProvider === 'openposterdb' ? 'e.g. opdb-...' : 'e.g. t1-xyz...'}
                    value={config.rpdbKey || ''}
                    onChange={e => { updateConfig('rpdbKey', e.target.value); setRpdbStatus('idle'); }}
                  />
                  <button className="input-icon-btn" onClick={() => setShowRpdbKey(v => !v)} title="Toggle visibility" type="button">
                    {showRpdbKey ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <button className="btn btn-primary btn-sm" onClick={validateRpdbKey} disabled={!config.rpdbKey || rpdbValidating}>
                  {rpdbValidating ? '…' : t.rpdbVerify}
                </button>
              </div>
              {rpdbStatus === 'ok'  && <p className="status-ok">✓ {t.rpdbValidKey}</p>}
              {rpdbStatus === 'err' && <p className="status-err">✗ {t.rpdbInvalidKey}</p>}
              <p className="input-hint">
                {config.rpdbProvider === 'openposterdb'
                  ? <a href="https://openposterdb.com" target="_blank" rel="noreferrer">{t.rpdbGetKeyOpen}</a>
                  : <a href="https://ratingposterdb.com" target="_blank" rel="noreferrer">{t.rpdbGetKey}</a>
                }.
              </p>
            </div>

            {config.rpdbKey && (
              <div className="field">
                <label className="label">{t.rpdbStyleLabel}</label>
                <select
                  className="select"
                  value={config.rpdbStyle || 'default'}
                  onChange={e => updateConfig('rpdbStyle', e.target.value)}
                >
                  <option value="default">{t.rpdbStyleDefault}</option>
                  <option value="ratings-only">{t.rpdbStyleRatings}</option>
                  <option value="clean">{t.rpdbStyleClean}</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Global Settings ── */}
        <div className="card">
          <div className="card-head">
            <div className="card-icon">⚙️</div>
            <span className="card-title">{t.globalTitle}</span>
          </div>
          <div className="card-body">
            <div className="settings-row">

              <div className="field">
                <label className="label" htmlFor="catalog-prefix">{t.catalogPrefixLabel}</label>
                <input
                  id="catalog-prefix"
                  className="input"
                  type="text"
                  placeholder={t.catalogPrefixPlaceholder}
                  value={config.catalogPrefix || ''}
                  onChange={e => updateConfig('catalogPrefix', e.target.value)}
                />
                {(config.catalogPrefix || config.hideAddonName !== undefined) && (
                  <p className="catalog-preview">
                    {t.catalogPrefixHint}{' '}
                    <strong>
                      {config.hideAddonName
                        ? 'Watchlist'
                        : config.hideHyphen
                          ? `${config.catalogPrefix || 'Cagelog'} Watchlist`
                          : `${config.catalogPrefix || 'Cagelog'} - Watchlist`
                      }
                    </strong>
                  </p>
                )}
              </div>

              <div className="toggle-row">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!config.hideAddonName}
                    onChange={e => updateConfig('hideAddonName', e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
                <span className="toggle-label">{t.hideAddonNameLabel}</span>
              </div>

              <div className="toggle-row">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!config.hideHyphen}
                    onChange={e => updateConfig('hideHyphen', e.target.checked)}
                  />
                  <span className="toggle-track" />
                </label>
                <span className="toggle-label">{t.hideHyphenLabel}</span>
              </div>

              <div className="field">
                <label className="label">{t.posterLanguageLabel}</label>
                <select className="select" value={config.language} onChange={e => updateConfig('language', e.target.value)}>
                  <option value="it-IT">🇮🇹 Italiano (it-IT)</option>
                  <option value="en-US">🇺🇸 English (en-US)</option>
                  <option value="es-ES">🇪🇸 Español (es-ES)</option>
                  <option value="fr-FR">🇫🇷 Français (fr-FR)</option>
                  <option value="de-DE">🇩🇪 Deutsch (de-DE)</option>
                  <option value="pt-BR">🇧🇷 Português (pt-BR)</option>
                  <option value="ja-JP">🇯🇵 日本語 (ja-JP)</option>
                  <option value="ko-KR">🇰🇷 한국어 (ko-KR)</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* ── Install Section ── */}
        <div className="install-card">
          <p className="install-title">📡 {t.installTitle}</p>

          <div className="install-url-box">
            {encodedUrl
              ? encodedUrl
              : <span className="install-url-placeholder">{t.installPlaceholder}</span>
            }
          </div>

          <div className="install-btns">
            <a
              href={encodedUrl ? `stremio://${encodedUrl.replace(/^https?:\/\//, '')}` : '#'}
              className="btn btn-primary install-btn-primary"
              style={!encodedUrl ? { pointerEvents: 'none', opacity: 0.4 } : {}}
            >
              {t.installStremio}
            </a>
            <a
              href={encodedUrl ? `https://web.stremio.com/#?addonOpen=${encodeURIComponent(encodedUrl)}` : '#'}
              className="btn btn-ghost install-btn-secondary"
              style={!encodedUrl ? { pointerEvents: 'none', opacity: 0.4 } : {}}
              target="_blank"
              rel="noreferrer"
            >
              {t.installWeb}
            </a>
          </div>

          <button
            className="btn btn-ghost install-copy-btn"
            onClick={handleCopy}
            disabled={!encodedUrl}
          >
            {copied ? `✓ ${t.copied}` : t.copyLink}
          </button>
        </div>

        {/* ── FAQ Section ── */}
        <div className="faq-section">
          <div className="faq-title">{t.faqTitle}</div>
          
          {[1, 2, 3, 4].map((num, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-q" onClick={() => toggleFaq(i)}>
                <span>{t[`faq${num}q` as keyof typeof t]}</span>
                <ChevronDownIcon />
              </button>
              <div className="faq-a">
                {t[`faq${num}a` as keyof typeof t]}
              </div>
            </div>
          ))}
        </div>

        {/* ── Donation Button ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          <a
            href="https://ko-fi.com/affogo"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              backgroundColor: '#FF5E5B',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(255, 94, 91, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minWidth: '200px',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 600,
            }}
          >
            <span>☕</span>
            <span>{t.support}</span>
          </a>
          <a
            href="https://stremio-addons.net/addons/cagelog"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              backgroundColor: '#8a5aeb',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(138, 90, 235, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minWidth: '200px',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 600,
            }}
          >
            <span>⭐</span>
            <span>{t.voteText}</span>
          </a>
        </div>

        <div className="faq-footer">
          Developed with ♥ for the Stremio community
        </div>

      </div>
    </div>
  );
}
