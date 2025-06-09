import React, { useState } from 'react';
import { SUBSKILLS } from '../../config';
import { SUBSKILL_LEVELS } from '../../constants/pokemon';
import type { SubskillByLevel } from '../../types/pokemon';

interface SubskillSelectorProps {
  subskillByLevel: SubskillByLevel;
  onSubskillChange: (subskillByLevel: SubskillByLevel) => void;
}

const SubskillSelector: React.FC<SubskillSelectorProps> = ({
  subskillByLevel,
  onSubskillChange
}) => {
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  return (
    <div>
      {/* サブスキル 5 枠カードの前に挿入 */}
      <div style={{ position:'relative', margin:'4px 0 4px' }}>
        <div style={{
          background:'#38a169',
          height:20,
          width:'100%',
          clipPath:'polygon(0 0, 100% 0, 97% 100%, 0% 100%)'
        }}/>
        <span style={{
          position:'absolute', top:0, left:8,
          color:'#fff', fontSize:12, fontWeight:700, lineHeight:'20px'
        }}>
          メインスキル・サブスキル
        </span>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 6, border: '1px solid #e2e8f0' }}>

        {/* 2列2×3行=5枠レイアウト */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, 20px)',
          gap: 6,
          justifyContent: 'center'
        }}>
          {SUBSKILL_LEVELS.map((lv, i) => (
            <button
              key={lv}
              onClick={() => setEditingLevel(lv)}                 /* 枠クリックでモーダル開く */
              style={{
                gridColumn: i % 2 === 0 ? 1 : 2,
                gridRow: Math.floor(i / 2) + 1,
                background: (() => {
                  if (!subskillByLevel[lv]) return '#f7fafc';
                  const subskill = SUBSKILLS.find((s: any) => s.id === subskillByLevel[lv]);
                  switch (subskill?.color) {
                    case 'gold': return '#fef08a';
                    case 'light blue': return '#e0f2fe';
                    case 'gray': return '#f3f4f6';
                    default: return '#f7fafc';
                  }
                })(),
                border: '1px solid #9ca3af',
                borderRadius: 6,
                height: 22,
                fontSize: 12,
                fontWeight: 700,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                if (!subskillByLevel[lv]) {
                  e.currentTarget.style.background = '#f1f5f9';
                } else {
                  const subskill = SUBSKILLS.find((s: any) => s.id === subskillByLevel[lv]);
                  switch (subskill?.color) {
                    case 'gold':
                      e.currentTarget.style.background = '#fde047';
                      break;
                    case 'light blue':
                      e.currentTarget.style.background = '#bfdbfe';
                      break;
                    case 'gray':
                      e.currentTarget.style.background = '#e5e7eb';
                      break;
                  }
                }
              }}
              onMouseLeave={e => {
                if (!subskillByLevel[lv]) {
                  e.currentTarget.style.background = '#f7fafc';
                } else {
                  const subskill = SUBSKILLS.find((s: any) => s.id === subskillByLevel[lv]);
                  switch (subskill?.color) {
                    case 'gold':
                      e.currentTarget.style.background = '#fef08a';
                      break;
                    case 'light blue':
                      e.currentTarget.style.background = '#e0f2fe';
                      break;
                    case 'gray':
                      e.currentTarget.style.background = '#f3f4f6';
                      break;
                  }
                }
              }}
            >
              {subskillByLevel[lv]
                ? SUBSKILLS.find((s: any) => s.id === subskillByLevel[lv])?.name
                : ''}
            </button>
          ))}
        </div>
      </div>

      {/* サブスキル選択モーダル */}
      {editingLevel !== null && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5000,
          background: 'rgba(0,0,0,.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            width: 320,
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: 12,
            padding: 20
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>
              レベル {editingLevel} のサブスキルを選択してください
            </h4>

            {/* 金枠→銀枠→青枠の順で2列表示 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {SUBSKILLS.map((sk: any) => {
                // このサブスキルがどのレベルで選択されているかを調べる
                const selectedLevel = Object.entries(subskillByLevel)
                  .find(([_, skillId]) => skillId === sk.id)?.[0];

                const isSelected = !!selectedLevel;

                return (
                  <button
                    key={sk.id}
                    onClick={() => {
                      if (isSelected) {
                        // 選択済みの場合は解除し、そのレベルの選択に戻る
                        onSubskillChange({ ...subskillByLevel, [selectedLevel]: null });
                        setEditingLevel(Number(selectedLevel));
                      } else {
                        // 未選択の場合は現在のレベルに設定
                        const newSubskillByLevel = { ...subskillByLevel, [editingLevel]: sk.id };
                        onSubskillChange(newSubskillByLevel);

                        // 次の未選択レベルを探す（優先順位：低いレベル→高いレベル）
                        // まず現在のレベルより小さい未選択レベルがあるかチェック
                        let nextUnselectedLevel = SUBSKILL_LEVELS.find(level =>
                          level < editingLevel && !(newSubskillByLevel as any)[level]
                        );

                        // 小さいレベルに未選択がない場合、大きいレベルから探す
                        if (!nextUnselectedLevel) {
                          nextUnselectedLevel = SUBSKILL_LEVELS.find(level =>
                            level > editingLevel && !(newSubskillByLevel as any)[level]
                          );
                        }

                        if (nextUnselectedLevel) {
                          setTimeout(() => {
                            setEditingLevel(nextUnselectedLevel);
                          }, 200);
                        } else {
                          // 全て選択済みの場合はモーダルを閉じる
                          setTimeout(() => {
                            setEditingLevel(null);
                          }, 500); // 少し長めの遅延で完了感を演出
                        }
                      }
                    }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '6px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: (() => {
                        switch (sk.color) {
                          case 'gold': return '#fef08a';
                          case 'light blue': return '#e0f2fe';
                          case 'gray': return '#f3f4f6';
                          default: return '#f7fafc';
                        }
                      })(),
                    }}
                  >
                    <span style={{ textAlign: 'center', lineHeight: 1.2 }}>{sk.name}</span>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#10b981',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {selectedLevel}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button
                onClick={() => {
                  onSubskillChange(Object.fromEntries(SUBSKILL_LEVELS.map(lv => [lv, null])));
                }}
                style={{
                  marginRight: 16,
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                全てクリア
              </button>
              <button
                onClick={() => setEditingLevel(null)}
                style={{
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubskillSelector;