import { useMemo } from 'react';
import { POKEMONS, MAINSKILLS } from '../config';
import type { Pokemon } from '../../config/schema';
import type { FilterOptions } from '../components/PokemonFilters';

export const usePokemonFiltering = (filters: FilterOptions, activeTab: string) => {
  const filteredPokemons = useMemo(() => {
    let filtered = [...POKEMONS];

    // まずタブによるフィルタリングを適用
    filtered = getFilteredPokemonsByTab(filtered, activeTab);

    // 名前フィルター
    if (filters.name) {
      filtered = filtered.filter(pokemon => 
        pokemon.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // 新しいとくいなものフィルター（複数選択対応）
    if (filters.specialties && filters.specialties.length > 0) {
      filtered = filtered.filter(pokemon => 
        filters.specialties.includes(pokemon.specialty)
      );
    }

    // 旧来のとくいなものフィルター（互換性のため）
    if (filters.specialty !== 'すべて') {
      filtered = filtered.filter(pokemon => pokemon.specialty === filters.specialty);
    }

    // きのみフィルター（複数選択対応）
    if (filters.berries && filters.berries.length > 0) {
      filtered = filtered.filter(pokemon => 
        filters.berries.includes(pokemon.berryId.toString())
      );
    }

    // 食材フィルター（複数選択対応、AND/OR検索対応）
    if (filters.ingredients && filters.ingredients.length > 0) {
      if (filters.ingredientsAndSearch) {
        // AND検索：すべての食材を含む
        filtered = filtered.filter(pokemon => {
          const pokemonIngredients = [
            pokemon.ing1?.ingredientId.toString(),
            pokemon.ing2?.ingredientId.toString(),
            pokemon.ing3?.ingredientId.toString()
          ].filter(Boolean);
          
          return filters.ingredients.every(ingredientId => 
            pokemonIngredients.includes(ingredientId)
          );
        });
      } else {
        // OR検索：いずれかの食材を含む
        filtered = filtered.filter(pokemon => {
          const pokemonIngredients = [
            pokemon.ing1?.ingredientId.toString(),
            pokemon.ing2?.ingredientId.toString(),
            pokemon.ing3?.ingredientId.toString()
          ].filter(Boolean);
          
          return filters.ingredients.some(ingredientId => 
            pokemonIngredients.includes(ingredientId)
          );
        });
      }
    }

    // メインスキルフィルター（minorclassでフィルター）
    if (filters.mainSkills && filters.mainSkills.length > 0) {
      filtered = filtered.filter(pokemon => {
        // ポケモンのメインスキルIDから該当するスキルを見つける
        const pokemonSkill = MAINSKILLS.find((skill: any) => skill.id === pokemon.mainSkillId);
        if (!pokemonSkill) return false;
        
        // 選択されたminorclassのいずれかと一致するかチェック
        return filters.mainSkills.includes(pokemonSkill.minorclass);
      });
    }

    // サブスキルフィルター（現在のスキーマではサブスキル情報が無いため、将来の拡張用として残す）
    if (filters.subSkills && filters.subSkills.length > 0) {
      // TODO: ポケモンスキーマにサブスキル情報が追加されたら実装
      // 現在は何もフィルタリングしない
    }

    // 旧来のフィルター（互換性のため、新しいフィルターが無い場合のみ）
    if (filters.berry && (!filters.berries || filters.berries.length === 0)) {
      filtered = filtered.filter(pokemon => pokemon.berryId.toString() === filters.berry);
    }

    if (filters.ingredient && (!filters.ingredients || filters.ingredients.length === 0)) {
      filtered = filtered.filter(pokemon =>
        pokemon.ing1?.ingredientId.toString() === filters.ingredient ||
        pokemon.ing2?.ingredientId.toString() === filters.ingredient ||
        pokemon.ing3?.ingredientId.toString() === filters.ingredient
      );
    }

    if (filters.nature) {
      // 性格フィルタリングは育成情報で設定されたもののみ
    }

    // 最終進化フィルタリング
    if (filters.finalEvolution !== 'すべて') {
      if (filters.finalEvolution === '最終進化のみ') {
        filtered = filtered.filter(pokemon => pokemon.isFinalEvolution);
      } else if (filters.finalEvolution === '進化前のみ') {
        filtered = filtered.filter(pokemon => !pokemon.isFinalEvolution);
      }
    }

    // ソート前に特別な姿のポケモンを正しい順序に配置
    filtered.sort((a, b) => {
      // まず図鑑番号でソート
      if (a.pokedexId !== b.pokedexId) {
        return a.pokedexId - b.pokedexId;
      }
      
      // 同じ図鑑番号の場合、通常の姿を先に、特別な姿を後に
      const aIsSpecial = a.name.includes('(');
      const bIsSpecial = b.name.includes('(');
      
      if (aIsSpecial !== bIsSpecial) {
        return aIsSpecial ? 1 : -1; // 通常の姿が先
      }
      
      // 両方特別な姿の場合は名前順
      return a.name.localeCompare(b.name, 'ja');
    });

    // ユーザー指定のソートを適用
    if (filters.sortBy !== 'id') {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'sleepType':
            aValue = a.sleepType;
            bValue = b.sleepType;
            break;
          case 'specialty':
            aValue = a.specialty;
            bValue = b.specialty;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc'
            ? aValue.localeCompare(bValue, 'ja')
            : bValue.localeCompare(aValue, 'ja');
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortOrder === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    } else {
      // 図鑑番号ソートの場合も昇順/降順に対応
      if (filters.sortOrder === 'desc') {
        filtered.sort((a, b) => {
          // 図鑑番号で降順ソート
          if (a.pokedexId !== b.pokedexId) {
            return b.pokedexId - a.pokedexId;
          }
          
          // 同じ図鑑番号の場合、通常の姿を先に、特別な姿を後に
          const aIsSpecial = a.name.includes('(');
          const bIsSpecial = b.name.includes('(');
          
          if (aIsSpecial !== bIsSpecial) {
            return aIsSpecial ? 1 : -1;
          }
          
          return a.name.localeCompare(b.name, 'ja');
        });
      }
    }

    return filtered;
  }, [filters, activeTab]);

  return filteredPokemons;
};

// タブに基づいてポケモンをフィルタリング
const getFilteredPokemonsByTab = (pokemons: Pokemon[], tab: string) => {
  switch (tab) {
    case 'きのみ':
      return pokemons.filter(pokemon => pokemon.specialty === 'きのみ');
    case '食材':
      return pokemons.filter(pokemon => pokemon.specialty === '食材');
    case 'スキル':
      return pokemons.filter(pokemon => pokemon.specialty === 'スキル');
    case '厳選管理':
      // TODO: 厳選管理のフィルタリング（後で実装）
      return pokemons;
    default: // 'すべて'
      return pokemons;
  }
};