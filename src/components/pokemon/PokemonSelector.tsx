import React from 'react';
import { POKEMONS } from '../../config';
import type { FilterOptions } from '../PokemonFilters';
import type { Pokemon } from '../../../config/schema';

interface PokemonSelectorProps {
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  filters: FilterOptions;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  selectedPokemon,
  onPokemonSelect,
  filters
}) => {
  const filteredPokemons = React.useMemo(() => {
    let filtered = [...POKEMONS];

    if (filters.specialty !== 'すべて') {
      filtered = filtered.filter(pokemon => pokemon.specialty === filters.specialty);
    }

    if (filters.berry) {
      filtered = filtered.filter(pokemon => pokemon.berryId.toString() === filters.berry);
    }

    if (filters.ingredient) {
      filtered = filtered.filter(pokemon =>
        pokemon.ing1?.ingredientId.toString() === filters.ingredient ||
        pokemon.ing2?.ingredientId.toString() === filters.ingredient ||
        pokemon.ing3?.ingredientId.toString() === filters.ingredient
      );
    }

    if (filters.nature) {
      // 性格フィルタリングは育成情報で設定されたもののみ
    }

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'specialty':
          aValue = a.specialty;
          bValue = b.specialty;
          break;
        case 'frequency':
          aValue = a.frequency;
          bValue = b.frequency;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc'
          ? aValue.localeCompare(bValue, 'ja')
          : bValue.localeCompare(aValue, 'ja');
      }

      return filters.sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [filters]);

  return (
    <div style={{
      borderTop: '1px solid #e2e8f0',
      paddingTop: 8,
      marginTop: 8
    }}>
      <h2 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: 16, fontWeight: 700 }}>
        ポケモン一覧 ({filteredPokemons.length}匹)
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: 6,
        maxHeight: '60vh',
        overflowY: 'auto',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: 8,
        background: '#f7fafc'
      }}>
        {filteredPokemons.map(pokemon => (
          <div
            key={pokemon.id}
            onClick={() => onPokemonSelect(pokemon)}
            style={{
              background: selectedPokemon.id === pokemon.id ? '#4299e1' : '#fff',
              border: selectedPokemon.id === pokemon.id ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              color: selectedPokemon.id === pokemon.id ? '#fff' : '#2d3748',
              transform: selectedPokemon.id === pokemon.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedPokemon.id === pokemon.id ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedPokemon.id !== pokemon.id) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPokemon.id !== pokemon.id) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}image/pokemon/${pokemon.id.toString().padStart(3, '0')}.png`}
              alt={pokemon.name}
              style={{
                width: '100%',
                height: 40,
                objectFit: 'contain',
                marginBottom: 2
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/vite.svg';
              }}
            />
            <div style={{ fontSize: 8, fontWeight: 700, lineHeight: 1.1, wordBreak: 'break-word' }}>
              {pokemon.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonSelector;