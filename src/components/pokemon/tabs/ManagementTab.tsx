import React from 'react';
import type { Pokemon } from '../../../../config/schema';
import { getPokemonKey } from '../../../utils/pokemon-storage';
import PokemonCard from '../PokemonCard';
import StatusIcon from '../../common/StatusIcon';

interface ManagementTabProps {
  filteredPokemons: Pokemon[];
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  pokemonStatuses: { [pokemonKey: string]: { status: string; count?: number } };
}

const ManagementTab: React.FC<ManagementTabProps> = ({
  filteredPokemons,
  selectedPokemon,
  onPokemonSelect,
  pokemonStatuses
}) => {

  // 状態別にポケモンをグルーピング
  const groupPokemonsByStatus = () => {
    const statusGroups: { [status: string]: Pokemon[] } = {};
    
    filteredPokemons.forEach(pokemon => {
      const pokemonKey = getPokemonKey(pokemon);
      const pokemonStatus = pokemonStatuses[pokemonKey];
      
      // 状態を取得（未設定の場合は「未設定」として扱う）
      let status = '未設定';
      if (pokemonStatus && pokemonStatus.status && pokemonStatus.status.trim() !== '') {
        status = pokemonStatus.status;
      }
      
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(pokemon);
    });
    
    return statusGroups;
  };

  const statusGroups = groupPokemonsByStatus();
  
  // 状態の優先順位で並び替え
  const statusOrder = ['完了', '厳選中', '厳選前', '保留', '中止', '対象外', '未設定'];
  const sortedStatuses = statusOrder.filter(status => statusGroups[status] && statusGroups[status].length > 0);

  // 状態ごとの色設定
  const getStatusColor = (status: string): string => {
    switch (status) {
      case '完了': return '#22c55e';
      case '厳選中': return '#3b82f6'; 
      case '厳選前': return '#8b5cf6';
      case '保留': return '#f59e0b';
      case '中止': return '#ef4444';
      case '対象外': return '#6b7280';
      case '未設定': return '#d1d5db';
      default: return '#6b7280';
    }
  };

  // 状態アイコンを取得
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '完了':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#22c55e"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '厳選中':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" fill="#3b82f6"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        );
      case '厳選前':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,20 2,20" stroke="#8b5cf6" strokeWidth="2" fill="#8b5cf6"/>
            <circle cx="12" cy="16" r="1" fill="white"/>
            <path d="M12 6v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case '保留':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 15,8 22,8 17,13 19,20 12,16 5,20 7,13 2,8 9,8" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b"/>
          </svg>
        );
      case '中止':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#ef4444"/>
            <path d="M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '対象外':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2" fill="#6b7280"/>
            <path d="M4.93 4.93l14.14 14.14" stroke="white" strokeWidth="2"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      border: '1px solid #e2e8f0',
      borderRadius: 6,
      padding: 8,
      background: '#f7fafc'
    }}>
      {sortedStatuses.map(status => {
        const pokemonsInStatus = statusGroups[status];
        
        return (
          <div key={status} style={{ marginBottom: 16 }}>
            {/* 状態ヘッダー */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              padding: '8px 12px',
              background: '#ffffff',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              {getStatusIcon(status)}
              <span style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: '#2d3748'
              }}>
                {status}
              </span>
              <span style={{ 
                fontSize: 12, 
                background: getStatusColor(status),
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 600
              }}>
                {pokemonsInStatus.length}匹
              </span>
            </div>
            
            {/* その状態のポケモン一覧 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
              gap: 6,
              padding: '0 8px',
              justifyContent: 'start',
              alignItems: 'start',
              gridAutoRows: '68px'
            }}>
              {pokemonsInStatus.map(pokemon => (
                <PokemonCard
                  key={getPokemonKey(pokemon)}
                  pokemon={pokemon}
                  isSelected={getPokemonKey(selectedPokemon) === getPokemonKey(pokemon)}
                  statusIcon={
                    <StatusIcon
                      status={pokemonStatuses[getPokemonKey(pokemon)]?.status || ''}
                      count={pokemonStatuses[getPokemonKey(pokemon)]?.count}
                    />
                  }
                  onClick={() => onPokemonSelect(pokemon)}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {/* ポケモンがいない場合のメッセージ */}
      {sortedStatuses.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280',
          fontSize: 14
        }}>
          表示できるポケモンがありません
        </div>
      )}
    </div>
  );
};

export default ManagementTab;