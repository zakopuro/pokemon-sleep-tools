import { useState, useEffect, useCallback } from 'react';
import { POKEMONS } from './config';
import PokemonFilters, { type FilterOptions } from './components/PokemonFilters';
import LevelSelector from './components/level/LevelSelector';
import PokemonSelector from './components/pokemon/PokemonSelector';
import IngredientSelector from './components/ingredient/IngredientSelector';
import SubskillSelector from './components/subskill/SubskillSelector';
import NatureSelector from './components/nature/NatureSelector';
import StatusDisplay from './components/status/StatusDisplay';
import type { SubskillByLevel } from './types/pokemon';
import { loadPokemonSettings, savePokemonSettings } from './utils/pokemon-storage';
import type { Pokemon } from '../config/schema';
import './App.css';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(POKEMONS[0]);
  
  // 初期設定を読み込み
  const initialSettings = loadPokemonSettings(POKEMONS[0].id, POKEMONS[0]);
  const [level, setLevel] = useState(initialSettings.level);
  const [subskillByLevel, setSubskillByLevel] = useState<SubskillByLevel>(initialSettings.subskillByLevel);
  const [upParam, setUpParam] = useState<string>(initialSettings.upParam);
  const [downParam, setDownParam] = useState<string>(initialSettings.downParam);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>(initialSettings.selectedIngredients);
  const [managementStatus, setManagementStatus] = useState<string>(initialSettings.managementStatus);
  const [selectedNeutralNature, setSelectedNeutralNature] = useState<any>(initialSettings.selectedNeutralNature);
  const [showFilters, setShowFilters] = useState(false);
  const [showPokemonDetails, setShowPokemonDetails] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: 'すべて',
    berry: '',
    ingredient: '',
    subskill: '',
    nature: '',
    sortBy: 'id',
    sortOrder: 'asc',
  });

  // 現在の設定を保存する関数
  const saveCurrentSettings = useCallback(() => {
    const settings = {
      level,
      selectedIngredients,
      subskillByLevel,
      upParam,
      downParam,
      selectedNeutralNature,
      managementStatus
    };
    savePokemonSettings(selectedPokemon.id, settings);
  }, [selectedPokemon.id, level, selectedIngredients, subskillByLevel, upParam, downParam, selectedNeutralNature, managementStatus]);

  // ポケモン選択時の処理
  const handlePokemonSelect = useCallback((pokemon: Pokemon) => {
    // 現在の設定を保存
    saveCurrentSettings();
    
    // 新しいポケモンの設定を読み込み
    const newSettings = loadPokemonSettings(pokemon.id, pokemon);
    setSelectedPokemon(pokemon);
    setLevel(newSettings.level);
    setSelectedIngredients(newSettings.selectedIngredients);
    setSubskillByLevel(newSettings.subskillByLevel);
    setUpParam(newSettings.upParam);
    setDownParam(newSettings.downParam);
    setSelectedNeutralNature(newSettings.selectedNeutralNature);
    setManagementStatus(newSettings.managementStatus);
  }, [saveCurrentSettings]);

  // 設定変更時に自動保存
  useEffect(() => {
    saveCurrentSettings();
  }, [level, selectedIngredients, subskillByLevel, upParam, downParam, selectedNeutralNature, managementStatus]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#ffffff',
      padding: 0,
      margin: 0,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 固定上部エリア - ヘッダーとポケモン詳細 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ margin: 0, color: '#2d3748', fontSize: 20, fontWeight: 700 }}>
            ポケモンスリープ管理ツール
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 詳細開閉ボタン */}
            <button
              onClick={() => setShowPokemonDetails(prev => !prev)}
              style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#495057',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
            >
              詳細
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{
                  transform: showPokemonDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path 
                  d="M7 10l5 5 5-5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ポケモン詳細表示 */}
        {showPokemonDetails && (
          <div style={{
            background: '#f7fafc',
            borderRadius: 6,
            padding: 8,
            margin: 0,
            width: '100%',
            border: '1px solid #e2e8f0'
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
                skipAutoInit={true}
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
        )}
      </div>

      {/* ポケモン一覧エリア - スクロール可能 */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        padding: '8px',
        paddingBottom: '80px'
      }}>
        <PokemonSelector
          selectedPokemon={selectedPokemon}
          onPokemonSelect={handlePokemonSelect}
          filters={filters}
        />
      </div>

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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
          </svg>
          <span style={{ fontSize: 10, marginTop: 2 }}>フィルター</span>
        </button>
      </div>

      {/* フィルターモーダル */}
      {showFilters && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            width: '100%',
            maxWidth: 400,
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>フィルター</h3>
              <button
                onClick={() => setShowFilters(false)}
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
            <PokemonFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;