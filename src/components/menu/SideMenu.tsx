import React from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'breeding', label: '厳選管理', icon: null }, // 画像を使用
    { id: 'candy', label: 'アメ計算', icon: '🍬' }
  ];

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'background 0.3s ease'
          }}
          onClick={onClose}
        />
      )}

      {/* サイドメニュー */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 280,
          background: '#ffffff',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            color: '#374151',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              メニュー
            </h2>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 4,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* メニュー項目 */}
        <div style={{ padding: '8px 0', flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  border: 'none',
                  background: isActive ? '#f3f4f6' : 'transparent',
                  color: isActive ? '#111827' : '#374151',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.id === 'breeding' ? (
                  <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={`${import.meta.env.BASE_URL}masterbox.png`}
                      alt="厳選管理"
                      style={{ width: 24, height: 24, objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('マスターボックス画像の読み込みに失敗しました:', `${import.meta.env.BASE_URL}masterbox.png`);
                        // 画像が見つからない場合のフォールバック
                        const target = e.target as HTMLImageElement;
                        const container = target.parentNode as HTMLElement;
                        container.innerHTML = '<span style="fontSize: 20px;">🎯</span>';
                      }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* フッター */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb'
          }}
        >
          <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            v1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;