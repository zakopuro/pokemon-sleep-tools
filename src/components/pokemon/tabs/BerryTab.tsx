import React from 'react';
import { FIELDS } from '../../../../config/fields';
import { BERRIES } from '../../../../config/berries';
import type { Pokemon } from '../../../../config/schema';
import { getBerry, getBerryImageName } from '../../../utils/pokemon';
import { getPokemonKey } from '../../../utils/pokemon-storage';
import PokemonCard from '../PokemonCard';
import StatusIcon from '../../common/StatusIcon';
import EmptyPlaceholder from '../../common/EmptyPlaceholder';

interface BerryTabProps {
  filteredPokemons: Pokemon[];
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  pokemonStatuses: { [pokemonKey: string]: { status: string; count?: number } };
  showFieldGrouping: boolean;
  setShowFieldGrouping: (value: boolean) => void;
}

const BerryTab: React.FC<BerryTabProps> = ({
  filteredPokemons,
  selectedPokemon,
  onPokemonSelect,
  pokemonStatuses,
  showFieldGrouping,
  setShowFieldGrouping
}) => {

  const renderFieldGrouping = () => {
    // フィールド別グルーピング（id=2以降のみ）
    const validFields = FIELDS.filter(field => field.id >= 2);
    
    return validFields.map(field => {
      // このフィールドのきのみを持つポケモンを取得
      const fieldPokemons = filteredPokemons.filter(pokemon => 
        field.berries.includes(pokemon.berryId)
      );
      
      // 0匹でも表示する
      
      return (
        <div key={field.id} style={{ marginBottom: 16 }}>
          {/* フィールドヘッダー */}
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
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
              {field.name}
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              ({fieldPokemons.length}匹)
            </span>
            {/* フィールドのきのみ画像 */}
            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
              {field.berries.map((berryId) => {
                const berry = getBerry(berryId);
                return (
                  <img
                    key={berryId}
                    src={`${import.meta.env.BASE_URL}image/berry/${getBerryImageName(berry?.name || '')}.png`}
                    alt={berry?.name || ''}
                    style={{ width: 20, height: 20, objectFit: 'contain' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `${import.meta.env.BASE_URL}image/berry/cheriberry.png`;
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* フィールド内のポケモン一覧 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
            gap: 6,
            padding: '0 8px',
            justifyContent: 'start',
            alignItems: 'start',
            gridAutoRows: '68px'
          }}>
            {fieldPokemons.length > 0 ? (
              fieldPokemons.map(pokemon => (
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
              ))
            ) : (
              <EmptyPlaceholder />
            )}
          </div>
        </div>
      );
    });
  };

  const renderBerryGrouping = () => {
    // 従来のきのみ別グルーピング
    const berryGroups: { [berryId: number]: Pokemon[] } = {};
    
    // 全てのきのみを初期化
    Object.values(BERRIES).forEach(berry => {
      berryGroups[berry.id] = [];
    });
    
    // ポケモンを該当するきのみグループに追加
    filteredPokemons.forEach(pokemon => {
      if (berryGroups[pokemon.berryId]) {
        berryGroups[pokemon.berryId].push(pokemon);
      }
    });

    // きのみIDでソート
    const sortedBerryIds = Object.values(BERRIES)
      .map(berry => berry.id)
      .sort((a, b) => a - b);

    return sortedBerryIds.map(berryId => {
      const berry = getBerry(berryId);
      const pokemonsForBerry = berryGroups[berryId];
      
      return (
        <div key={berryId} style={{ marginBottom: 16 }}>
          {/* きのみヘッダー */}
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
            <img
              src={`${import.meta.env.BASE_URL}image/berry/${getBerryImageName(berry?.name || '')}.png`}
              alt={berry?.name || ''}
              style={{ width: 24, height: 24, objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `${import.meta.env.BASE_URL}image/berry/cheriberry.png`;
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
              {berry?.name || `きのみ${berryId}`}
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              ({pokemonsForBerry.length}匹)
            </span>
          </div>
          
          {/* そのきのみのポケモン一覧 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
            gap: 6,
            padding: '0 8px',
            justifyContent: 'start',
            alignItems: 'start',
            gridAutoRows: '68px'
          }}>
            {pokemonsForBerry.length > 0 ? (
              pokemonsForBerry.map(pokemon => (
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
              ))
            ) : (
              <EmptyPlaceholder />
            )}
          </div>
        </div>
      );
    });
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
      {/* フィールドボタン - 右側に小さく */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 8
      }}>
        <button
          onClick={() => setShowFieldGrouping(!showFieldGrouping)}
          style={{
            background: showFieldGrouping ? '#3b82f6' : '#f3f4f6',
            color: showFieldGrouping ? '#fff' : '#374151',
            border: 'none',
            borderRadius: 12,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!showFieldGrouping) {
              e.currentTarget.style.background = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!showFieldGrouping) {
              e.currentTarget.style.background = '#f3f4f6';
            }
          }}
        >
          フィールド{showFieldGrouping ? 'ON' : 'OFF'}
        </button>
      </div>

      {showFieldGrouping ? renderFieldGrouping() : renderBerryGrouping()}
    </div>
  );
};

export default BerryTab;