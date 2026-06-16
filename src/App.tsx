import { useState, useEffect, useCallback, useRef } from 'react';
import { POKEMONS } from './config';
import PokemonFilters, { type FilterOptions } from './components/PokemonFilters';
import LevelSelector from './components/level/LevelSelector';
import PokemonSelector from './components/pokemon/PokemonSelector';
import IngredientSelector from './components/ingredient/IngredientSelector';
import SubskillSelector from './components/subskill/SubskillSelector';
import MainSkillSelector from './components/mainskill/MainSkillSelector';
import NatureSelector from './components/nature/NatureSelector';
import StatusDisplay from './components/status/StatusDisplay';
import InstanceIndicator from './components/instance/InstanceIndicator';
import SideMenu from './components/menu/SideMenu';
import CandyCalculator from './components/pages/CandyCalculator';
import FieldPokemon from './components/pages/FieldPokemon';
import TypePokemon from './components/pages/TypePokemon';
import PWAInstallButton from './components/common/PWAInstallButton';
import BackupModal from './components/backup/BackupModal';
import type { SubskillByLevel } from './types/pokemon';
import { loadPokemonInstanceSettings, savePokemonInstanceSettings, getUsedInstanceIds, deletePokemonInstanceSettings } from './utils/pokemon-storage';
import { attemptDataMigration, showMigrationResult } from './utils/data-migration';
import { dataProtection } from './utils/data-protection';
import type { Pokemon } from '../config/schema';
import './App.css';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(POKEMONS[0]);
  const [currentInstanceId, setCurrentInstanceId] = useState('1'); // 現在選択中の個体ID
  const [isSliding, setIsSliding] = useState(false); // スライド中状態
  const [dynamicHeight, setDynamicHeight] = useState(window.innerHeight); // 動的なviewport高さ
  const detailsRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  
  // 初期設定を読み込み
  const initialSettings = loadPokemonInstanceSettings(POKEMONS[0], '1');
  const [level, setLevel] = useState(initialSettings.level);
  const [subskillByLevel, setSubskillByLevel] = useState<SubskillByLevel>(initialSettings.subskillByLevel);
  const [upParam, setUpParam] = useState<string>(initialSettings.upParam);
  const [downParam, setDownParam] = useState<string>(initialSettings.downParam);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>(initialSettings.selectedIngredients);
  const [managementStatus, setManagementStatus] = useState<string>(initialSettings.managementStatus);
  const [selectedNeutralNature, setSelectedNeutralNature] = useState<any>(initialSettings.selectedNeutralNature);
  const [selectedMainSkillId, setSelectedMainSkillId] = useState<number>(initialSettings.selectedMainSkillId || POKEMONS[0].mainSkillId);
  const [mainSkillLevel, setMainSkillLevel] = useState<number>(initialSettings.mainSkillLevel || 1);
  const [memo, setMemo] = useState<string>(initialSettings.memo || '');
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [showPokemonDetails, setShowPokemonDetails] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ポケモン状態更新用トリガー
  const [showSideMenu, setShowSideMenu] = useState(false); // サイドメニュー表示状態
  const [currentPage, setCurrentPage] = useState('breeding'); // 現在のページ
  const [showBackupModal, setShowBackupModal] = useState(false); // バックアップモーダル表示状態
  const [isSkillsCollapsed, setIsSkillsCollapsed] = useState(true); // メインスキル・サブスキル折りたたみ状態（デフォルト：閉じている）
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
    managementStatuses: [],
    memoOnly: false,
  });

  // 現在の設定を保存する関数（データ保護付き）
  const saveCurrentSettings = useCallback(async () => {
    const settings = {
      level,
      selectedIngredients,
      subskillByLevel,
      upParam,
      downParam,
      selectedNeutralNature,
      managementStatus,
      selectedMainSkillId,
      mainSkillLevel,
      memo
    };
    
    // メイン保存
    savePokemonInstanceSettings(selectedPokemon, currentInstanceId, settings);
    
    // 自動バックアップ作成（非同期、エラーでも処理継続）
    try {
      await dataProtection.createBackup();
    } catch (error) {
      console.warn('Backup creation failed during save:', error);
    }
  }, [selectedPokemon, currentInstanceId, level, selectedIngredients, subskillByLevel, upParam, downParam, selectedNeutralNature, managementStatus, selectedMainSkillId, mainSkillLevel, memo]);

  // ポケモン選択時の処理
  const handlePokemonSelect = useCallback((pokemon: Pokemon, instanceId?: string) => {
    // 現在の設定を保存
    saveCurrentSettings();
    
    // 指定された個体ID、または個体1番の設定を読み込み
    const targetInstanceId = instanceId || '1';
    const newSettings = loadPokemonInstanceSettings(pokemon, targetInstanceId);
    setSelectedPokemon(pokemon);
    setCurrentInstanceId(targetInstanceId);
    setLevel(newSettings.level);
    setSelectedIngredients(newSettings.selectedIngredients);
    setSubskillByLevel(newSettings.subskillByLevel);
    setUpParam(newSettings.upParam);
    setDownParam(newSettings.downParam);
    setSelectedNeutralNature(newSettings.selectedNeutralNature);
    setManagementStatus(newSettings.managementStatus);
    setSelectedMainSkillId(newSettings.selectedMainSkillId || pokemon.mainSkillId);
    setMainSkillLevel(newSettings.mainSkillLevel || 1);
    setMemo(newSettings.memo || '');
    setIsMemoOpen(false);
  }, [saveCurrentSettings]);

  // 個体切り替え処理
  const handleInstanceChange = useCallback((newInstanceId: string) => {
    // 現在の設定を保存
    saveCurrentSettings();
    
    // 新しい個体の設定を読み込み
    const newSettings = loadPokemonInstanceSettings(selectedPokemon, newInstanceId);
    setCurrentInstanceId(newInstanceId);
    setLevel(newSettings.level);
    setSelectedIngredients(newSettings.selectedIngredients);
    setSubskillByLevel(newSettings.subskillByLevel);
    setUpParam(newSettings.upParam);
    setDownParam(newSettings.downParam);
    setSelectedNeutralNature(newSettings.selectedNeutralNature);
    setManagementStatus(newSettings.managementStatus);
    setSelectedMainSkillId(newSettings.selectedMainSkillId || selectedPokemon.mainSkillId);
    setMainSkillLevel(newSettings.mainSkillLevel || 1);
    setMemo(newSettings.memo || '');
    setIsMemoOpen(false);
  }, [saveCurrentSettings, selectedPokemon]);

  // データ移行処理（アプリ初期化時に1回だけ実行）
  useEffect(() => {
    let migrationAttempted = false;
    
    const runDataMigration = async () => {
      if (migrationAttempted) return;
      migrationAttempted = true;
      
      try {
        const result = await attemptDataMigration();
        showMigrationResult(result);
        
        // データが移行された場合、現在のポケモンの設定を再読み込み
        if (result.success && result.dataFound && result.migratedRecords > 0) {
          const newSettings = loadPokemonInstanceSettings(selectedPokemon, currentInstanceId);
          setLevel(newSettings.level);
          setSelectedIngredients(newSettings.selectedIngredients);
          setSubskillByLevel(newSettings.subskillByLevel);
          setUpParam(newSettings.upParam);
          setDownParam(newSettings.downParam);
          setSelectedNeutralNature(newSettings.selectedNeutralNature);
          setManagementStatus(newSettings.managementStatus);
          setSelectedMainSkillId(newSettings.selectedMainSkillId || selectedPokemon.mainSkillId);
          setMainSkillLevel(newSettings.mainSkillLevel || 1);
          setMemo(newSettings.memo || '');
          setIsMemoOpen(false);
        }
      } catch (error) {
        console.warn('Data migration failed:', error);
      }
    };

    // 少し遅延させてDOMが確実に構築されてから実行
    setTimeout(runDataMigration, 500);
  }, []); // 空の依存配列で初回のみ実行

  // 詳細エリアのスワイプ機能
  useEffect(() => {
    const element = detailsRef.current;
    if (!element) return;

    const usedIds = getUsedInstanceIds(selectedPokemon);
    const currentIndex = usedIds.indexOf(currentInstanceId);

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      setIsSliding(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX.current;
      const deltaY = e.touches[0].clientY - startY.current;
      
      // 水平方向の移動が垂直方向より大きい場合はスライド中とする
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        setIsSliding(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX.current;
      const deltaY = e.changedTouches[0].clientY - startY.current;
      
      // 水平方向の移動が垂直方向より大きく、50px以上の場合のみ処理
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex > 0) {
          // 右スワイプ: 前の個体へ
          handleInstanceChange(usedIds[currentIndex - 1]);
        } else if (deltaX < 0 && currentIndex < usedIds.length - 1) {
          // 左スワイプ: 次の個体へ
          handleInstanceChange(usedIds[currentIndex + 1]);
        }
      }
      
      setIsSliding(false);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [selectedPokemon, currentInstanceId, handleInstanceChange]);

  // 設定変更時に自動保存とリアルタイム更新
  useEffect(() => {
    saveCurrentSettings();
    // ポケモン状態更新をトリガー
    setRefreshTrigger(prev => prev + 1);
  }, [level, selectedIngredients, subskillByLevel, upParam, downParam, selectedNeutralNature, managementStatus, selectedMainSkillId, mainSkillLevel, memo]);

  // 動的なviewport高さの管理
  useEffect(() => {
    const updateHeight = () => {
      // モバイルブラウザでのURLバーを考慮した実際の表示領域
      const height = window.innerHeight;
      setDynamicHeight(height);
      
      // CSS変数として設定（他のコンポーネントでも利用可能）
      document.documentElement.style.setProperty('--dynamic-vh', `${height}px`);
    };

    // 初期設定
    updateHeight();

    // リサイズイベントリスナー
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    // モバイルブラウザでのスクロール時の高さ変化にも対応
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateHeight();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // メニュー関連の関数
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShowSideMenu(false); // メニューを閉じる
  };

  return (
    <div style={{
      width: '100%',
      height: dynamicHeight,
      backgroundColor: '#ffffff',
      padding: 0,
      margin: 0,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)'
    }}>
      {/* サイドメニュー */}
      <SideMenu
        isOpen={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenBackup={() => setShowBackupModal(true)}
        dynamicHeight={dynamicHeight}
      />

      {/* 固定上部エリア - ヘッダーとポケモン詳細 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px',
        flexShrink: 0,
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* メニューバーボタン */}
            <button
              onClick={() => {
                console.log('ハンバーガーメニューがクリックされました');
                setShowSideMenu(true);
              }}
              style={{
                width: 40,
                height: 40,
                background: 'transparent',
                border: 'none',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 448 512"
                style={{
                  fill: '#374151',
                  display: 'block'
                }}
              >
                <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/>
              </svg>
            </button>
            
            <h1 style={{ margin: 0, color: '#2d3748', fontSize: 20, fontWeight: 700 }}>
              ポケスリ厳選管理
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* 詳細開閉ボタン - 厳選管理ページのみ表示 */}
            {currentPage === 'breeding' && (
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
            )}
          </div>
        </div>

        {/* ポケモン詳細表示 - 厳選管理ページのみ */}
        {currentPage === 'breeding' && showPokemonDetails && (
          <div 
            ref={detailsRef}
            style={{
              background: '#f7fafc',
              borderRadius: 6,
              padding: 4, // paddingを半分に
              margin: 0,
              width: '100%',
              border: '1px solid #e2e8f0',
              position: 'relative',
              touchAction: 'pan-y', // 垂直スクロールは許可、水平スワイプを検出
              transition: isSliding ? 'none' : 'transform 0.3s ease',
              transform: isSliding ? 'scale(0.99)' : 'scale(1)' // スライド中の視覚的フィードバック
            }}
          >
            
            {/* ポケモンステータス表示 */}
            <StatusDisplay
              selectedPokemon={selectedPokemon}
              managementStatus={managementStatus}
              onManagementStatusChange={setManagementStatus}
              memo={memo}
              onMemoChange={setMemo}
              isMemoOpen={isMemoOpen}
              onMemoClose={() => setIsMemoOpen(false)}
              canDelete={getUsedInstanceIds(selectedPokemon).length > 1}
              onDelete={() => {
                const usedIds = getUsedInstanceIds(selectedPokemon);
                if (usedIds.length <= 1) {
                  alert('最後の個体は削除できません');
                  return;
                }
                
                if (confirm(`${selectedPokemon.name}の個体${currentInstanceId}番を削除しますか？`)) {
                  deletePokemonInstanceSettings(selectedPokemon, currentInstanceId);
                  
                  // 削除後に状態を更新
                  const newUsedIds = getUsedInstanceIds(selectedPokemon);
                  if (newUsedIds.length > 0) {
                    const currentIndex = usedIds.indexOf(currentInstanceId);
                    const newIndex = Math.max(0, currentIndex - 1);
                    const newInstanceId = newUsedIds[newIndex] || newUsedIds[0];
                    
                    // 新しい個体の設定を読み込んで状態を更新
                    const newSettings = loadPokemonInstanceSettings(selectedPokemon, newInstanceId);
                    setCurrentInstanceId(newInstanceId);
                    setLevel(newSettings.level);
                    setSelectedIngredients(newSettings.selectedIngredients);
                    setSubskillByLevel(newSettings.subskillByLevel);
                    setUpParam(newSettings.upParam);
                    setDownParam(newSettings.downParam);
                    setSelectedNeutralNature(newSettings.selectedNeutralNature);
                    setManagementStatus(newSettings.managementStatus);
                    setSelectedMainSkillId(newSettings.selectedMainSkillId || selectedPokemon.mainSkillId);
                    setMainSkillLevel(newSettings.mainSkillLevel || 1);
                    setMemo(newSettings.memo || '');
                    setIsMemoOpen(false);
                    
                    // 表示の更新をトリガー
                    setRefreshTrigger(prev => prev + 1);
                  }
                }
              }}
              currentInstanceId={currentInstanceId}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}> {/* gapを半分に */}
              {/* レベル設定 */}
              <LevelSelector
                level={level}
                onLevelChange={setLevel}
                onMemoToggle={() => setIsMemoOpen(prev => !prev)}
                hasMemo={memo.trim().length > 0}
                isMemoOpen={isMemoOpen}
              />

              {/* 食材選択とせいかく選択を横並び */}
              <div style={{ display: 'flex', gap: 4, width: '100%' }}> {/* gapを小さく */}
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

              {/* サブスキル選択と個体インジケーター */}
              <div>
                <SubskillSelector
                  subskillByLevel={subskillByLevel}
                  onSubskillChange={setSubskillByLevel}
                  isCollapsed={isSkillsCollapsed}
                  onToggleCollapse={() => setIsSkillsCollapsed(!isSkillsCollapsed)}
                >
                  <MainSkillSelector
                    selectedPokemon={selectedPokemon}
                    selectedMainSkillId={selectedMainSkillId}
                    onMainSkillChange={setSelectedMainSkillId}
                    mainSkillLevel={mainSkillLevel}
                    onMainSkillLevelChange={setMainSkillLevel}
                  />
                </SubskillSelector>
                
                {/* 個体インジケーター（サブスキルの直下、マージン最小） */}
                <InstanceIndicator
                  selectedPokemon={selectedPokemon}
                  currentInstanceId={currentInstanceId}
                  onInstanceChange={handleInstanceChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* メインコンテンツエリア - ページ切り替え */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {currentPage === 'breeding' ? (
          /* 厳選管理ページ */
          <div style={{ flex: 1, overflow: 'hidden', padding: '8px' }}>
            <PokemonSelector
              selectedPokemon={selectedPokemon}
              onPokemonSelect={handlePokemonSelect}
              filters={filters}
              onFiltersChange={setFilters}
              onOpenFilters={() => setShowFilters(true)}
              onOpenSort={() => setShowSortModal(true)}
              refreshTrigger={refreshTrigger}
              showPokemonDetails={showPokemonDetails}
              onTogglePokemonDetails={() => setShowPokemonDetails(prev => !prev)}
            />
          </div>
        ) : currentPage === 'field' ? (
          /* 出現フィールドページ */
          <FieldPokemon />
        ) : currentPage === 'type' ? (
          /* タイプ別ページ */
          <TypePokemon />
        ) : currentPage === 'candy' ? (
          /* アメ計算ページ */
          <CandyCalculator />
        ) : (
          /* デフォルト */
          <div style={{ flex: 1, overflow: 'hidden', padding: '8px' }}>
            <PokemonSelector
              selectedPokemon={selectedPokemon}
              onPokemonSelect={handlePokemonSelect}
              filters={filters}
              onFiltersChange={setFilters}
              onOpenFilters={() => setShowFilters(true)}
              onOpenSort={() => setShowSortModal(true)}
              refreshTrigger={refreshTrigger}
              showPokemonDetails={showPokemonDetails}
              onTogglePokemonDetails={() => setShowPokemonDetails(prev => !prev)}
            />
          </div>
        )}
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

      {/* バックアップモーダル */}
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />

      {/* PWA Install Button */}
      <PWAInstallButton />

    </div>
  );
}

export default App;
