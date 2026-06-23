import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const apiKey = (url.searchParams.get('key') || '').trim();
  const provider = (url.searchParams.get('provider') || 'rpdb').trim();

  if (!apiKey) return NextResponse.json({ valid: false }, { headers: CORS });

  try {
    let valid = false;

    if (provider === 'rpdb') {
      // RPDB validation endpoint
      const res = await fetch(`https://api.ratingposterdb.com/${apiKey}/isValid`, {
        cache: 'no-store',
      });
      valid = res.ok;
    } else if (provider === 'openposterdb') {
      // OpenPosterDB validation endpoint
      const res = await fetch(`https://openposterdb.com/api/poster?type=movie&imdb=tt0137523&apikey=${apiKey}`, {
        cache: 'no-store',
      });
      valid = res.ok;
    }

    return NextResponse.json({ valid }, { headers: CORS });
  } catch {
    return NextResponse.json({ valid: false }, { headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}
