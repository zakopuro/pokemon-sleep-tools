import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { FIELDS, SLEEP_TYPES, POKEMONS } from '../../config';
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
    memoOnly: false,
  });

  // 管理状態を取得してからフィルターを適用
  const pokemonStatuses = usePokemonStatuses([...POKEMONS]);
  const filteredPokemons = usePokemonFiltering(filters, 'すべて', pokemonStatuses);

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
    (filters.managementStatuses && filters.managementStatuses.length > 0) ||
    filters.memoOnly;

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

  // スクリーンショットを撮影する共通関数
  const captureScreenshot = async (): Promise<{ canvas: HTMLCanvasElement; blob: Blob } | null> => {
    try {
      // 内側のスクロール可能なテーブル要素を取得
      const scrollableElement = document.querySelector('[data-field-table-scrollable]') as HTMLElement;
      if (!scrollableElement) {
        console.error('フィールド表が見つかりません');
        return null;
      }

      // 元のスタイルを保存
      const originalStyle = {
        width: scrollableElement.style.width,
        height: scrollableElement.style.height,
        maxWidth: scrollableElement.style.maxWidth,
        maxHeight: scrollableElement.style.maxHeight,
        overflowX: scrollableElement.style.overflowX,
        overflowY: scrollableElement.style.overflowY
      };

      // 一時的にスクロールを無効化し、全体を表示
      scrollableElement.style.width = 'auto';
      scrollableElement.style.height = 'auto';
      scrollableElement.style.maxWidth = 'none';
      scrollableElement.style.maxHeight = 'none';
      scrollableElement.style.overflowX = 'visible';
      scrollableElement.style.overflowY = 'visible';

      // DOMの更新を待つ
      await new Promise(resolve => setTimeout(resolve, 200));

      // 実際のコンテンツサイズを取得
      const actualWidth = scrollableElement.scrollWidth;
      const actualHeight = scrollableElement.scrollHeight;

      // スクリーンショットを撮影
      const canvas = await html2canvas(scrollableElement, {
        backgroundColor: '#ffffff',
        scale: 1.5, // 解像度を少し下げて安定性向上
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false,
        width: actualWidth,
        height: actualHeight,
        windowWidth: actualWidth,
        windowHeight: actualHeight
      });

      // 元のスタイルを復元
      scrollableElement.style.width = originalStyle.width;
      scrollableElement.style.height = originalStyle.height;
      scrollableElement.style.maxWidth = originalStyle.maxWidth;
      scrollableElement.style.maxHeight = originalStyle.maxHeight;
      scrollableElement.style.overflowX = originalStyle.overflowX;
      scrollableElement.style.overflowY = originalStyle.overflowY;

      // Canvasをblobに変換
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ canvas, blob });
          } else {
            resolve(null);
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('スクリーンショットの撮影に失敗しました:', error);
      return null;
    }
  };

  const handleScreenshot = async () => {
    // 確認ダイアログを表示
    const confirmed = confirm('出現フィールド表の画像を保存しますか？');
    if (!confirmed) {
      return; // キャンセルされた場合は何もしない
    }

    try {
      const result = await captureScreenshot();
      if (!result) {
        alert('スクリーンショットの撮影に失敗しました');
        return;
      }

      // Canvasを画像としてダウンロード
      const link = document.createElement('a');
      link.download = `field-pokemon-table-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = result.canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('スクリーンショットの撮影に失敗しました:', error);
      alert('スクリーンショットの撮影に失敗しました');
    }
  };

  const handleShare = async () => {
    try {
      // Web Share APIが利用可能で、画像共有に対応している場合
      if (navigator.share && navigator.canShare) {
        const result = await captureScreenshot();
        if (result) {
          const fileName = `field-pokemon-table-${new Date().toISOString().slice(0, 10)}.png`;
          const file = new File([result.blob], fileName, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            // 画像のみ共有
            await navigator.share({
              title: 'ポケモンスリープ出現フィールド表',
              files: [file]
            });
            return;
          }
        }
        
        // ファイル共有に対応していない場合はテキストのみ共有
        const shareText = `私のポケモンスリープの出現フィールド表です！

#ポケモンスリープ #ポケスリ厳選管理

https://zakopuro.github.io/pokemon-sleep-tools/`;
        
        await navigator.share({
          title: 'ポケモンスリープ出現フィールド表',
          text: shareText
        });
        return;
      }

      // Web Share APIが使えない場合はTwitterで共有
      const shareText = `私のポケモンスリープの出現フィールド表です！

#ポケモンスリープ #ポケスリ厳選管理

https://zakopuro.github.io/pokemon-sleep-tools/`;
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(twitterUrl, '_blank');
      
    } catch (error) {
      console.error('共有に失敗しました:', error);
      alert('共有に失敗しました');
    }
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
                title="フィールド表のスクリーンショットを保存"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="12" height="12">
                  <path fill="#1a16f3" d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
                </svg>
              </button>
              
              {/* 共有ボタン */}
              <button
                onClick={handleShare}
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
                title="フィールド表を共有"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="12" height="12">
                  <path fill="#005eff" d="M352 224c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96c0 4 .2 8 .7 11.9l-94.1 47C145.4 170.2 121.9 160 96 160c-53 0-96 43-96 96s43 96 96 96c25.9 0 49.4-10.2 66.6-26.9l94.1 47c-.5 3.9-.7 7.8-.7 11.9c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-25.9 0-49.4 10.2-66.6 26.9l-94.1-47c.5-3.9 .7-7.8 .7-11.9s-.2-8-.7-11.9l94.1-47C302.6 213.8 326.1 224 352 224z"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* 右側：最終進化フィルター */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={() => {
                setFilters({ ...filters, memoOnly: !filters.memoOnly });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                padding: 0,
                borderRadius: 12,
                border: filters.memoOnly ? '1px solid #10b981' : '1px solid #d1d5db',
                background: filters.memoOnly ? '#dcfce7' : '#fff',
                cursor: 'pointer'
              }}
              title={filters.memoOnly ? 'メモフィルターを解除' : 'メモがあるポケモンのみ表示'}
            >
              <img
                src={`${import.meta.env.BASE_URL}${filters.memoOnly ? 'memo_add.png' : 'memo.png'}`}
                alt="メモフィルター"
                style={{ width: 14, height: 14, objectFit: 'contain' }}
              />
            </button>
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
        <div 
          data-field-table
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
          <div 
            data-field-table-scrollable
            style={{
              overflowX: 'auto',
              overflowY: 'visible'
            }}>
          {/* テーブルヘッダー */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `120px repeat(${FIELDS.length}, 200px)`,
            backgroundColor: '#f7fafc',
            borderBottom: '1px solid #e2e8f0',
            minWidth: `${120 + (FIELDS.length * 200)}px`
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
                gridTemplateColumns: `120px repeat(${FIELDS.length}, 200px)`,
                borderBottom: sleepTypeIndex < SLEEP_TYPES.length - 1 ? '1px solid #e2e8f0' : 'none',
                minHeight: '120px',
                minWidth: `${120 + (FIELDS.length * 200)}px`
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