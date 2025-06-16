import React, { useState, useRef, useEffect } from 'react';
import { RECIPES } from '../../../../config/recipes';
import type { Pokemon } from '../../../../config/schema';
import { getIngredient, getIngredientImageName } from '../../../utils/pokemon';
import { getPokemonKey } from '../../../utils/pokemon-storage';
import PokemonCard from '../PokemonCard';
import StatusIcon from '../../common/StatusIcon';

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
  setSelectedSlots
}) => {

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
    } else if (targetIngredientId) {
      // 食材別モード：どのスロットの食材かを確認
      if (pokemon.ing1?.ingredientId === targetIngredientId) {
        return { label: 'A', backgroundColor: '#ef4444' };
      } else if (pokemon.ing2?.ingredientId === targetIngredientId) {
        return { label: 'B', backgroundColor: '#3b82f6' };
      } else if (pokemon.ing3?.ingredientId === targetIngredientId) {
        return { label: 'C', backgroundColor: '#10b981' };
      }
    }
    return null;
  };


  // スロットフィルタリング関数（レシピOFF時用）
  const filterPokemonsBySlotForIngredient = (pokemons: Pokemon[], ingredientId: number) => {
    if (selectedSlots.length === 3) return pokemons; // 全スロット選択時はフィルタリングしない
    
    return pokemons.filter(pokemon => {
      // そのポケモンがこの食材を持っているスロットを特定
      const pokemonSlots: string[] = [];
      
      if (pokemon.ing1?.ingredientId === ingredientId) pokemonSlots.push('A');
      if (pokemon.ing2?.ingredientId === ingredientId) pokemonSlots.push('B');
      if (pokemon.ing3?.ingredientId === ingredientId) pokemonSlots.push('C');
      
      // 選択されたスロットのいずれかでこの食材を持っているかチェック
      return selectedSlots.some(slot => pokemonSlots.includes(slot));
    });
  };

  const renderRecipeGrouping = () => {
    // レシピ別グルーピング（ごちゃまぜ系は除外）
    let validRecipes = RECIPES.filter(recipe => recipe.ingredients.length > 0);
    console.log('DEBUG: 初期レシピ数:', validRecipes.length);
    console.log('DEBUG: recipeCategory:', recipeCategory);
    
    // カテゴリーフィルター
    if (recipeCategory !== 'all') {
      validRecipes = validRecipes.filter(recipe => recipe.category === recipeCategory);
      console.log('DEBUG: フィルター後レシピ数:', validRecipes.length);
    }
    
    // エナジー順ソート
    if (recipeSortByEnergy) {
      validRecipes = [...validRecipes].sort((a, b) => b.energy - a.energy);
      console.log('DEBUG: エナジー順ソート実行');
    }
    
    return validRecipes.map(recipe => {
      // このレシピの食材を持つポケモンを取得
      let recipePokemons = filteredPokemons.filter(pokemon => {
        const pokemonIngredients = [
          pokemon.ing1?.ingredientId,
          pokemon.ing2?.ingredientId,
          pokemon.ing3?.ingredientId
        ].filter((id): id is number => id !== undefined);
        
        // レシピに必要な食材のいずれかを持っているポケモンを取得
        return recipe.ingredients.some(recipeIngredient => 
          pokemonIngredients.includes(recipeIngredient.ingredientId)
        );
      });
      
      // スロットフィルタリングを適用（レシピの各食材について）
      if (selectedSlots.length < 3) {
        recipePokemons = recipePokemons.filter(pokemon => {
          // このポケモンが、選択されたスロットでレシピ食材のいずれかを持っているかチェック
          return recipe.ingredients.some(recipeIngredient => {
            const pokemonSlots: string[] = [];
            
            if (pokemon.ing1?.ingredientId === recipeIngredient.ingredientId) pokemonSlots.push('A');
            if (pokemon.ing2?.ingredientId === recipeIngredient.ingredientId) pokemonSlots.push('B');
            if (pokemon.ing3?.ingredientId === recipeIngredient.ingredientId) pokemonSlots.push('C');
            
            return selectedSlots.some(slot => pokemonSlots.includes(slot));
          });
        });
      }
      
      if (recipePokemons.length === 0) return null;
      
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
              ({recipePokemons.length}匹)
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
            {recipePokemons.map(pokemon => {
              // レシピマッチング用のラベルを取得
              let ingredientLabel = null;
              for (const recipeIngredient of recipe.ingredients) {
                const label = getIngredientLabel(pokemon, recipeIngredient.ingredientId, recipe);
                if (label) {
                  ingredientLabel = label;
                  break;
                }
              }

              return (
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
                  ingredientLabel={ingredientLabel}
                  onClick={() => onPokemonSelect(pokemon)}
                />
              );
            })}
          </div>
        </div>
      );
    });
  };

  const renderIngredientGrouping = () => {
    // レシピOFF時: 従来の食材別グルーピング
    const ingredientGroups: { [ingredientId: number]: Pokemon[] } = {};
    filteredPokemons.forEach(pokemon => {
      // ポケモンが持つすべての食材をチェック
      const ingredientIds = [
        pokemon.ing1?.ingredientId,
        pokemon.ing2?.ingredientId,
        pokemon.ing3?.ingredientId
      ].filter((id): id is number => id !== undefined);

      ingredientIds.forEach(ingredientId => {
        if (!ingredientGroups[ingredientId]) {
          ingredientGroups[ingredientId] = [];
        }
        // 重複を避けるためにポケモンが既に追加されていないかチェック
        const pokemonKey = getPokemonKey(pokemon);
        const alreadyAdded = ingredientGroups[ingredientId].some(p => getPokemonKey(p) === pokemonKey);
        if (!alreadyAdded) {
          ingredientGroups[ingredientId].push(pokemon);
        }
      });
    });

    // 食材IDでソート
    const sortedIngredientIds = Object.keys(ingredientGroups)
      .map(id => parseInt(id))
      .sort((a, b) => a - b);

    return sortedIngredientIds.map(ingredientId => {
      const ingredient = getIngredient(ingredientId);
      // スロットフィルタリングを適用
      const pokemonsForIngredient = filterPokemonsBySlotForIngredient(ingredientGroups[ingredientId], ingredientId);
      
      // フィルター後にポケモンがいない場合は表示しない
      if (pokemonsForIngredient.length === 0) return null;
      
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
            {pokemonsForIngredient.map(pokemon => (
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
              />
            ))}
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