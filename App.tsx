import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPokemon, getRandomPokemonId, fetchGen1PokemonList } from './services/pokeService';
import { Pokemon, Turn, GameState, PokemonListItem } from './types';
import { PokemonCard } from './components/PokemonCard';
import { BattleLog } from './components/BattleLog';

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
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animation states
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);

  // Load Pokemon List
  useEffect(() => {
    fetchGen1PokemonList().then(setPokemonList);
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

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
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const executeAttack = useCallback((attacker: Pokemon, defender: Pokemon, isPlayerTurn: boolean) => {
    const damage = calculateDamage(attacker.attack);
    const newHp = Math.max(0, defender.currentHp - damage);
    const isDefeated = newHp <= 0;

    // 1. Start Animation
    if (isPlayerTurn) {
      setPlayerAttacking(true);
    } else {
      setOpponentAttacking(true);
    }

    // 2. Impact (Mid-animation)
    setTimeout(() => {
      if (isPlayerTurn) {
        setPlayerAttacking(false);
        setOpponentHit(true);
        setTimeout(() => setOpponentHit(false), 200);
      } else {
        setOpponentAttacking(false);
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 200);
      }
    }, 250);

    // 3. Resolve Turn
    setTimeout(() => {
      addLog(`${attacker.name} used ATTACK!`);
      // Update HP
      if (isPlayerTurn) {
        setOpponent((prev) => prev ? { ...prev, currentHp: newHp } : null);
      } else {
        setPlayer((prev) => prev ? { ...prev, currentHp: newHp } : null);
      }

      if (isDefeated) {
        setTurn(Turn.GAMEOVER);
        addLog(`${defender.name} fainted!`);
        addLog(isPlayerTurn ? 'YOU WIN!' : 'YOU LOSE!');
        setIsProcessing(false); // Unlock for restart
      } else {
        const nextTurn = isPlayerTurn ? Turn.OPPONENT : Turn.PLAYER;
        setTurn(nextTurn);
        if (nextTurn === Turn.PLAYER) {
           setIsProcessing(false); // Unlock player input
        }
      }
    }, 600);
  }, []);

  const handlePlayerAttack = () => {
    if (turn !== Turn.PLAYER || isProcessing || !player || !opponent) return;
    setIsProcessing(true); // Lock input
    executeAttack(player, opponent, true);
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameState === GameState.BATTLING && turn === Turn.OPPONENT && player && opponent) {
      // AI "Thinking" delay
      const timer = setTimeout(() => {
        executeAttack(opponent, player, false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, gameState, player, opponent, executeAttack]);

  const resetGame = () => {
    setGameState(GameState.SELECTING);
    setPlayer(null);
    setOpponent(null);
    setLogs([]);
    setIsProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#9bbc0f] flex items-center justify-center font-retro">
        <div className="text-xl animate-pulse text-[#0f380f]">Loading...</div>
      </div>
    );
  }

  // --- SELECTION SCREEN ---
  if (gameState === GameState.SELECTING) {
    return (
      <div className="min-h-screen bg-[#9bbc0f] p-4 font-retro text-[#0f380f] flex flex-col items-center">
        <h1 className="text-xl md:text-3xl mb-6 mt-4 uppercase font-bold text-center border-b-4 border-[#0f380f] pb-2">
          Red Version
        </h1>
        <p className="mb-4 text-xs md:text-sm">Select your Pokemon</p>
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pokemonList.map((p) => (
                <button
                    key={p.name}
                    onClick={() => startGame(p.name)}
                    className="group relative p-3 bg-[#8bac0f] border-2 border-[#0f380f] hover:bg-[#306230] hover:text-[#9bbc0f] text-[10px] md:text-xs uppercase transition-colors text-left overflow-hidden shadow-lg"
                >
                    <span className="relative z-10">{p.name}</span>
                </button>
            ))}
        </div>
      </div>
    );
  }

  // --- BATTLE SCREEN ---
  return (
    <div className="min-h-screen bg-[#202020] flex items-center justify-center p-0 md:p-4 font-retro selection:bg-transparent">
      {/* GameBoy Device Body (Simulated Container) */}
      <div className="w-full max-w-[400px] bg-[#f8f9fa] border-[12px] border-[#9bbc0f] rounded shadow-2xl overflow-hidden flex flex-col">
        
        {/* Battle Viewport */}
        <div className="relative aspect-[10/9] bg-[#f8f9fa] flex flex-col border-b-4 border-[#0f380f]">
             {/* Subtle Grid Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#0f380f 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            
            {opponent && player && (
                <>
                {/* Opponent Section (Top Left) */}
                <div className="relative flex-1">
                    <div className="absolute top-2 left-2 z-10">
                        <PokemonCard 
                            pokemon={opponent} 
                            isPlayer={false} 
                            isAttacking={opponentAttacking} 
                            isHit={opponentHit} 
                        />
                    </div>
                </div>

                {/* Player Section (Bottom Right) */}
                <div className="relative flex-1">
                     <div className="absolute bottom-2 right-2 z-10">
                        <PokemonCard 
                            pokemon={player} 
                            isPlayer={true} 
                            isAttacking={playerAttacking} 
                            isHit={playerHit} 
                        />
                    </div>
                </div>
                </>
            )}
        </div>

        {/* Text Box Area */}
        <div className="h-32 bg-white border-t-4 border-[#0f380f] p-2 flex gap-2">
            
            {/* Dialog Box */}
            <div className="flex-[2] border-4 border-[#0f380f] rounded-sm p-1 relative bg-white shadow-inner">
                 <BattleLog logs={logs} />
            </div>

            {/* Menu Box */}
            <div className="flex-1 border-4 border-[#0f380f] rounded-sm bg-white p-1 relative">
                {turn === Turn.GAMEOVER ? (
                    <button 
                        onClick={resetGame}
                        className="w-full h-full flex items-center justify-center text-[10px] uppercase font-bold hover:bg-[#0f380f] hover:text-[#9bbc0f] transition-colors"
                    >
                        Restart
                    </button>
                ) : (
                    <div className="grid grid-cols-1 h-full">
                        <button 
                            onClick={handlePlayerAttack}
                            disabled={turn !== Turn.PLAYER || isProcessing}
                            className={`
                                text-left px-2 py-1 text-[10px] font-bold uppercase hover:bg-[#9bbc0f] flex items-center group
                                ${turn !== Turn.PLAYER || isProcessing ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {turn === Turn.PLAYER && !isProcessing && <span className="mr-1">▶</span>}
                            FIGHT
                        </button>
                        <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400">PKMN</div>
                        <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400">ITEM</div>
                        <div className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400">RUN</div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}