import React from 'react';
import html2canvas from 'html2canvas';
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
    filters.subSkills.length > 0 ||
    (filters.managementStatuses && filters.managementStatuses.length > 0);

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

  const handleScreenshot = async () => {
    try {
      // ポケモンボックス部分のDOMエレメントを取得
      const boxElement = document.querySelector('[data-pokemon-box]') as HTMLElement;
      if (!boxElement) {
        console.error('ポケモンボックスが見つかりません');
        return;
      }

      // 元のスタイルを保存
      const originalStyle = {
        height: boxElement.style.height,
        maxHeight: boxElement.style.maxHeight,
        overflowY: boxElement.style.overflowY,
        overflowX: boxElement.style.overflowX
      };

      // 一時的にスクロールを無効化し、全体を表示
      boxElement.style.height = 'auto';
      boxElement.style.maxHeight = 'none';
      boxElement.style.overflowY = 'visible';
      boxElement.style.overflowX = 'visible';

      // DOMの更新を待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      // スクリーンショットを撮影
      const canvas = await html2canvas(boxElement, {
        backgroundColor: '#f7fafc', // 背景色を要素と同じにする
        scale: 2, // 高解像度
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false
      });

      // 元のスタイルを復元
      boxElement.style.height = originalStyle.height;
      boxElement.style.maxHeight = originalStyle.maxHeight;
      boxElement.style.overflowY = originalStyle.overflowY;
      boxElement.style.overflowX = originalStyle.overflowX;

      // Canvasを画像としてダウンロード
      const link = document.createElement('a');
      link.download = `pokemon-box-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('スクリーンショットの撮影に失敗しました:', error);
      alert('スクリーンショットの撮影に失敗しました');
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
          
          {/* カメラボタン（スクリーンショット） */}
          <button
            onClick={handleScreenshot}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 12,
              cursor: 'pointer',
              padding: 0,
              marginLeft: 4
            }}
            title="ボックスのスクリーンショットを保存"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="12" height="12">
              <path fill="#1a16f3" d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
            </svg>
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
            {option === 'すべて' ? '全て' : option === '最終進化のみ' ? '最終' : 'たね'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PokemonSelectorHeader;