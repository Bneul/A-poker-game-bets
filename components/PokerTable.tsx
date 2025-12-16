import React from 'react';
import Card from './Card';
import Chips from './Chips';
import { Card as CardType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface PokerTableProps {
  communityCards: CardType[];
  pot: number;
}

const PokerTable: React.FC<PokerTableProps> = ({ communityCards, pot }) => {
  return (
    <div className="relative w-full max-w-[1000px] aspect-[2/1] bg-[#276e36] rounded-[200px] border-[16px] border-[#3e2723] shadow-[inset_0_0_100px_rgba(0,0,0,0.6),0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center mx-auto my-auto isolate">
      {/* Felt Texture / Logo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none rounded-[180px] overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-yellow-400/30 rounded-full w-[40%] h-[60%] flex items-center justify-center">
             <span className="text-yellow-400/40 font-serif font-bold text-4xl tracking-widest text-center">TEXAS<br/>HOLD'EM</span>
         </div>
      </div>

      {/* Community Cards */}
      <div className="relative z-10 flex gap-2 md:gap-4 items-center justify-center min-h-[120px]">
        <AnimatePresence>
            {communityCards.map((card, idx) => (
                <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring' }}
                >
                    <Card card={card} />
                </motion.div>
            ))}
        </AnimatePresence>
        
        {/* Placeholders for cards if empty */}
        {communityCards.length === 0 && (
            <div className="text-green-900/30 font-bold text-sm uppercase tracking-widest absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                Deal in progress
            </div>
        )}
      </div>

      {/* Pot Display */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 bg-black/40 px-6 py-2 rounded-full border border-yellow-500/20 flex items-center gap-3 backdrop-blur-sm shadow-lg">
        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Pot</span>
        <span className="text-white text-lg md:text-xl font-bold font-mono">${pot}</span>
        <Chips amount={pot} className="scale-75 origin-bottom-left" />
      </div>

    </div>
  );
};

export default PokerTable;
