import React from 'react';

interface LevelSelectorProps {
  level: number;
  onLevelChange: (level: number) => void;
  onMemoToggle?: () => void;
  hasMemo?: boolean;
  isMemoOpen?: boolean;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ level, onLevelChange, onMemoToggle, hasMemo = false, isMemoOpen = false }) => {
  const handleLevelPreset = (presetLevel: number) => {
    onLevelChange(presetLevel);
  };

  const memoIconSrc = `${import.meta.env.BASE_URL}${(isMemoOpen || hasMemo) ? 'memo_add.png' : 'memo.png'}`;

  return (
    <div>
      {/* レベルセクション見出し */}
      <div style={{ display:'flex', alignItems:'center', gap:6, margin:'0 0 4px 0' }}>
        <button
          type="button"
          onClick={onMemoToggle}
          disabled={!onMemoToggle}
          aria-pressed={isMemoOpen}
          style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            width:28,
            height:28,
            borderRadius:6,
            border:(isMemoOpen ? '1px solid #93c5fd' : hasMemo ? '1px solid #bbf7d0' : '1px solid #e5e7eb'),
            background:(isMemoOpen ? '#e0f2fe' : hasMemo ? '#f0fdf4' : '#fff'),
            cursor: onMemoToggle ? 'pointer' : 'not-allowed',
            padding:0,
            flexShrink:0
          }}
          title={onMemoToggle ? (isMemoOpen ? 'メモを閉じる' : 'メモを開く') : undefined}
        >
          <img
            src={memoIconSrc}
            alt="メモアイコン"
            style={{ width: 16, height: 16, objectFit: 'contain', opacity: onMemoToggle ? 1 : 0.4 }}
          />
        </button>
        <span style={{
          background:'#4ade80',
          color:'#fff',
          padding:'4px 14px',
          borderRadius:16,
          fontSize:12,
          fontWeight:700,
          minWidth:68,
          display:'inline-block',
          textAlign:'center'
        }}>
          レベル
        </span>
        {/* レベルスライドバー */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 4, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, minWidth: '24px' }}>Lv</span>
            <input
              type="range"
              min="1"
              max="100"
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#4ade80'
              }}
            />
            <input
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={(e) => onLevelChange(Math.max(1, Math.min(100, Number(e.target.value))))}
              style={{
                width: '50px',
                padding: '2px 4px',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: 12
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'nowrap', justifyContent: 'space-between', marginTop: 2 }}>
            {[10, 25, 30, 50, 60, 75].map(preset => (
              <button
                key={preset}
                onClick={() => handleLevelPreset(preset)}
                style={{
                  padding: '2px 6px',
                  border: level === preset ? 'none' : '1px solid #e2e8f0',
                  background: level === preset ? '#4ade80' : '#fff',
                  color: level === preset ? '#fff' : '#2d3748',
                  borderRadius: 4,
                  fontSize: 9,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: 'auto',
                  flex: 1
                }}
              >
                Lv.{preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;