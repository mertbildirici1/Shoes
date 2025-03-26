export interface Shoe {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  size: string;
  fit: 'too small' | 'perfect' | 'too large';
  created_at: string;
}

export interface SizeRecommendation {
  recommendedSize: string;
  confidence: number;
  basedOn: Shoe[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
} 