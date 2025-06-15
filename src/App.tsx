import { useState, useEffect, useCallback } from 'react';
import { POKEMONS } from './config';
import PokemonFilters, { type FilterOptions } from './components/PokemonFilters';
import LevelSelector from './components/level/LevelSelector';
import PokemonSelector from './components/pokemon/PokemonSelector';
import IngredientSelector from './components/ingredient/IngredientSelector';
import SubskillSelector from './components/subskill/SubskillSelector';
import MainSkillSelector from './components/mainskill/MainSkillSelector';
import NatureSelector from './components/nature/NatureSelector';
import StatusDisplay from './components/status/StatusDisplay';
import type { SubskillByLevel } from './types/pokemon';
import { loadPokemonSettings, savePokemonSettings } from './utils/pokemon-storage';
import type { Pokemon } from '../config/schema';
import './App.css';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(POKEMONS[0]);
  
  // 初期設定を読み込み
  const initialSettings = loadPokemonSettings(POKEMONS[0]);
  const [level, setLevel] = useState(initialSettings.level);
  const [subskillByLevel, setSubskillByLevel] = useState<SubskillByLevel>(initialSettings.subskillByLevel);
  const [upParam, setUpParam] = useState<string>(initialSettings.upParam);
  const [downParam, setDownParam] = useState<string>(initialSettings.downParam);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>(initialSettings.selectedIngredients);
  const [managementStatus, setManagementStatus] = useState<string>(initialSettings.managementStatus);
  const [selectedNeutralNature, setSelectedNeutralNature] = useState<any>(initialSettings.selectedNeutralNature);
  const [mainSkillLevel, setMainSkillLevel] = useState<number>(initialSettings.mainSkillLevel || 1);
  const [showPokemonDetails, setShowPokemonDetails] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ポケモン状態更新用トリガー
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: 'すべて',
    specialties: [],
    berry: '',
    ingredient: '',
    subskill: '',
    nature: '',
    sortBy: 'id',
    sortOrder: 'asc',
    finalEvolution: 'すべて',
    // 新しいフィルター項目
    name: '',
    pokemonTypes: [],
    berries: [],
    ingredients: [],
    ingredientsAndSearch: false,
    mainSkills: [],
    subSkills: [],
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
      managementStatus,
      mainSkillLevel
    };
    savePokemonSettings(selectedPokemon, settings);
  }, [selectedPokemon, level, selectedIngredients, subskillByLevel, upParam, downParam, selectedNeutralNature, managementStatus, mainSkillLevel]);

  // ポケモン選択時の処理
  const handlePokemonSelect = useCallback((pokemon: Pokemon) => {
    // 現在の設定を保存
    saveCurrentSettings();
    
    // 新しいポケモンの設定を読み込み
    const newSettings = loadPokemonSettings(pokemon);
    setSelectedPokemon(pokemon);
    setLevel(newSettings.level);
    setSelectedIngredients(newSettings.selectedIngredients);
    setSubskillByLevel(newSettings.subskillByLevel);
    setUpParam(newSettings.upParam);
    setDownParam(newSettings.downParam);
    setSelectedNeutralNature(newSettings.selectedNeutralNature);
    setManagementStatus(newSettings.managementStatus);
    setMainSkillLevel(newSettings.mainSkillLevel || 1);
  }, [saveCurrentSettings]);

  // 設定変更時に自動保存とリアルタイム更新
  useEffect(() => {
    saveCurrentSettings();
    // ポケモン状態更新をトリガー
    setRefreshTrigger(prev => prev + 1);
  }, [level, selectedIngredients, subskillByLevel, upParam, downParam, selectedNeutralNature, managementStatus, mainSkillLevel]);

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

              {/* 食材選択とせいかく選択を横並び */}
              <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                {/* 食材選択 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <IngredientSelector
                    selectedPokemon={selectedPokemon}
                    selectedIngredients={selectedIngredients}
                    onIngredientsChange={setSelectedIngredients}
                    skipAutoInit={true}
                  />
                </div>

                {/* せいかく選択 */}
                <div style={{ flex: 1, minWidth: 0 }}>
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

              {/* サブスキル選択 */}
              <SubskillSelector
                subskillByLevel={subskillByLevel}
                onSubskillChange={setSubskillByLevel}
              >
                <MainSkillSelector
                  selectedPokemon={selectedPokemon}
                  mainSkillLevel={mainSkillLevel}
                  onMainSkillLevelChange={setMainSkillLevel}
                />
              </SubskillSelector>
            </div>
          </div>
        )}
      </div>

      {/* ポケモン一覧エリア - スクロール可能 */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        padding: '8px'
      }}>
        <PokemonSelector
          selectedPokemon={selectedPokemon}
          onPokemonSelect={handlePokemonSelect}
          filters={filters}
          onFiltersChange={setFilters}
          onOpenFilters={() => setShowFilters(true)}
          onOpenSort={() => setShowSortModal(true)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* フィルターモーダル */}
      {showFilters && (
        <div 
          style={{
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
          }}
          onClick={(e) => {
            // 背景クリックでモーダルを閉じる
            if (e.target === e.currentTarget) {
              setShowFilters(false);
            }
          }}
        >
          <PokemonFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* ソートモーダル */}
      {showSortModal && (
        <div 
          style={{
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
          }}
          onClick={(e) => {
            // 背景クリックでモーダルを閉じる
            if (e.target === e.currentTarget) {
              setShowSortModal(false);
            }
          }}
        >
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
            {/* ヘッダー */}
            <div style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
              color: '#fff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M7 12h10"/>
                <path d="M10 18h4"/>
              </svg>
              <span style={{ fontSize: 16, fontWeight: 600 }}>並び替え</span>
            </div>
            
            {/* コンテンツ */}
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 12,
                  paddingLeft: 4
                }}>
                  <div style={{
                    width: 3,
                    height: 16,
                    background: '#4ade80',
                    borderRadius: 2
                  }}></div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>項目</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { value: 'id', label: '図鑑番号' },
                    { value: 'name', label: '名前' },
                    { value: 'sleepType', label: '睡眠タイプ' },
                    { value: 'specialty', label: 'とくいなもの' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        padding: '8px 4px'
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        border: `2px solid ${filters.sortBy === option.value ? '#4ade80' : '#d1d5db'}`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: filters.sortBy === option.value ? '#4ade80' : 'transparent'
                      }}>
                        {filters.sortBy === option.value && (
                          <div style={{
                            width: 8,
                            height: 8,
                            background: '#fff',
                            borderRadius: '50%'
                          }}></div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 16,
                        color: '#374151',
                        fontWeight: filters.sortBy === option.value ? 600 : 400
                      }}>
                        {option.label}
                      </span>
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={filters.sortBy === option.value}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* フッター */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: 12
            }}>
              <button
                onClick={() => setShowSortModal(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 20,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => setShowSortModal(false)}
                style={{
                  background: '#4ade80',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 20,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;