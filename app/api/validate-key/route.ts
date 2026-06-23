import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/tmdb';

// The TMDB API key is loaded from environment variables only — never hardcoded in source
const TMDB_API_KEY = process.env.TMDB_API_KEY!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

export async function GET() {
  try {
    const valid = await validateApiKey(TMDB_API_KEY);
    return NextResponse.json({ valid }, { headers: CORS });
  } catch {
    return NextResponse.json({ valid: false }, { headers: CORS });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}
