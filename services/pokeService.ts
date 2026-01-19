import { Pokemon, PokeApiResponse, PokemonListItem } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export const getRandomPokemonId = (): number => {
  return Math.floor(Math.random() * 151) + 1;
};

// Fetch list of first 151 Pokemon
export const fetchGen1PokemonList = async (): Promise<PokemonListItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}?limit=151`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch pokemon list", error);
    return [];
  }
};

const mapApiToPokemon = (data: PokeApiResponse): Pokemon => {
  const hpStat = data.stats.find((s) => s.stat.name === 'hp');
  const attackStat = data.stats.find((s) => s.stat.name === 'attack');

  // Basic stats or fallback values to ensure gameplay works
  const maxHp = hpStat ? hpStat.base_stat * 2 : 100; // Double HP for longer battles
  const attack = attackStat ? attackStat.base_stat : 50;

  return {
    id: data.id,
    name: data.name.toUpperCase(), // Original game used uppercase
    spriteFront: data.sprites.front_default || 'https://via.placeholder.com/96',
    spriteBack: data.sprites.back_default || data.sprites.front_default || 'https://via.placeholder.com/96',
    maxHp,
    currentHp: maxHp,
    attack,
  };
};

export const fetchPokemon = async (idOrName: number | string): Promise<Pokemon> => {
  try {
    const response = await fetch(`${BASE_URL}/${idOrName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon: ${idOrName}`);
    }
    const data: PokeApiResponse = await response.json();
    return mapApiToPokemon(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};