import React, { useState, useEffect } from 'react';
import { calculateRequiredCandy, isValidLevelRange, type CandyCalculationInput, type CandyCalculationResult } from '../../utils/candy-calculator';

const CandyCalculator: React.FC = () => {
  const [input, setInput] = useState<CandyCalculationInput>({
    currentLevel: 1,
    targetLevel: 50,
    expType: 600,
    nature: 'normal',
    eventType: 'none'
  });

  const [result, setResult] = useState<CandyCalculationResult>({
    requiredCandies: 0,
    requiredDreamShards: 0,
    requiredExp: 0
  });

  const [error, setError] = useState<string>('');

  // 計算結果を更新
  useEffect(() => {
    if (!isValidLevelRange(input.currentLevel, input.targetLevel)) {
      setError('現在レベルは目標レベルより小さい値を入力してください');
      return;
    }
    
    setError('');
    const calculationResult = calculateRequiredCandy(input);
    setResult(calculationResult);
  }, [input]);

  const handleInputChange = (field: keyof CandyCalculationInput, value: any) => {
    setInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{
      flex: 1,
      padding: 16,
      background: '#f7fafc',
      overflowY: 'auto'
    }}>
      {/* ページタイトル */}
      <div style={{
        marginBottom: 24,
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#2d3748',
          margin: 0
        }}>
          アメ計算機
        </h1>
        <p style={{
          fontSize: 14,
          color: '#6b7280',
          margin: '4px 0 0 0'
        }}>
          ポケモンのレベルアップに必要なアメとゆめのかけらを計算
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 24,
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {/* 入力パネル */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: 16,
            margin: '0 0 16px 0'
          }}>
            設定
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* レベル設定 */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 4
                }}>
                  現在レベル
                </label>
                <select
                  value={input.currentLevel}
                  onChange={(e) => handleInputChange('currentLevel', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    backgroundColor: '#fff'
                  }}
                >
                  {Array.from({ length: 65 }, (_, i) => i + 1).map(level => (
                    <option key={level} value={level}>Lv.{level}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 4
                }}>
                  目標レベル
                </label>
                <select
                  value={input.targetLevel}
                  onChange={(e) => handleInputChange('targetLevel', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    backgroundColor: '#fff'
                  }}
                >
                  {Array.from({ length: 65 }, (_, i) => i + 1).map(level => (
                    <option key={level} value={level}>Lv.{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 経験値タイプ */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 4
              }}>
                経験値タイプ
              </label>
              <select
                value={input.expType}
                onChange={(e) => handleInputChange('expType', parseInt(e.target.value) as 600 | 900 | 1080 | 1320)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  backgroundColor: '#fff'
                }}
              >
                <option value={600}>600タイプ</option>
                <option value={900}>900タイプ</option>
                <option value={1080}>1080タイプ</option>
                <option value={1320}>1320タイプ</option>
              </select>
            </div>

            {/* 性格 */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 4
              }}>
                性格
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'up', label: 'UP性格', color: '#10b981' },
                  { value: 'normal', label: '通常', color: '#6b7280' },
                  { value: 'down', label: 'DOWN性格', color: '#ef4444' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('nature', option.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: input.nature === option.value ? 'none' : '1px solid #d1d5db',
                      backgroundColor: input.nature === option.value ? option.color : '#fff',
                      color: input.nature === option.value ? '#fff' : '#374151',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* イベント */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 4
              }}>
                イベント状況
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'none', label: '通常', color: '#6b7280' },
                  { value: 'mini', label: 'ミニブースト', color: '#f59e0b' },
                  { value: 'unlimited', label: 'ブースト', color: '#8b5cf6' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('eventType', option.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: input.eventType === option.value ? 'none' : '1px solid #d1d5db',
                      backgroundColor: input.eventType === option.value ? option.color : '#fff',
                      color: input.eventType === option.value ? '#fff' : '#374151',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 結果パネル */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: 16,
            margin: '0 0 16px 0'
          }}>
            計算結果
          </h2>

          {error ? (
            <div style={{
              padding: 12,
              borderRadius: 6,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: 14
            }}>
              {error}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 必要アメ個数 */}
              <div style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d'
              }}>
                <div style={{
                  fontSize: 12,
                  color: '#92400e',
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  必要アメ個数
                </div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#92400e'
                }}>
                  {result.requiredCandies.toLocaleString()}個
                </div>
              </div>

              {/* 必要ゆめのかけら */}
              <div style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: '#ddd6fe',
                border: '1px solid #c4b5fd'
              }}>
                <div style={{
                  fontSize: 12,
                  color: '#5b21b6',
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  必要ゆめのかけら
                </div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#5b21b6'
                }}>
                  {result.requiredDreamShards.toLocaleString()}個
                </div>
              </div>

              {/* 必要経験値 */}
              <div style={{
                padding: 16,
                borderRadius: 8,
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{
                  fontSize: 12,
                  color: '#166534',
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  必要経験値
                </div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#166534'
                }}>
                  {result.requiredExp.toLocaleString()}EXP
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandyCalculator;