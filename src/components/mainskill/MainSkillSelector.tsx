import React from 'react';
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
  
  if (!mainSkill) {
    return null;
  }

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
      <select
        value={mainSkillLevel}
        onChange={(e) => onMainSkillLevelChange(Number(e.target.value))}
        style={{
          padding: '2px 6px',
          borderRadius: 4,
          border: '1px solid #d1d5db',
          fontSize: 12,
          background: '#fff',
          cursor: 'pointer'
        }}
      >
        {Array.from({ length: mainSkill.maxlevel }, (_, i) => i + 1).map(level => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MainSkillSelector;