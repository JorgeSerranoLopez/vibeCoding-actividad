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
  const attackAnim = isAttacking ? (isPlayer ? 'translate-x-4 -translate-y-4' : '-translate-x-4 translate-y-4') : '';
  const hitAnim = isHit ? 'invisible' : ''; // Old games used blinking/invisibility for hits

  return (
    <div className={`w-full h-full relative font-retro text-black`}>
      
      {/* HUD (Status Box) */}
      <div className={`
        absolute z-10 p-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]
        ${isPlayer ? 'bottom-8 right-4 w-[160px]' : 'top-4 left-4 w-[150px]'}
      `}>
        <h2 className="text-xs font-bold uppercase mb-1">{pokemon.name}</h2>
        <div className="text-[10px] mb-1">:L50</div>
        <HealthBar current={pokemon.currentHp} max={pokemon.maxHp} />
        {isPlayer && (
             <div className="text-right text-[10px] mt-1">{Math.max(0, pokemon.currentHp)}/ {pokemon.maxHp}</div>
        )}
      </div>

      {/* Sprite */}
      <div className={`
        absolute 
        ${isPlayer ? 'bottom-0 left-4' : 'top-12 right-4'}
      `}>
        <img
          src={spriteUrl}
          alt={pokemon.name}
          className={`
            w-32 h-32 object-contain rendering-pixelated grayscale contrast-125
            transition-transform duration-100
            ${attackAnim} ${hitAnim}
            ${isPlayer ? 'scale-150' : ''}
          `}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};