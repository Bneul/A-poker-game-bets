import React, { useState } from 'react';
import { Player } from '../types';

interface GameControlsProps {
  player: Player;
  currentBet: number;
  pot: number;
  onAction: (action: string, amount?: number) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ player, currentBet, pot, onAction }) => {
  const [raiseAmount, setRaiseAmount] = useState(Math.min(player.chips, currentBet * 2 || 100));

  const callAmount = currentBet - player.bet;
  const canCheck = callAmount === 0;
  const minRaise = currentBet > 0 ? currentBet * 2 : 100;
  const maxRaise = player.chips;

  const handleRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 pb-8 md:pb-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center justify-end z-40 pointer-events-auto">
      <div className="flex items-end gap-3 md:gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-2xl max-w-2xl w-full mx-auto">
        
        {/* Fold Button */}
        <button 
          onClick={() => onAction('fold')}
          className="flex-1 py-3 md:py-4 rounded-xl font-bold uppercase tracking-wider text-sm md:text-base transition-all bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1"
        >
          Fold
        </button>

        {/* Check/Call Button */}
        <button 
          onClick={() => onAction(canCheck ? 'check' : 'call')}
          className="flex-1 py-3 md:py-4 rounded-xl font-bold uppercase tracking-wider text-sm md:text-base transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_0_rgb(37,99,235)] active:shadow-none active:translate-y-1"
        >
          {canCheck ? 'Check' : `Call $${callAmount}`}
        </button>

        {/* Raise Control Group */}
        <div className="flex-[1.5] flex flex-col gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
           <div className="flex justify-between text-xs text-slate-400 px-1">
             <span>Min: {minRaise}</span>
             <span>Max: {maxRaise}</span>
           </div>
           <input 
             type="range" 
             min={minRaise} 
             max={maxRaise} 
             step={50}
             value={raiseAmount}
             onChange={handleRaiseChange}
             className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
           />
           <button 
             onClick={() => onAction('raise', raiseAmount)}
             className="w-full py-2 rounded-lg font-bold uppercase text-slate-900 bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-sm"
           >
             Raise To ${raiseAmount}
           </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
