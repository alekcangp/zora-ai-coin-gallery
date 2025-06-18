export interface ZoraCoin {
  contractAddress: string;
  name: string;
  description: string;
  imageUrl?: string;
  symbol?: string;
  creator?: string;
  createdAt?: string;
  volume?: number;
  priceChange?: number;
}

export interface CloudflareAIResponse {
  result: string | ArrayBuffer;
  success: boolean;
  errors?: string[];
}

export interface SummaryResponse {
  result: {
    summary: string;
  };
  success: boolean;
}

export interface ImageResponse {
  result: string;
  success: boolean;
  type?: string;
}

export type ListType = 'NEW' | 'TOP_GAINERS' | 'TOP_VOLUME_24H' | 'MOST_VALUABLE' | 'LAST_TRADED' | 'LAST_TRADED_UNIQUE' | 'FEATURED' | 'FEATURED_VIDEOS';

export type ArtStyle = 'Cyberpunk' | 'Fantasy' | 'Futuristic' | 'Abstract' | 'Retro Wave' | 'Sci-Fi';

export interface GeneratedArt {
  imageData: string;
  prompt: string;
  style: ArtStyle;
  timestamp: number;
}