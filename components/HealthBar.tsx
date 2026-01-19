import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full flex items-center font-retro gap-1">
      <span className="text-[10px] font-bold">HP:</span>
      <div className="flex-1 h-3 border-2 border-black p-[1px] bg-white">
        <div
          className="h-full bg-black transition-all duration-200"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};