import { Card, Rank, Suit, HandResult } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  RANKS.forEach((rank, rIndex) => {
    SUITS.forEach((suit) => {
      deck.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
        value: rIndex + 2, // 2=2, ..., A=14
      });
    });
  });
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// --- Hand Evaluator ---

const getRankValue = (rank: Rank): number => {
  const idx = RANKS.indexOf(rank);
  return idx + 2;
};

// Simplified evaluator returning a score and description
// Score format: Type (Million) + Tiebreakers
export const evaluateHand = (holeCards: Card[], communityCards: Card[]): HandResult => {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 5) return { score: 0, name: 'Waiting', description: 'Waiting for cards' };

  // Sort by value descending
  const sorted = allCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));

  // Check Flush
  const suits: Record<string, Card[]> = {};
  SUITS.forEach(s => suits[s] = []);
  sorted.forEach(c => suits[c.suit].push(c));
  const flushSuit = Object.keys(suits).find(s => suits[s].length >= 5);
  
  // Check Straight
  const uniqueValues = Array.from(new Set(sorted.map(c => getRankValue(c.rank))));
  let straightHigh = -1;
  // Check special Ace low straight (A, 5, 4, 3, 2)
  if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
     straightHigh = 5;
  }
  
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    const subset = uniqueValues.slice(i, i + 5);
    if (subset[0] - subset[4] === 4) {
      if (subset[0] > straightHigh) straightHigh = subset[0];
      break; // Found highest straight since sorted descending
    }
  }

  // Group by Rank (Pairs, Trips, Quads)
  const counts: Record<number, number> = {};
  sorted.forEach(c => {
    const val = getRankValue(c.rank);
    counts[val] = (counts[val] || 0) + 1;
  });
  
  const quads = Object.keys(counts).filter(k => counts[Number(k)] === 4).map(Number).sort((a,b) => b-a);
  const trips = Object.keys(counts).filter(k => counts[Number(k)] === 3).map(Number).sort((a,b) => b-a);
  const pairs = Object.keys(counts).filter(k => counts[Number(k)] === 2).map(Number).sort((a,b) => b-a);

  // 1. Straight Flush
  if (flushSuit && straightHigh > -1) {
     // Verify if the straight cards share the flush suit
     const flushCards = suits[flushSuit].sort((a,b) => getRankValue(b.rank) - getRankValue(a.rank));
     const flushValues = flushCards.map(c => getRankValue(c.rank));
     let sfHigh = -1;
     
     // Check normal straight flush
     for(let i=0; i<= flushValues.length - 5; i++) {
        if(flushValues[i] - flushValues[i+4] === 4) {
            sfHigh = flushValues[i];
            break;
        }
     }
     // Check wheel straight flush
     if(sfHigh === -1 && flushValues.includes(14) && flushValues.includes(5) && flushValues.includes(4) && flushValues.includes(3) && flushValues.includes(2)) {
         sfHigh = 5;
     }

     if (sfHigh > -1) {
         return { score: 8000000 + sfHigh, name: 'Straight Flush', description: sfHigh === 14 ? 'Royal Flush!' : `Straight Flush, ${sfHigh} High` };
     }
  }

  // 2. Four of a Kind
  if (quads.length > 0) {
      const kicker = sorted.find(c => getRankValue(c.rank) !== quads[0])!.value;
      return { score: 7000000 + quads[0] * 100 + kicker, name: 'Four of a Kind', description: `Four ${getRankName(quads[0])}s` };
  }

  // 3. Full House
  if (trips.length > 0 && (trips.length > 1 || pairs.length > 0)) {
      const tripVal = trips[0];
      const pairVal = trips.length > 1 ? trips[1] : pairs[0];
      return { score: 6000000 + tripVal * 100 + pairVal, name: 'Full House', description: `Full House, ${getRankName(tripVal)}s full of ${getRankName(pairVal)}s` };
  }

  // 4. Flush
  if (flushSuit) {
      const fCards = suits[flushSuit].slice(0, 5);
      const score = 5000000 + fCards.reduce((acc, c, i) => acc + c.value * Math.pow(15, 4-i), 0);
      return { score, name: 'Flush', description: `Flush, ${getRankName(fCards[0].value)} High` };
  }

  // 5. Straight
  if (straightHigh > -1) {
      return { score: 4000000 + straightHigh, name: 'Straight', description: `Straight, ${getRankName(straightHigh)} High` };
  }

  // 6. Three of a Kind
  if (trips.length > 0) {
      const kickers = sorted.filter(c => getRankValue(c.rank) !== trips[0]).slice(0, 2);
      return { score: 3000000 + trips[0] * 1000 + kickers[0].value * 10 + kickers[1].value, name: 'Three of a Kind', description: `Three ${getRankName(trips[0])}s` };
  }

  // 7. Two Pair
  if (pairs.length >= 2) {
      const highPair = pairs[0];
      const lowPair = pairs[1];
      const kicker = sorted.find(c => getRankValue(c.rank) !== highPair && getRankValue(c.rank) !== lowPair)!.value;
      return { score: 2000000 + highPair * 1000 + lowPair * 10 + kicker, name: 'Two Pair', description: `Two Pair, ${getRankName(highPair)}s and ${getRankName(lowPair)}s` };
  }

  // 8. One Pair
  if (pairs.length === 1) {
      const pairVal = pairs[0];
      const kickers = sorted.filter(c => getRankValue(c.rank) !== pairVal).slice(0, 3);
      const kScore = kickers.reduce((acc, c, i) => acc + c.value * Math.pow(15, 2-i), 0);
      return { score: 1000000 + pairVal * 10000 + kScore, name: 'Pair', description: `Pair of ${getRankName(pairVal)}s` };
  }

  // 9. High Card
  const highCards = sorted.slice(0, 5);
  const score = highCards.reduce((acc, c, i) => acc + c.value * Math.pow(15, 4-i), 0);
  return { score, name: 'High Card', description: `High Card ${getRankName(highCards[0].value)}` };
};

const getRankName = (val: number): string => {
    if (val <= 10) return String(val);
    if (val === 11) return 'Jack';
    if (val === 12) return 'Queen';
    if (val === 13) return 'King';
    if (val === 14) return 'Ace';
    return String(val);
}
