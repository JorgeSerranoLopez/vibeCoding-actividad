import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full max-w-[120px]">
      <div className="flex items-center gap-1 bg-white border-2 border-[#0f380f] rounded-[2px] p-[1px]">
        <span className="text-[8px] font-bold text-[#0f380f] leading-none px-1">HP</span>
        <div className="flex-1 h-2 bg-white relative">
            <div 
                className="h-full bg-[#0f380f] transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
};