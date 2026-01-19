export interface PokemonStats {
  hp: number;
  attack: number;
}

export interface Pokemon {
  id: number;
  name: string;
  spriteFront: string;
  spriteBack: string;
  maxHp: number;
  currentHp: number;
  attack: number;
}

export enum Turn {
  PLAYER = 'PLAYER',
  OPPONENT = 'OPPONENT',
  GAMEOVER = 'GAMEOVER',
}

export enum GameState {
  SELECTING = 'SELECTING',
  BATTLING = 'BATTLING',
}

export interface PokemonListItem {
  name: string;
  url: string;
}

// Minimal interface for PokeAPI response
export interface PokeApiResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default: string | null;
  };
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}