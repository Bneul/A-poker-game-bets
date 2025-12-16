import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Card as CardType, GamePhase, PlayerAction, HandResult } from './types';
import { createDeck, evaluateHand } from './utils/pokerLogic';
import PlayerSeat from './components/PlayerSeat';
import PokerTable from './components/PokerTable';
import GameControls from './components/GameControls';
import { RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SMALL_BLIND = 10;
const BIG_BLIND = 20;

// Initial Players
const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'You', chips: 1000, bet: 0, cards: [], isBot: false, isActive: true, hasActed: false, lastAction: null, avatarUrl: 'https://picsum.photos/seed/p1/200' },
  { id: 'p2', name: 'Bot Alice', chips: 1000, bet: 0, cards: [], isBot: true, isActive: true, hasActed: false, lastAction: null, avatarUrl: 'https://picsum.photos/seed/p2/200' },
  { id: 'p3', name: 'Bot Bob', chips: 1000, bet: 0, cards: [], isBot: true, isActive: true, hasActed: false, lastAction: null, avatarUrl: 'https://picsum.photos/seed/p3/200' },
  { id: 'p4', name: 'Bot Charlie', chips: 1000, bet: 0, cards: [], isBot: true, isActive: true, hasActed: false, lastAction: null, avatarUrl: 'https://picsum.photos/seed/p4/200' },
  { id: 'p5', name: 'Bot Dave', chips: 1000, bet: 0, cards: [], isBot: true, isActive: true, hasActed: false, lastAction: null, avatarUrl: 'https://picsum.photos/seed/p5/200' },
];

