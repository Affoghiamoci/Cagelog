export interface CatalogEntry {
  id: number;
  name: string;
  type: 'cast' | 'crew' | 'collection';
  sort?: string;
  image?: string;
}

export interface AddonConfig {
  // TMDB key is no longer stored in the public config — it's hardcoded server-side
  language: string;       // poster/catalog language (TMDB)
  sort: string;
  catalogs: CatalogEntry[];
  catalogOrder?: string[];

  // Ratings on Posters (RPDB / OpenPosterDB)
  rpdbKey?: string;
  rpdbProvider?: 'rpdb' | 'openposterdb';
  rpdbStyle?: string;

  // Global Settings
  catalogPrefix?: string;
  hideAddonName?: boolean;
  hideHyphen?: boolean;
}

const DEFAULT_SORT = 'release_date.desc';
const DEFAULT_LANGUAGE = 'en-US';

export const DEFAULT_CONFIG: AddonConfig = {
  language: DEFAULT_LANGUAGE,
  sort: DEFAULT_SORT,
  catalogs: [
    {
      id: 2963,
      name: 'Nicolas Cage',
      type: 'cast',
      sort: 'release_date.desc',
      image: '/cage.jpg'
    }
  ],
  rpdbKey: '',
  rpdbProvider: 'rpdb',
  rpdbStyle: 'default',
  catalogPrefix: 'Cagelog',
  hideAddonName: false,
  hideHyphen: false,
};

export function encodeConfig(config: AddonConfig): string {
  const json = JSON.stringify(config);
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeConfig(encoded: string): AddonConfig {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function isConfigValid(config: AddonConfig): boolean {
  const hasDemoCage = config.catalogs.some(c => c.id === 2963 && c.type === 'cast');

  // With hardcoded TMDB key, we only need at least one catalog
  if (hasDemoCage) return true;

  return (
    Array.isArray(config.catalogs) &&
    config.catalogs.length > 0
  );
}
