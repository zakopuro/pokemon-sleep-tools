import type { PokemonSettings, PokemonSettingsStore } from '../types/pokemon-settings';
import type { SubskillByLevel } from '../types/pokemon';
import { SUBSKILL_LEVELS } from '../constants/pokemon';
import { getIngredient } from './pokemon';

const STORAGE_KEY = 'pokemon-sleep-settings';

// ポケモンの所持食材を取得（重複排除）
const getPokemonIngredients = (pokemon: any) => {
  return [
    pokemon.ing1 ? getIngredient(pokemon.ing1.ingredientId) : null,
    pokemon.ing2 ? getIngredient(pokemon.ing2.ingredientId) : null,
    pokemon.ing3 ? getIngredient(pokemon.ing3.ingredientId) : null,
  ].filter(Boolean);
};

// デフォルト設定を生成
export const createDefaultSettings = (pokemon?: any): PokemonSettings => {
  // ポケモンが指定されている場合は、その所持食材をデフォルトにする
  let defaultIngredients: number[] = [];
  if (pokemon) {
    const ingredientIds = getPokemonIngredients(pokemon)
      .map(ing => ing?.id)
      .filter((id): id is number => id !== undefined);
    defaultIngredients = [...new Set(ingredientIds)];
  }

  return {
    level: 50,
    selectedIngredients: defaultIngredients,
    subskillByLevel: Object.fromEntries(SUBSKILL_LEVELS.map(lv => [lv, null])) as SubskillByLevel,
    upParam: 'なし',
    downParam: 'なし',
    selectedNeutralNature: null,
    managementStatus: '未設定'
  };
};

// 全ての設定を読み込み
export const loadAllPokemonSettings = (): PokemonSettingsStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    return parsed || {};
  } catch (error) {
    console.warn('Failed to load pokemon settings:', error);
    return {};
  }
};

// 特定のポケモンの設定を読み込み
export const loadPokemonSettings = (pokemonId: number, pokemon?: any): PokemonSettings => {
  const allSettings = loadAllPokemonSettings();
  return allSettings[pokemonId] || createDefaultSettings(pokemon);
};

// 特定のポケモンの設定を保存
export const savePokemonSettings = (pokemonId: number, settings: PokemonSettings): void => {
  try {
    const allSettings = loadAllPokemonSettings();
    allSettings[pokemonId] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.warn('Failed to save pokemon settings:', error);
  }
};

// 特定のポケモンの設定を削除
export const deletePokemonSettings = (pokemonId: number): void => {
  try {
    const allSettings = loadAllPokemonSettings();
    delete allSettings[pokemonId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.warn('Failed to delete pokemon settings:', error);
  }
};

// 全ての設定をクリア
export const clearAllSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear all settings:', error);
  }
};