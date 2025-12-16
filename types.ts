export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number; // Numeric value for comparison
}

export type GamePhase = 'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface Player {
  id: string;
  name: string;
  chips: number;
  bet: number; // Current round bet
  cards: Card[];
  isBot: boolean;
  isActive: boolean; // Not folded
  hasActed: boolean; // Acted in current round
  lastAction: PlayerAction | null;
  avatarUrl: string;
}

export interface HandResult {
  score: number;
  name: string;
  description: string;
}

export interface Winner {
  playerId: string;
  handName: string;
  prize: number;
}