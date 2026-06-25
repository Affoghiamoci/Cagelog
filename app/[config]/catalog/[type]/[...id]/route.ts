import { NextResponse } from 'next/server';
import { decodeConfig, isConfigValid } from '@/lib/config';
import { discoverByCast, discoverByCrew, getCollection, mapMovieToMeta, StremioMeta } from '@/lib/tmdb';
import demoCage from '@/lib/demo_cage.json';
import { trackEvent } from '@/lib/tracker';

// The TMDB API key is loaded from environment variables only — never hardcoded in source
const TMDB_API_KEY = process.env.TMDB_API_KEY!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const PAGE_SIZE = 20;

function skipToPage(skip: number): number {
  return Math.floor(skip / PAGE_SIZE) + 1;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffle(array: any[], seed: number) {
  let m = array.length, t, i;
  let currentSeed = seed;
  while (m) {
    i = Math.floor(seededRandom(currentSeed) * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    currentSeed++;
  }
  return array;
}

export async function GET(
  req: Request,
  { params }: { params: { config: string; type: string; id: string[] } }
) {
  let rawId = '';
  let skip = 0;

  for (const part of params.id) {
    if (part.startsWith('skip=')) {
      skip = parseInt(part.replace('skip=', '').replace('.json', ''), 10) || 0;
    } else if (!rawId) {
      rawId = part.replace(/\.json$/, '');
    }
  }

  const id = rawId;
  const page = skipToPage(skip);

  const config = decodeConfig(params.config);

  if (!isConfigValid(config)) {
    return NextResponse.json({ metas: [] }, { headers: CORS });
  }

  // Track this catalog request (fire-and-forget)
  trackEvent('cagelog', 'catalog_request', params.config);

  const apiKey = TMDB_API_KEY;
  const language = config.language || 'en-US';
  const underscoreIdx = id.indexOf('_');
  if (underscoreIdx === -1) {
    return NextResponse.json({ metas: [] }, { headers: CORS });
  }

  const personType = id.slice(0, underscoreIdx);
  const personId = parseInt(id.slice(underscoreIdx + 1), 10);

  if (isNaN(personId)) {
    return NextResponse.json({ metas: [] }, { headers: CORS });
  }

  const catalogEntry = config.catalogs.find(c => c.id === personId && c.type === personType);
  const sort = catalogEntry?.sort || config.sort || 'release_date.desc';

  try {
    let movies: any[] = [];

    if (!apiKey && personType === 'cast' && personId === 2963) {
      let allMovies = [...demoCage];
      if (sort === 'random') {
        const seed = Math.floor(Date.now() / 86400000) + personId;
        shuffle(allMovies, seed);
      }
      movies = allMovies.slice(skip, skip + PAGE_SIZE);
    } else if (personType === 'cast' || personType === 'crew') {
      if (sort === 'random') {
        const pages = await Promise.all(
          [1, 2, 3, 4].map(p => 
            personType === 'cast' 
              ? discoverByCast(personId, apiKey, 'popularity.desc', language, p)
              : discoverByCrew(personId, apiKey, 'popularity.desc', language, p)
          )
        );
        let allMovies = pages.flatMap(data => data?.results || []);
        
        const seen = new Set();
        allMovies = allMovies.filter(m => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });

        const seed = Math.floor(Date.now() / 86400000) + personId;
        shuffle(allMovies, seed);
        movies = allMovies.slice(skip, skip + PAGE_SIZE);
      } else {
        const data = personType === 'cast' 
          ? await discoverByCast(personId, apiKey, sort, language, page)
          : await discoverByCrew(personId, apiKey, sort, language, page);
        movies = data?.results || [];
      }
    } else if (personType === 'collection') {
      // Collections ignore global sort, they are always chronological
      const data = await getCollection(personId, apiKey, language);
      let allMovies = (data?.parts || []).sort((a: any, b: any) =>
        (a.release_date || '').localeCompare(b.release_date || '')
      );
      movies = allMovies.slice(skip, skip + PAGE_SIZE);
    } else {
      return NextResponse.json({ metas: [] }, { headers: CORS });
    }

    if (movies.length === 0) {
      return NextResponse.json({ metas: [] }, { headers: CORS });
    }

    const metas: StremioMeta[] = movies.map((movie) => mapMovieToMeta(movie));

    return NextResponse.json(
      { metas },
      {
        headers: {
          ...CORS,
          'Cache-Control': 'max-age=900, stale-while-revalidate=3600',
        },
      }
    );
  } catch (err) {
    console.error('[catalog] error:', err);
    return NextResponse.json({ metas: [] }, { headers: CORS });
  }
}
