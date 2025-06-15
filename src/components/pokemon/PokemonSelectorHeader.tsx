import React from 'react';
import type { FilterOptions } from '../PokemonFilters';

interface PokemonSelectorHeaderProps {
  pokemonCount: number;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onOpenFilters: () => void;
  onOpenSort: () => void;
}

const PokemonSelectorHeader: React.FC<PokemonSelectorHeaderProps> = ({
  pokemonCount,
  filters,
  onFiltersChange,
  onOpenFilters,
  onOpenSort
}) => {
  // フィルターが設定されているかチェック（ソート設定は除外）
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
    filters.subSkills.length > 0;

  const getSortLabel = () => {
    switch (filters.sortBy) {
      case 'id':
        return '図鑑番号';
      case 'name':
        return '名前';
      case 'sleepType':
        return '睡眠タイプ';
      case 'specialty':
        return 'とくいなもの';
      default:
        return '図鑑番号';
    }
  };

  return (
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
          {pokemonCount}匹
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
              {hasFilters ? 'ON' : 'OFF'}
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
              {getSortLabel()}
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
  );
};

export default PokemonSelectorHeader;