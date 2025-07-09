import React, { useState } from 'react';
import { FIELDS, SLEEP_TYPES } from '../../config';
import PokemonFilters, { type FilterOptions } from '../PokemonFilters';
import PokemonCard from '../pokemon/PokemonCard';
import { usePokemonFiltering } from '../../hooks/usePokemonFiltering';
import { usePokemonStatuses } from '../../hooks/usePokemonStatuses';
import { getPokemonKey } from '../../utils/pokemon-storage';
import StatusIcon from '../common/StatusIcon';
import { sleepTypeColors } from '../../constants/colors';
import type { Pokemon } from '../../../config/schema';

interface FieldPokemonProps {}

const FieldPokemon: React.FC<FieldPokemonProps> = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: 'すべて',
    specialties: [],
    berry: '',
    ingredient: '',
    subskill: '',
    nature: '',
    sortBy: 'id',
    sortOrder: 'asc',
    finalEvolution: 'すべて',
    name: '',
    pokemonTypes: [],
    berries: [],
    ingredients: [],
    ingredientsAndSearch: false,
    mainSkills: [],
    subSkills: [],
    managementStatuses: [],
  });

  // フィルターを適用したポケモンリストを取得
  const filteredPokemons = usePokemonFiltering(filters, 'すべて');
  const pokemonStatuses = usePokemonStatuses(filteredPokemons);

  // フィルターが設定されているかチェック
  const hasFilters = 
    filters.specialty !== 'すべて' ||
    (filters.specialties && filters.specialties.length > 0) ||
    filters.berry !== '' ||
    filters.ingredient !== '' ||
    filters.subskill !== '' ||
    filters.nature !== '' ||
    filters.name !== '' ||
    filters.pokemonTypes.length > 0 ||
    filters.berries.length > 0 ||
    filters.ingredients.length > 0 ||
    filters.mainSkills.length > 0 ||
    filters.subSkills.length > 0 ||
    filters.finalEvolution !== 'すべて' ||
    (filters.managementStatuses && filters.managementStatuses.length > 0);

  // フィールドと睡眠タイプの組み合わせでポケモンを分類
  const pokemonByFieldAndSleepType = React.useMemo(() => {
    const result: { [fieldId: number]: { [sleepType: string]: Pokemon[] } } = {};
    
    FIELDS.forEach(field => {
      result[field.id] = {};
      SLEEP_TYPES.forEach(sleepType => {
        result[field.id][sleepType.name] = filteredPokemons.filter(pokemon => 
          pokemon.fieldIds.includes(field.id) && pokemon.sleepType === sleepType.name
        );
      });
    });
    
    return result;
  }, [filteredPokemons]);

  const totalPokemon = filteredPokemons.length;

  const handlePokemonSelect = () => {
    // 出現フィールドページでは特に何もしない（クリック無効）
  };

  return (
    <div style={{ 
      flex: 1, 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc'
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: 18, 
            fontWeight: 700, 
            color: '#1a202c',
            marginBottom: '8px'
          }}>
            出現フィールド
          </h2>
        </div>

        {/* フィルターボタンと統計 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* ポケモン数表示 */}
            <div style={{ color: '#6b7280', fontSize: 12 }}>
              {totalPokemon}匹
            </div>
            
            {/* コントロールボタン */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {/* 虫眼鏡ボタン（フィルター） */}
              <button
                onClick={() => setShowFilters(true)}
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
                  {hasFilters ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
          
          {/* 右側：最終進化フィルター */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {(['すべて', '最終進化のみ', 'たねのみ'] as const).map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (filters.finalEvolution !== option) {
                    const newFilters = { ...filters, finalEvolution: option };
                    setFilters(newFilters);
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
                {option === 'すべて' ? '全て' : option === '最終進化のみ' ? '最終' : 'たね'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 表形式のポケモン表示 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto',
            overflowY: 'visible'
          }}>
          {/* テーブルヘッダー */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px repeat(6, 200px)',
            backgroundColor: '#f7fafc',
            borderBottom: '1px solid #e2e8f0',
            minWidth: '1320px'
          }}>
            <div style={{
              padding: '12px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#2d3748',
              borderRight: '1px solid #e2e8f0'
            }}>
            </div>
            {FIELDS.map(field => (
              <div
                key={field.id}
                style={{
                  padding: '12px 8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#2d3748',
                  textAlign: 'center',
                  borderRight: field.id < FIELDS.length ? '1px solid #e2e8f0' : 'none',
                  backgroundColor: field.color,
                  textShadow: '0 0 3px rgba(255, 255, 255, 0.8), 0 0 6px rgba(255, 255, 255, 0.6)'
                }}
              >
                {field.abbreviation}
              </div>
            ))}
          </div>

          {/* テーブルボディ */}
          {SLEEP_TYPES.map((sleepType, sleepTypeIndex) => (
            <div
              key={sleepType.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(6, 200px)',
                borderBottom: sleepTypeIndex < SLEEP_TYPES.length - 1 ? '1px solid #e2e8f0' : 'none',
                minHeight: '120px',
                minWidth: '1320px'
              }}
            >
              {/* 睡眠タイプラベル */}
              <div style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid #e2e8f0',
                backgroundColor: '#fafafa'
              }}>
                <span style={{
                  background: sleepTypeColors[sleepType.name as keyof typeof sleepTypeColors],
                  color: (() => {
                    switch(sleepType.name) {
                      case 'うとうと': return '#b8860b';
                      case 'すやすや': return '#1e50a2';
                      case 'ぐっすり': return '#ffffff';
                      default: return '#2d3748';
                    }
                  })(),
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #e2e8f0'
                }}>
                  {sleepType.name}
                </span>
              </div>

              {/* フィールドごとのポケモン表示 */}
              {FIELDS.map((field, fieldIndex) => {
                const pokemonList = pokemonByFieldAndSleepType[field.id][sleepType.name];
                
                return (
                  <div
                    key={field.id}
                    style={{
                      padding: '8px',
                      borderRight: fieldIndex < FIELDS.length - 1 ? '1px solid #e2e8f0' : 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 32px))',
                      gap: '2px',
                      justifyContent: 'start'
                    }}>
                      {pokemonList.map(pokemon => (
                        <div
                          key={getPokemonKey(pokemon)}
                          style={{
                            position: 'relative',
                            width: '32px',
                            height: '38px'
                          }}
                        >
                          <PokemonCard
                            pokemon={pokemon}
                            isSelected={false}
                            statusIcon={
                              <StatusIcon
                                status={pokemonStatuses[getPokemonKey(pokemon)]?.status || ''}
                                count={pokemonStatuses[getPokemonKey(pokemon)]?.count}
                              />
                            }
                            onClick={() => handlePokemonSelect()}
                            size="tiny"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* 出現数表示 */}
                    {pokemonList.length > 0 && (
                      <div style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        color: '#718096',
                        textAlign: 'center'
                      }}>
                        {pokemonList.length}匹
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* フィルターモーダル */}
      {showFilters && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFilters(false);
            }
          }}
        >
          <PokemonFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FieldPokemon;