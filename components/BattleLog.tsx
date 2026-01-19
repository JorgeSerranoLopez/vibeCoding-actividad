import React from 'react';

interface BattleLogProps {
  logs: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  // Get the last log message
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : "What will you do?";

  return (
    <div className="h-full w-full bg-white border-4 border-double border-black p-4 font-retro text-xs md:text-sm leading-6 uppercase text-black">
      {lastLog}
      {logs.length > 0 && <span className="animate-pulse ml-2 text-red-600">▼</span>}
    </div>
  );
};