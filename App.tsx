import React, { useState, useEffect, useCallback } from 'react';
import { fetchPokemon, getRandomPokemonId, fetchGen1PokemonList } from './services/pokeService';
import { Pokemon, Turn, GameState, PokemonListItem } from './types';
import { PokemonCard } from './components/PokemonCard';
import { BattleLog } from './components/BattleLog';

// Helper to calculate damage
const calculateDamage = (attack: number): number => {
  const min = attack * 0.5;
  const max = attack;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.SELECTING);
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  
  const [player, setPlayer] = useState<Pokemon | null>(null);
  const [opponent, setOpponent] = useState<Pokemon | null>(null);
  const [turn, setTurn] = useState<Turn>(Turn.PLAYER);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Animation states
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);

  // Load Pokemon List on Mount
  useEffect(() => {
    fetchGen1PokemonList().then(setPokemonList);
  }, []);

  const startGame = async (pokemonName: string) => {
    setLoading(true);
    try {
      const playerPokemon = await fetchPokemon(pokemonName);
      const opponentPokemon = await fetchPokemon(getRandomPokemonId());

      setPlayer(playerPokemon);
      setOpponent(opponentPokemon);
      setLogs([`Wild ${opponentPokemon.name} appeared!`, `Go! ${playerPokemon.name}!`]);
      setTurn(Turn.PLAYER);
      setGameState(GameState.BATTLING);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const executeAttack = (attacker: Pokemon, defender: Pokemon, isPlayerTurn: boolean) => {
    const damage = calculateDamage(attacker.attack);
    const newHp = defender.currentHp - damage;
    const isDefeated = newHp <= 0;

    // Animations
    if (isPlayerTurn) {
      setPlayerAttacking(true);
      setTimeout(() => {
        setPlayerAttacking(false);
        setOpponentHit(true);
        setTimeout(() => setOpponentHit(false), 200); // Fast blink
      }, 200);
    } else {
      setOpponentAttacking(true);
      setTimeout(() => {
        setOpponentAttacking(false);
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 200);
      }, 200);
    }

    // Logic Update
    setTimeout(() => {
      addLog(`${attacker.name} used ATTACK!`);
      // We log damage in next step for suspense? No, keep simple.

      if (isPlayerTurn) {
        setOpponent((prev) => prev ? { ...prev, currentHp: newHp } : null);
      } else {
        setPlayer((prev) => prev ? { ...prev, currentHp: newHp } : null);
      }

      if (isDefeated) {
        setTurn(Turn.GAMEOVER);
        addLog(`${defender.name} fainted!`);
        addLog(isPlayerTurn ? 'YOU WIN!' : 'YOU LOSE!');
      } else {
        setTurn(isPlayerTurn ? Turn.OPPONENT : Turn.PLAYER);
      }
    }, 600);
  };

  const handlePlayerAttack = () => {
    if (turn !== Turn.PLAYER || !player || !opponent) return;
    executeAttack(player, opponent, true);
  };

  // AI Turn
  useEffect(() => {
    if (gameState === GameState.BATTLING && turn === Turn.OPPONENT && player && opponent) {
      const timeout = setTimeout(() => {
        executeAttack(opponent, player, false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, gameState, player, opponent]);

  const resetGame = () => {
    setGameState(GameState.SELECTING);
    setPlayer(null);
    setOpponent(null);
    setLogs([]);
  };

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#9bbc0f] flex items-center justify-center font-retro">
        <div className="text-xl animate-pulse text-[#0f380f]">Loading...</div>
      </div>
    );
  }

  // SELECTION SCREEN
  if (gameState === GameState.SELECTING) {
    return (
      <div className="min-h-screen bg-[#9bbc0f] p-4 font-retro text-[#0f380f] flex flex-col items-center">
        <h1 className="text-xl md:text-3xl mb-8 mt-4 uppercase font-bold text-center border-b-4 border-[#0f380f] pb-2">
          Choose Your Pokemon
        </h1>
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pokemonList.map((p) => (
                <button
                    key={p.name}
                    onClick={() => startGame(p.name)}
                    className="p-3 bg-[#8bac0f] border-2 border-[#0f380f] hover:bg-[#306230] hover:text-[#9bbc0f] text-xs uppercase transition-colors text-left"
                >
                    {p.name}
                </button>
            ))}
        </div>
      </div>
    );
  }

  // BATTLE SCREEN
  return (
    <div className="min-h-screen bg-[#202020] flex items-center justify-center p-0 md:p-4 font-retro">
      {/* GameBoy Screen Container */}
      <div className="w-full max-w-[500px] aspect-[10/9] bg-[#f8f9fa] border-8 border-gray-400 rounded-sm shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Screen Bezel Filter (Optional, keeping it clean for now) */}
        
        {/* BATTLE ARENA (Top 70%) */}
        <div className="flex-[2] relative border-b-4 border-black">
             {/* Background Grid Pattern for retro feel (CSS only) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            
            {opponent && player && (
                <>
                <div className="absolute top-0 left-0 w-full h-1/2">
                    <PokemonCard 
                        pokemon={opponent} 
                        isPlayer={false} 
                        isAttacking={opponentAttacking} 
                        isHit={opponentHit} 
                    />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1/2">
                     <PokemonCard 
                        pokemon={player} 
                        isPlayer={true} 
                        isAttacking={playerAttacking} 
                        isHit={playerHit} 
                    />
                </div>
                </>
            )}
        </div>

        {/* BOTTOM UI (Text Box + Menu) */}
        <div className="flex-1 bg-white p-2 flex gap-2">
            
            {/* TEXT BOX */}
            <div className="flex-[2] border-4 border-black rounded-sm relative">
                 <BattleLog logs={logs} />
            </div>

            {/* ACTION MENU */}
            <div className="flex-1 border-4 border-black rounded-sm p-2 flex flex-col gap-2 justify-center bg-white">
                {turn === Turn.GAMEOVER ? (
                     <button 
                     onClick={resetGame}
                     className="w-full h-full text-[10px] md:text-xs font-bold uppercase hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors"
                   >
                     RESTART
                   </button>
                ) : (
                    <>
                    <button 
                        onClick={handlePlayerAttack}
                        disabled={turn !== Turn.PLAYER}
                        className={`
                            h-full text-left pl-2 text-xs md:text-sm font-bold uppercase flex items-center group
                            ${turn !== Turn.PLAYER ? 'opacity-30' : 'hover:bg-gray-200'}
                        `}
                    >
                        {turn === Turn.PLAYER && <span className="mr-1 group-hover:visible">▶</span>}
                        FIGHT
                    </button>
                     {/* Decorative Buttons */}
                     <div className="text-gray-400 text-xs pl-4 uppercase">PKMN</div>
                     <div className="text-gray-400 text-xs pl-4 uppercase">ITEM</div>
                     <div className="text-gray-400 text-xs pl-4 uppercase">RUN</div>
                    </>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}