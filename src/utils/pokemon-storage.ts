import type { PokemonSettings, PokemonSettingsStore, PokemonInstancesSettings } from '../types/pokemon-settings';
import type { SubskillByLevel } from '../types/pokemon';
import { SUBSKILL_LEVELS } from '../constants/pokemon';
import { getIngredient } from './pokemon';

const STORAGE_KEY = 'pokemon-sleep-settings';
const MAX_INSTANCES = 10; // 1ポケモンあたりの最大個体数

// ポケモンの一意キーを生成（ID + 名前の組み合わせ）
export const getPokemonKey = (pokemon: any): string => {
  if (typeof pokemon === 'object' && pokemon.id && pokemon.name) {
    return `${pokemon.id}-${pokemon.name}`;
  }
  return String(pokemon);
};

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
    managementStatus: '未設定',
    mainSkillLevel: 1
  };
};

// 旧形式データを新形式に移行
const migrateOldData = (data: any): PokemonSettingsStore => {
  const migrated: PokemonSettingsStore = {};
  
  for (const [pokemonKey, settings] of Object.entries(data)) {
    // 既に新形式の場合はそのまま
    if (typeof settings === 'object' && settings !== null && !('level' in settings)) {
      migrated[pokemonKey] = settings as PokemonInstancesSettings;
    } else {
      // 旧形式の場合は個体1番として保存
      migrated[pokemonKey] = {
        '1': settings as PokemonSettings
      };
    }
  }
  
  return migrated;
};

// 全ての設定を読み込み（新形式）
export const loadAllPokemonSettings = (): PokemonSettingsStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    return migrateOldData(parsed || {});
  } catch (error) {
    console.warn('Failed to load pokemon settings:', error);
    return {};
  }
};

// 特定のポケモンの特定個体の設定を読み込み
export const loadPokemonInstanceSettings = (pokemon: any, instanceId: string = '1'): PokemonSettings => {
  const allSettings = loadAllPokemonSettings();
  const pokemonKey = getPokemonKey(pokemon);
  const pokemonInstances = allSettings[pokemonKey];
  
  if (pokemonInstances && pokemonInstances[instanceId]) {
    return pokemonInstances[instanceId];
  }
  
  return createDefaultSettings(pokemon);
};

// 特定のポケモンの設定を読み込み（互換性のため、個体1番を返す）
export const loadPokemonSettings = (pokemon: any): PokemonSettings => {
  return loadPokemonInstanceSettings(pokemon, '1');
};

// 特定のポケモンの全個体設定を読み込み
export const loadAllInstancesForPokemon = (pokemon: any): PokemonInstancesSettings => {
  const allSettings = loadAllPokemonSettings();
  const pokemonKey = getPokemonKey(pokemon);
  return allSettings[pokemonKey] || {};
};

// 特定のポケモンの特定個体の設定を保存
export const savePokemonInstanceSettings = (pokemon: any, instanceId: string, settings: PokemonSettings): void => {
  try {
    const allSettings = loadAllPokemonSettings();
    const pokemonKey = getPokemonKey(pokemon);
    
    if (!allSettings[pokemonKey]) {
      allSettings[pokemonKey] = {};
    }
    
    allSettings[pokemonKey][instanceId] = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.warn('Failed to save pokemon instance settings:', error);
  }
};

// 特定のポケモンの設定を保存（互換性のため、個体1番に保存）
export const savePokemonSettings = (pokemon: any, settings: PokemonSettings): void => {
  savePokemonInstanceSettings(pokemon, '1', settings);
};

// 特定のポケモンの特定個体の設定を削除
export const deletePokemonInstanceSettings = (pokemon: any, instanceId: string): void => {
  try {
    const allSettings = loadAllPokemonSettings();
    const pokemonKey = getPokemonKey(pokemon);
    
    if (allSettings[pokemonKey]) {
      delete allSettings[pokemonKey][instanceId];
      
      // 個体が全て削除された場合はポケモンキー自体も削除
      if (Object.keys(allSettings[pokemonKey]).length === 0) {
        delete allSettings[pokemonKey];
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
    }
  } catch (error) {
    console.warn('Failed to delete pokemon instance settings:', error);
  }
};

// 特定のポケモンの設定を削除（互換性のため、全個体を削除）
export const deletePokemonSettings = (pokemon: any): void => {
  try {
    const allSettings = loadAllPokemonSettings();
    const pokemonKey = getPokemonKey(pokemon);
    delete allSettings[pokemonKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.warn('Failed to delete pokemon settings:', error);
  }
};

// 利用可能な個体番号を取得（1-10で未使用の番号）
export const getAvailableInstanceIds = (pokemon: any): string[] => {
  const instances = loadAllInstancesForPokemon(pokemon);
  const usedIds = Object.keys(instances);
  const availableIds: string[] = [];
  
  for (let i = 1; i <= MAX_INSTANCES; i++) {
    if (!usedIds.includes(i.toString())) {
      availableIds.push(i.toString());
    }
  }
  
  return availableIds;
};

// 次の利用可能な個体番号を取得
export const getNextAvailableInstanceId = (pokemon: any): string | null => {
  const available = getAvailableInstanceIds(pokemon);
  return available.length > 0 ? available[0] : null;
};

// 特定のポケモンの使用中個体番号一覧を取得
export const getUsedInstanceIds = (pokemon: any): string[] => {
  const instances = loadAllInstancesForPokemon(pokemon);
  return Object.keys(instances).sort((a, b) => parseInt(a) - parseInt(b));
};

// 全ての設定をクリア
export const clearAllSettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear all settings:', error);
  }
};