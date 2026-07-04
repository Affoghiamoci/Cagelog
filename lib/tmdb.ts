import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 43200, checkperiod: 600 }); // 12h TTL by default
const EXT_IDS_TTL = 604800; // 7 days for external IDs

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export interface StremioMeta {
  id: string;
  type: 'movie';
  name: string;
  poster?: string;
  releaseInfo?: string;
}

export function posterUrl(path: string | null | undefined, size = 'w500'): string | undefined {
  return path ? `${IMG_BASE}/${size}${path}` : undefined;
}

async function tmdbFetch<T>(path: string, apiKey: string, language: string, extraParams: Record<string, any> = {}, ttl?: number): Promise<T | null> {
  const keyPrefix = apiKey ? apiKey.slice(0, 8) : 'nokey';
  const queryStr = new URLSearchParams(extraParams).toString();
  const cacheKey = `tmdb:${keyPrefix}:${path}:${language}:${queryStr}`;

  const cached = cache.get<T>(cacheKey);
  if (cached) return cached;

  const urlParams = new URLSearchParams({ api_key: apiKey, language, ...extraParams });
  const url = `${TMDB_BASE}${path}?${urlParams.toString()}`;

  try {
    // Next.js fetch cache is automatically used in app router, but we also use node-cache 
    // to avoid limits or weird Next.js caching behavior when parameters change slightly.
    // Setting `cache: 'no-store'` forces fetch to run and node-cache handles caching in memory.
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data: T = await res.json();
    cache.set(cacheKey, data, ttl || 43200);
    return data;
  } catch (err) {
    console.error(`[TMDB] fetch error ${path}:`, err);
    return null;
  }
}

export async function discoverByCast(personId: number, apiKey: string, sort = 'release_date.desc', language = 'en-US', page = 1) {
  return tmdbFetch<any>('/discover/movie', apiKey, language, {
    with_cast: personId,
    sort_by: sort,
    page,
    'vote_count.gte': 5,
  });
}

export async function discoverByCrew(personId: number, apiKey: string, sort = 'release_date.desc', language = 'en-US', page = 1) {
  return tmdbFetch<any>('/discover/movie', apiKey, language, {
    with_crew: personId,
    sort_by: sort,
    page,
    'vote_count.gte': 5,
  });
}

export async function discoverByKeyword(keywordId: number, apiKey: string, sort = 'release_date.desc', language = 'en-US', page = 1) {
  return tmdbFetch<any>('/discover/movie', apiKey, language, {
    with_keywords: keywordId,
    sort_by: sort,
    page,
    'vote_count.gte': 5,
  });
}
export async function discoverByGenre(genreId: number, apiKey: string, sort = 'release_date.desc', language = 'en-US', page = 1) {
  return tmdbFetch<any>('/discover/movie', apiKey, language, {
    with_genres: genreId,
    sort_by: sort,
    page,
    'vote_count.gte': 5,
  });
}

export async function getCollection(collectionId: number, apiKey: string, language = 'en-US') {
  return tmdbFetch<any>(`/collection/${collectionId}`, apiKey, language);
}

export async function searchPerson(query: string, apiKey: string, language = 'en-US', page = 1) {
  return tmdbFetch<any>('/search/person', apiKey, language, { query, page }, 3600);
}

export async function searchCollection(query: string, apiKey: string, language = 'en-US', page = 1) {
  return tmdbFetch<any>('/search/collection', apiKey, language, { query, page }, 3600);
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${TMDB_BASE}/configuration?api_key=${apiKey}`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export function mapMovieToMeta(movie: any): StremioMeta {
  return {
    id: `tmdb:${movie.id}`,
    type: 'movie',
    name: movie.title || movie.name || 'Sconosciuto',
    poster: posterUrl(movie.poster_path, 'w500'),
    releaseInfo: movie.release_date ? movie.release_date.split('-')[0] : undefined,
  };
}
