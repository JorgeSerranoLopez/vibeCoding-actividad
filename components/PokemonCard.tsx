import React from 'react';
import { Pokemon } from '../types';
import { HealthBar } from './HealthBar';

interface PokemonCardProps {
  pokemon: Pokemon;
  isPlayer: boolean;
  isAttacking: boolean;
  isHit: boolean;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, isPlayer, isAttacking, isHit }) => {
  const spriteUrl = isPlayer ? pokemon.spriteBack : pokemon.spriteFront;

  // Animation classes
  const attackAnim = isAttacking ? (isPlayer ? 'translate-x-2 -translate-y-2' : '-translate-x-2 translate-y-2') : '';
  const hitAnim = isHit ? 'opacity-0' : 'opacity-100'; // Blinking effect

  return (
    <div className={`relative ${isPlayer ? 'w-[200px]' : 'w-[180px]'} h-[120px] font-retro text-[#0f380f]`}>
      
      {/* Sprite Layer */}
      <div className={`absolute ${isPlayer ? 'bottom-2 left-4' : 'top-8 right-4'} z-0`}>
         <img
          src={spriteUrl}
          alt={pokemon.name}
          className={`
            w-24 h-24 object-contain rendering-pixelated grayscale contrast-125
            transition-all duration-100
            ${attackAnim} ${hitAnim}
            ${isPlayer ? 'scale-125' : ''}
          `}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* HUD Layer - Opponent (Top Left) or Player (Bottom Right) */}
      <div className={`
        absolute z-10 bg-transparent
        ${isPlayer ? 'top-6 right-0' : 'top-0 left-0'}
      `}>
         {/* Name & Level */}
         <div className="flex justify-between items-baseline mb-1">
             <span className="font-bold text-xs uppercase tracking-tighter">{pokemon.name}</span>
             <span className="text-[10px] font-bold ml-2">:L50</span>
         </div>
         
         {/* HP Bar Container */}
         <div className="pl-2">
            <HealthBar current={pokemon.currentHp} max={pokemon.maxHp} />
            
            {/* Numerical HP for Player Only */}
            {isPlayer && (
                <div className="text-right text-[10px] font-bold mt-1 tracking-widest">
                    {Math.max(0, pokemon.currentHp)}/ {pokemon.maxHp}
                </div>
            )}
         </div>
      </div>

    </div>
  );
};