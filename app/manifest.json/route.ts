import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  const manifest = {
    id: 'community.cagelog',
    version: '0.1.6',
    name: 'Cagelog',
    description: 'Your favorite actors, directors and sagas on Stremio',
    logo: `${baseUrl}/icon.png`,
    resources: ['catalog'],
    types: ['movie'],
    idPrefixes: ['tt', 'tmdb:'],
    catalogs: [],
    behaviorHints: {
      configurable: true,
      configurationRequired: true,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Cache-Control': 'max-age=86400',
    },
  });
}
