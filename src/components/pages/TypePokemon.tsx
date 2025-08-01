import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { POKEMONS, BERRIES, INGREDIENTS, MAINSKILLS } from '../../config';
import PokemonFilters, { type FilterOptions } from '../PokemonFilters';
import PokemonCard from '../pokemon/PokemonCard';
import { usePokemonFiltering } from '../../hooks/usePokemonFiltering';
import { usePokemonStatuses } from '../../hooks/usePokemonStatuses';
import { getPokemonKey } from '../../utils/pokemon-storage';
import StatusIcon from '../common/StatusIcon';

interface TypePokemonProps {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
}

const TypePokemon: React.FC<TypePokemonProps> = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'berry' | 'ingredient' | 'skill'>('berry');
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['A', 'B', 'C']); // A/B/Cフィルター
  const [evolutionFilter, setEvolutionFilter] = useState<'すべて' | '最終進化のみ' | 'たねのみ'>('すべて'); // 進化フィルター
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

  // 管理状態を取得してからフィルターを適用
  const pokemonStatuses = usePokemonStatuses([...POKEMONS]);
  const filteredPokemons = usePokemonFiltering(filters, activeTab === 'berry' ? 'きのみ' : activeTab === 'ingredient' ? '食材' : 'スキル', pokemonStatuses);

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

  const totalPokemon = filteredPokemons.length;

  const handlePokemonSelect = () => {
    // タイプ別ページでは特に何もしない（クリック無効）
  };

  // スクリーンショットを撮影する共通関数
  const captureScreenshot = async (): Promise<{ canvas: HTMLCanvasElement; blob: Blob } | null> => {
    try {
      // タブに応じてスクリーンショット対象を選択
      let dataAttribute: string;
      switch (activeTab) {
        case 'ingredient':
          dataAttribute = '[data-ingredient-matrix-scrollable]';
          break;
        case 'skill':
          dataAttribute = '[data-skill-matrix-scrollable]';
          break;
        case 'berry':
          dataAttribute = '[data-berry-matrix-scrollable]';
          break;
        default:
          dataAttribute = '[data-ingredient-matrix-scrollable]';
      }
      
      const scrollableElement = document.querySelector(dataAttribute) as HTMLElement;
      if (!scrollableElement) {
        console.error(`${activeTab}表が見つかりません`);
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
    // タブに応じてメッセージを設定
    let tabName: string;
    switch (activeTab) {
      case 'ingredient':
        tabName = '食材マトリックス表';
        break;
      case 'skill':
        tabName = 'スキルマトリックス表';
        break;
      case 'berry':
        tabName = 'きのみマトリックス表';
        break;
      default:
        tabName = 'マトリックス表';
    }
    
    const confirmed = confirm(`${tabName}の画像を保存しますか？`);
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
      let fileName: string;
      switch (activeTab) {
        case 'ingredient':
          fileName = 'ingredient-matrix-table';
          break;
        case 'skill':
          fileName = 'skill-matrix-table';
          break;
        case 'berry':
          fileName = 'berry-matrix-table';
          break;
        default:
          fileName = 'matrix-table';
      }
      
      link.download = `${fileName}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = result.canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('スクリーンショットの撮影に失敗しました:', error);
      alert('スクリーンショットの撮影に失敗しました');
    }
  };

  const handleShare = async () => {
    try {
      // タブに応じてメッセージを設定
      let tabName: string;
      let filePrefix: string;
      switch (activeTab) {
        case 'ingredient':
          tabName = '食材マトリックス表';
          filePrefix = 'ingredient-matrix-table';
          break;
        case 'skill':
          tabName = 'スキルマトリックス表';
          filePrefix = 'skill-matrix-table';
          break;
        case 'berry':
          tabName = 'きのみマトリックス表';
          filePrefix = 'berry-matrix-table';
          break;
        default:
          tabName = 'マトリックス表';
          filePrefix = 'matrix-table';
      }
      
      // Web Share APIが利用可能で、画像共有に対応している場合
      if (navigator.share && navigator.canShare) {
        const result = await captureScreenshot();
        if (result) {
          const fileName = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
          const file = new File([result.blob], fileName, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            // 画像のみ共有
            await navigator.share({
              title: `ポケモンスリープ${tabName}`,
              files: [file]
            });
            return;
          }
        }
        
        // ファイル共有に対応していない場合はテキストのみ共有
        const shareText = `私のポケモンスリープの${tabName}です！

#ポケモンスリープ #ポケスリ厳選管理

https://zakopuro.github.io/pokemon-sleep-tools/`;
        
        await navigator.share({
          title: `ポケモンスリープ${tabName}`,
          text: shareText
        });
        return;
      }

      // Web Share APIが使えない場合はTwitterで共有
      const shareText = `私のポケモンスリープの${tabName}です！

#ポケモンスリープ #ポケスリ厳選管理

https://zakopuro.github.io/pokemon-sleep-tools/`;
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(twitterUrl, '_blank');
      
    } catch (error) {
      console.error('共有に失敗しました:', error);
      alert('共有に失敗しました');
    }
  };

  // A/B/Cスロットフィルターボタンコンポーネント
  const SlotFilterButtons = () => {
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

  // 進化フィルターを適用
  const applyEvolutionFilter = (pokemons: typeof POKEMONS) => {
    return pokemons.filter(pokemon => {
      switch (evolutionFilter) {
        case '最終進化のみ':
          return pokemon.isFinalEvolution;
        case 'たねのみ':
          return pokemon.isSeedPokemon;
        default:
          return true;
      }
    });
  };

  // ポケモンの食材ラベル（A/B/C）を取得
  const getIngredientLabel = (pokemon: typeof POKEMONS[0], targetIngredientId: number) => {
    if (pokemon.ing1?.ingredientId === targetIngredientId) return { label: 'A', backgroundColor: '#ef4444' };
    if (pokemon.ing2?.ingredientId === targetIngredientId) return { label: 'B', backgroundColor: '#3b82f6' };
    if (pokemon.ing3?.ingredientId === targetIngredientId) return { label: 'C', backgroundColor: '#10b981' };
    return null;
  };

  // 食材タブの内容をレンダリング
  const renderIngredientMatrix = () => {
    try {
      // 進化フィルターを適用したポケモンリスト
      const evolutionFilteredPokemons = applyEvolutionFilter(filteredPokemons);

      // INGREDIENTSが配列の場合とオブジェクトの場合を処理
      const ingredientsArray = Array.isArray(INGREDIENTS) ? INGREDIENTS : Object.values(INGREDIENTS);
      const berriesArray = Array.isArray(BERRIES) ? BERRIES : Object.values(BERRIES);

      // 食材IDでソート（「-」を除外）
      const sortedIngredients = ingredientsArray
        .filter(ingredient => ingredient.name !== '-')
        .sort((a, b) => a.id - b.id);

      // ベリーIDでソート
      const sortedBerries = berriesArray.sort((a, b) => a.id - b.id);

      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div 
            data-ingredient-matrix-scrollable
            style={{
              overflowX: 'auto',
              overflowY: 'visible'
            }}>
            {/* テーブルヘッダー（食材） */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `60px repeat(${sortedIngredients.length}, 80px)`,
              backgroundColor: '#f7fafc',
              borderBottom: '1px solid #e2e8f0',
              minWidth: `${60 + sortedIngredients.length * 80}px`
            }}>
              <div style={{
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#2d3748',
                borderRight: '1px solid #e2e8f0'
              }}>
              </div>
              {sortedIngredients.map(ingredient => (
                <div
                  key={ingredient.id}
                  style={{
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#2d3748',
                    textAlign: 'center',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={`${import.meta.env.BASE_URL}image/ing/${(() => {
                      const mapping: { [key: string]: string } = {
                        'ふといながねぎ': 'largeleek',
                        'あじわいキノコ': 'tastymushroom',
                        'とくせんエッグ': 'fancyegg',
                        'ほっこりポテト': 'softpotato',
                        'とくせんリンゴ': 'fancyapple',
                        'げきからハーブ': 'fieryherb',
                        'マメミート': 'beansausage',
                        'モーモーミルク': 'moomoomilk',
                        'あまいミツ': 'honey',
                        'ピュアなオイル': 'pureoil',
                        'あったかジンジャー': 'warmingginger',
                        'あんみんトマト': 'snoozytomato',
                        'リラックスカカオ': 'soothingcacao',
                        'ワカクサコーン': 'greengrasscorn',
                        'ワカクサ大豆': 'greengrasssoybeans',
                        'ヤドンのしっぽ': 'slowpoketail',
                        'めざましコーヒー': 'めざましコーヒー'
                      };
                      return mapping[ingredient.name] || 'honey';
                    })()}.png`}
                    alt={ingredient.name}
                    style={{ width: 24, height: 24 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>

            {/* テーブルボディ */}
            {sortedBerries.map((berry, berryIndex) => (
              <div
                key={berry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `60px repeat(${sortedIngredients.length}, 80px)`,
                  borderBottom: berryIndex < sortedBerries.length - 1 ? '1px solid #e2e8f0' : 'none',
                  minHeight: '80px',
                  minWidth: `${60 + sortedIngredients.length * 80}px`
                }}
              >
                {/* ベリーラベル */}
                <div style={{
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#2d3748',
                  borderRight: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}image/berry/${berry.eng_name}.png`}
                    alt={berry.name}
                    style={{ width: 28, height: 28 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* 各食材とのマトリックスセル */}
                {sortedIngredients.map(ingredient => {
                  // この食材とベリーの組み合わせを持つポケモンを探す
                  const matchingPokemons = evolutionFilteredPokemons.filter(pokemon => {
                    const hasIngredient = [
                      pokemon.ing1?.ingredientId,
                      pokemon.ing2?.ingredientId,
                      pokemon.ing3?.ingredientId
                    ].includes(ingredient.id);
                    
                    const hasBerry = pokemon.berryId === berry.id;
                    
                    // スロットフィルターの適用
                    if (hasIngredient && hasBerry) {
                      const ingredientLabel = getIngredientLabel(pokemon, ingredient.id);
                      if (ingredientLabel) {
                        return selectedSlots.includes(ingredientLabel.label);
                      }
                    }
                    
                    return hasIngredient && hasBerry;
                  });

                  return (
                    <div
                      key={`${berry.id}-${ingredient.id}`}
                      style={{
                        padding: '4px',
                        borderRight: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '2px',
                        alignItems: 'start',
                        justifyContent: 'start',
                        minHeight: '80px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {matchingPokemons.map((pokemon) => {
                        const pokemonKey = getPokemonKey(pokemon);
                        const pokemonStatus = pokemonStatuses[pokemonKey];
                        const ingredientLabel = getIngredientLabel(pokemon, ingredient.id);
                        
                        return (
                          <PokemonCard
                            key={pokemonKey}
                            pokemon={pokemon}
                            isSelected={false}
                            statusIcon={pokemonStatus?.status ? (
                              <StatusIcon 
                                status={pokemonStatus.status} 
                                count={pokemonStatus.count && pokemonStatus.count > 1 ? pokemonStatus.count : undefined}
                              />
                            ) : null}
                            ingredientLabel={ingredientLabel}
                            onClick={handlePokemonSelect}
                            size="tiny"
                            isIngredientTab={true}
                            selectedSlots={selectedSlots}
                            targetIngredientId={ingredient.id}
                            showPokemonName={false}
                            statusIconPosition="top-left"
                            ingredientLabelPosition="top-right"
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error in renderIngredientMatrix:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          エラーが発生しました: {error instanceof Error ? error.message : String(error)}
        </div>
      );
    }
  };

  // きのみタブの内容をレンダリング（きのみ×きのみのマトリックス表）
  const renderBerryMatrix = () => {
    try {
      // 進化フィルターを適用したポケモンリスト
      const evolutionFilteredPokemons = applyEvolutionFilter(filteredPokemons);

      // ベリーの配列を取得
      const berriesArray = Array.isArray(BERRIES) ? BERRIES : Object.values(BERRIES);
      const sortedBerries = berriesArray.sort((a, b) => a.id - b.id);

      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div 
            data-berry-matrix-scrollable
            style={{
              overflowX: 'auto',
              overflowY: 'visible'
            }}>
            {/* テーブル（きのみ行のみ） */}
            {sortedBerries.map((berry, berryIndex) => (
              <div
                key={berry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr',
                  borderBottom: berryIndex < sortedBerries.length - 1 ? '1px solid #e2e8f0' : 'none',
                  minHeight: '80px'
                }}
              >
                {/* ベリーラベル */}
                <div style={{
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#2d3748',
                  borderRight: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}image/berry/${berry.eng_name}.png`}
                    alt={berry.name}
                    style={{ width: 28, height: 28 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* そのベリーのポケモン一覧 */}
                <div style={{
                  padding: '4px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 36px))',
                  gap: '2px',
                  alignContent: 'start',
                  backgroundColor: '#ffffff'
                }}>
                  {evolutionFilteredPokemons
                    .filter(pokemon => pokemon.berryId === berry.id)
                    .map((pokemon) => {
                      const pokemonKey = getPokemonKey(pokemon);
                      const pokemonStatus = pokemonStatuses[pokemonKey];
                      
                      return (
                        <PokemonCard
                          key={pokemonKey}
                          pokemon={pokemon}
                          isSelected={false}
                          statusIcon={pokemonStatus?.status ? (
                            <StatusIcon 
                              status={pokemonStatus.status} 
                              count={pokemonStatus.count && pokemonStatus.count > 1 ? pokemonStatus.count : undefined}
                            />
                          ) : null}
                          onClick={handlePokemonSelect}
                          size="tiny"
                          showPokemonName={false}
                          statusIconPosition="top-left"
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error in renderBerryMatrix:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          エラーが発生しました: {error instanceof Error ? error.message : String(error)}
        </div>
      );
    }
  };

  // スキルタブの内容をレンダリング（ベリー×スキルのマトリックス表）
  const renderSkillMatrix = () => {
    try {
      // 進化フィルターを適用したポケモンリスト
      const evolutionFilteredPokemons = applyEvolutionFilter(filteredPokemons);

      // スキルの配列を取得してminorclassでグループ化
      const skillsArray = Array.isArray(MAINSKILLS) ? MAINSKILLS : Object.values(MAINSKILLS);
      const uniqueMinorClasses = [...new Set(skillsArray.map(skill => skill.minorclass))].sort();
      
      // 各minorclassの代表スキルを取得
      const minorClassSkills = uniqueMinorClasses.map(minorclass => 
        skillsArray.find(skill => skill.minorclass === minorclass)
      ).filter(skill => skill);

      // ベリーの配列を取得
      const berriesArray = Array.isArray(BERRIES) ? BERRIES : Object.values(BERRIES);
      const sortedBerries = berriesArray.sort((a, b) => a.id - b.id);

      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div 
            data-skill-matrix-scrollable
            style={{
              overflowX: 'auto',
              overflowY: 'visible'
            }}>
            {/* テーブルヘッダー（minorclass） */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `60px repeat(${minorClassSkills.length}, 120px)`,
              backgroundColor: '#f7fafc',
              borderBottom: '1px solid #e2e8f0',
              minWidth: `${60 + minorClassSkills.length * 120}px`
            }}>
              <div style={{
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#2d3748',
                borderRight: '1px solid #e2e8f0'
              }}>
              </div>
              {minorClassSkills.map(skill => (
                <div
                  key={skill.minorclass}
                  style={{
                    padding: '8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#2d3748',
                    textAlign: 'center',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                >
                  <img 
                    src={`${import.meta.env.BASE_URL}image/mainskill/${skill.imagename}.png`}
                    alt={skill.minorclass}
                    style={{ width: 24, height: 24 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span style={{ fontSize: '8px' }}>{skill.minorclass}</span>
                </div>
              ))}
            </div>

            {/* テーブルボディ */}
            {sortedBerries.map((berry, berryIndex) => (
              <div
                key={berry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `60px repeat(${minorClassSkills.length}, 120px)`,
                  borderBottom: berryIndex < sortedBerries.length - 1 ? '1px solid #e2e8f0' : 'none',
                  minHeight: '80px',
                  minWidth: `${60 + minorClassSkills.length * 120}px`
                }}
              >
                {/* ベリーラベル */}
                <div style={{
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#2d3748',
                  borderRight: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}image/berry/${berry.eng_name}.png`}
                    alt={berry.name}
                    style={{ width: 28, height: 28 }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* 各minorclassとのマトリックスセル */}
                {minorClassSkills.map(representativeSkill => {
                  // このベリーとminorclassの組み合わせを持つポケモンを探す
                  const matchingPokemons = evolutionFilteredPokemons.filter(pokemon => {
                    if (pokemon.berryId !== berry.id) return false;
                    const pokemonSkill = skillsArray.find(skill => skill.id === pokemon.mainSkillId);
                    return pokemonSkill && pokemonSkill.minorclass === representativeSkill.minorclass;
                  });

                  return (
                    <div
                      key={`${berry.id}-${representativeSkill.minorclass}`}
                      style={{
                        padding: '4px',
                        borderRight: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '2px',
                        alignContent: 'start',
                        minHeight: '80px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      {matchingPokemons.map((pokemon) => {
                        const pokemonKey = getPokemonKey(pokemon);
                        const pokemonStatus = pokemonStatuses[pokemonKey];
                        
                        return (
                          <PokemonCard
                            key={pokemonKey}
                            pokemon={pokemon}
                            isSelected={false}
                            statusIcon={pokemonStatus?.status ? (
                              <StatusIcon 
                                status={pokemonStatus.status} 
                                count={pokemonStatus.count && pokemonStatus.count > 1 ? pokemonStatus.count : undefined}
                              />
                            ) : null}
                            onClick={handlePokemonSelect}
                            size="tiny"
                            showPokemonName={false}
                            statusIconPosition="top-left"
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error in renderSkillMatrix:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          エラーが発生しました: {error instanceof Error ? error.message : String(error)}
        </div>
      );
    }
  };

  const tabs = [
    { id: 'berry' as const, label: 'きのみ', icon: '🫐' },
    { id: 'ingredient' as const, label: '食材', icon: '🍎' },
    { id: 'skill' as const, label: 'スキル', icon: '⚡' }
  ];

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '12px 16px',
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
            タイプ別
          </h2>
        </div>

        {/* タブナビゲーション */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 12,
          flexShrink: 0
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                border: 'none',
                background: activeTab === tab.id ? '#f7fafc' : 'transparent',
                color: activeTab === tab.id ? '#2d3748' : '#6b7280',
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 700 : 400,
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #4ade80' : '2px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.color = '#2d3748';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
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
              
              {/* 全タブでスクリーンショットと共有ボタンを表示 */}
              {(activeTab === 'ingredient' || activeTab === 'skill' || activeTab === 'berry') && (
                <>
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
                    title={`${activeTab === 'ingredient' ? '食材マトリックス表' : activeTab === 'skill' ? 'スキルマトリックス表' : 'きのみマトリックス表'}のスクリーンショットを保存`}
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
                    title={`${activeTab === 'ingredient' ? '食材マトリックス表' : activeTab === 'skill' ? 'スキルマトリックス表' : 'きのみマトリックス表'}を共有`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="12" height="12">
                      <path fill="#005eff" d="M352 224c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96c0 4 .2 8 .7 11.9l-94.1 47C145.4 170.2 121.9 160 96 160c-53 0-96 43-96 96s43 96 96 96c25.9 0 49.4-10.2 66.6-26.9l94.1 47c-.5 3.9-.7 7.8-.7 11.9c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-25.9 0-49.4 10.2-66.6 26.9l-94.1-47c.5-3.9 .7-7.8 .7-11.9s-.2-8-.7-11.9l94.1-47C302.6 213.8 326.1 224 352 224z"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* タブ別フィルターボタン */}
          {activeTab === 'ingredient' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* A/B/Cスロットフィルター */}
              <SlotFilterButtons />
              
              {/* 進化フィルター */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {(['すべて', '最終進化のみ', 'たねのみ'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setEvolutionFilter(option)}
                    style={{
                      padding: '2px 6px',
                      borderRadius: 12,
                      border: evolutionFilter === option ? 'none' : '1px solid #d1d5db',
                      background: evolutionFilter === option ? '#4f46e5' : '#fff',
                      color: evolutionFilter === option ? '#fff' : '#374151',
                      fontSize: 10,
                      cursor: 'pointer',
                      fontWeight: evolutionFilter === option ? 600 : 400,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {option === 'すべて' ? '全て' : option === '最終進化のみ' ? '最終' : 'たね'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* スキル・きのみタブの場合の進化フィルター */}
          {(activeTab === 'skill' || activeTab === 'berry') && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {(['すべて', '最終進化のみ', 'たねのみ'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setEvolutionFilter(option)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 12,
                    border: evolutionFilter === option ? 'none' : '1px solid #d1d5db',
                    background: evolutionFilter === option ? '#4f46e5' : '#fff',
                    color: evolutionFilter === option ? '#fff' : '#374151',
                    fontSize: 10,
                    cursor: 'pointer',
                    fontWeight: evolutionFilter === option ? 600 : 400,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {option === 'すべて' ? '全て' : option === '最終進化のみ' ? '最終' : 'たね'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* タブ別コンテンツ */}
      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {activeTab === 'ingredient' ? (
          /* 食材タブ：マトリックス表 */
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '16px'
          }}>
            {renderIngredientMatrix()}
          </div>
        ) : activeTab === 'skill' ? (
          /* スキルタブ：マトリックス表 */
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '16px'
          }}>
            {renderSkillMatrix()}
          </div>
        ) : activeTab === 'berry' ? (
          /* きのみタブ：マトリックス表 */
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '16px'
          }}>
            {renderBerryMatrix()}
          </div>
        ) : (
          /* その他のタブ：通常のグリッドレイアウト */
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '16px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {filteredPokemons.map((pokemon) => {
                const pokemonKey = getPokemonKey(pokemon);
                const pokemonStatus = pokemonStatuses[pokemonKey];
                
                return (
                  <PokemonCard
                    key={pokemonKey}
                    pokemon={pokemon}
                    isSelected={false}
                    statusIcon={pokemonStatus?.status ? (
                      <StatusIcon 
                        status={pokemonStatus.status} 
                        count={pokemonStatus.count && pokemonStatus.count > 1 ? pokemonStatus.count : undefined}
                      />
                    ) : null}
                    onClick={handlePokemonSelect}
                    size="medium"
                  />
                );
              })}
            </div>

            {filteredPokemons.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <div>条件に合うポケモンが見つかりません</div>
              </div>
            )}
          </div>
        )}
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

export default TypePokemon;