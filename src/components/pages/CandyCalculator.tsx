import React, { useState, useEffect } from 'react';
import { calculateRequiredCandy, isValidLevelRange, getExpToNextLevel, type CandyCalculationInput, type CandyCalculationResult } from '../../utils/candy-calculator';

// AdSenseの型定義
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const CandyCalculator: React.FC = () => {
  const [input, setInput] = useState<CandyCalculationInput>({
    currentLevel: 10,
    targetLevel: 50,
    expType: 600,
    nature: 'normal',
    eventType: 'none',
    remainingExp: getExpToNextLevel(10, 600), // 初期値は最大値
    evolutionCandies: 0,
    ownedCandies: 0
  });

  const [result, setResult] = useState<CandyCalculationResult>({
    requiredCandies: 0,
    requiredDreamShards: 0,
    requiredExp: 0,
    totalCandies: 0,
    additionalCandiesNeeded: 0,
    universalCandyS: 0,
    universalCandyM: 0,
    universalCandyL: 0
  });

  const [error, setError] = useState<string>('');

  // 広告の初期化
  useEffect(() => {
    if (result.requiredCandies > 0 && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [result.requiredCandies]);

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
    setInput(prev => {
      const newInput = {
        ...prev,
        [field]: value
      };
      
      // レベルまたは経験値タイプが変更された場合、remainingExpを最大値にリセット
      if (field === 'currentLevel' || field === 'expType') {
        const maxExp = getExpToNextLevel(
          field === 'currentLevel' ? value : newInput.currentLevel,
          field === 'expType' ? value : newInput.expType
        );
        newInput.remainingExp = maxExp;
      }
      
      return newInput;
    });
  };

  return (
    <div style={{
      flex: 1,
      padding: 16,
      background: '#f7fafc',
      overflowY: 'auto',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%'
      }}>
        {/* ページタイトル */}
        <div style={{
          marginBottom: 20,
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
        </div>

        {/* 設定カード */}
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 16,
          border: '1px solid #e2e8f0',
          marginBottom: 12
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* レベル設定 */}
            <div style={{ display: 'flex', gap: 12 }}>
              {/* 現在のレベル */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  現在のレベル
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleInputChange('currentLevel', Math.max(1, input.currentLevel - 1))}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      color: '#374151',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    −
                  </button>
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#2d3748'
                  }}>
                    {input.currentLevel}
                  </div>
                  <button
                    onClick={() => handleInputChange('currentLevel', Math.min(65, input.currentLevel + 1))}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      color: '#374151',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
                <input
                  type="range"
                  min="1"
                  max="65"
                  value={input.currentLevel}
                  onChange={(e) => handleInputChange('currentLevel', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 3,
                    background: '#dbeafe',
                    outline: 'none',
                    marginTop: 8,
                    cursor: 'pointer'
                  }}
                />
                
                {/* あとEXP スライダー */}
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#6b7280',
                    minWidth: 42,
                    flexShrink: 0
                  }}>
                    あとEXP
                  </label>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => {
                          handleInputChange('remainingExp', Math.max(1, (input.remainingExp || 1) - 1));
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 2,
                          border: '1px solid #d1d5db',
                          background: '#fff',
                          color: '#374151',
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        −
                      </button>
                      <div style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#6b7280'
                      }}>
                        {input.remainingExp || getExpToNextLevel(input.currentLevel, input.expType)}
                      </div>
                      <button
                        onClick={() => {
                          const maxExp = getExpToNextLevel(input.currentLevel, input.expType);
                          handleInputChange('remainingExp', Math.min(maxExp, (input.remainingExp || maxExp) + 1));
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 2,
                          border: '1px solid #d1d5db',
                          background: '#fff',
                          color: '#374151',
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
                      </button>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={getExpToNextLevel(input.currentLevel, input.expType)}
                      value={getExpToNextLevel(input.currentLevel, input.expType) - (input.remainingExp || 0) + 1}
                      onChange={(e) => {
                        const maxExp = getExpToNextLevel(input.currentLevel, input.expType);
                        const reversedValue = maxExp - parseInt(e.target.value) + 1;
                        handleInputChange('remainingExp', reversedValue);
                      }}
                      style={{
                        width: '100%',
                        height: 3,
                        borderRadius: 2,
                        background: '#f3e8ff',
                        outline: 'none',
                        marginTop: 4,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 目標レベル */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  目標レベル
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleInputChange('targetLevel', Math.max(1, input.targetLevel - 1))}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      color: '#374151',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    −
                  </button>
                  <div style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#3b82f6'
                  }}>
                    {input.targetLevel}
                  </div>
                  <button
                    onClick={() => handleInputChange('targetLevel', Math.min(65, input.targetLevel + 1))}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      color: '#374151',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
                <input
                  type="range"
                  min="1"
                  max="65"
                  value={input.targetLevel}
                  onChange={(e) => handleInputChange('targetLevel', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 3,
                    background: '#dbeafe',
                    outline: 'none',
                    marginTop: 8,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* 進化に必要なアメ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                minWidth: 70,
                flexShrink: 0
              }}>
                進化に必要なアメ
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: 4, 
                flex: 1,
                maxWidth: 280
              }}>
                {[0, 40, 80, 100].map(candies => (
                  <button
                    key={candies}
                    onClick={() => handleInputChange('evolutionCandies', candies)}
                    style={{
                      padding: '6px 2px',
                      borderRadius: 4,
                      border: 'none',
                      backgroundColor: input.evolutionCandies === candies ? '#dbeafe' : '#f8f9fa',
                      color: '#374151',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {candies === 0 ? 'なし' : candies}
                  </button>
                ))}
                {[120, 140, 160].map(candies => (
                  <button
                    key={candies}
                    onClick={() => handleInputChange('evolutionCandies', candies)}
                    style={{
                      padding: '6px 2px',
                      borderRadius: 4,
                      border: 'none',
                      backgroundColor: input.evolutionCandies === candies ? '#dbeafe' : '#f8f9fa',
                      color: '#374151',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {candies}
                  </button>
                ))}
                <div></div> {/* 空のグリッドセル */}
              </div>
            </div>

            {/* 経験値タイプ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                minWidth: 70,
                flexShrink: 0
              }}>
                経験値タイプ
              </label>
              <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                {[
                  { value: 600, label: '一般' },
                  { value: 900, label: '600族' },
                  { value: 1080, label: '伝説' },
                  { value: 1320, label: '幻' }
                ].map(expType => (
                  <button
                    key={expType.value}
                    onClick={() => handleInputChange('expType', expType.value)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: input.expType === expType.value ? '#dbeafe' : '#f8f9fa',
                      color: '#374151',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {expType.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 性格による経験値補正 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                minWidth: 70,
                flexShrink: 0
              }}>
                性格による経験値補正
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flex: 1 }}>
                {[
                  { value: 'down', symbol: '▼', color: '#ef4444' },
                  { value: 'normal', symbol: '−', color: '#6b7280' },
                  { value: 'up', symbol: '▲', color: '#10b981' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('nature', option.value)}
                    style={{
                      width: 48,
                      height: 36,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: input.nature === option.value ? '#dbeafe' : '#f8f9fa',
                      color: '#374151',
                      fontSize: 18,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {option.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* アメブースト */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                minWidth: 70,
                flexShrink: 0
              }}>
                アメブースト
              </label>
              <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                {[
                  { value: 'none', label: 'なし', color: '#6b7280' },
                  { value: 'mini', label: 'ミニ', color: '#f59e0b' },
                  { value: 'unlimited', label: '無制限', color: '#8b5cf6' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('eventType', option.value)}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: input.eventType === option.value ? '#dbeafe' : '#f8f9fa',
                      color: '#374151',
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

            {/* 所持している飴の数 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#374151'
              }}>
                所持している飴の数
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                value={input.ownedCandies}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= 100000) {
                    handleInputChange('ownedCandies', value);
                  }
                }}
                style={{
                  width: 120,
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none',
                  backgroundColor: '#fff',
                  color: '#374151',
                  textAlign: 'right'
                }}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* 計算結果表示 */}
        {error ? (
          <div style={{
            padding: 12,
            borderRadius: 6,
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: 14,
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* 必要アメ個数を大きく表示 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderRadius: 6,
                backgroundColor: '#f8f9fa'
              }}>
                <span style={{
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: 600
                }}>
                  必要なアメの数
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={`${import.meta.env.BASE_URL}candy.png`} alt="アメ" style={{ width: 32, height: 32 }} />
                  <span style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: '#2d3748'
                  }}>
                    {result.totalCandies.toLocaleString()}個
                  </span>
                </div>
              </div>

              {/* 追加で必要なアメ個数 */}
              <div style={{
                padding: 16,
                borderRadius: 6,
                backgroundColor: result.additionalCandiesNeeded > 0 ? '#fef2f2' : '#f0f9ff'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: result.additionalCandiesNeeded > 0 ? 12 : 0
                }}>
                  <span style={{
                    fontSize: 14,
                    color: '#374151',
                    fontWeight: 600
                  }}>
                    追加で必要なアメの数
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src={`${import.meta.env.BASE_URL}candy.png`} alt="アメ" style={{ width: 24, height: 24 }} />
                    <span style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: result.additionalCandiesNeeded > 0 ? '#dc2626' : '#2563eb'
                    }}>
                      {result.additionalCandiesNeeded.toLocaleString()}個
                    </span>
                  </div>
                </div>

                {/* ばんのうアメ必要個数 */}
                {result.additionalCandiesNeeded > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: 16,
                    fontSize: 12,
                    color: '#6b7280',
                    flexWrap: 'nowrap',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <img src={`${import.meta.env.BASE_URL}candy.png`} alt="アメ" style={{ width: 16, height: 16 }} />
                      <span>S {result.universalCandyS}個</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <img src={`${import.meta.env.BASE_URL}candy.png`} alt="アメ" style={{ width: 20, height: 20 }} />
                      <span>M {result.universalCandyM}個</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <img src={`${import.meta.env.BASE_URL}candy.png`} alt="アメ" style={{ width: 24, height: 24 }} />
                      <span>L {result.universalCandyL}個</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ゆめのかけら */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                borderRadius: 6,
                backgroundColor: '#f8f9fa'
              }}>
                <span style={{
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: 600
                }}>
                  ゆめのかけら
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={`${import.meta.env.BASE_URL}dream_shards.png`} alt="ゆめのかけら" style={{ width: 18, height: 18 }} />
                  <span style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#374151'
                  }}>
                    {result.requiredDreamShards.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 必要経験値 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                borderRadius: 6,
                backgroundColor: '#f8f9fa'
              }}>
                <span style={{
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: 600
                }}>
                  必要ＥＸＰ
                </span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  EXP {result.requiredExp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 広告表示エリア - アメ計算結果の下 */}
        {result && result.requiredCandies > 0 && (
          <div style={{ 
            marginTop: 24, 
            textAlign: 'center',
            padding: '20px 0'
          }}>
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-6565457882658270"
              data-ad-slot="5037153304"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CandyCalculator;