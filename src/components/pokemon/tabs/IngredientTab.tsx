import React, { useState, useRef, useEffect } from 'react';
import { RECIPES } from '../../../../config/recipes';
import { INGREDIENTS } from '../../../../config/ingredients';
import type { Pokemon } from '../../../../config/schema';
import { getIngredient, getIngredientImageName } from '../../../utils/pokemon';
import { getPokemonKey, loadAllInstancesForPokemon } from '../../../utils/pokemon-storage';
import PokemonCard from '../PokemonCard';
import StatusIcon from '../../common/StatusIcon';
import EmptyPlaceholder from '../../common/EmptyPlaceholder';
import type { FilterOptions } from '../../PokemonFilters';

interface IngredientTabProps {
  filteredPokemons: Pokemon[];
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  pokemonStatuses: { [pokemonKey: string]: { status: string; count?: number } };
  showRecipeGrouping: boolean;
  setShowRecipeGrouping: (value: boolean) => void;
  recipeSortByEnergy: boolean;
  setRecipeSortByEnergy: (value: boolean) => void;
  recipeCategory: string;
  setRecipeCategory: (value: string) => void;
  selectedSlots: string[];
  setSelectedSlots: (value: string[]) => void;
  filters?: FilterOptions; // 管理状態フィルター用
}

