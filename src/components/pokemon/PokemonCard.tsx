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
  size?: 'tiny' | 'small' | 'medium';
  // 食材タブ専用プロパティ
  isIngredientTab?: boolean;
  selectedSlots?: string[];
  targetIngredientId?: number;
  currentInstanceStatus?: string;
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
  targetIngredientId,
  currentInstanceStatus
}) => {
  const { mainName, formName } = splitPokemonName(pokemon.name);
  
  const cardSize = size === 'tiny' ? { width: 36, height: 42 } : 
                   size === 'small' ? { width: 50, height: 58 } : 
                   { width: 60, height: 68 };
  const imageSize = size === 'tiny' ? 24 : size === 'small' ? 30 : 40;
  const fontSize = size === 'tiny' ? 6 : size === 'small' ? 7 : 8;
  const formFontSize = size === 'tiny' ? 4 : size === 'small' ? 5 : 6;

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
      if (priority === '厳選中') {
        // 厳選中は優先度付きも含めて判定（半角・全角両方対応）
        const totalCount = statusCounts['厳選中'] || 0;
        const priorityCount = Object.entries(statusCounts)
          .filter(([status]) => status.startsWith('厳選中(') || status.startsWith('厳選中（'))
          .reduce((sum, [, count]) => sum + count, 0);
        
        if (totalCount + priorityCount > 0) {
          // 優先度付きのステータスがある場合は、それを優先表示
          const priorityStatus = Object.keys(statusCounts).find(status => 
            status.startsWith('厳選中(') || status.startsWith('厳選中（')
          );
          if (priorityStatus) {
            displayStatus = priorityStatus;
            statusCount = statusCounts[priorityStatus];
          } else {
            displayStatus = priority;
            statusCount = totalCount;
          }
          break;
        }
      } else if (statusCounts[priority] > 0) {
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
        // Aラベル表示時：AAA, AAB, AAC, ABA の場合のみ表示
        return slotPattern === 'AAA' || slotPattern === 'AAB' || slotPattern === 'AAC' || slotPattern === 'ABA';
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

  // 厳選中の優先度ラベルを取得
  const getPriorityLabel = () => {
    if (isIngredientTab && ingredientLabel && targetIngredientId) {
      // 食材タブでは特定パターンの個体の状態から優先度を取得
      const specificStatus = getSpecificPatternStatus();
      if (specificStatus && specificStatus.status && 
          (specificStatus.status.startsWith('厳選中(') || specificStatus.status.startsWith('厳選中（'))) {
        // 優先度を抽出（半角・全角両方対応）
        const match = specificStatus.status.match(/厳選中[（(](.+?)[）)]/);
        return match ? match[1] : null;
      }
    } else {
      if (currentInstanceStatus) {
        if (currentInstanceStatus.startsWith('厳選中(') || currentInstanceStatus.startsWith('厳選中（')) {
          const match = currentInstanceStatus.match(/厳選中[（(](.+?)[）)]/);
          return match ? match[1] : null;
        }
        // 個別カードで優先度が付いていない場合は表示しない
        return null;
      }

      // 通常タブではstatusIconから優先度を判定
      // statusIconの内容を確認する必要があるため、別の方法で取得
      const allInstances = loadAllInstancesForPokemon(pokemon);
      const statuses = Object.values(allInstances).map(instance => instance.managementStatus);
      
      // 状態の優先順位で表示する状態を決定
      const statusPriority = ['完了', '厳選中', '厳選前', '保留', '中止', '対象外'];
      
      for (const priority of statusPriority) {
        if (priority === '厳選中') {
          // 厳選中の優先度付きを探す
          const priorityStatus = statuses.find(status => 
            status && (status.startsWith('厳選中(') || status.startsWith('厳選中（'))
          );
          if (priorityStatus) {
            const match = priorityStatus.match(/厳選中[（(](.+?)[）)]/);
            return match ? match[1] : null;
          }
          // 通常の厳選中があれば終了
          if (statuses.includes('厳選中')) {
            break;
          }
        } else if (statuses.includes(priority)) {
          break;
        }
      }
    }
    return null;
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
          // 優先度ラベルがある場合は管理状態アイコンを非表示
          const priorityLabel = getPriorityLabel();
          if (priorityLabel) {
            return null;
          }
          
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

        {/* 優先度ラベル（高・中・低） */}
        {(() => {
          const priorityLabel = getPriorityLabel();
          if (priorityLabel) {
            return (
              <span style={{
                position: 'absolute',
                top: -2,
                left: -2,
                background: (() => {
                  switch(priorityLabel) {
                    case '高': return '#dc2626';
                    case '中': return '#f59e0b';
                    case '低': return '#10b981';
                    default: return '#6b7280';
                  }
                })(),
                color: '#fff',
                borderRadius: 2,
                padding: '1px 3px',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fff',
                zIndex: 10,
                lineHeight: 1
              }}>
                {priorityLabel}
              </span>
            );
          }
          return null;
        })()}
      </div>
      
      {/* ポケモン名エリア */}
      <div style={{ 
        fontSize, 
        fontWeight: 700, 
        lineHeight: 1.1, 
        whiteSpace: 'nowrap',
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