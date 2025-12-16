import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card?: CardType;
  hidden?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const suitIcons: Record<Suit, React.ReactNode> = {
  hearts: <Heart className="fill-current" />,
  diamonds: <Diamond className="fill-current" />,
  clubs: <Club className="fill-current" />,
  spades: <Spade className="fill-current" />,
};

const Card: React.FC<CardProps> = ({ card, hidden = false, className = '', style }) => {
  const isRed = card?.suit === 'hearts' || card?.suit === 'diamonds';

  return (
    <div className={`relative w-16 h-24 md:w-20 md:h-28 perspective-1000 ${className}`} style={style}>
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-500"
        initial={false}
        animate={{ rotateY: hidden ? 180 : 0 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col items-center justify-between p-1 select-none overflow-hidden">
          {card && (
            <>
              <div className={`text-xs md:text-sm font-bold w-full text-left flex flex-col leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                <span>{card.rank}</span>
                <span className="w-3 h-3 md:w-4 md:h-4">{suitIcons[card.suit]}</span>
              </div>
              
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl md:text-4xl ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                {suitIcons[card.suit]}
              </div>

              <div className={`text-xs md:text-sm font-bold w-full text-right flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                <span>{card.rank}</span>
                <span className="w-3 h-3 md:w-4 md:h-4">{suitIcons[card.suit]}</span>
              </div>
            </>
          )}
        </div>

        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-blue-800 rounded-lg shadow-lg border-2 border-white rotate-y-180 flex items-center justify-center">
            <div className="w-full h-full opacity-50" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #ffffff 5px, #ffffff 10px), repeating-linear-gradient(-45deg, transparent, transparent 5px, #ffffff 5px, #ffffff 10px)'
            }}></div>
            <div className="absolute w-8 h-8 md:w-10 md:h-10 bg-blue-900 rounded-full border-2 border-white/50 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xs md:text-sm">P</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Card;
