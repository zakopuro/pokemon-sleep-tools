import { BERRIES } from '../../config/berries';
import { INGREDIENTS } from '../../config/ingredients';
import { SUBSKILLS } from '../../config/subskills';
import { NATURES } from '../../config/natures';

export interface FilterOptions {
  specialty: string;
  berry: string;
  ingredient: string;
  subskill: string;
  nature: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  finalEvolution: 'すべて' | '最終進化のみ' | '進化前のみ';
}

interface PokemonFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

const specialties = ['すべて', 'きのみ', '食材', 'スキル', 'オール'];
const sortOptions = [
  { value: 'id', label: 'ポケモン番号' },
  { value: 'name', label: '名前' },
  { value: 'specialty', label: 'とくい' },
  { value: 'frequency', label: 'おてつだい時間' },
];

export default function PokemonFilters({ filters, onFiltersChange, onClose }: PokemonFiltersProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          width: '95%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#000',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>フィルター・ソート</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>とくい</label>
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>きのみ</label>
          <select
            value={filters.berry}
            onChange={(e) => handleFilterChange('berry', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            <option value="">すべて</option>
            {BERRIES.map((berry) => (
              <option key={berry.id} value={berry.id.toString()}>
                {berry.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>食材</label>
          <select
            value={filters.ingredient}
            onChange={(e) => handleFilterChange('ingredient', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            <option value="">すべて</option>
            {INGREDIENTS.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id.toString()}>
                {ingredient.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>サブスキル</label>
          <select
            value={filters.subskill}
            onChange={(e) => handleFilterChange('subskill', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            <option value="">すべて</option>
            {SUBSKILLS.map((subskill) => (
              <option key={subskill.id} value={subskill.id.toString()}>
                {subskill.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>せいかく</label>
          <select
            value={filters.nature}
            onChange={(e) => handleFilterChange('nature', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            <option value="">すべて</option>
            {NATURES.map((nature) => (
              <option key={nature.name} value={nature.name}>
                {nature.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>ソート</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              style={{
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                fontSize: 14,
              }}
            >
              <option value="asc">昇順</option>
              <option value="desc">降順</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              onFiltersChange({
                specialty: 'すべて',
                berry: '',
                ingredient: '',
                subskill: '',
                nature: '',
                sortBy: 'id',
                sortOrder: 'asc',
                finalEvolution: 'すべて',
              });
            }}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            リセット
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}