import type { ListType, ArtStyle } from '../types';

export const LIST_TYPES: { value: ListType; label: string }[] = [
  { value: 'NEW', label: 'New Coins' },
  { value: 'TOP_GAINERS', label: 'Top Gainers' },
  { value: 'TOP_VOLUME_24H', label: 'Top Volume' },
  { value: 'MOST_VALUABLE', label: 'Most Valuable' },
  { value: 'LAST_TRADED', label: 'Last Traded' },
  { value: 'LAST_TRADED_UNIQUE', label: 'Last Traded Unique' },
  { value: 'FEATURED', label: 'Featured' },
  { value: 'FEATURED_VIDEOS', label: 'Featured Videos' },
];

export const ART_STYLES: { value: ArtStyle; label: string }[] = [
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Fantasy', label: 'Fantasy Realm' },
  { value: 'Futuristic', label: 'Futuristic City' },
  { value: 'Abstract', label: 'Abstract Art' },
  { value: 'Retro Wave', label: 'Retro Wave' },
  { value: 'Sci-Fi', label: 'Sci-Fi Universe' }
];

export const ZORA_API_BASE = 'https://api-sdk.zora.engineering';
export const ZORA_COIN_BASE = 'https://zora.co/coin';

// Cloudflare credentials should be set as environment variables
export const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '';
export const CLOUDFLARE_API_TOKEN = import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '';
export const CLOUDFLARE_AI_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run`;

export const REFRESH_INTERVAL = 60000; // 60 seconds