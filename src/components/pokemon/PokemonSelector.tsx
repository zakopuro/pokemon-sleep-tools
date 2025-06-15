import React, { useState } from 'react';
import type { FilterOptions } from '../PokemonFilters';
import type { Pokemon } from '../../../config/schema';
import { usePokemonFiltering } from '../../hooks/usePokemonFiltering';
import { usePokemonStatuses } from '../../hooks/usePokemonStatuses';
import PokemonSelectorHeader from './PokemonSelectorHeader';
import BerryTab from './tabs/BerryTab';
import IngredientTab from './tabs/IngredientTab';
import SkillTab from './tabs/SkillTab';
import DefaultTab from './tabs/DefaultTab';

interface PokemonSelectorProps {
  selectedPokemon: Pokemon;
  onPokemonSelect: (pokemon: Pokemon) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onOpenFilters: () => void;
  onOpenSort: () => void;
  refreshTrigger?: number; // 状態更新のトリガー
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({
  selectedPokemon,
  onPokemonSelect,
  filters,
  onFiltersChange,
  onOpenFilters,
  onOpenSort,
  refreshTrigger
}) => {
  const [activeTab, setActiveTab] = useState('すべて');
  
  // きのみタブのstate管理
  const [showFieldGrouping, setShowFieldGrouping] = useState(false);
  
  // 食材タブのstate管理
  const [showRecipeGrouping, setShowRecipeGrouping] = useState(false);
  const [recipeSortByEnergy, setRecipeSortByEnergy] = useState(false);
  const [recipeCategory, setRecipeCategory] = useState('all');

  // カスタムフックを使用してフィルタリングと管理状態を取得
  const filteredPokemons = usePokemonFiltering(filters, activeTab);
  const pokemonStatuses = usePokemonStatuses(filteredPokemons, refreshTrigger);

  const tabs = ['すべて', 'きのみ', '食材', 'スキル', '厳選管理'];

  // タブ別のコンテンツをレンダリングする関数
  const renderTabContent = () => {
    switch (activeTab) {
      case 'きのみ':
        return (
          <BerryTab
            filteredPokemons={filteredPokemons}
            selectedPokemon={selectedPokemon}
            onPokemonSelect={onPokemonSelect}
            pokemonStatuses={pokemonStatuses}
            showFieldGrouping={showFieldGrouping}
            setShowFieldGrouping={setShowFieldGrouping}
          />
        );
      case '食材':
        return (
          <IngredientTab
            filteredPokemons={filteredPokemons}
            selectedPokemon={selectedPokemon}
            onPokemonSelect={onPokemonSelect}
            pokemonStatuses={pokemonStatuses}
            showRecipeGrouping={showRecipeGrouping}
            setShowRecipeGrouping={setShowRecipeGrouping}
            recipeSortByEnergy={recipeSortByEnergy}
            setRecipeSortByEnergy={setRecipeSortByEnergy}
            recipeCategory={recipeCategory}
            setRecipeCategory={setRecipeCategory}
          />
        );
      case 'スキル':
        return (
          <SkillTab
            filteredPokemons={filteredPokemons}
            selectedPokemon={selectedPokemon}
            onPokemonSelect={onPokemonSelect}
            pokemonStatuses={pokemonStatuses}
          />
        );
      case '厳選管理':
        // TODO: 将来実装
        return (
          <DefaultTab
            filteredPokemons={filteredPokemons}
            selectedPokemon={selectedPokemon}
            onPokemonSelect={onPokemonSelect}
            pokemonStatuses={pokemonStatuses}
          />
        );
      default: // 'すべて'
        return (
          <DefaultTab
            filteredPokemons={filteredPokemons}
            selectedPokemon={selectedPokemon}
            onPokemonSelect={onPokemonSelect}
            pokemonStatuses={pokemonStatuses}
          />
        );
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* タブナビゲーション */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 12,
        flexShrink: 0
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 4px',
              border: 'none',
              background: activeTab === tab ? '#f7fafc' : 'transparent',
              color: activeTab === tab ? '#2d3748' : '#6b7280',
              fontSize: 12,
              fontWeight: activeTab === tab ? 700 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #4ade80' : '2px solid transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#2d3748';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* ヘッダー（ポケモン数とコントロールボタン） */}
      <PokemonSelectorHeader
        pokemonCount={filteredPokemons.length}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onOpenFilters={onOpenFilters}
        onOpenSort={onOpenSort}
      />
      
      {/* タブ別コンテンツ */}
      {renderTabContent()}
    </div>
  );
};

export default PokemonSelector;