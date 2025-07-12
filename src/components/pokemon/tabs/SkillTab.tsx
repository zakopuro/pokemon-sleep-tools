import React from 'react';
import { MAINSKILLS } from '../../../../config/mainskills';
import type { Pokemon } from '../../../../config/schema';
import { getPokemonKey } from '../../../utils/pokemon-storage';
import PokemonCard from '../PokemonCard';
import StatusIcon from '../../common/StatusIcon';
import EmptyPlaceholder from '../../common/EmptyPlaceholder';

interface SkillTabProps {
  filteredPokemons: Pokemon[];
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  pokemonStatuses: { [pokemonKey: string]: { status: string; count?: number } };
}

const SkillTab: React.FC<SkillTabProps> = ({
  filteredPokemons,
  selectedPokemon,
  onPokemonSelect,
  pokemonStatuses
}) => {
  // minorclass（スキル種別）ごとにポケモンをグルーピング
  const skillGroups: { [minorclass: string]: { pokemons: Pokemon[], skill: any } } = {};
  
  // 全てのスキル種別を初期化
  const uniqueMinorClasses = [...new Set(MAINSKILLS.map(skill => skill.minorclass))];
  uniqueMinorClasses.forEach(minorclass => {
    const skill = MAINSKILLS.find(s => s.minorclass === minorclass);
    if (skill) {
      skillGroups[minorclass] = { pokemons: [], skill };
    }
  });
  
  // ポケモンを該当するスキルグループに追加
  filteredPokemons.forEach(pokemon => {
    const skill = MAINSKILLS.find(s => s.id === pokemon.mainSkillId);
    if (skill && skillGroups[skill.minorclass]) {
      skillGroups[skill.minorclass].pokemons.push(pokemon);
    }
  });

  // minorclassでソート
  const sortedMinorclasses = uniqueMinorClasses.sort();

  return (
    <div 
      data-pokemon-box
      style={{
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: 8,
        background: '#f7fafc'
      }}>
      {sortedMinorclasses.map(minorclass => {
        const { pokemons: pokemonsForSkill, skill } = skillGroups[minorclass];
        
        return (
          <div key={minorclass} style={{ marginBottom: 16 }}>
            {/* スキルヘッダー */}
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
                src={`${import.meta.env.BASE_URL}image/mainskill/${skill.imagename}.png`}
                alt={skill.minorclass}
                style={{ width: 24, height: 24, objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `${import.meta.env.BASE_URL}vite.svg`;
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2d3748' }}>
                {skill.minorclass}
              </span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                ({pokemonsForSkill.length}匹)
              </span>
            </div>
            
            {/* そのスキルのポケモン一覧 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
              gap: 6,
              padding: '0 8px',
              justifyContent: 'start',
              alignItems: 'start',
              gridAutoRows: '68px'
            }}>
              {pokemonsForSkill.length > 0 ? (
                pokemonsForSkill.map(pokemon => (
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
      })}
    </div>
  );
};

export default SkillTab;