// カテゴリープルダウンコンポーネント
interface CategoryDropdownProps {
  recipeCategory: string;
  setRecipeCategory: (value: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ recipeCategory, setRecipeCategory }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'カレー・シチュー', label: 'カレー' },
    { key: 'サラダ', label: 'サラダ' },
    { key: 'デザート・ドリンク', label: 'デザート' }
  ];

  const currentCategory = categories.find(cat => cat.key === recipeCategory) || categories[0];

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* プルダウンボタン */}
      <button
        onClick={() => setShowDropdown(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 6px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          fontSize: 9,
          background: '#fff',
          color: '#374151',
          cursor: 'pointer',
          minWidth: 60,
          fontWeight: 600
        }}
      >
        <span>{currentCategory.label}</span>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      
      {/* ドロップダウンメニュー */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 2,
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            padding: 2,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            minWidth: 80
          }}
        >
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => {
                console.log('DEBUG: カテゴリークリック:', category.key);
                setRecipeCategory(category.key);
                setShowDropdown(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '4px 8px',
                background: recipeCategory === category.key ? '#f59e0b' : 'transparent',
                color: recipeCategory === category.key ? '#fff' : '#374151',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 600,
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => {
                if (recipeCategory !== category.key) {
                  e.currentTarget.style.background = '#f1f5f9';
                }
              }}
              onMouseLeave={e => {
                if (recipeCategory !== category.key) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// スロットフィルターボタンコンポーネント
interface SlotFilterButtonsProps {
  selectedSlots: string[];
  setSelectedSlots: (value: string[]) => void;
}

const SlotFilterButtons: React.FC<SlotFilterButtonsProps> = ({ selectedSlots, setSelectedSlots }) => {
  const slots = ['A', 'B', 'C'];

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      // 選択解除（ただし、すべて解除されることを防ぐため最低1つは残す）
      if (selectedSlots.length > 1) {
        setSelectedSlots(selectedSlots.filter(s => s !== slot));
      }
    } else {
      // 選択追加
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {slots.map(slot => (
        <button
          key={slot}
          onClick={() => toggleSlot(slot)}
          style={{
            padding: '2px 6px',
            borderRadius: 6,
            border: selectedSlots.includes(slot) ? 'none' : '1px solid #e2e8f0',
            background: selectedSlots.includes(slot) ? (() => {
              switch(slot) {
                case 'A': return '#ef4444';
                case 'B': return '#3b82f6';
                case 'C': return '#10b981';
                default: return '#6b7280';
              }
            })() : '#fff',
            color: selectedSlots.includes(slot) ? '#fff' : '#374151',
            fontSize: 9,
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: 20,
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!selectedSlots.includes(slot)) {
              e.currentTarget.style.background = '#f1f5f9';
            }
          }}
          onMouseLeave={(e) => {
            if (!selectedSlots.includes(slot)) {
              e.currentTarget.style.background = '#fff';
            }
          }}
        >
          {slot}
        </button>
      ))}
    </div>
  );
};

const IngredientTab: React.FC<IngredientTabProps> = ({
  filteredPokemons,
  selectedPokemon,
  onPokemonSelect,
  pokemonStatuses,
  showRecipeGrouping,
  setShowRecipeGrouping,
  recipeSortByEnergy,
  setRecipeSortByEnergy,
  recipeCategory,
  setRecipeCategory,
  selectedSlots,
  setSelectedSlots,
  filters
}) => {

  // PokemonCardと同じロジックでパターンチェック
  const checkIngredientPattern = (pokemon: Pokemon, ingredientSlots: number[], targetIngredientId: number, labelSlot: string): boolean => {
    // 個体の食材構成を文字列パターンに変換（例：[9,9,12] → "AAB"）
    const slotPattern = getIngredientSlotPattern(pokemon, ingredientSlots);
    
    // ターゲット食材に対応する基本スロット（ポケモンの基本食材配置）を取得
    const baseSlot = getBaseSlotForIngredient(pokemon, targetIngredientId);
    
    if (baseSlot !== labelSlot) {
      return false; // 基本スロットと表示ラベルが一致しない場合は非表示
    }
    
    // パターン別の表示条件をチェック
    switch (labelSlot) {
      case 'A':
        // Aラベル表示時：AAA, AAB, AAC の場合のみ表示
        return slotPattern === 'AAA' || slotPattern === 'AAB' || slotPattern === 'AAC';
      case 'B':
        // Bラベル表示時：ABB の場合のみ表示
        return slotPattern === 'ABB';
      case 'C':
        // Cラベル表示時：AAC, ABC の場合のみ表示
        return slotPattern === 'AAC' || slotPattern === 'ABC';
      default:
        return false;
    }
  };

  // 個体の食材設定をA/B/Cパターンに変換
  const getIngredientSlotPattern = (pokemon: Pokemon, ingredientSlots: number[]): string => {
    return ingredientSlots.map((ingredientId) => {
      // ポケモンの基本食材との対応でA/B/Cを決定
      if (pokemon.ing1?.ingredientId === ingredientId) return 'A';
      if (pokemon.ing2?.ingredientId === ingredientId) return 'B';
      if (pokemon.ing3?.ingredientId === ingredientId) return 'C';
      return 'X'; // 基本食材にない場合
    }).join('');
  };

  // 食材IDから基本スロット（A/B/C）を取得
  const getBaseSlotForIngredient = (pokemon: Pokemon, ingredientId: number): string => {
    if (pokemon.ing1?.ingredientId === ingredientId) return 'A';
    if (pokemon.ing2?.ingredientId === ingredientId) return 'B';
    if (pokemon.ing3?.ingredientId === ingredientId) return 'C';
    return '';
  };

  // スロット別管理状態フィルターによるポケモンのフィルタリング（PokemonCardと同じロジック）
  const filterPokemonsBySlotManagementStatus = (pokemon: Pokemon, targetSlot: string): boolean => {
    // 管理状態フィルターが設定されていない場合は全て表示
    if (!filters?.managementStatuses || filters.managementStatuses.length === 0) {
      return true;
    }

    // 該当スロットに対応する食材IDを取得
    const targetIngredientId = (() => {
      if (targetSlot === 'A') return pokemon.ing1?.ingredientId;
      if (targetSlot === 'B') return pokemon.ing2?.ingredientId;
      if (targetSlot === 'C') return pokemon.ing3?.ingredientId;
      return undefined;
    })();

    if (!targetIngredientId) {
      return false; // 該当スロットに食材がない場合は非表示
    }

    // このポケモンの全個体を取得
    const allInstances = loadAllInstancesForPokemon(pokemon);
    
    // 該当する個体の管理状態を収集
    const matchingInstanceStatuses: string[] = [];
    
    Object.entries(allInstances).forEach(([, instance]) => {
      // 個体の食材設定を取得
      const ingredientSlots = instance.selectedIngredients || [];
      
      // 該当スロットに対象食材が設定されているかチェック
      const labelSlotIndex = targetSlot === 'A' ? 0 : targetSlot === 'B' ? 1 : 2;
      const hasTargetIngredientInSlot = ingredientSlots[labelSlotIndex] === targetIngredientId;
      
      if (!hasTargetIngredientInSlot) {
        return; // 該当スロットに対象食材がなければスキップ
      }
      
      // 個体の食材組み合わせパターンをチェック（PokemonCardと同じロジック）
      const shouldShowForThisPattern = checkIngredientPattern(pokemon, ingredientSlots, targetIngredientId, targetSlot);
      
      if (shouldShowForThisPattern) {
        matchingInstanceStatuses.push(instance.managementStatus || '未設定');
      }
    });

    // 該当する個体がない場合は非表示
    if (matchingInstanceStatuses.length === 0) {
      return false;
    }

    // フィルター条件に合う個体があるかチェック
    const hasMatchingStatus = matchingInstanceStatuses.some(status => 
      filters.managementStatuses?.includes(status) || false
    );

    
    return hasMatchingStatus;
  };

  // 食材ラベル（A,B,C）を取得する関数
  const getIngredientLabel = (pokemon: Pokemon, targetIngredientId?: number, recipe?: any) => {
    if (recipe && targetIngredientId) {
      // レシピモード：レシピ内の食材との一致を確認
      if (pokemon.ing1?.ingredientId === targetIngredientId) {
        return { label: 'A', backgroundColor: '#ef4444' };
      } else if (pokemon.ing2?.ingredientId === targetIngredientId) {
        return { label: 'B', backgroundColor: '#3b82f6' };
      } else if (pokemon.ing3?.ingredientId === targetIngredientId) {
        return { label: 'C', backgroundColor: '#10b981' };
      }
      
      // 「オール」特性ポケモンの場合：availableIngredientsから検索
      if (pokemon.availableIngredients) {
        if (pokemon.availableIngredients.slot1.some(item => item.ingredientId === targetIngredientId)) {
          return { label: 'A', backgroundColor: '#ef4444' };
        } else if (pokemon.availableIngredients.slot2.some(item => item.ingredientId === targetIngredientId)) {
          return { label: 'B', backgroundColor: '#3b82f6' };
        } else if (pokemon.availableIngredients.slot3.some(item => item.ingredientId === targetIngredientId)) {
          return { label: 'C', backgroundColor: '#10b981' };
        }
      }
    } else if (targetIngredientId) {
      // 食材別モード：どのスロットの食材かを確認
      if (pokemon.ing1?.ingredientId === targetIngredientId) {
        return { label: 'A', backgroundColor: '#ef4444' };
      } else if (pokemon.ing2?.ingredientId === targetIngredientId) {
        return { label: 'B', backgroundColor: '#3b82f6' };
      } else if (pokemon.ing3?.ingredientId === targetIngredientId) {
        return { label: 'C', backgroundColor: '#10b981' };
      }
      
      // 「オール」特性ポケモンの場合：availableIngredientsから検索（最初に見つかったスロット）
      if (pokemon.availableIngredients) {
        if (pokemon.availableIngredients.slot1.some(item => item.ingredientId === targetIngredientId)) {
          return { label: 'A', backgroundColor: '#ef4444' };
        } else if (pokemon.availableIngredients.slot2.some(item => item.ingredientId === targetIngredientId)) {
          return { label: 'B', backgroundColor: '#3b82f6' };
        } else if (pokemon.availableIngredients.slot3.some(item => item.ingredientId === targetIngredientId)) {
          return { label: 'C', backgroundColor: '#10b981' };
        }
      }
    }
    return null;
  };


  // スロットフィルタリング関数（レシピOFF時用）
  const filterPokemonsBySlotForIngredient = (pokemons: Pokemon[], ingredientId: number) => {
    return pokemons.filter(pokemon => {
      // 通常ポケモン：そのポケモンがこの食材を持っているスロットを特定
      const pokemonSlots: string[] = [];
      
      if (pokemon.ing1?.ingredientId === ingredientId) pokemonSlots.push('A');
      if (pokemon.ing2?.ingredientId === ingredientId) pokemonSlots.push('B');
      if (pokemon.ing3?.ingredientId === ingredientId) pokemonSlots.push('C');
      
      // 「オール」特性ポケモン：availableIngredientsから該当スロットを特定
      if (pokemon.availableIngredients) {
        if (pokemon.availableIngredients.slot1.some(item => item.ingredientId === ingredientId)) {
          pokemonSlots.push('A');
        }
        if (pokemon.availableIngredients.slot2.some(item => item.ingredientId === ingredientId)) {
          pokemonSlots.push('B');
        }
        if (pokemon.availableIngredients.slot3.some(item => item.ingredientId === ingredientId)) {
          pokemonSlots.push('C');
        }
      }
      
      // 各スロットに対してフィルタリングチェック
      return pokemonSlots.some(slot => {
        // スロットフィルターチェック
        if (selectedSlots.length < 3 && !selectedSlots.includes(slot)) {
          return false;
        }
        
        // スロット別管理状態フィルターチェック（通常ポケモンのみ）
        if (!pokemon.availableIngredients && !filterPokemonsBySlotManagementStatus(pokemon, slot)) {
          return false;
        }
        
        return true;
      });
    });
  };

  const renderRecipeGrouping = () => {
    // レシピ別グルーピング（ごちゃまぜ系は除外）
    let validRecipes = RECIPES.filter(recipe => recipe.ingredients.length > 0);
    
    // カテゴリーフィルター
    if (recipeCategory !== 'all') {
      validRecipes = validRecipes.filter(recipe => recipe.category === recipeCategory);
    }
    
    // エナジー順ソート
    if (recipeSortByEnergy) {
      validRecipes = [...validRecipes].sort((a, b) => b.energy - a.energy);
    }
    
    return validRecipes.map(recipe => {
      // このレシピの食材ごとに、それを持つポケモンを個別に取得
      const recipePokemonEntries: Array<{
        pokemon: Pokemon;
        targetIngredientId: number;
        targetSlot: string;
      }> = [];
      
      recipe.ingredients.forEach(recipeIngredient => {
        filteredPokemons.forEach(pokemon => {
          // 通常ポケモンの食材チェック
          const pokemonIngredients = [
            pokemon.ing1?.ingredientId,
            pokemon.ing2?.ingredientId,
            pokemon.ing3?.ingredientId
          ].filter((id): id is number => id !== undefined);
          
          // このポケモンが、このレシピ食材を持っているかチェック
          if (pokemonIngredients.includes(recipeIngredient.ingredientId)) {
            // どのスロット（A/B/C）でその食材を持っているかを取得
            let targetSlot = '';
            if (pokemon.ing1?.ingredientId === recipeIngredient.ingredientId) targetSlot = 'A';
            else if (pokemon.ing2?.ingredientId === recipeIngredient.ingredientId) targetSlot = 'B';
            else if (pokemon.ing3?.ingredientId === recipeIngredient.ingredientId) targetSlot = 'C';
            
            // スロットフィルタリングチェック
            if (selectedSlots.length < 3) {
              if (!selectedSlots.includes(targetSlot)) {
                return; // 選択されたスロットに含まれていない場合はスキップ
              }
            }

            // スロット別管理状態フィルターチェック
            if (!filterPokemonsBySlotManagementStatus(pokemon, targetSlot)) {
              return; // 管理状態フィルターに合わない場合はスキップ
            }
            
            recipePokemonEntries.push({
              pokemon: pokemon,
              targetIngredientId: recipeIngredient.ingredientId,
              targetSlot: targetSlot
            });
          }

          // 「オール」特性ポケモンの availableIngredients チェック
          if (pokemon.availableIngredients) {
            // 各スロットでレシピ食材が選択可能かチェック
            ['slot1', 'slot2', 'slot3'].forEach((slotKey, index) => {
              const slot = pokemon.availableIngredients![slotKey as keyof typeof pokemon.availableIngredients];
              const hasRecipeIngredient = slot.some(item => item.ingredientId === recipeIngredient.ingredientId);
              
              if (hasRecipeIngredient) {
                const targetSlot = ['A', 'B', 'C'][index];
                
                // スロットフィルタリングチェック
                if (selectedSlots.length < 3) {
                  if (!selectedSlots.includes(targetSlot)) {
                    return; // 選択されたスロットに含まれていない場合はスキップ
                  }
                }

                // 「オール」特性ポケモンの管理状態フィルターは一旦スキップ（後で実装）
                
                recipePokemonEntries.push({
                  pokemon: pokemon,
                  targetIngredientId: recipeIngredient.ingredientId,
                  targetSlot: targetSlot
                });
              }
            });
          }
        });
      });
      
      // 0匹でも表示する
      
      // A-B-C順にソート（同じスロットの場合は図鑑番号順）
      recipePokemonEntries.sort((a, b) => {
        // まずスロット（A/B/C）でソート
        const slotOrder = { 'A': 0, 'B': 1, 'C': 2 };
        const slotComparison = slotOrder[a.targetSlot as keyof typeof slotOrder] - slotOrder[b.targetSlot as keyof typeof slotOrder];
        
        if (slotComparison !== 0) {
          return slotComparison;
        }
        
        // 同じスロットの場合は図鑑番号でソート
        return a.pokemon.pokedexId - b.pokemon.pokedexId;
      });
      
      return (
        <div key={recipe.id} style={{ marginBottom: 16 }}>
          {/* レシピヘッダー */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            padding: '8px 12px',
            background: '#ffffff',
            borderRadius: 6,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
                {recipe.name}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ 
                  fontSize: 10, 
                  color: '#fff',
                  background: (() => {
                    switch(recipe.category) {
                      case 'カレー・シチュー': return '#f59e0b';
                      case 'サラダ': return '#10b981';
                      case 'デザート・ドリンク': return '#8b5cf6';
                      default: return '#6b7280';
                    }
                  })(),
                  padding: '2px 6px',
                  borderRadius: 8,
                  fontWeight: 600
                }}>
                  {recipe.category}
                </span>
                <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>
                  {recipe.energy.toLocaleString()}エナジー
                </span>
              </div>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              ({recipePokemonEntries.length}個)
            </span>
            {/* レシピの食材画像と必要数 */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
              {recipe.ingredients.map((recipeIngredient) => {
                const ingredient = getIngredient(recipeIngredient.ingredientId);
                return (
                  <div key={recipeIngredient.ingredientId} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <img
                      src={`${import.meta.env.BASE_URL}image/ing/${getIngredientImageName(ingredient?.name || '')}.png`}
                      alt={ingredient?.name || ''}
                      style={{ width: 16, height: 16, objectFit: 'contain' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${import.meta.env.BASE_URL}image/ing/honey.png`;
                      }}
                    />
                    <span style={{ 
                      fontSize: 8, 
                      color: '#6b7280',
                      fontWeight: 600,
                      lineHeight: 1
                    }}>
                      {recipeIngredient.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* レシピ内のポケモン一覧 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
            gap: 6,
            padding: '0 8px',
            justifyContent: 'start',
            alignItems: 'start',
            gridAutoRows: '68px'
          }}>
            {recipePokemonEntries.length > 0 ? (
              recipePokemonEntries.map(entry => {
                // レシピマッチング用のラベルを取得
                const ingredientLabel = getIngredientLabel(entry.pokemon, entry.targetIngredientId, recipe);

                return (
                  <PokemonCard
                    key={`${getPokemonKey(entry.pokemon)}-${entry.targetIngredientId}`}
                    pokemon={entry.pokemon}
                    isSelected={getPokemonKey(selectedPokemon) === getPokemonKey(entry.pokemon)}
                    statusIcon={
                      <StatusIcon
                        status={pokemonStatuses[getPokemonKey(entry.pokemon)]?.status || ''}
                        count={pokemonStatuses[getPokemonKey(entry.pokemon)]?.count}
                      />
                    }
                    ingredientLabel={ingredientLabel}
                    onClick={() => onPokemonSelect(entry.pokemon)}
                    isIngredientTab={true}
                    selectedSlots={selectedSlots}
                    targetIngredientId={entry.targetIngredientId}
                  />
                );
              })
            ) : (
              <EmptyPlaceholder />
            )}
          </div>
        </div>
      );
    });
  };

  const renderIngredientGrouping = () => {
    // レシピOFF時: 従来の食材別グルーピング
    const ingredientGroups: { [ingredientId: number]: Pokemon[] } = {};
    
    // 全ての食材を初期化
    Object.values(INGREDIENTS).forEach(ingredient => {
      ingredientGroups[ingredient.id] = [];
    });
    
    filteredPokemons.forEach(pokemon => {
      // 通常ポケモンの食材チェック
      const ingredientIds = [
        pokemon.ing1?.ingredientId,
        pokemon.ing2?.ingredientId,
        pokemon.ing3?.ingredientId
      ].filter((id): id is number => id !== undefined);

      ingredientIds.forEach(ingredientId => {
        if (ingredientGroups[ingredientId]) {
          // 重複を避けるためにポケモンが既に追加されていないかチェック
          const pokemonKey = getPokemonKey(pokemon);
          const alreadyAdded = ingredientGroups[ingredientId].some(p => getPokemonKey(p) === pokemonKey);
          if (!alreadyAdded) {
            ingredientGroups[ingredientId].push(pokemon);
          }
        }
      });

      // 「オール」特性ポケモンの availableIngredients チェック
      if (pokemon.availableIngredients) {
        const allAvailableIngredientIds = [
          ...pokemon.availableIngredients.slot1.map(item => item.ingredientId),
          ...pokemon.availableIngredients.slot2.map(item => item.ingredientId),
          ...pokemon.availableIngredients.slot3.map(item => item.ingredientId)
        ];

        // 重複を除去
        const uniqueIngredientIds = [...new Set(allAvailableIngredientIds)];

        uniqueIngredientIds.forEach(ingredientId => {
          if (ingredientGroups[ingredientId]) {
            const pokemonKey = getPokemonKey(pokemon);
            const alreadyAdded = ingredientGroups[ingredientId].some(p => getPokemonKey(p) === pokemonKey);
            if (!alreadyAdded) {
              ingredientGroups[ingredientId].push(pokemon);
            }
          }
        });
      }
    });

    // 食材IDでソート（「-」を除外）
    const sortedIngredientIds = Object.values(INGREDIENTS)
      .filter(ingredient => ingredient.name !== '-')
      .map(ingredient => ingredient.id)
      .sort((a, b) => a - b);

    return sortedIngredientIds.map(ingredientId => {
      const ingredient = getIngredient(ingredientId);
      // スロットフィルタリングを適用
      let pokemonsForIngredient = filterPokemonsBySlotForIngredient(ingredientGroups[ingredientId], ingredientId);
      
      // 0匹でも表示する
      
      // A-B-C順にソート（同じスロットの場合は図鑑番号順）
      pokemonsForIngredient = pokemonsForIngredient.sort((a, b) => {
        // 各ポケモンのラベルを取得
        const labelA = getIngredientLabel(a, ingredientId);
        const labelB = getIngredientLabel(b, ingredientId);
        
        // ラベルが取得できない場合は図鑑番号順
        if (!labelA || !labelB) {
          return a.pokedexId - b.pokedexId;
        }
        
        // まずラベル（A/B/C）でソート
        const slotOrder = { 'A': 0, 'B': 1, 'C': 2 };
        const slotComparison = slotOrder[labelA.label as keyof typeof slotOrder] - slotOrder[labelB.label as keyof typeof slotOrder];
        
        if (slotComparison !== 0) {
          return slotComparison;
        }
        
        // 同じラベルの場合は図鑑番号でソート
        return a.pokedexId - b.pokedexId;
      });
      
      return (
        <div key={ingredientId} style={{ marginBottom: 16 }}>
          {/* 食材ヘッダー */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            padding: '8px 12px',
            background: '#ffffff',
            borderRadius: 6,
            border: '1px solid #e2e8f0'
          }}>
            <img
              src={`${import.meta.env.BASE_URL}image/ing/${getIngredientImageName(ingredient?.name || '')}.png`}
              alt={ingredient?.name || ''}
              style={{ width: 24, height: 24, objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `${import.meta.env.BASE_URL}image/ing/honey.png`;
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
              {ingredient?.name || `食材${ingredientId}`}
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              ({pokemonsForIngredient.length}匹)
            </span>
          </div>
          
          {/* その食材のポケモン一覧 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
            gap: 6,
            padding: '0 8px',
            justifyContent: 'start',
            alignItems: 'start',
            gridAutoRows: '68px'
          }}>
            {pokemonsForIngredient.length > 0 ? (
              pokemonsForIngredient.map(pokemon => (
                <PokemonCard
                  key={getPokemonKey(pokemon)}
                  pokemon={pokemon}
                  isSelected={getPokemonKey(selectedPokemon) === getPokemonKey(pokemon)}
                  statusIcon={
                    <StatusIcon
                      status={pokemonStatuses[getPokemonKey(pokemon)]?.status || ''}
                      count={pokemonStatuses[getPokemonKey(pokemon)]?.count}
                    />
                  }
                  ingredientLabel={getIngredientLabel(pokemon, ingredientId)}
                  onClick={() => onPokemonSelect(pokemon)}
                  isIngredientTab={true}
                  selectedSlots={selectedSlots}
                  targetIngredientId={ingredientId}
                />
              ))
            ) : (
              <EmptyPlaceholder />
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      border: '1px solid #e2e8f0',
      borderRadius: 6,
      padding: 8,
      background: '#f7fafc'
    }}>
      {/* レシピコントロール */}
      <div style={{
        display: 'flex',
        justifyContent: showRecipeGrouping ? 'space-between' : 'flex-end',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8
      }}>
        {/* 左側：ソートとカテゴリーフィルター（レシピON時のみ表示） */}
        {showRecipeGrouping && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* エナジー順ソートボタン */}
            <button
              onClick={() => setRecipeSortByEnergy(!recipeSortByEnergy)}
              style={{
                background: recipeSortByEnergy ? '#10b981' : '#f3f4f6',
                color: recipeSortByEnergy ? '#fff' : '#374151',
                border: 'none',
                borderRadius: 12,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!recipeSortByEnergy) {
                  e.currentTarget.style.background = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!recipeSortByEnergy) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
            >
              エナジー順
            </button>
            
            {/* カテゴリーフィルタープルダウン */}
            <CategoryDropdown
              recipeCategory={recipeCategory}
              setRecipeCategory={setRecipeCategory}
            />
          </div>
        )}
        
        {/* 右側：スロットフィルターとレシピON/OFFボタン */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* スロットフィルターボタン */}
          <SlotFilterButtons
            selectedSlots={selectedSlots}
            setSelectedSlots={setSelectedSlots}
          />
          
          {/* レシピON/OFFボタン */}
        <button
          onClick={() => setShowRecipeGrouping(!showRecipeGrouping)}
          style={{
            background: showRecipeGrouping ? '#3b82f6' : '#f3f4f6',
            color: showRecipeGrouping ? '#fff' : '#374151',
            border: 'none',
            borderRadius: 12,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!showRecipeGrouping) {
              e.currentTarget.style.background = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!showRecipeGrouping) {
              e.currentTarget.style.background = '#f3f4f6';
            }
          }}
        >
          レシピ{showRecipeGrouping ? 'ON' : 'OFF'}
        </button>
        </div>
      </div>

      {/* レシピON時: レシピ別グルーピング / レシピOFF時: 食材別グルーピング */}
      {(() => {
        if (showRecipeGrouping) {
          return <div key={`recipe-mode-${recipeCategory}-${recipeSortByEnergy}-${selectedSlots.join('')}`}>{renderRecipeGrouping()}</div>;
        } else {
          return <div key={`ingredient-mode-${selectedSlots.join('')}`}>{renderIngredientGrouping()}</div>;
        }
      })()}
    </div>
  );
};

export default IngredientTab;