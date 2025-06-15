import React from 'react';

interface StatusIconProps {
  status: string;
  count?: number;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status, count }) => {
  // 空文字または未設定の場合は何も表示しない
  if (!status || status === '未設定') {
    return null;
  }
  
  const iconStyle = {
    position: 'absolute' as const,
    top: -2,
    left: -2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    zIndex: 10
  };

  switch (status) {
    case '厳選前':
      return (
        <div style={{ ...iconStyle, background: '#8b5cf6' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    case '厳選中':
      return (
        <div style={{ ...iconStyle, background: '#3b82f6' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2" fill="white"/>
            <path d="m14 10-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="m10 10 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      );
    case '完了':
      return (
        <div style={{ ...iconStyle, background: '#22c55e' }}>
          {count && count > 1 ? (
            // 複数完了の場合は数値を表示
            <span style={{
              color: '#fff',
              fontSize: 8,
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              {count > 9 ? '9+' : `${count}`}
            </span>
          ) : (
            // 単一完了の場合はチェックマーク
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      );
    case '保留':
      return (
        <div style={{ ...iconStyle, background: '#f59e0b' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" fill="white"/>
            <rect x="14" y="4" width="4" height="16" fill="white"/>
          </svg>
        </div>
      );
    case '中止':
      return (
        <div style={{ ...iconStyle, background: '#ef4444' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    case '対象外':
      return (
        <div style={{ ...iconStyle, background: '#6b7280' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M4.93 4.93l14.14 14.14" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
      );
    default:
      return null; // 未設定の場合は何も表示しない
  }
};

export default StatusIcon;