import React from 'react';
import type { Pokemon } from '../../../config/schema';
import { getPokemonImageName } from '../../utils/pokemon-id';
import { loadAllInstancesForPokemon } from '../../utils/pokemon-storage';
import StatusIcon from '../common/StatusIcon';

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

interface PokemonCardProps {
  pokemon: Pokemon;
  isSelected: boolean;
  statusIcon?: React.ReactNode;
  ingredientLabel?: { label: string; backgroundColor: string } | null;
  onClick: () => void;
  size?: 'small' | 'medium';
  // 食材タブ専用プロパティ
  isIngredientTab?: boolean;
  selectedSlots?: string[];
  targetIngredientId?: number;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isSelected,
  statusIcon,
  ingredientLabel,
  onClick,
  size = 'medium',
  isIngredientTab = false,
  selectedSlots = [],
  targetIngredientId
}) => {
  const { mainName, formName } = splitPokemonName(pokemon.name);
  
  const cardSize = size === 'small' ? { width: 50, height: 58 } : { width: 60, height: 68 };
  const imageSize = size === 'small' ? 30 : 40;
  const fontSize = size === 'small' ? 7 : 8;
  const formFontSize = size === 'small' ? 5 : 6;

  // 食材タブでの特定パターン個体の状態を計算
  const getSpecificPatternStatus = () => {
    if (!isIngredientTab || !ingredientLabel || !targetIngredientId) {
      return null; // 非食材タブまたは条件不足の場合はnull
    }
    
    // このポケモンの全個体データを取得
    const allInstances = loadAllInstancesForPokemon(pokemon);
    
    // ラベルと一致する個体のみの状態を収集
    const matchingInstanceStatuses: string[] = [];
    
    Object.entries(allInstances).forEach(([, instance]) => {
      // 個体の食材設定を取得
      const ingredientSlots = instance.selectedIngredients || [];
      
      // 右上ラベル（A/B/C）に対応するスロットインデックス
      const labelSlotIndex = ingredientLabel.label === 'A' ? 0 : 
                            ingredientLabel.label === 'B' ? 1 : 2;
      
      // 個体の該当スロットに対象食材が設定されているかチェック
      const hasTargetIngredientInSlot = ingredientSlots[labelSlotIndex] === targetIngredientId;
      
      if (!hasTargetIngredientInSlot) {
        return; // 該当スロットに対象食材がなければスキップ
      }
      
      // 個体の食材組み合わせパターンをチェック
      const shouldShowForThisPattern = checkIngredientPattern(ingredientSlots, targetIngredientId, ingredientLabel.label);
      
      if (shouldShowForThisPattern) {
        matchingInstanceStatuses.push(instance.managementStatus);
      }
    });
    
    if (matchingInstanceStatuses.length === 0) {
      return { status: '', count: undefined };
    }
    
    // 各状態の個数をカウント
    const statusCounts = matchingInstanceStatuses.reduce((counts, status) => {
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as { [status: string]: number });
    
    // 状態の優先順位で表示する状態を決定
    const statusPriority = ['完了', '厳選中', '厳選前', '保留', '中止', '対象外'];
    
    let displayStatus = '未設定';
    let statusCount = 0;
    
    for (const priority of statusPriority) {
      if (statusCounts[priority] > 0) {
        displayStatus = priority;
        statusCount = statusCounts[priority];
        break;
      }
    }
    
    // 未設定のみの場合は表示しない（空文字）
    if (displayStatus === '未設定') {
      return { status: '', count: undefined };
    } else {
      // 完了状態で複数個体がある場合は数値を表示
      return {
        status: displayStatus,
        count: displayStatus === '完了' && statusCount > 1 ? statusCount : undefined
      };
    }
  };

  // 食材タブでの状態アイコン表示判定
  const shouldShowStatusIcon = () => {
    if (!isIngredientTab) {
      // 食材タブ以外では常に表示
      return true;
    }
    
    if (!ingredientLabel || !targetIngredientId) {
      // ラベルがない、または対象食材がない場合は従来通り表示
      return true;
    }

    // 「オール」特性ポケモンの場合は常に表示
    if (pokemon.availableIngredients) {
      return true;
    }
    
    // 個体の食材設定とラベルの一致判定
    return checkInstanceMatchesLabel();
  };

  // 個体の食材設定と右上ラベルの一致チェック
  const checkInstanceMatchesLabel = () => {
    if (!ingredientLabel || !targetIngredientId) return false;
    
    // このポケモンの全個体データを取得
    const allInstances = loadAllInstancesForPokemon(pokemon);
    
    // ラベルと一致する個体を検索し、その個体の状態を判定
    const matchingInstances = Object.entries(allInstances).filter(([, instance]) => {
      // 個体の食材設定を取得（配列の各要素が1枠目、2枠目、3枠目の食材ID）
      const ingredientSlots = instance.selectedIngredients || [];
      
      // 右上ラベル（A/B/C）に対応するスロットインデックス
      const labelSlotIndex = ingredientLabel.label === 'A' ? 0 : 
                            ingredientLabel.label === 'B' ? 1 : 2;
      
      // 個体の該当スロットに対象食材が設定されているかチェック
      const hasTargetIngredientInSlot = ingredientSlots[labelSlotIndex] === targetIngredientId;
      
      if (!hasTargetIngredientInSlot) {
        return false; // 該当スロットに対象食材がなければ false
      }
      
      // 個体の食材組み合わせパターンをチェック
      const shouldShowForThisPattern = checkIngredientPattern(ingredientSlots, targetIngredientId, ingredientLabel.label);
      
      // A/B/Cフィルターが選択されている場合の追加チェック
      if (selectedSlots.length < 3) {
        return shouldShowForThisPattern && selectedSlots.includes(ingredientLabel.label);
      }
      
      // 全選択時
      return shouldShowForThisPattern;
    });
    
    return matchingInstances.length > 0;
  };
  
  // 食材パターンチェック：指定された組み合わせパターンに合致するかを判定
  const checkIngredientPattern = (ingredientSlots: number[], targetIngredientId: number, labelSlot: string): boolean => {
    // 個体の食材構成を文字列パターンに変換（例：[9,9,12] → "AAB"）
    const slotPattern = getIngredientSlotPattern(ingredientSlots);
    
    // ターゲット食材に対応する基本スロット（ポケモンの基本食材配置）を取得
    const baseSlot = getBaseSlotForIngredient(targetIngredientId);
    
    if (baseSlot !== labelSlot) {
      return false; // 基本スロットと表示ラベルが一致しない場合は非表示
    }
    
    // パターン別の表示条件をチェック
    switch (labelSlot) {
      case 'A':
        // Aラベル表示時：AAA, AAB, AAC の場合のみ表示
        return slotPattern === 'AAA' || slotPattern === 'AAB' || slotPattern === 'AAC';
      case 'B':
        // Bラベル表示時：ABB の場合のみ表示
        return slotPattern === 'ABB';
      case 'C':
        // Cラベル表示時：AAC, ABC の場合のみ表示
        return slotPattern === 'AAC' || slotPattern === 'ABC';
      default:
        return false;
    }
  };
  
  // 個体の食材設定をA/B/Cパターンに変換
  const getIngredientSlotPattern = (ingredientSlots: number[]): string => {
    return ingredientSlots.map((ingredientId) => {
      // ポケモンの基本食材との対応でA/B/Cを決定
      if (pokemon.ing1?.ingredientId === ingredientId) return 'A';
      if (pokemon.ing2?.ingredientId === ingredientId) return 'B';
      if (pokemon.ing3?.ingredientId === ingredientId) return 'C';
      return 'X'; // 基本食材にない場合
    }).join('');
  };
  
  // 食材IDから基本スロット（A/B/C）を取得
  const getBaseSlotForIngredient = (ingredientId: number): string => {
    if (pokemon.ing1?.ingredientId === ingredientId) return 'A';
    if (pokemon.ing2?.ingredientId === ingredientId) return 'B';
    if (pokemon.ing3?.ingredientId === ingredientId) return 'C';
    return 'X';
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#4299e1' : '#fff',
        border: isSelected ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
        borderRadius: 4,
        padding: 4,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
        color: isSelected ? '#fff' : '#2d3748',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isSelected ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
        ...cardSize,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* ポケモン画像エリア */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: imageSize, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexShrink: 0 
      }}>
        <img
          src={`${import.meta.env.BASE_URL}image/pokemon/${getPokemonImageName(pokemon)}.png`}
          alt={pokemon.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
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
        
        {/* 管理状態アイコン */}
        {shouldShowStatusIcon() && (() => {
          if (isIngredientTab && ingredientLabel && targetIngredientId) {
            // 食材タブでは特定パターンの個体の状態を表示
            const specificStatus = getSpecificPatternStatus();
            if (specificStatus && specificStatus.status) {
              return (
                <StatusIcon
                  status={specificStatus.status}
                  count={specificStatus.count}
                />
              );
            }
            return null;
          } else {
            // 非食材タブでは外部から渡された状態アイコンを表示
            return statusIcon;
          }
        })()}
        
        {/* 食材ラベル（A,B,C） */}
        {ingredientLabel && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: ingredientLabel.backgroundColor,
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
            {ingredientLabel.label}
          </span>
        )}
      </div>
      
      {/* ポケモン名エリア */}
      <div style={{ 
        fontSize, 
        fontWeight: 700, 
        lineHeight: 1.1, 
        wordBreak: 'break-word',
        textAlign: 'center',
        width: '100%',
        height: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {mainName}
        {formName && (
          <div style={{ 
            fontSize: formFontSize, 
            color: isSelected ? '#e2e8f0' : '#666', 
            lineHeight: 1.0
          }}>
            {formName}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;