export interface CatalogEntry {
  id: number;
  name: string;
  type: 'cast' | 'crew' | 'collection';
  sort?: string;
  image?: string;
}

export interface AddonConfig {
  tmdbKey: string;
  language: string;
  sort: string;
  catalogs: CatalogEntry[];
  catalogOrder?: string[];
}

const DEFAULT_SORT = 'release_date.desc';
const DEFAULT_LANGUAGE = 'en-US';

export const DEFAULT_CONFIG: AddonConfig = {
  tmdbKey: '',
  language: DEFAULT_LANGUAGE,
  sort: DEFAULT_SORT,
  catalogs: [
    {
      id: 2963,
      name: 'Nicolas Cage',
      type: 'cast',
      sort: 'release_date.desc',
      image: 'https://image.tmdb.org/t/p/w185/ar33qcWbEpRn11SRI73EI8JEast.jpg'
    }
  ],
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
  const hasKey = typeof config.tmdbKey === 'string' && config.tmdbKey.length > 0;

  if (!hasKey && hasDemoCage) return true;

  return (
    hasKey &&
    Array.isArray(config.catalogs) &&
    config.catalogs.length > 0
  );
}
