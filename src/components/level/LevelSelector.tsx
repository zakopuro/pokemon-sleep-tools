import React from 'react';

interface LevelSelectorProps {
  level: number;
  onLevelChange: (level: number) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ level, onLevelChange }) => {
  const handleLevelPreset = (presetLevel: number) => {
    onLevelChange(presetLevel);
  };

  return (
    <div>
      {/* レベルセクション見出し */}
      <div style={{ display:'flex', alignItems:'center', gap:6, margin:'0 0 4px 0' }}>
        <span style={{
          background:'#4ade80',
          color:'#fff',
          padding:'4px 24px',
          borderRadius:20,
          fontSize:12,
          fontWeight:700,
          minWidth:80,
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
            {[10, 25, 50, 60, 75, 100].map(preset => (
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