import React, { useState, useRef, useEffect } from 'react';
import { MAINSKILLS } from '../../config';
import type { Pokemon } from '../../../config/schema';

interface MainSkillSelectorProps {
  selectedPokemon: Pokemon;
  selectedMainSkillId?: number;
  onMainSkillChange?: (skillId: number) => void;
  mainSkillLevel: number;
  onMainSkillLevelChange: (level: number) => void;
}

const MainSkillSelector: React.FC<MainSkillSelectorProps> = ({
  selectedPokemon,
  selectedMainSkillId,
  onMainSkillChange,
  mainSkillLevel,
  onMainSkillLevelChange
}) => {
  type MainSkillItem = (typeof MAINSKILLS)[number];

  const availableMainSkillIds = selectedPokemon.availableMainSkillIds ?? [];
  const selectableSkills = availableMainSkillIds
    .map(skillId => MAINSKILLS.find(skill => skill.id === skillId))
    .filter((skill): skill is MainSkillItem => skill !== undefined);
  const fallbackMainSkillId = selectableSkills[0]?.id ?? selectedPokemon.mainSkillId;
  const normalizedMainSkillId = selectedMainSkillId !== undefined && selectableSkills.some(skill => skill.id === selectedMainSkillId)
    ? selectedMainSkillId
    : fallbackMainSkillId;
  const mainSkill = MAINSKILLS.find(skill => skill.id === normalizedMainSkillId)
    ?? MAINSKILLS.find(skill => skill.id === selectedPokemon.mainSkillId);
  const canSelectMainSkill = selectableSkills.length > 1 && Boolean(onMainSkillChange);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
        setShowLevelDropdown(false);
      }
    };

    if (showSkillDropdown || showLevelDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSkillDropdown, showLevelDropdown]);

  if (!mainSkill) {
    return null;
  }

  const levelOptions = Array.from({ length: mainSkill.maxlevel }, (_, i) => i + 1);

  const handleMainSkillChange = (skillId: number) => {
    const nextSkill = MAINSKILLS.find(skill => skill.id === skillId);
    if (!nextSkill) return;

    onMainSkillChange?.(skillId);
    if (mainSkillLevel > nextSkill.maxlevel) {
      onMainSkillLevelChange(nextSkill.maxlevel);
    }
    setShowSkillDropdown(false);
  };

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
      <div ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', minWidth: 0 }}>
        {canSelectMainSkill ? (
          <div style={{ position: 'relative', minWidth: 0 }}>
            <button
              type="button"
              onClick={() => {
                setShowSkillDropdown(prev => !prev);
                setShowLevelDropdown(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                maxWidth: 180,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                background: '#fff',
                color: '#2d3748',
                cursor: 'pointer',
                minWidth: 0,
              }}
            >
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {mainSkill.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showSkillDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: 220,
                  maxHeight: 260,
                  overflowY: 'auto',
                  marginTop: 2,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: 4,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 1000,
                }}
              >
                {selectableSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleMainSkillChange(skill.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%',
                      padding: '7px 8px',
                      background: skill.id === mainSkill.id ? '#eef6ff' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#2d3748',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = skill.id === mainSkill.id ? '#eef6ff' : 'transparent';
                    }}
                  >
                    <span>{skill.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span style={{ fontWeight: 700, color: '#2d3748' }}>
            {mainSkill.name}
          </span>
        )}

        <span style={{ color: '#6b7280' }}>Lv</span>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowLevelDropdown(prev => !prev);
              setShowSkillDropdown(false);
            }}
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
                  type="button"
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
    </div>
  );
};

export default MainSkillSelector;
