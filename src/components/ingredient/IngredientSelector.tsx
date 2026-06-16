import React, { useState, useEffect, useRef } from 'react';
import { INGREDIENTS } from '../../config';
import { getIngredient, getIngredientImageName } from '../../utils/pokemon';
import type { Pokemon } from '../../../config/schema';

interface IngredientSelectorProps {
  selectedPokemon: Pokemon;
  selectedIngredients: number[];
  onIngredientsChange: (ingredients: number[]) => void;
  skipAutoInit?: boolean;
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  selectedPokemon,
  selectedIngredients,
  onIngredientsChange,
  skipAutoInit = false
}) => {
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [showSlotDropdowns, setShowSlotDropdowns] = useState([false, false, false]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 「オール」特性ポケモンかどうかを判定
  const isAllSpecialtyPokemon = selectedPokemon.availableIngredients !== undefined;

  // ポケモンの所持食材を取得（重複排除）
  const getPokemonIngredients = (pokemon: Pokemon) => {
    return [
      pokemon.ing1 ? getIngredient(pokemon.ing1.ingredientId) : null,
      pokemon.ing2 ? getIngredient(pokemon.ing2.ingredientId) : null,
      pokemon.ing3 ? getIngredient(pokemon.ing3.ingredientId) : null,
    ].filter(Boolean);
  };

  // ポケモンごとの食材構成パターンを返すヘルパー
  const getPokemonIngredientPatterns = (pokemon: Pokemon) => {
    const patterns = [];

    // AAA パターン (ing1のみ3つ) - 1枠目、2枠目、3枠目の個数
    if (pokemon.ing1) {
      patterns.push([
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 || 2 },  // 1枠目
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 || 2 },  // 2枠目
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c3 || 2 }   // 3枠目
      ]);
    }

    // AAB パターン (ing1 2つ + ing2 1つ)
    if (pokemon.ing1 && pokemon.ing2) {
      patterns.push([
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 || 2 },  // ing1の1枠目
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 || 2 },  // ing1の2枠目
        { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c2 || 2 }   // ing2の2枠目
      ]);
    }

    // AAC パターン (ing1 2つ + ing3 1つ)
    if (pokemon.ing1 && pokemon.ing3) {
      patterns.push([
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 || 2 },  // ing1の1枠目
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 || 2 },  // ing1の2枠目
        { id: pokemon.ing3.ingredientId, num: pokemon.ing3.c1 || 2 }   // ing3の1枠目
      ]);
    }

    // ABA パターン (ing1 1つ + ing2 1つ + ing1 1つ)
    if (pokemon.ing1 && pokemon.ing2) {
      patterns.push([
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 || 2 },  // ing1の1枠目
        { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 || 2 },  // ing2の1枠目
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 || 2 }   // ing1の2枠目
      ]);
    }

    // ABB パターン (ing1 1つ + ing2 2つ)
    if (pokemon.ing1 && pokemon.ing2) {
      patterns.push([
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 || 2 },  // ing1の1枠目
        { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 || 2 },  // ing2の1枠目
        { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c2 || 2 }   // ing2の2枠目
      ]);
    }

    // ABC パターン (ing1 1つ + ing2 1つ + ing3 1つ)
    if (pokemon.ing1 && pokemon.ing2 && pokemon.ing3) {
      patterns.push([
        { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 || 2 },  // ing1の1枠目
        { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 || 2 },  // ing2の1枠目
        { id: pokemon.ing3.ingredientId, num: pokemon.ing3.c1 || 2 }   // ing3の1枠目
      ]);
    }

    return patterns;
  };

  // 初期化: ポケモンが変更された時はポケモンの所持食材を重複なしで表示（保存された設定がない場合のみ）
  useEffect(() => {
    if (skipAutoInit) return;
    
    const ingredientIds = getPokemonIngredients(selectedPokemon)
      .map(ing => ing?.id)
      .filter((id): id is number => id !== undefined);
    const uniqueIngredients = [...new Set(ingredientIds)];
    onIngredientsChange(uniqueIngredients);
  }, [selectedPokemon, skipAutoInit]);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowIngredientDropdown(false);
        setShowSlotDropdowns([false, false, false]);
      }
    };

    if (showIngredientDropdown || showSlotDropdowns.some(show => show)) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIngredientDropdown, showSlotDropdowns]);

  // 「オール」特性ポケモン用の初期化
  useEffect(() => {
    if (skipAutoInit || !isAllSpecialtyPokemon) return;
    
    // 各スロットの最初の食材を初期選択
    const defaultIngredients = [
      selectedPokemon.availableIngredients?.slot1[0]?.ingredientId ?? 1,
      selectedPokemon.availableIngredients?.slot2[0]?.ingredientId ?? 2,
      selectedPokemon.availableIngredients?.slot3[0]?.ingredientId ?? 3
    ];
    onIngredientsChange(defaultIngredients);
  }, [selectedPokemon, skipAutoInit, isAllSpecialtyPokemon]);

  // 「オール」特性ポケモン用のスロット別選択UI
  const renderAllSpecialtySelector = () => {
    if (!selectedPokemon.availableIngredients) return null;

    const handleSlotChange = (slotIndex: number, ingredientId: number) => {
      const newIngredients = [...selectedIngredients];
      newIngredients[slotIndex] = ingredientId;
      onIngredientsChange(newIngredients);
      // プルダウンを閉じる
      const newDropdowns = [...showSlotDropdowns];
      newDropdowns[slotIndex] = false;
      setShowSlotDropdowns(newDropdowns);
    };

    const toggleSlotDropdown = (slotIndex: number) => {
      const newDropdowns = [...showSlotDropdowns];
      newDropdowns[slotIndex] = !newDropdowns[slotIndex];
      // 他のプルダウンを閉じる
      for (let i = 0; i < newDropdowns.length; i++) {
        if (i !== slotIndex) newDropdowns[i] = false;
      }
      setShowSlotDropdowns(newDropdowns);
    };

    const getSelectedIngredientInfo = (slotIndex: number, ingredientId: number) => {
      const slotKey = `slot${slotIndex + 1}` as keyof typeof selectedPokemon.availableIngredients;
      const slot = selectedPokemon.availableIngredients![slotKey];
      return slot.find(item => item.ingredientId === ingredientId);
    };

    return (
      <div style={{ marginTop: 4, position: 'relative' }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 4, position: 'relative' }}>
          {/* 食材ラベル */}
          <span style={{
            position: 'absolute',
            top: -6,
            left: 4,
            background:'#4ade80',
            color:'#fff',
            padding:'2px 8px',
            borderRadius:8,
            fontSize:10,
            fontWeight:700,
            zIndex: 10
          }}>
            食材
          </span>

          {/* 通常ポケモンと同じスタイルの横1列表示 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            padding: 4,
            paddingLeft: 12,
          }}>
            {[0, 1, 2].map(slotIndex => {
              const slotKey = `slot${slotIndex + 1}` as keyof typeof selectedPokemon.availableIngredients;
              const slotOptions = selectedPokemon.availableIngredients![slotKey];
              const selectedId = selectedIngredients[slotIndex] ?? slotOptions[0]?.ingredientId;
              const selectedInfo = getSelectedIngredientInfo(slotIndex, selectedId);

              return (
                <div key={slotIndex} style={{ position: 'relative' }}>
                  {/* 食材画像ボタン */}
                  <button
                    onClick={() => toggleSlotDropdown(slotIndex)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative'
                    }}
                  >
                    {selectedId === 0 ? (
                      // 食材ID 0（「-」）の場合は特別な表示
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 28, 
                        height: 28,
                        border: '1px dashed #9ca3af',
                        borderRadius: 4,
                        color: '#9ca3af',
                        fontSize: 20,
                        fontWeight: 'bold'
                      }}>
                        -
                      </div>
                    ) : (
                      <>
                        <img
                          src={`${import.meta.env.BASE_URL}image/ing/${getIngredientImageName(
                            INGREDIENTS.find(ing => ing.id === selectedId)?.name || ''
                          )}.png`}
                          alt=""
                          style={{ 
                            width: 28, 
                            height: 28, 
                            objectFit: 'contain'
                          }}
                          onError={e => ((e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}image/ing/honey.png`)}
                        />
                        
                        {/* 個数バッジ */}
                        <span style={{
                          position: 'absolute',
                          bottom: -6,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#fff',
                          border: '1px solid #d1d5db',
                          borderRadius: 10,
                          fontSize: 8,
                          fontWeight: 700,
                          padding: '0 2px',
                          whiteSpace: 'nowrap'
                        }}>
                          ×{selectedInfo?.c1 || 1}
                        </span>
                      </>
                    )}
                  </button>

                  {/* プルダウンメニュー */}
                  {showSlotDropdowns[slotIndex] && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: slotIndex === 0 ? '0' : slotIndex === 2 ? 'auto' : '50%',
                      right: slotIndex === 2 ? '0' : 'auto',
                      transform: slotIndex === 1 ? 'translateX(-50%)' : 'none',
                      marginTop: 2,
                      maxHeight: 220,
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: 4,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      zIndex: 1000,
                      width: 'auto'
                    }}>
                      {slotOptions.map(option => {
                        const ingredient = INGREDIENTS.find(ing => ing.id === option.ingredientId);
                        return (
                          <button
                            key={option.ingredientId}
                            onClick={() => handleSlotChange(slotIndex, option.ingredientId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              padding: 4,
                              background: selectedId === option.ingredientId ? '#f1f5f9' : 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: 4,
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => {
                              if (selectedId !== option.ingredientId) {
                                e.currentTarget.style.background = '#f1f5f9';
                              }
                            }}
                            onMouseLeave={e => {
                              if (selectedId !== option.ingredientId) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {option.ingredientId === 0 ? (
                              // 食材ID 0（「-」）の場合は特別な表示
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 24, 
                                height: 24,
                                border: '1px dashed #9ca3af',
                                borderRadius: 4,
                                color: '#9ca3af',
                                fontSize: 16,
                                fontWeight: 'bold'
                              }}>
                                -
                              </div>
                            ) : (
                              <div style={{ position: 'relative' }}>
                                <img
                                  src={`${import.meta.env.BASE_URL}image/ing/${getIngredientImageName(ingredient?.name || '')}.png`}
                                  alt=""
                                  style={{ width: 24, height: 24, objectFit: 'contain' }}
                                  onError={e => ((e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}image/ing/honey.png`)}
                                />
                                <span style={{
                                  position: 'absolute',
                                  bottom: -6,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  background: '#fff',
                                  border: '1px solid #d1d5db',
                                  borderRadius: 10,
                                  fontSize: 8,
                                  fontWeight: 700,
                                  padding: '0 2px'
                                }}>
                                  ×{option.c1 || 1}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 「オール」特性ポケモンの場合は専用UIを表示
  if (isAllSpecialtyPokemon) {
    return renderAllSpecialtySelector();
  }

  return (
    <div style={{ marginTop: 4, position: 'relative' }}>
      {/* 食材プルダウン */}
      <div ref={dropdownRef} style={{ background: '#fff', borderRadius: 8, padding: 4, position: 'relative' }}>
        {/* 食材ラベル（左上に被るように配置） */}
        <span style={{
          position: 'absolute',
          top: -6,
          left: 4,
          background:'#4ade80',
          color:'#fff',
          padding:'2px 8px',
          borderRadius:8,
          fontSize:10,
          fontWeight:700,
          zIndex: 10
        }}>
          食材
        </span>
        {/* ── 折りたたみヘッダー ── */}
        <button
          onClick={() => setShowIngredientDropdown(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            paddingLeft: 12,
          }}
        >
          {/* 重複のない3種だけを表示するヘッダー用配列 */}
          {(() => {
            const ingredientsToShow = selectedIngredients.length
              ? selectedIngredients.slice(0, 3)                         // ← Set を外し重複許可
              : (() => {
                  const ingredientIds = getPokemonIngredients(selectedPokemon)
                    .map(ing => ing?.id)
                    .filter((id): id is number => id !== undefined);
                  return [...new Set(ingredientIds)];
                })();

            return ingredientsToShow.map((id, index) => {
              const ing = INGREDIENTS.find(i => i.id === id);
              // 現在のパターンから個数を取得
              const currentPattern = getPokemonIngredientPatterns(selectedPokemon).find(pattern =>
                JSON.stringify(pattern.map(p => p.id)) === JSON.stringify(selectedIngredients)
              ) || [];
              const count = currentPattern[index]?.num || 2;

              return (
                <div key={`${id}-${index}`} style={{ position: 'relative' }}>
                  <img
                    src={`${import.meta.env.BASE_URL}image/ing/${getIngredientImageName(ing?.name || '')}.png`}
                    alt={ing?.name || ''}
                    style={{ width: 28, height: 28, objectFit: 'contain' }}
                    onError={e => ((e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}image/ing/honey.png`)}
                  />
                  {/* 個数バッジ */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#fff',
                      border: '1px solid #d1d5db',
                      borderRadius: 10,
                      fontSize: 8,
                      fontWeight: 700,
                      padding: '0 2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ×{count}
                  </span>
                </div>
              );
            });
          })()}

          {/* ドロップダウン矢印 */}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#374151' }}>
            {showIngredientDropdown ? '▲' : '▼'}
          </span>
        </button>

        {/* ── 一覧（開いたときだけ表示） ── */}
        {showIngredientDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 2,
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 4,
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 1000,
            }}
          >
            {getPokemonIngredientPatterns(selectedPokemon).map((pattern, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onIngredientsChange(pattern.map(p => p.id));          // ← Set を使わずそのまま
                  setShowIngredientDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: 6,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {pattern.map((p, pidx) => {
                  const ing = INGREDIENTS.find(i => i.id === p.id);
                  return (
                    <div key={`${p.id}-${pidx}`} style={{ position: 'relative' }}>
                      <img
                        src={`${import.meta.env.BASE_URL}image/ing/${getIngredientImageName(ing?.name || '')}.png`}
                        alt=""
                        style={{ width: 24, height: 24 }}
                        onError={e => ((e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}image/ing/honey.png`)}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -6,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#fff',
                          border: '1px solid #d1d5db',
                          borderRadius: 10,
                          fontSize: 8,
                          fontWeight: 700,
                          padding: '0 2px',
                        }}
                      >
                        ×{p.num}
                      </span>
                    </div>
                  );
                })}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientSelector;
