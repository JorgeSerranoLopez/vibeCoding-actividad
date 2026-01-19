import React from 'react';

interface BattleLogProps {
  logs: string[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  // Get the last log message
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : "What will\nMON do?";

  return (
    <div className="h-full w-full font-retro text-[10px] md:text-xs leading-5 uppercase text-[#0f380f] whitespace-pre-wrap">
      {lastLog}
      {logs.length > 0 && <span className="animate-bounce inline-block ml-1">▼</span>}
    </div>
  );
};