import { SUBSKILLS } from '../../../config/subskills';
import type { BreedingPokemon, BreedingStatus } from '../../types/breeding';

interface BreedingListProps {
  breedingPokemons: BreedingPokemon[];
  onUpdateStatus: (id: string, status: BreedingStatus) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<BreedingStatus, string> = {
  '完了': '#10b981',
  '保留': '#f59e0b',
  '中止': '#ef4444',
  '育成しない': '#6b7280',
};

export default function BreedingList({ breedingPokemons, onUpdateStatus, onDelete }: BreedingListProps) {
  if (breedingPokemons.length === 0) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center', 
        color: '#6b7280',
        fontSize: 14 
      }}>
        育成中のポケモンはありません
      </div>
    );
  }

  return (
    <div style={{ padding: 8, maxHeight: '80vh', overflowY: 'auto' }}>
      {breedingPokemons.map((pokemon) => (
        <div
          key={pokemon.id}
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            color: '#000',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {pokemon.pokemonName}
            </div>
            <div
              style={{
                background: statusColors[pokemon.status],
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {pokemon.status}
            </div>
          </div>

          <div style={{ fontSize: 14, marginBottom: 8 }}>
            <div style={{ color: '#6b7280', marginBottom: 4 }}>目標レベル: {pokemon.target.level}</div>
            <div style={{ color: '#6b7280', marginBottom: 4 }}>
              性格: {pokemon.target.nature}
            </div>
            {pokemon.target.subskills.length > 0 && (
              <div style={{ color: '#6b7280', marginBottom: 4 }}>
                サブスキル: {pokemon.target.subskills
                  .map(id => SUBSKILLS.find(s => s.id === id)?.name)
                  .filter(Boolean)
                  .join(', ')
                }
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['完了', '保留', '中止', '育成しない'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(pokemon.id, status)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  border: pokemon.status === status ? 'none' : '1px solid #d1d5db',
                  background: pokemon.status === status ? statusColors[status] : '#fff',
                  color: pokemon.status === status ? '#fff' : '#000',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: pokemon.status === status ? 600 : 400,
                }}
              >
                {status}
              </button>
            ))}
            <button
              onClick={() => onDelete(pokemon.id)}
              style={{
                padding: '4px 8px',
                borderRadius: 12,
                border: '1px solid #ef4444',
                background: '#fff',
                color: '#ef4444',
                fontSize: 12,
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              削除
            </button>
          </div>

          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            作成: {new Date(pokemon.createdAt).toLocaleDateString('ja-JP')}
          </div>
        </div>
      ))}
    </div>
  );
}