import React, { useState } from 'react';
import { POKEMONS, MAINSKILLS } from '../../config';
import type { FilterOptions } from '../PokemonFilters';
import type { Pokemon } from '../../../config/schema';
import { loadPokemonSettings, getPokemonKey } from '../../utils/pokemon-storage';
import { getBerry, getBerryImageName, getIngredient, getIngredientImageName } from '../../utils/pokemon';
import { getPokemonImageName as getNewPokemonImageName } from '../../utils/pokemon-id';

// ポケモン名を分離（メイン名と特別な姿の説明）
const splitPokemonName = (name: string) => {
  const match = name.match(/^(.+?)\((.+)\)$/);
  if (match) {
    return {
      mainName: match[1],
      formName: `(${match[2]})`
    };
  }
  return {
    mainName: name,
    formName: ''
  };
};


interface PokemonSelectorProps {
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onOpenFilters: () => void;
  onOpenSort: () => void;
  refreshTrigger?: number; // 状態更新のトリガー
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  selectedPokemon,
  onPokemonSelect,
  filters,
  onFiltersChange,
  onOpenFilters,
  onOpenSort,
  refreshTrigger
}) => {
  const [activeTab, setActiveTab] = useState('すべて');

  // タブに基づいてポケモンをフィルタリング
  const getFilteredPokemonsByTab = (pokemons: Pokemon[], tab: string) => {
    switch (tab) {
      case 'きのみ':
        return pokemons.filter(pokemon => pokemon.specialty === 'きのみ');
      case '食材':
        return pokemons.filter(pokemon => pokemon.specialty === '食材');
      case 'スキル':
        return pokemons.filter(pokemon => pokemon.specialty === 'スキル');
      case 'レシピ':
        // TODO: レシピ関連のフィルタリング（後で実装）
        return pokemons;
      case '厳選管理':
        // TODO: 厳選管理のフィルタリング（後で実装）
        return pokemons;
      default: // 'すべて'
        return pokemons;
    }
  };

  const filteredPokemons = React.useMemo(() => {
    let filtered = [...POKEMONS];

    // まずタブによるフィルタリングを適用
    filtered = getFilteredPokemonsByTab(filtered, activeTab);

    if (filters.specialty !== 'すべて') {
      filtered = filtered.filter(pokemon => pokemon.specialty === filters.specialty);
    }

    if (filters.berry) {
      filtered = filtered.filter(pokemon => pokemon.berryId.toString() === filters.berry);
    }

    if (filters.ingredient) {
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
          case 'specialty':
            aValue = a.specialty;
            bValue = b.specialty;
            break;
          case 'frequency':
            aValue = a.frequency;
            bValue = b.frequency;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc'
            ? aValue.localeCompare(bValue, 'ja')
            : bValue.localeCompare(aValue, 'ja');
        }

        return filters.sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
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

  // ポケモンの管理状態をメモ化（リアルタイム更新対応）
  const pokemonStatuses = React.useMemo(() => {
    const statuses: { [pokemonKey: string]: string } = {};
    filteredPokemons.forEach(pokemon => {
      const settings = loadPokemonSettings(pokemon);
      const pokemonKey = getPokemonKey(pokemon);
      statuses[pokemonKey] = settings.managementStatus;
    });
    return statuses;
  }, [filteredPokemons, refreshTrigger]);

  // 管理状態アイコンを返す関数
  const getStatusIcon = (status: string) => {
    const iconStyle = {
      position: 'absolute' as const,
      top: -2,
      left: -2,
      width: 16,
      height: 16,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      zIndex: 10
    };

    switch (status) {
      case '厳選前':
        return (
          <div style={{ ...iconStyle, background: '#8b5cf6' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case '厳選中':
        return (
          <div style={{ ...iconStyle, background: '#3b82f6' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2" fill="white"/>
              <path d="m14 10-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="m10 10 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case '完了':
        return (
          <div style={{ ...iconStyle, background: '#22c55e' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case '保留':
        return (
          <div style={{ ...iconStyle, background: '#f59e0b' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" fill="white"/>
              <rect x="14" y="4" width="4" height="16" fill="white"/>
            </svg>
          </div>
        );
      case '中止':
        return (
          <div style={{ ...iconStyle, background: '#ef4444' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case '対象外':
        return (
          <div style={{ ...iconStyle, background: '#6b7280' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M4.93 4.93l14.14 14.14" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
        );
      default:
        return null; // 未設定の場合は何も表示しない
    }
  };

  const tabs = ['すべて', 'きのみ', '食材', 'スキル', 'レシピ', '厳選管理'];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* タブナビゲーション */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 12,
        flexShrink: 0
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              background: activeTab === tab ? '#f7fafc' : 'transparent',
              color: activeTab === tab ? '#2d3748' : '#6b7280',
              fontSize: 12,
              fontWeight: activeTab === tab ? 700 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #4ade80' : '2px solid transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#2d3748';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* ポケモン数表示と最終進化フィルター */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        margin: '0 0 8px 0', 
        flexShrink: 0 
      }}>
        {/* 左側：ポケモン数とコントロールボタン */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* ポケモン数表示 */}
          <div style={{ color: '#6b7280', fontSize: 12 }}>
            {filteredPokemons.length}匹
          </div>
          
          {/* コントロールボタン */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* 虫眼鏡ボタン（フィルター） */}
            <button
              onClick={onOpenFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 24,
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 12,
                cursor: 'pointer',
                padding: 0,
                gap: 3
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <circle cx="10" cy="10" r="7"/>
                <path d="M21 21l-6-6"/>
              </svg>
              
              {/* フィルターON/OFF表示 */}
              <span style={{ 
                fontSize: 8, 
                color: '#000', 
                fontWeight: 600,
                lineHeight: 1
              }}>
                {(() => {
                  // フィルターが設定されているかチェック
                  const hasFilters = 
                    filters.specialty !== 'すべて' ||
                    filters.berry !== '' ||
                    filters.ingredient !== '' ||
                    filters.subskill !== '' ||
                    filters.nature !== '' ||
                    filters.sortBy !== 'id' ||
                    filters.sortOrder !== 'asc';
                  
                  return hasFilters ? 'ON' : 'OFF';
                })()}
              </span>
            </button>
            
            {/* ソートボタン */}
            <button
              onClick={onOpenSort}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 24,
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 12,
                cursor: 'pointer',
                padding: 0,
                gap: 3
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M7 12h10"/>
                <path d="M10 18h4"/>
              </svg>
              
              {/* ソート基準表示 */}
              <span style={{ 
                fontSize: 8, 
                color: '#000', 
                fontWeight: 600,
                lineHeight: 1
              }}>
                {(() => {
                  switch (filters.sortBy) {
                    case 'id':
                      return '図鑑番号';
                    case 'name':
                      return '名前';
                    case 'specialty':
                      return '得意分野';
                    case 'frequency':
                      return '頻度';
                    default:
                      return '図鑑番号';
                  }
                })()}
              </span>
            </button>
            
            {/* ソート順序ボタン */}
            <button
              onClick={() => {
                const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
                onFiltersChange({ ...filters, sortOrder: newOrder });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                background: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {filters.sortOrder === 'asc' ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <path d="m7 14 5-5 5 5"/>
                  <path d="M12 19V5"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <path d="m7 10 5 5 5-5"/>
                  <path d="M12 5v14"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* 右側：最終進化フィルター */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {(['すべて', '最終進化のみ', '進化前のみ'] as const).map((option) => (
            <button
              key={option}
              onClick={() => {
                if (filters.finalEvolution !== option) {
                  const newFilters = { ...filters, finalEvolution: option };
                  onFiltersChange(newFilters);
                }
              }}
              style={{
                padding: '2px 6px',
                borderRadius: 12,
                border: filters.finalEvolution === option ? 'none' : '1px solid #d1d5db',
                background: filters.finalEvolution === option ? '#4f46e5' : '#fff',
                color: filters.finalEvolution === option ? '#fff' : '#374151',
                fontSize: 10,
                cursor: 'pointer',
                fontWeight: filters.finalEvolution === option ? 600 : 400,
                whiteSpace: 'nowrap'
              }}
            >
              {option === 'すべて' ? '全て' : option === '最終進化のみ' ? '最終' : '進化前'}
            </button>
          ))}
        </div>
      </div>
      
      {/* きのみタブの場合はきのみ別にグルーピング表示 */}
      {activeTab === 'きのみ' ? (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: 8,
          background: '#f7fafc'
        }}>
          {(() => {
            // きのみごとにポケモンをグルーピング
            const berryGroups: { [berryId: number]: Pokemon[] } = {};
            filteredPokemons.forEach(pokemon => {
              if (!berryGroups[pokemon.berryId]) {
                berryGroups[pokemon.berryId] = [];
              }
              berryGroups[pokemon.berryId].push(pokemon);
            });

            // きのみIDでソート
            const sortedBerryIds = Object.keys(berryGroups)
              .map(id => parseInt(id))
              .sort((a, b) => a - b);

            return sortedBerryIds.map(berryId => {
              const berry = getBerry(berryId);
              const pokemonsForBerry = berryGroups[berryId];
              
              return (
                <div key={berryId} style={{ marginBottom: 16 }}>
                  {/* きのみヘッダー */}
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
                      src={`${import.meta.env.BASE_URL}image/berry/${getBerryImageName(berry?.name || '')}.png`}
                      alt={berry?.name || ''}
                      style={{ width: 24, height: 24, objectFit: 'contain' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${import.meta.env.BASE_URL}image/berry/cheriberry.png`;
                      }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
                      {berry?.name || `きのみ${berryId}`}
                    </span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      ({pokemonsForBerry.length}匹)
                    </span>
                  </div>
                  
                  {/* そのきのみのポケモン一覧 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: 6,
                    padding: '0 8px'
                  }}>
                    {pokemonsForBerry.map(pokemon => (
          <div
            key={getPokemonKey(pokemon)}
            onClick={() => onPokemonSelect(pokemon)}
            style={{
              background: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#4299e1' : '#fff',
              border: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              color: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#fff' : '#2d3748',
              transform: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? 'scale(1.05)' : 'scale(1)',
              boxShadow: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
              minHeight: 68, // 固定最小高さで統一（画像40px + 名前20px + padding8px）
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{ position: 'relative', marginBottom: 2 }}>
              <img
                src={`${import.meta.env.BASE_URL}image/pokemon/${getNewPokemonImageName(pokemon)}.png`}
                alt={pokemon.name}
                style={{
                  width: '100%',
                  height: 40,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // 特別な姿の画像が見つからない場合は通常の姿にフォールバック
                  const pokedexId = pokemon.pokedexId.toString().padStart(3, '0');
                  target.src = `${import.meta.env.BASE_URL}image/pokemon/${pokedexId}.png`;
                  // それでも見つからない場合はデフォルト画像
                  target.onerror = () => {
                    target.src = '/vite.svg';
                  };
                }}
              />
              {/* 管理状態アイコン */}
              {getStatusIcon(pokemonStatuses[getPokemonKey(pokemon)])}
            </div>
            <div style={{ 
              fontSize: 8, 
              fontWeight: 700, 
              lineHeight: 1.1, 
              wordBreak: 'break-word',
              height: 20, // 固定高さで統一
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                {splitPokemonName(pokemon.name).mainName}
              </div>
              {splitPokemonName(pokemon.name).formName && (
                <div style={{ 
                  fontSize: 6, 
                  color: '#666', 
                  lineHeight: 1.0,
                  textAlign: 'center'
                }}>
                  {splitPokemonName(pokemon.name).formName}
                </div>
              )}
            </div>
          </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : activeTab === '食材' ? (
        // 食材タブの場合は食材別にグルーピング表示
        <div style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: 8,
          background: '#f7fafc'
        }}>
          {(() => {
            // 食材ごとにポケモンをグルーピング
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
              const pokemonsForIngredient = ingredientGroups[ingredientId];
              
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: 6,
                    padding: '0 8px'
                  }}>
                    {pokemonsForIngredient.map(pokemon => (
                      <div
                        key={getPokemonKey(pokemon)}
                        onClick={() => onPokemonSelect(pokemon)}
                        style={{
                          background: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#4299e1' : '#fff',
                          border: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
                          borderRadius: 4,
                          padding: 4,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          color: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#fff' : '#2d3748',
                          transform: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
                          minHeight: 68,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40 }}>
                          <img
                            src={`${import.meta.env.BASE_URL}image/pokemon/${getNewPokemonImageName(pokemon)}.png`}
                            alt={pokemon.name}
                            style={{
                              maxWidth: 40,
                              maxHeight: 40,
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const pokedexId = pokemon.pokedexId.toString().padStart(3, '0');
                              target.src = `${import.meta.env.BASE_URL}image/pokemon/${pokedexId}.png`;
                              target.onerror = () => {
                                target.src = '/vite.svg';
                              };
                            }}
                          />
                          {/* 食材の順番ラベル（A,B,C） */}
                          {(() => {
                            let label = '';
                            let backgroundColor = '';
                            if (pokemon.ing1?.ingredientId === ingredientId) {
                              label = 'A';
                              backgroundColor = '#ef4444'; // 赤色
                            } else if (pokemon.ing2?.ingredientId === ingredientId) {
                              label = 'B';
                              backgroundColor = '#3b82f6'; // 青色
                            } else if (pokemon.ing3?.ingredientId === ingredientId) {
                              label = 'C';
                              backgroundColor = '#10b981'; // 緑色
                            }
                            
                            return label ? (
                              <span style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                background: backgroundColor,
                                color: '#fff',
                                borderRadius: '50%',
                                width: 16,
                                height: 16,
                                fontSize: 8,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #fff',
                                zIndex: 10
                              }}>
                                {label}
                              </span>
                            ) : null;
                          })()}
                          {getStatusIcon(pokemonStatuses[getPokemonKey(pokemon)])}
                        </div>
                        <div style={{ 
                          fontSize: 8, 
                          fontWeight: 700, 
                          lineHeight: 1.1, 
                          wordBreak: 'break-word',
                          height: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            {splitPokemonName(pokemon.name).mainName}
                          </div>
                          {splitPokemonName(pokemon.name).formName && (
                            <div style={{ 
                              fontSize: 6, 
                              color: '#666', 
                              lineHeight: 1.0,
                              textAlign: 'center'
                            }}>
                              {splitPokemonName(pokemon.name).formName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : activeTab === 'スキル' ? (
        // スキルタブの場合はminorclass別にグルーピング表示
        <div style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: 8,
          background: '#f7fafc'
        }}>
          {(() => {
            // minorclass（スキル種別）ごとにポケモンをグルーピング
            const skillGroups: { [minorclass: string]: { pokemons: Pokemon[], skill: any } } = {};
            filteredPokemons.forEach(pokemon => {
              const skill = MAINSKILLS.find(s => s.id === pokemon.mainSkillId);
              if (skill) {
                if (!skillGroups[skill.minorclass]) {
                  skillGroups[skill.minorclass] = { pokemons: [], skill };
                }
                skillGroups[skill.minorclass].pokemons.push(pokemon);
              }
            });

            // minorclassでソート
            const sortedMinorclasses = Object.keys(skillGroups).sort();

            return sortedMinorclasses.map(minorclass => {
              const { pokemons: pokemonsForSkill, skill } = skillGroups[minorclass];
              
              return (
                <div key={minorclass} style={{ marginBottom: 16 }}>
                  {/* スキルヘッダー */}
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
                      src={`${import.meta.env.BASE_URL}image/mainskill/${skill.imagename}.png`}
                      alt={skill.minorclass}
                      style={{ width: 24, height: 24, objectFit: 'contain' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `${import.meta.env.BASE_URL}vite.svg`;
                      }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
                      {skill.minorclass}
                    </span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      ({pokemonsForSkill.length}匹)
                    </span>
                  </div>
                  
                  {/* そのスキルのポケモン一覧 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: 6,
                    padding: '0 8px'
                  }}>
                    {pokemonsForSkill.map(pokemon => (
                      <div
                        key={getPokemonKey(pokemon)}
                        onClick={() => onPokemonSelect(pokemon)}
                        style={{
                          background: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#4299e1' : '#fff',
                          border: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
                          borderRadius: 4,
                          padding: 4,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          color: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#fff' : '#2d3748',
                          transform: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
                          minHeight: 68,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40 }}>
                          <img
                            src={`${import.meta.env.BASE_URL}image/pokemon/${getNewPokemonImageName(pokemon)}.png`}
                            alt={pokemon.name}
                            style={{
                              maxWidth: 40,
                              maxHeight: 40,
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const pokedexId = pokemon.pokedexId.toString().padStart(3, '0');
                              target.src = `${import.meta.env.BASE_URL}image/pokemon/${pokedexId}.png`;
                              target.onerror = () => {
                                target.src = '/vite.svg';
                              };
                            }}
                          />
                          {getStatusIcon(pokemonStatuses[getPokemonKey(pokemon)])}
                        </div>
                        <div style={{ 
                          fontSize: 8, 
                          fontWeight: 700, 
                          lineHeight: 1.1, 
                          wordBreak: 'break-word',
                          height: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            {splitPokemonName(pokemon.name).mainName}
                          </div>
                          {splitPokemonName(pokemon.name).formName && (
                            <div style={{ 
                              fontSize: 6, 
                              color: '#666', 
                              lineHeight: 1.0,
                              textAlign: 'center'
                            }}>
                              {splitPokemonName(pokemon.name).formName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        // 通常のポケモン一覧表示（きのみタブ以外）
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
          gap: 6,
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: 8,
          background: '#f7fafc'
        }}>
          {filteredPokemons.map(pokemon => (
            <div
              key={getPokemonKey(pokemon)}
              onClick={() => onPokemonSelect(pokemon)}
              style={{
                background: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#4299e1' : '#fff',
                border: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
                borderRadius: 4,
                padding: 4,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                color: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '#fff' : '#2d3748',
                transform: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? 'scale(1.05)' : 'scale(1)',
                boxShadow: getPokemonKey(selectedPokemon) === getPokemonKey(pokemon) ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
                minHeight: 68,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (getPokemonKey(selectedPokemon) !== getPokemonKey(pokemon)) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40 }}>
                <img
                  src={`${import.meta.env.BASE_URL}image/pokemon/${getNewPokemonImageName(pokemon)}.png`}
                  alt={pokemon.name}
                  style={{
                    maxWidth: 40,
                    maxHeight: 40,
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const pokedexId = pokemon.pokedexId.toString().padStart(3, '0');
                    target.src = `${import.meta.env.BASE_URL}image/pokemon/${pokedexId}.png`;
                    target.onerror = () => {
                      target.src = '/vite.svg';
                    };
                  }}
                />
                {getStatusIcon(pokemonStatuses[getPokemonKey(pokemon)])}
              </div>
              <div style={{ 
                fontSize: 8, 
                fontWeight: 700, 
                lineHeight: 1.1, 
                wordBreak: 'break-word',
                height: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  {splitPokemonName(pokemon.name).mainName}
                </div>
                {splitPokemonName(pokemon.name).formName && (
                  <div style={{ 
                    fontSize: 6, 
                    color: '#666', 
                    lineHeight: 1.0,
                    textAlign: 'center'
                  }}>
                    {splitPokemonName(pokemon.name).formName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonSelector;