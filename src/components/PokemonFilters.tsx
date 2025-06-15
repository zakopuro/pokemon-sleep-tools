import { useState } from 'react';
import { BERRIES } from '../../config/berries';
import { INGREDIENTS } from '../../config/ingredients';
import { SUBSKILLS } from '../../config/subskills';
import { MAINSKILLS } from '../../config/mainskills';

export interface FilterOptions {
  // 既存のフィルター
  specialty: string; // 旧式（互換性のため残す）
  specialties: string[]; // 新式（複数選択）
  berry: string;
  ingredient: string;
  subskill: string;
  nature: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  finalEvolution: 'すべて' | '最終進化のみ' | '進化前のみ';
  
  // 新しいフィルター項目
  name: string; // 名前・ニックネーム検索
  pokemonTypes: string[]; // ポケモンタイプ（複数選択）
  berries: string[]; // きのみ（複数選択）
  ingredients: string[]; // 食材（複数選択、AND検索）
  ingredientsAndSearch: boolean; // 食材AND検索のON/OFF
  mainSkills: string[]; // メインスキル（複数選択）
  subSkills: string[]; // サブスキル（複数選択、AND検索）
}

interface PokemonFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

// ポケモンタイプの定義
const pokemonTypes = [
  { id: 'ノーマル', name: 'ノーマル', color: '#A8A878' },
  { id: 'ほのお', name: 'ほのお', color: '#F08030' },
  { id: 'みず', name: 'みず', color: '#6890F0' },
  { id: 'でんき', name: 'でんき', color: '#F8D030' },
  { id: 'くさ', name: 'くさ', color: '#78C850' },
  { id: 'こおり', name: 'こおり', color: '#98D8D8' },
];

