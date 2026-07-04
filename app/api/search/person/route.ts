import { NextResponse } from 'next/server';
import { searchPerson } from '@/lib/tmdb';

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
    const data = await searchPerson(q, TMDB_API_KEY, lang, page);
    let results = (data?.results || [])
      .filter((p: any) => p.known_for_department === 'Acting' || p.known_for_department === 'Directing' || p.known_for_department === 'Sound')
      .map((p: any) => ({
      id: p.id,
      name: p.name,
      knownFor: p.known_for_department,
      profilePath: p.profile_path
        ? `https://image.tmdb.org/t/p/w185${p.profile_path}`
        : null,
      knownForTitles: (p.known_for || [])
        .filter((m: any) => m.media_type === 'movie')
        .slice(0, 3)
        .map((m: any) => m.title || m.name),
      hasActing: p.known_for_department === 'Acting' || p.known_for_department === 'Directing',
      hasDirecting: p.known_for_department === 'Acting' || p.known_for_department === 'Directing',
      hasComposing: p.known_for_department === 'Sound',
      primaryRole: p.known_for_department, // used for highlighting the primary button
    }));

    return NextResponse.json({ results }, { headers: CORS });
  } catch (err) {
    console.error('[search/person]', err);
    return NextResponse.json({ results: [] }, { status: 500, headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}
