import { useMemo } from 'react';
import type { Pokemon } from '../../config/schema';
import { loadAllInstancesForPokemon, getPokemonKey } from '../utils/pokemon-storage';

export const usePokemonStatuses = (filteredPokemons: Pokemon[], refreshTrigger?: number) => {
  // ポケモンの管理状態をメモ化（リアルタイム更新対応、複数個体対応）
  const pokemonStatuses = useMemo(() => {
    const statuses: { [pokemonKey: string]: { status: string; count?: number } } = {};
    
    filteredPokemons.forEach(pokemon => {
      const pokemonKey = getPokemonKey(pokemon);
      const allInstances = loadAllInstancesForPokemon(pokemon);
      
      // 全個体の管理状態を取得
      const instanceStatuses = Object.values(allInstances).map(instance => instance.managementStatus);
      
      // 各状態の個数をカウント
      const statusCounts = instanceStatuses.reduce((counts, status) => {
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
            displayStatus = priority;
            statusCount = totalCount + priorityCount;
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
        statuses[pokemonKey] = { status: '' };
      } else {
        // 完了状態で複数個体がある場合は数値を表示
        statuses[pokemonKey] = {
          status: displayStatus,
          count: displayStatus === '完了' && statusCount > 1 ? statusCount : undefined
        };
      }
    });
    
    return statuses;
  }, [filteredPokemons, refreshTrigger]);

  return pokemonStatuses;
};