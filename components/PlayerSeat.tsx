import React from 'react';
import { Player } from '../types';
import Card from './Card';
import Chips from './Chips';
import { motion } from 'framer-motion';

interface PlayerSeatProps {
  player: Player;
  position: 'bottom' | 'top' | 'left' | 'right' | 'top-left' | 'top-right';
  isCurrentTurn: boolean;
  isDealer: boolean;
  winner?: boolean;
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({ player, position, isCurrentTurn, isDealer, winner }) => {
  
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'top': return 'top-8 left-1/2 -translate-x-1/2 flex-col-reverse';
      case 'left': return 'left-4 top-1/2 -translate-y-1/2 flex-row-reverse';
      case 'right': return 'right-4 top-1/2 -translate-y-1/2';
      case 'top-left': return 'top-12 left-12';
      case 'top-right': return 'top-12 right-12';
      default: return '';
    }
  };

  const isUser = !player.isBot;

  return (
    <div className={`absolute flex flex-col items-center gap-2 ${getPositionStyles()}`}>
      
      {/* Cards Area */}
      <div className="relative h-24 w-28 md:h-28 md:w-32">
        {player.cards.map((card, idx) => (
          <motion.div
            key={card.id || idx}
            initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: idx * 25 - 12, 
              y: idx * 5,
              rotate: idx * 10 - 5
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute top-0 left-1/2 -ml-8 md:-ml-10"
          >
             <Card 
               card={card} 
               hidden={player.isBot && player.isActive && !winner && player.cards.length > 0} 
               className={winner ? "ring-4 ring-yellow-400 rounded-lg" : ""}
             />
          </motion.div>
        ))}
      </div>

      {/* Avatar & Info */}
      <div className={`relative flex flex-col items-center ${player.isActive ? 'opacity-100' : 'opacity-50 grayscale'}`}>
        
        {/* Chips Bet Display */}
        {player.bet > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 bg-black/60 px-3 py-1 rounded-full border border-yellow-500/30 backdrop-blur-sm z-10 flex items-center gap-2"
          >
            <Chips amount={player.bet} />
            <span className="text-yellow-400 font-bold text-xs md:text-sm">${player.bet}</span>
          </motion.div>
        )}

        <div className={`
          relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 overflow-hidden bg-slate-800 transition-all duration-300
          ${isCurrentTurn ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110' : 'border-slate-600'}
          ${!player.isActive ? 'border-red-900/50' : ''}
        `}>
          <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
          
          {/* Dealer Button */}
          {isDealer && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-slate-900 flex items-center justify-center shadow-md z-20">
              <span className="text-[10px] font-bold text-slate-900">D</span>
            </div>
          )}
        </div>

        {/* Player Stats */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1 mt-2 text-center min-w-[100px] shadow-lg backdrop-blur-md">
          <div className="text-white font-bold text-xs md:text-sm truncate max-w-[100px]">{player.name}</div>
          <div className="text-yellow-500 text-xs font-mono">${player.chips}</div>
        </div>

        {/* Last Action Badge */}
        {player.lastAction && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 -right-2 bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-lg border border-blue-400"
          >
            {player.lastAction}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlayerSeat;
