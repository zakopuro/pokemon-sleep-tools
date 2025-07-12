import React from 'react';
import type { Pokemon } from '../../../../config/schema';
import { getPokemonKey } from '../../../utils/pokemon-storage';
import PokemonCard from '../PokemonCard';
import StatusIcon from '../../common/StatusIcon';

interface DefaultTabProps {
  filteredPokemons: Pokemon[];
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  pokemonStatuses: { [pokemonKey: string]: { status: string; count?: number } };
}

const DefaultTab: React.FC<DefaultTabProps> = ({
  filteredPokemons,
  selectedPokemon,
  onPokemonSelect,
  pokemonStatuses
}) => {
  return (
    <div 
      data-pokemon-box
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 60px))',
        gap: 6,
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: 8,
        background: '#f7fafc',
        justifyContent: 'start',
        alignItems: 'start',
        gridAutoRows: '68px'
      }}>
      {filteredPokemons.map(pokemon => (
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
  );
};

export default DefaultTab;