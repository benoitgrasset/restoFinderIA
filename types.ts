export interface Review {
  author: string;
  rating: number;
  text: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount?: number;
  cuisine: string;
  priceLevel: string; // e.g., €€, €€€
  address: string;
  description: string;
  lat?: number;
  lng?: number;
  imageKeyword?: string; // For placeholder generation
  reviews?: Review[];
}

export interface SearchState {
  address: string;
  radius: number; // in km
  loading: boolean;
  error: string | null;
  results: Restaurant[];
  center: [number, number]; // [lat, lng]
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[]
    }
  }
}