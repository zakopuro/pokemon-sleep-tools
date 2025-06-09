export type BreedingStatus = '完了' | '保留' | '中止' | '育成しない';

export interface BreedingTarget {
  subskills: number[];
  ingredients: number[];
  nature: string;
  level: number;
}

export interface BreedingPokemon {
  id: string;
  pokemonId: number;
  pokemonName: string;
  status: BreedingStatus;
  target: BreedingTarget;
  current: BreedingTarget;
  createdAt: string;
  updatedAt: string;
}

export interface BreedingData {
  pokemons: BreedingPokemon[];
}