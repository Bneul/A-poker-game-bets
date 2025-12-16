import React from 'react';

interface ChipsProps {
  amount: number;
  className?: string;
}

const ChipStack: React.FC<{ color: string; count: number; value: number }> = ({ color, count, value }) => {
  return (
    <div className="relative flex flex-col-reverse -space-y-3 items-center mx-0.5">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 md:w-5 md:h-5 rounded-full border border-dashed border-white/40 shadow-sm flex items-center justify-center text-[6px] text-white font-bold select-none ${color}`}
          style={{ transform: `translateY(${i * -2}px)` }}
        >
        </div>
      ))}
    </div>
  );
};

const Chips: React.FC<ChipsProps> = ({ amount, className }) => {
  // Simplified chip logic
  const thousands = Math.floor(amount / 1000);
  const hundreds = Math.floor((amount % 1000) / 100);
  const fifties = Math.floor((amount % 100) / 50);
  const tens = Math.floor((amount % 50) / 10);
  const ones = amount % 10;

  if (amount === 0) return null;

  return (
    <div className={`flex items-end ${className}`}>
        {thousands > 0 && <ChipStack count={thousands} color="bg-orange-500" value={1000} />}
        {hundreds > 0 && <ChipStack count={hundreds} color="bg-slate-800" value={100} />}
        {fifties > 0 && <ChipStack count={fifties} color="bg-blue-600" value={50} />}
        {tens > 0 && <ChipStack count={tens} color="bg-red-600" value={10} />}
        {ones > 0 && <ChipStack count={ones} color="bg-white text-black" value={1} />}
    </div>
  );
};

export default Chips;