import React from 'react';

interface EmptyPlaceholderProps {
  onClick?: () => void;
}

const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: 60,
        height: 68,
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'all 0.2s ease' : 'none'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = '#f3f4f6';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.background = '#f9fafb';
        }
      }}
    >
      <span style={{
        fontSize: 24,
        color: '#9ca3af',
        fontWeight: 'bold',
        userSelect: 'none'
      }}>
        -
      </span>
    </div>
  );
};

export default EmptyPlaceholder;