export default function PokemonFilters({ filters, onFiltersChange, onClose }: PokemonFiltersProps) {
  const [activeTab, setActiveTab] = useState<'きのみ' | '食材' | 'スキル'>('きのみ');

  const handleFilterChange = (key: keyof FilterOptions, value: string | string[] | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  // 食材名から英語画像ファイル名へのマッピング
  const getIngredientImageName = (ingredientName: string): string => {
    const mapping: { [key: string]: string } = {
      'ふといながねぎ': 'largeleek',
      'あじわいキノコ': 'tastymushroom',
      'とくせんエッグ': 'fancyegg',
      'ほっこりポテト': 'softpotato',
      'とくせんリンゴ': 'fancyapple',
      'げきからハーブ': 'fieryherb',
      'マメミート': 'beansausage',
      'モーモーミルク': 'moomoomilk',
      'あまいミツ': 'honey',
      'ピュアなオイル': 'pureoil',
      'あったかジンジャー': 'warmingginger',
      'あんみんトマト': 'snoozytomato',
      'リラックスカカオ': 'soothingcacao',
      'ワカクサコーン': 'greengrasscorn',
      'ワカクサ大豆': 'greengrasssoybeans',
      'ヤドンのしっぽ': 'slowpoketail',
      'めざましコーヒー': 'めざましコーヒー'
    };
    return mapping[ingredientName] || 'honey'; // デフォルトはhoney
  };

  const resetFilters = () => {
    onFiltersChange({
      specialty: 'すべて',
      specialties: [],
      berry: '',
      ingredient: '',
      subskill: '',
      nature: '',
      sortBy: filters.sortBy, // ソート設定は保持
      sortOrder: filters.sortOrder,
      finalEvolution: 'すべて',
      name: '',
      pokemonTypes: [],
      berries: [],
      ingredients: [],
      ingredientsAndSearch: false,
      mainSkills: [],
      subSkills: [],
    });
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
        color: '#fff',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7"/>
            <path d="M21 21l-6-6"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600 }}>フィルター</span>
        </div>
        <button
          onClick={resetFilters}
          style={{
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: 16,
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          リセット
        </button>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
        {/* 名前・ニックネーム */}
        <div style={{ marginBottom: 24 }}>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>名前</span>
          </div>
          
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="入力してください"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                border: '2px solid #4ade80',
                borderRadius: 8,
                fontSize: 14,
                backgroundColor: '#f9fafb',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#4ade80" 
              strokeWidth="2"
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 1 1L12 12l-3 1 1-3 8.5-8.5z"/>
            </svg>
          </div>
        </div>


        {/* とくいなもの */}
        <div style={{ marginBottom: 24 }}>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>とくいなもの</span>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'きのみ', label: 'きのみ', color: '#4ade80' },
              { value: '食材', label: '食材', color: '#f59e0b' },
              { value: 'スキル', label: 'スキル', color: '#3b82f6' }
            ].map((option) => {
              const isSelected = filters.specialties?.includes(option.value) || false;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    const newSpecialties = toggleArrayItem(filters.specialties || [], option.value);
                    handleFilterChange('specialties', newSpecialties);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    background: isSelected ? `${option.color}80` : option.color, // 選択時は薄く、未選択時は濃く
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {option.label}
                  {isSelected && (
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <path 
                        d="M20 6L9 17l-5-5" 
                        stroke="#22c55e" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* きのみフィルター */}
        <div style={{ marginBottom: 24 }}>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>きのみ</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: 8 
          }}>
            {Object.values(BERRIES).map((berry) => (
              <div key={berry.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  onClick={() => {
                    const newBerries = toggleArrayItem(filters.berries, String(berry.id));
                    handleFilterChange('berries', newBerries);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    padding: 8,
                    borderRadius: '50%',
                    background: 'rgba(251, 146, 60, 0.2)',
                    border: filters.berries.includes(String(berry.id)) ? '2px solid #4ade80' : '1px solid rgba(251, 146, 60, 0.3)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={`/image/berry/${berry.eng_name}.png`} 
                    alt={berry.name}
                    style={{ width: 24, height: 24 }}
                    onError={(e) => {
                      // 画像が見つからない場合のフォールバック
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* 選択時の緑チェック */}
                  {filters.berries.includes(String(berry.id)) && (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <path 
                        d="M20 6L9 17l-5-5" 
                        stroke="#22c55e" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 8, textAlign: 'center' }}>
                  {berry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 食材フィルター */}
        <div style={{ marginBottom: 24 }}>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>食材</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: 8 
          }}>
            {Object.values(INGREDIENTS).map((ingredient) => (
              <div key={ingredient.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  onClick={() => {
                    const newIngredients = toggleArrayItem(filters.ingredients, String(ingredient.id));
                    handleFilterChange('ingredients', newIngredients);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    padding: 8,
                    borderRadius: '50%',
                    background: 'rgba(251, 146, 60, 0.2)',
                    border: filters.ingredients.includes(String(ingredient.id)) ? '2px solid #4ade80' : '1px solid rgba(251, 146, 60, 0.3)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={`/image/ing/${getIngredientImageName(ingredient.name)}.png`} 
                    alt={ingredient.name}
                    style={{ width: 24, height: 24 }}
                    onError={(e) => {
                      // 画像が見つからない場合のフォールバック
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* 選択時の緑チェック */}
                  {filters.ingredients.includes(String(ingredient.id)) && (
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <path 
                        d="M20 6L9 17l-5-5" 
                        stroke="#22c55e" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 8, textAlign: 'center' }}>
                  {ingredient.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* AND検索トグル */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: 12,
            padding: '8px 12px',
            background: '#f8f9fa',
            borderRadius: 6,
            border: '1px solid #e5e7eb'
          }}>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
              すべての食材を含む（AND検索）
            </span>
            <button
              onClick={() => handleFilterChange('ingredientsAndSearch', !filters.ingredientsAndSearch)}
              style={{
                position: 'relative',
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: filters.ingredientsAndSearch ? '#4ade80' : '#d1d5db',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 2,
                left: filters.ingredientsAndSearch ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>

        {/* メインスキルフィルター */}
        <div style={{ marginBottom: 24 }}>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>メインスキル</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 8 
          }}>
            {(() => {
              // minorclassでグループ化して重複を除去
              const uniqueMinorClasses = [...new Set(Object.values(MAINSKILLS).map(skill => skill.minorclass))];
              
              return uniqueMinorClasses.map((minorclass) => (
                <label
                  key={minorclass}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  <div
                    onClick={() => {
                      const newSkills = toggleArrayItem(filters.mainSkills, minorclass);
                      handleFilterChange('mainSkills', newSkills);
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid #22c55e',
                      borderRadius: 3,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {filters.mainSkills.includes(minorclass) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path 
                          d="M20 6L9 17l-5-5" 
                          stroke="#22c55e" 
                          strokeWidth="6" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {minorclass}
                </label>
              ));
            })()}
          </div>
        </div>

        {/* サブスキルフィルター */}
        <div style={{ marginBottom: 24 }}>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>サブスキル</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: 8 
          }}>
            {Object.values(SUBSKILLS).map((skill) => (
              <label
                key={skill.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                <div
                  onClick={() => {
                    const newSkills = toggleArrayItem(filters.subSkills, String(skill.id));
                    handleFilterChange('subSkills', newSkills);
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid #22c55e',
                    borderRadius: 3,
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {filters.subSkills.includes(String(skill.id)) && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M20 6L9 17l-5-5" 
                        stroke="#22c55e" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                {skill.name}
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
          onClick={onClose}
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
          onClick={onClose}
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
  );
}