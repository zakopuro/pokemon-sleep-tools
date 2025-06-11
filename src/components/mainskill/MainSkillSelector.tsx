import React, { useState, useRef, useEffect } from 'react';
import { MAINSKILLS } from '../../config';
import type { Pokemon } from '../../../config/schema';

interface MainSkillSelectorProps {
  selectedPokemon: Pokemon;
  mainSkillLevel: number;
  onMainSkillLevelChange: (level: number) => void;
}

const MainSkillSelector: React.FC<MainSkillSelectorProps> = ({
  selectedPokemon,
  mainSkillLevel,
  onMainSkillLevelChange
}) => {
  const mainSkill = MAINSKILLS.find(skill => skill.id === selectedPokemon.mainSkillId);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  if (!mainSkill) {
    return null;
  }

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLevelDropdown(false);
      }
    };

    if (showLevelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLevelDropdown]);

  const levelOptions = Array.from({ length: mainSkill.maxlevel }, (_, i) => i + 1);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 8px',
      background: '#f8f9fa',
      borderRadius: 6,
      border: '1px solid #e2e8f0',
      fontSize: 12
    }}>
      <span style={{ fontWeight: 700, color: '#2d3748' }}>
        {mainSkill.name}
      </span>
      <span style={{ color: '#6b7280' }}>Lv</span>
      
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        {/* プルダウンボタン */}
        <button
          onClick={() => setShowLevelDropdown(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px 4px 6px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            fontSize: 12,
            background: '#fff',
            color: '#2d3748',
            cursor: 'pointer',
            minWidth: 40,
            whiteSpace: 'nowrap'
          }}
        >
          <span>{mainSkillLevel}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        
        {/* ドロップダウンメニュー */}
        {showLevelDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 2,
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 4,
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 1000,
            }}
          >
            {levelOptions.map((level) => (
              <button
                key={level}
                onClick={() => {
                  onMainSkillLevelChange(level);
                  setShowLevelDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '6px 8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#2d3748',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainSkillSelector;