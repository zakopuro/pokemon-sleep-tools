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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 || 2 }   // ing2の1枠目
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
      }
    };

    if (showIngredientDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIngredientDropdown]);

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