import type { SubskillByLevel } from './pokemon';

export interface PokemonSettings {
  level: number;
  selectedIngredients: number[];
  subskillByLevel: SubskillByLevel;
  upParam: string;
  downParam: string;
  selectedNeutralNature: any;
  managementStatus: string;
  selectedMainSkillId: number;
  mainSkillLevel: number;
  memo: string;
}

// 1ポケモンあたり最大10個体の設定
export interface PokemonInstancesSettings {
  [instanceId: string]: PokemonSettings; // "1", "2", ..., "10"
}

// 全ポケモンの設定ストア
export interface PokemonSettingsStore {
  [pokemonKey: string]: PokemonInstancesSettings;
}
