import { encodeConfig, decodeConfig } from './lib/config';

const conf = {
  language: 'it-IT',
  sort: 'release_date.desc',
  catalogs: [
    { id: -112339, name: 'Slasher', type: 'crew', sort: 'release_date.desc', image: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🪓</text></svg>`)}` }
  ]
};

const enc = encodeConfig(conf as any);
console.log("Encoded:", enc);
console.log("Decoded:", decodeConfig(enc));
