import { useState } from 'react';
import { POKEMONS } from './config';
import PokemonFilters, { type FilterOptions } from './components/PokemonFilters';
import BreedingList from './components/breeding/BreedingList';
import LevelSelector from './components/level/LevelSelector';
import PokemonSelector from './components/pokemon/PokemonSelector';
import IngredientSelector from './components/ingredient/IngredientSelector';
import SubskillSelector from './components/subskill/SubskillSelector';
import NatureSelector from './components/nature/NatureSelector';
import StatusDisplay from './components/status/StatusDisplay';
import { useBreedingData } from './hooks/useBreedingData';
import { SUBSKILL_LEVELS } from './constants/pokemon';
import type { SubskillByLevel } from './types/pokemon';
import './App.css';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(POKEMONS[0]);
  const [level, setLevel] = useState(50);

  // 5枠用の状態を追加
  const [subskillByLevel, setSubskillByLevel] = useState<SubskillByLevel>(
    Object.fromEntries(SUBSKILL_LEVELS.map(lv => [lv, null]))
  );
  const [upParam, setUpParam] = useState<string>('なし');
  const [downParam, setDownParam] = useState<string>('なし');
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [managementStatus, setManagementStatus] = useState<string>('未設定');
  const [showFilters, setShowFilters] = useState(false);
  const [showBreeding, setShowBreeding] = useState(false);
  const [selectedNeutralNature, setSelectedNeutralNature] = useState<any>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: 'すべて',
    berry: '',
    ingredient: '',
    subskill: '',
    nature: '',
    sortBy: 'id',
    sortOrder: 'asc',
  });

  const { data: breedingData, updateStatus, deleteBreedingPokemon } = useBreedingData();













  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: 0,
      margin: 0,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
        {/* ヘッダーとポケモン詳細 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 0,
          padding: 0,
          margin: 0,
          width: '100%',
          minHeight: 'calc(100vh - 60px)',
          paddingBottom: 60
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h1 style={{ margin: 0, color: '#2d3748', fontSize: 20, fontWeight: 700 }}>
              ポケモンスリープ管理ツール
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowBreeding(true)}
                style={{
                  background: '#48bb78',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  position: 'relative',
                  fontSize: 11,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 9h10v10H9V9z"/>
                  <path d="M5 9v10h4V9H5z"/>
                  <path d="M9 5v4"/>
                  <path d="M5 5h14"/>
                </svg>
                育成リスト
                {breedingData.pokemons.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#e53e3e',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {breedingData.pokemons.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ポケモン詳細表示 */}
          <div style={{
            background: '#f7fafc',
            borderRadius: 0,
            padding: 8,
            margin: 0,
            width: '100%',
            border: 'none',
            borderTop: '1px solid #e2e8f0'
          }}>
            {/* ポケモンステータス表示 */}
            <StatusDisplay
              selectedPokemon={selectedPokemon}
              managementStatus={managementStatus}
              onManagementStatusChange={setManagementStatus}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

              {/* レベル設定 */}
              <LevelSelector level={level} onLevelChange={setLevel} />

              {/* 食材選択 */}
              <IngredientSelector
                selectedPokemon={selectedPokemon}
                selectedIngredients={selectedIngredients}
                onIngredientsChange={setSelectedIngredients}
              />

              {/* サブスキル選択 */}
              <SubskillSelector
                subskillByLevel={subskillByLevel}
                onSubskillChange={setSubskillByLevel}
              />

              {/* せいかく選択 */}
              <NatureSelector
                upParam={upParam}
                downParam={downParam}
                selectedNeutralNature={selectedNeutralNature}
                onUpParamChange={setUpParam}
                onDownParamChange={setDownParam}
                onNeutralNatureChange={setSelectedNeutralNature}
              />
            </div>

          </div>
        </div>

          {/* ポケモン一覧 */}
          <PokemonSelector
            selectedPokemon={selectedPokemon}
            onPokemonSelect={setSelectedPokemon}
            filters={filters}
          />

        {/* 下部フィルターバー */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          zIndex: 1000,
          width: '100%'
        }}>
          <button
            onClick={() => setShowFilters(true)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              color: '#4a5568'
            }}
          >
            <div style={{ marginBottom: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="21 21l-4.35-4.35"/>
              </svg>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>フィルター</div>
          </button>
          <button
            onClick={() => {
              setFilters({
                specialty: 'すべて',
                berry: '',
                ingredient: '',
                subskill: '',
                nature: '',
                sortBy: 'id',
                sortOrder: 'asc',
              });
            }}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              color: '#4a5568'
            }}
          >
            <div style={{ marginBottom: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>リセット</div>
          </button>
          <button
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                sortBy: 'id',
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
              }));
            }}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              color: '#4a5568'
            }}
          >
            <div style={{ marginBottom: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>ソート</div>
          </button>
        </div>

        {/* フィルターモーダル */}
        {showFilters && (
          <PokemonFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}



        {/* 育成リストモーダル */}
        {showBreeding && (
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
                borderRadius: 12,
                width: '95%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflow: 'hidden',
                color: '#000',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>育成リスト</h3>
                <button
                  onClick={() => setShowBreeding(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#666',
                  }}
                >
                  ×
                </button>
              </div>
              <BreedingList
                breedingPokemons={breedingData.pokemons}
                onUpdateStatus={updateStatus}
                onDelete={deleteBreedingPokemon}
              />
            </div>
          </div>
        )}
      </div>
    );
}

export default App;
