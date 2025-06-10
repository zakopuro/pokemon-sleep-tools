import React from 'react';
import { POKEMONS } from '../../config';
import type { FilterOptions } from '../PokemonFilters';
import type { Pokemon } from '../../../config/schema';
import { loadPokemonSettings, getPokemonKey } from '../../utils/pokemon-storage';

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

// 特別な姿のポケモンの画像ファイル名を取得
const getPokemonImageName = (pokemon: Pokemon) => {
  const baseId = pokemon.id.toString().padStart(3, '0');
  
  // 名前に特別な形状が含まれている場合
  if (pokemon.name.includes('(ハロウィン)')) {
    return `${baseId}-halloween`;
  }
  if (pokemon.name.includes('(ホリデー)')) {
    return `${baseId}-holiday`;
  }
  if (pokemon.name.includes('(アローラ)')) {
    return `${baseId}-alolan`;
  }
  if (pokemon.name.includes('(パルデア)')) {
    return `${baseId}-paldean`;
  }
  
  // 通常の姿
  return baseId;
};

interface PokemonSelectorProps {
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  filters: FilterOptions;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  selectedPokemon,
  onPokemonSelect,
  filters
}) => {
  const filteredPokemons = React.useMemo(() => {
    let filtered = [...POKEMONS];

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

    // ソート前に特別な姿のポケモンを正しい順序に配置
    filtered.sort((a, b) => {
      // まずIDでソート
      if (a.id !== b.id) {
        return a.id - b.id;
      }
      
      // 同じIDの場合、通常の姿を先に、特別な姿を後に
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
    }

    return filtered;
  }, [filters]);

  // ポケモンの管理状態をメモ化
  const pokemonStatuses = React.useMemo(() => {
    const statuses: { [pokemonKey: string]: string } = {};
    filteredPokemons.forEach(pokemon => {
      const settings = loadPokemonSettings(pokemon);
      const pokemonKey = getPokemonKey(pokemon);
      statuses[pokemonKey] = settings.managementStatus;
    });
    return statuses;
  }, [filteredPokemons]);

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

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
        ポケモン一覧 ({filteredPokemons.length}匹)
      </h2>
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
                src={`${import.meta.env.BASE_URL}image/pokemon/${getPokemonImageName(pokemon)}.png`}
                alt={pokemon.name}
                style={{
                  width: '100%',
                  height: 40,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // 特別な姿の画像が見つからない場合は通常の姿にフォールバック
                  const baseId = pokemon.id.toString().padStart(3, '0');
                  target.src = `${import.meta.env.BASE_URL}image/pokemon/${baseId}.png`;
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
};

export default PokemonSelector;