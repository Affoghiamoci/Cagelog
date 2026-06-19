import { NextResponse } from 'next/server';
import { decodeConfig, isConfigValid } from '@/lib/config';

export async function GET(
  req: Request,
  { params }: { params: { config: string } }
) {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  const config = decodeConfig(params.config);

  if (!isConfigValid(config)) {
    return NextResponse.json(
      { error: 'Configurazione non valida: inserisci la TMDB API key e almeno un catalogo.' },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        } 
      }
    );
  }

  const catalogs = config.catalogs.map((entry) => ({
    type: 'movie',
    id: `${entry.type}_${entry.id}`,
    name: entry.name,
    extra: [{ name: 'skip', isRequired: false }],
  }));

  if (Array.isArray(config.catalogOrder)) {
    catalogs.sort((a, b) => {
      const idxA = config.catalogOrder!.indexOf(a.id);
      const idxB = config.catalogOrder!.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  const manifest = {
    id: 'community.cagelog',
    version: '0.1.7',
    name: 'Cagelog',
    description: 'Your favorite actors, directors and sagas on Stremio',
    logo: `${baseUrl}/icon.png`,
    resources: ['catalog'],
    types: ['movie'],
    idPrefixes: ['tt', 'tmdb:'],
    catalogs,
    behaviorHints: {
      configurable: true,
      configurationRequired: false,
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
