export interface Level {
  id: number;
  name: string;
  description: string;
  requiredJumps: number;
  bgColor: string; // Keep for fallback/overlay tint
  bgImage: string; // New image URL
  accentColor: string;
}

export enum GameState {
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED'
}

export interface SoldierState {
  isJumping: boolean;
  totalJumps: number;
}