const App: React.FC = () => {
  // Game State
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [dealerIdx, setDealerIdx] = useState(0);
  const [turnIdx, setTurnIdx] = useState(0); // Index of player whose turn it is
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [gameMessage, setGameMessage] = useState("Press 'Deal' to start");
  const [winner, setWinner] = useState<{ id: string, hand: HandResult } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Bot AI ---
  // Simple heuristic: 
  // - High random chance to fold if bet is high and hand is weak (not implemented fully for UI demo)
  // - Random delay to simulate thinking
  useEffect(() => {
    if (phase === 'idle' || phase === 'showdown') return;

    const currentPlayer = players[turnIdx];
    if (currentPlayer && currentPlayer.isBot && currentPlayer.isActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      timerRef.current = setTimeout(() => {
        const action = decideBotAction(currentPlayer, currentBet);
        handlePlayerAction(currentPlayer.id, action.type, action.amount);
      }, 1000 + Math.random() * 1000); // 1-2s delay
    }
  }, [turnIdx, phase, players, currentBet]);

  const decideBotAction = (player: Player, currentBet: number): { type: PlayerAction; amount?: number } => {
    const callAmount = currentBet - player.bet;
    const canCheck = callAmount === 0;
    
    // Very basic random behavior
    const roll = Math.random();
    
    if (canCheck) {
      if (roll > 0.8) return { type: 'raise', amount: currentBet + BIG_BLIND }; // 20% raise
      return { type: 'check' };
    } else {
      if (roll > 0.9) return { type: 'raise', amount: currentBet * 2 }; // 10% raise
      if (roll > 0.3) return { type: 'call' }; // 60% call
      return { type: 'fold' }; // 30% fold
    }
  };

  // --- Game Flow Control ---

  const startNewHand = useCallback(() => {
    // Reset state
    const newDeck = createDeck();
    setDeck(newDeck);
    setCommunityCards([]);
    setPot(0);
    setCurrentBet(BIG_BLIND);
    setWinner(null);
    setPhase('preflop');
    setGameMessage('Pre-Flop Round');

    // Rotate dealer
    const newDealerIdx = (dealerIdx + 1) % players.length;
    setDealerIdx(newDealerIdx);

    // Blinds
    const sbIdx = (newDealerIdx + 1) % players.length;
    const bbIdx = (newDealerIdx + 2) % players.length;
    const firstActorIdx = (newDealerIdx + 3) % players.length;

    const updatedPlayers = players.map((p, idx) => {
      // Deal 2 cards
      const hand = [newDeck.pop()!, newDeck.pop()!];
      let bet = 0;
      let chips = p.chips;
      
      if (idx === sbIdx) { bet = Math.min(chips, SMALL_BLIND); chips -= bet; }
      if (idx === bbIdx) { bet = Math.min(chips, BIG_BLIND); chips -= bet; }

      return {
        ...p,
        cards: hand,
        chips,
        bet,
        isActive: p.chips > 0, // Should be true unless busted before hand
        hasActed: false,
        lastAction: null,
      };
    });

    setPlayers(updatedPlayers);
    setPot(SMALL_BLIND + BIG_BLIND);
    setTurnIdx(firstActorIdx);
    setDeck(newDeck); // Update deck after dealing

  }, [players, dealerIdx]);

  const nextPhase = () => {
    // Collect bets into pot
    const newPot = pot + players.reduce((acc, p) => acc + p.bet, 0);
    setPot(newPot);
    
    // Reset player round bets
    const resetPlayers = players.map(p => ({ ...p, bet: 0, hasActed: false, lastAction: null }));
    setPlayers(resetPlayers);
    setCurrentBet(0);

    // Deal community cards
    const deckCopy = [...deck];
    let newCommunity = [...communityCards];

    if (phase === 'preflop') {
      // Burn 1? (Skip for simplicity)
      newCommunity = [...newCommunity, deckCopy.pop()!, deckCopy.pop()!, deckCopy.pop()!]; // Flop
      setPhase('flop');
      setGameMessage('The Flop');
    } else if (phase === 'flop') {
      newCommunity = [...newCommunity, deckCopy.pop()!]; // Turn
      setPhase('turn');
      setGameMessage('The Turn');
    } else if (phase === 'turn') {
      newCommunity = [...newCommunity, deckCopy.pop()!]; // River
      setPhase('river');
      setGameMessage('The River');
    } else if (phase === 'river') {
      setPhase('showdown');
      determineWinner(resetPlayers, communityCards, newPot);
      return;
    }

    setDeck(deckCopy);
    setCommunityCards(newCommunity);
    
    // Post-flop action starts with SB (or first active player after dealer)
    const firstActive = (dealerIdx + 1) % players.length;
    let nextTurn = firstActive;
    while (!resetPlayers[nextTurn].isActive) {
        nextTurn = (nextTurn + 1) % resetPlayers.length;
    }
    setTurnIdx(nextTurn);
  };

  const determineWinner = (currentPlayers: Player[], commCards: CardType[], currentPot: number) => {
    let bestScore = -1;
    let winnerId = '';
    let winningHand: HandResult | null = null;
    let bestPlayerName = '';

    currentPlayers.forEach(p => {
      if (p.isActive) {
        const result = evaluateHand(p.cards, commCards);
        if (result.score > bestScore) {
          bestScore = result.score;
          winnerId = p.id;
          winningHand = result;
          bestPlayerName = p.name;
        }
      }
    });

    if (winnerId && winningHand) {
      setGameMessage(`${bestPlayerName} wins with ${winningHand.description}!`);
      setWinner({ id: winnerId, hand: winningHand });
      
      // Pay the winner
      setPlayers(prev => prev.map(p => 
        p.id === winnerId ? { ...p, chips: p.chips + currentPot } : p
      ));
      setPot(0);
    }
  };

  const checkRoundComplete = (updatedPlayers: Player[]) => {
    const activePlayers = updatedPlayers.filter(p => p.isActive);
    
    // Check if everyone folded but one
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      setGameMessage(`${winner.name} wins (everyone folded)!`);
      const totalPot = pot + updatedPlayers.reduce((acc, p) => acc + p.bet, 0);
      setWinner({ id: winner.id, hand: { score: 0, name: 'Default', description: 'Last Man Standing' }});
      setPlayers(updatedPlayers.map(p => p.id === winner.id ? { ...p, chips: p.chips + totalPot, bet: 0 } : { ...p, bet: 0 }));
      setPot(0);
      setPhase('showdown');
      return;
    }

    // Check if betting is equalized and everyone has acted
    const allActed = activePlayers.every(p => p.hasActed || p.chips === 0); // all-in players don't need to act again if matched
    const maxBet = Math.max(...activePlayers.map(p => p.bet));
    const betsEqual = activePlayers.every(p => p.bet === maxBet || p.chips === 0);

    if (allActed && betsEqual) {
      setTimeout(nextPhase, 500);
    } else {
        // Next player
        let next = (turnIdx + 1) % updatedPlayers.length;
        while (!updatedPlayers[next].isActive || updatedPlayers[next].chips === 0) {
            // Check if loop completes (shouldn't happen if check above is correct)
             next = (next + 1) % updatedPlayers.length;
             // Safety break for single active all-in scenarios handled by recursion logic usually
             if (next === turnIdx) break; 
        }
        
        // Edge case: if next player is all-in, skip? No, they might have checked. 
        // Simplified: if current state is balanced, we move on. 
        // If we are here, someone needs to act.
        setTurnIdx(next);
    }
  };

  const handlePlayerAction = (playerId: string, actionType: PlayerAction, amount: number = 0) => {
    const playerIdx = players.findIndex(p => p.id === playerId);
    const player = players[playerIdx];
    let newBet = player.bet;
    let newChips = player.chips;

    if (actionType === 'fold') {
      player.isActive = false;
    } else if (actionType === 'check') {
        // Do nothing, just pass
    } else if (actionType === 'call') {
      const needed = currentBet - player.bet;
      const actual = Math.min(needed, player.chips);
      newBet += actual;
      newChips -= actual;
    } else if (actionType === 'raise') {
      const totalBet = amount; // Input is "Raise To X"
      const added = totalBet - player.bet;
      newBet = totalBet;
      newChips -= added;
      setCurrentBet(totalBet);
      
      // Reset other players' hasActed status because raise re-opens betting
      // But only those who are still active
      players.forEach(p => { if(p.id !== playerId && p.isActive) p.hasActed = false; });
    }

    const updatedPlayers = [...players];
    updatedPlayers[playerIdx] = {
      ...player,
      chips: newChips,
      bet: newBet,
      hasActed: true,
      lastAction: actionType
    };

    setPlayers(updatedPlayers);
    checkRoundComplete(updatedPlayers);
  };

  // Helper to place players around the table
  const getPosition = (index: number) => {
    // Map array index to visual position relative to USER (index 0)
    // We assume User is always index 0 in the 'players' array state for now, 
    // or we shift visual indices so User is at 'bottom'.
    // Since we don't reorder the array, index 0 is always User.
    const positions: Array<'bottom' | 'top' | 'left' | 'right' | 'top-left' | 'top-right'> = [
        'bottom', 'right', 'top-right', 'top-left', 'left'
    ];
    return positions[index];
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white overflow-hidden relative selection:bg-yellow-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-green-900 via-slate-900 to-black opacity-80 z-0" />
      
      {/* Navbar / HUD */}
      <nav className="absolute top-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex flex-col">
            <h1 className="text-2xl font-serif text-yellow-500 font-bold tracking-wider drop-shadow-md">ROYAL HOLD'EM</h1>
            <p className="text-slate-400 text-xs">Room #842 • Limit $10/$20</p>
        </div>
        <div className="pointer-events-auto">
            <button 
                onClick={startNewHand} 
                disabled={phase !== 'idle' && phase !== 'showdown'}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg transition-all"
            >
                <RotateCcw size={16} />
                {phase === 'idle' ? 'Start Game' : 'Next Hand'}
            </button>
        </div>
      </nav>

      {/* Main Game Area */}
      <main className="absolute inset-0 flex items-center justify-center p-4">
         <div className="relative w-full max-w-5xl aspect-video">
             
             {/* The Table */}
             <PokerTable communityCards={communityCards} pot={pot} />

             {/* Players */}
             {players.map((p, idx) => (
                <PlayerSeat 
                  key={p.id}
                  player={p}
                  position={getPosition(idx)}
                  isCurrentTurn={phase !== 'showdown' && phase !== 'idle' && idx === turnIdx}
                  isDealer={idx === dealerIdx}
                  winner={winner?.id === p.id}
                />
             ))}

             {/* Game Message / Toast */}
             <AnimatePresence>
                {gameMessage && (
                  <motion.div 
                    key={gameMessage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-[60%] left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/10 z-30 pointer-events-none"
                  >
                    <span className="font-semibold tracking-wide">{gameMessage}</span>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Winner Overlay - Big Celebration */}
             {winner && (
               <div className="absolute top-[40%] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-bounce">
                  <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    {players.find(p => p.id === winner.id)?.name} WINS!
                  </div>
                  <div className="text-white text-xl md:text-2xl font-serif mt-2 text-shadow">
                    {winner.hand.description}
                  </div>
               </div>
             )}

         </div>
      </main>

      {/* Controls (Only visible for User when it's their turn) */}
      <AnimatePresence>
        {players[0].isActive && turnIdx === 0 && phase !== 'showdown' && phase !== 'idle' && (
          <motion.div
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             exit={{ y: 100 }}
             className="z-50"
          >
            <GameControls 
                player={players[0]} 
                currentBet={currentBet} 
                pot={pot}
                onAction={(type, amt) => handlePlayerAction('p1', type as PlayerAction, amt)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;