import { NextResponse } from 'next/server';
import { searchCollection } from '@/lib/tmdb';

// The TMDB API key is loaded from environment variables only — never hardcoded in source
const TMDB_API_KEY = process.env.TMDB_API_KEY!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const lang = (url.searchParams.get('lang') || 'en-US').trim();
  const page = parseInt(url.searchParams.get('page') || '1', 10);

  if (!q) return NextResponse.json({ results: [] }, { headers: CORS });

  try {
    const data = await searchCollection(q, TMDB_API_KEY, lang, page);
    const results = (data?.results || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      posterPath: c.poster_path
        ? `https://image.tmdb.org/t/p/w185${c.poster_path}`
        : null,
    }));
    return NextResponse.json({ results }, { headers: CORS });
  } catch (err) {
    console.error('[search/collection]', err);
    return NextResponse.json({ results: [] }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}
