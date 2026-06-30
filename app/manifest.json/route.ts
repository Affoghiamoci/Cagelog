import { NextResponse } from 'next/server';
import { version } from '../../../package.json';

export async function GET(req: Request) {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  const manifest = {
    id: 'community.cagelog',
    version,
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
    stremioAddonsConfig: {
      issuer: "https://stremio-addons.net",
      signature: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..aQby3h9HlafleLaiBRJ2ew.yyHt54n5d_5lk09zNeUC6CVnjElZ6ZA6SlCYaGSk7sXPbNfvc5cgCAkKPJ1kbY0wxyyk4_l7L0YlmPLX_wuZpAwQazyOlViLY8CPz_5jp8qP8WLfJSNM9I8LQRTVMWvz.1zQ_yhhsnO77NwR-K4yYTw"
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
