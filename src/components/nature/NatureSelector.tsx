import React, { useState, useEffect, useMemo } from 'react';
import { NATURES } from '../../config';

interface NatureSelectorProps {
  upParam: string;
  downParam: string;
  selectedNeutralNature: any;
  onUpParamChange: (param: string) => void;
  onDownParamChange: (param: string) => void;
  onNeutralNatureChange: (nature: any) => void;
}

const NatureSelector: React.FC<NatureSelectorProps> = ({
  upParam,
  downParam,
  selectedNeutralNature,
  onUpParamChange,
  onDownParamChange,
  onNeutralNatureChange
}) => {
  const [showNatureModal, setShowNatureModal] = useState(false);
  const [isNeutralMode, setIsNeutralMode] = useState(false);

  const PARAMS = [
    'おてつだいスピード',
    '食材おてつだい確率',
    'メインスキル発生確率',
    'EXP獲得量',
    'げんき回復量'
  ];

  const NEUTRAL_NATURES = [
    { id: 21, name: 'がんばりや' },
    { id: 22, name: 'すなお' },
    { id: 23, name: 'てれや' },
    { id: 24, name: 'きまぐれ' },
    { id: 25, name: 'まじめ' },
  ];

  // 上昇/下降パラメータから性格を自動確定
  const selectedNature = useMemo(() => {
    // 中性性格が明示的に選択されている場合はそれを使用
    if (selectedNeutralNature) {
      return selectedNeutralNature;
    }

    if (!upParam || !downParam || upParam === downParam || (upParam === 'なし' && downParam === 'なし')) {
      return NEUTRAL_NATURES.find((n) => n.name === 'がんばりや') || NEUTRAL_NATURES[0];
    }
    const u = upParam === 'なし' ? null : upParam;
    const d = downParam === 'なし' ? null : downParam;
    return NATURES.find((n) => n.up === u && n.down === d) || NEUTRAL_NATURES.find((n) => n.name === 'がんばりや') || NATURES[0];
  }, [upParam, downParam, selectedNeutralNature]);

  const handleUpParamSelect = (param: string) => {
    if (param !== downParam) {
      onUpParamChange(param);
      onNeutralNatureChange(null); // Clear neutral nature when selecting parameters
    }
  };

  const handleDownParamSelect = (param: string) => {
    if (param !== upParam) {
      onDownParamChange(param);
      onNeutralNatureChange(null); // Clear neutral nature when selecting parameters
    }
  };

  const handleNeutralNatureSelect = (nature: any) => {
    console.log('Selected neutral nature:', nature.name);
    onNeutralNatureChange(nature);
    onUpParamChange('なし');
    onDownParamChange('なし');
    setShowNatureModal(false);
    setIsNeutralMode(false);
  };

  // 両方のパラメータが選択されたら自動的にモーダルを閉じる
  useEffect(() => {
    if (selectedNature && !isNeutralMode && upParam && downParam && upParam !== 'なし' && downParam !== 'なし') {
      console.log('Selected nature:', selectedNature.name);
      setTimeout(() => {
        setShowNatureModal(false);
      }, 300); // 少し遅延を入れて選択の確認ができるようにする
    }
  }, [selectedNature, isNeutralMode, upParam, downParam]);

  return (
    <div style={{ marginTop: -2, position: 'relative' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 6, border: '1px solid #e2e8f0', position: 'relative' }}>
        {/* せいかくラベル（左上に被るように配置） */}
        <span style={{
          position: 'absolute',
          top: -6,
          left: 4,
          background:'#a855f7',
          color:'#fff',
          padding:'2px 8px',
          borderRadius:8,
          fontSize:10,
          fontWeight:700,
          zIndex: 10
        }}>
          せいかく
        </span>
        {/* せいかくカード */}
        <div
          onClick={() => {
            onUpParamChange('');
            onDownParamChange('');
            onNeutralNatureChange(null);
            setShowNatureModal(true);
            setIsNeutralMode(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            width: '100%',
            flexWrap: 'nowrap',
          }}
        >
          {/* 左：緑枠＋せいかく名 */}
          <div style={{ position: 'relative', whiteSpace: 'nowrap' }}>
            <span
              style={{
                position: 'absolute',
                top: -10,
                left: 16,
                background: '#4ade80',
                color: '#fff',
                borderRadius: 8,
                padding: '2px 8px',
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              せいかく
            </span>
            <div
              style={{
                border: '2px solid #4ade80',
                borderRadius: 9999,
                padding: '6px 30px',
                minWidth: 100,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2d3748' }}>
                {selectedNature.name}
              </span>
            </div>
          </div>

          {/* 右：上昇/下降パラメータ表示 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, whiteSpace: 'nowrap', justifyContent: 'center' }}>
            {(!upParam || upParam === 'なし') && (!downParam || downParam === 'なし') ? (
              // 補正なしの場合は1つのテキストを中央に表示
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', whiteSpace: 'nowrap' }}>
                  せいかくによる特徴なし
                </span>
              </div>
            ) : (
              // 補正ありの場合は上昇/下降を表示
              <>
                {/* 上昇 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#2d3748', whiteSpace: 'nowrap' }}>
                    {upParam && upParam !== 'なし' ? upParam : '補正なし'}
                  </span>
                  {upParam && upParam !== 'なし' && <span style={{ color: '#fb923c', fontSize: 14, lineHeight: 1 }}>▲▲</span>}
                </div>
                {/* 下降 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#2d3748', whiteSpace: 'nowrap' }}>
                    {downParam && downParam !== 'なし' ? downParam : '補正なし'}
                  </span>
                  {downParam && downParam !== 'なし' && <span style={{ color: '#60a5fa', fontSize: 14, lineHeight: 1 }}>▼▼</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 性格選択モーダル */}
      {showNatureModal && (
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
              maxWidth: 400,
              maxHeight: '80vh',
              overflow: 'hidden',
              color: '#000',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '16px 20px',
            }}>
              <button
                onClick={() => setShowNatureModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#666',
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {!isNeutralMode ? (
              <div style={{ padding: '0 20px 20px' }}>
                {/* 上昇パラメータ選択 */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                    ▲ せいかく効果（上昇）
                  </div>

                  {/* 旧 grid → pill タグ型に変更 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PARAMS.map(param => {
                      const isSelected = upParam === param;
                      const isDisabled = param === downParam;
                      return (
                        <button
                          key={param}
                          onClick={() => !isDisabled && handleUpParamSelect(param)}
                          disabled={isDisabled}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            border: isSelected ? '2px solid #22c55e' : 'none',
                            background: isSelected ? '#dcfce7' : '#f1f5f9',
                            color: isSelected ? '#15803d' : '#374151',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ fontSize: 12 }}>▲</span>
                          {param}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 下降パラメータ選択 */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#ef4444' }}>
                    ▼ せいかく効果（下降）
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PARAMS.map(param => {
                      const isSelected = downParam === param;
                      const isDisabled  = param === upParam;
                      return (
                        <button
                          key={param}
                          onClick={() => !isDisabled && handleDownParamSelect(param)}
                          disabled={isDisabled}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            border: isSelected ? '2px solid #ef4444' : 'none',
                            background: isSelected ? '#fee2e2' : '#f1f5f9',
                            color: isSelected ? '#dc2626' : '#374151',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.4 : 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ fontSize: 12 }}>▼</span>
                          {param}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 性格補正なしボタン */}
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 16,
                  marginTop: 8,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => setIsNeutralMode(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 20,
                      background: '#e0e7ff',
                      border: '2px solid #6366f1',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#3730a3',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#c7d2fe';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#e0e7ff';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 11 21 7 17 3"/>
                      <line x1="21" y1="7" x2="9" y2="7"/>
                      <polyline points="7 21 3 17 7 13"/>
                      <line x1="3" y1="17" x2="15" y2="17"/>
                    </svg>
                    <span>せいかく補正なし</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16
                }}>
                  <button
                    onClick={() => setIsNeutralMode(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 20,
                      color: '#2d3748',
                      padding: 4
                    }}
                  >
                    ←
                  </button>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2d3748' }}>
                    補正なしせいかく選択
                  </h3>
                </div>

                {/* 補正なしモードの UI も pill タグ型で統一 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {NEUTRAL_NATURES.map(nature => (
                    <button
                      key={nature.id}
                      onClick={() => handleNeutralNatureSelect(nature)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 20,
                        background: '#e0e7ff',
                        border: '2px solid #6366f1',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#3730a3',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      {nature.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default NatureSelector;