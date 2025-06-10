import type { SubskillByLevel } from './pokemon';

export interface PokemonSettings {
  level: number;
  selectedIngredients: number[];
  subskillByLevel: SubskillByLevel;
  upParam: string;
  downParam: string;
  selectedNeutralNature: any;
  managementStatus: string;
}

export interface PokemonSettingsStore {
  [pokemonKey: string]: PokemonSettings;
}