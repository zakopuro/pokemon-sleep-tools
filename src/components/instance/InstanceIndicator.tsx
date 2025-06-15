import React from 'react';
import { getUsedInstanceIds, getNextAvailableInstanceId } from '../../utils/pokemon-storage';
import type { Pokemon } from '../../../config/schema';

interface InstanceIndicatorProps {
  selectedPokemon: Pokemon;
  currentInstanceId: string;
  onInstanceChange: (instanceId: string) => void;
}

const InstanceIndicator: React.FC<InstanceIndicatorProps> = ({
  selectedPokemon,
  currentInstanceId,
  onInstanceChange
}) => {
  const usedIds = getUsedInstanceIds(selectedPokemon);
  const currentIndex = usedIds.indexOf(currentInstanceId);
  
  // 新しい個体を追加
  const handleAddNew = () => {
    const nextId = getNextAvailableInstanceId(selectedPokemon);
    if (nextId) {
      onInstanceChange(nextId);
    }
  };
  
  const canAddNew = getNextAvailableInstanceId(selectedPokemon) !== null;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      margin: '2px 0 0 0', // 上下マージンを極小に
      padding: 0
    }}>
      {/* 個体ドット */}
      {usedIds.map((instanceId, index) => (
        <button
          key={instanceId}
          onClick={() => onInstanceChange(instanceId)}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            border: 'none',
            background: index === currentIndex ? '#4ade80' : '#d1d5db',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            if (index !== currentIndex) {
              e.currentTarget.style.background = '#9ca3af';
            }
          }}
          onMouseLeave={(e) => {
            if (index !== currentIndex) {
              e.currentTarget.style.background = '#d1d5db';
            }
          }}
        />
      ))}
      
      {/* 追加ボタン（利用可能な場合のみ） */}
      {canAddNew && (
        <button
          onClick={handleAddNew}
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            outline: 'none',
            marginLeft: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'normal',
            lineHeight: 1,
            fontFamily: 'monospace',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
          }}
          title="新しい個体を追加"
        >
          +
        </button>
      )}
    </div>
  );
};

export default InstanceIndicator;