import React from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenBackup?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentPage, onNavigate, onOpenBackup }) => {
  const menuItems = [
    { id: 'breeding', label: '厳選管理', icon: null }, // 画像を使用
    { id: 'field', label: '出現フィールド', icon: '🗺️' },
    { id: 'candy', label: 'アメ計算', icon: '🍬' }
  ];

  const handleInstall = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`ユーザーの選択: ${outcome}`);
      (window as any).deferredPrompt = null;
    } else {
      // PWAインストールプロンプトが利用できない場合
      alert('このアプリは既にインストールされているか、インストールプロンプトが利用できません。');
    }
  };

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
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.id === 'breeding' ? (
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
                  ) : item.id === 'field' ? (
                    <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                      {/* 海 */}
                      <rect x="0" y="45" width="64" height="19" fill="#4A90E2"/>
                      {/* 砂浜 */}
                      <ellipse cx="32" cy="45" rx="20" ry="8" fill="#F5DEB3"/>
                      {/* 左のヤシの木 */}
                      <rect x="18" y="30" width="3" height="15" fill="#8B4513"/>
                      <path d="M14 25 C14 25, 16 28, 19.5 30" stroke="#228B22" strokeWidth="2" fill="none"/>
                      <path d="M12 28 C12 28, 15 30, 19.5 32" stroke="#228B22" strokeWidth="2" fill="none"/>
                      <path d="M25 25 C25 25, 23 28, 19.5 30" stroke="#228B22" strokeWidth="2" fill="none"/>
                      <path d="M27 28 C27 28, 24 30, 19.5 32" stroke="#228B22" strokeWidth="2" fill="none"/>
                      {/* 右のヤシの木 */}
                      <rect x="43" y="28" width="3" height="17" fill="#8B4513"/>
                      <path d="M39 23 C39 23, 41 26, 44.5 28" stroke="#228B22" strokeWidth="2" fill="none"/>
                      <path d="M37 26 C37 26, 40 28, 44.5 30" stroke="#228B22" strokeWidth="2" fill="none"/>
                      <path d="M50 23 C50 23, 48 26, 44.5 28" stroke="#228B22" strokeWidth="2" fill="none"/>
                      <path d="M52 26 C52 26, 49 28, 44.5 30" stroke="#228B22" strokeWidth="2" fill="none"/>
                    </svg>
                  ) : item.id === 'candy' ? (
                    <img 
                      src={`${import.meta.env.BASE_URL}candy.png`}
                      alt="アメ計算"
                      style={{ width: 24, height: 24, objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('アメ画像の読み込みに失敗しました:', `${import.meta.env.BASE_URL}candy.png`);
                        // 画像が見つからない場合のフォールバック
                        const target = e.target as HTMLImageElement;
                        const container = target.parentNode as HTMLElement;
                        container.innerHTML = '<span style="fontSize: 20px;">🍬</span>';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* バックアップボタン */}
        <div style={{ padding: '4px 0' }}>
          <button
            onClick={() => {
              onOpenBackup?.();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              color: '#374151',
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
              e.currentTarget.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={`${import.meta.env.BASE_URL}backup.png`}
                alt="バックアップ"
                style={{ width: 24, height: 24, objectFit: 'contain' }}
                onError={(e) => {
                  console.error('バックアップ画像の読み込みに失敗しました:', `${import.meta.env.BASE_URL}backup.png`);
                  const target = e.target as HTMLImageElement;
                  const container = target.parentNode as HTMLElement;
                  container.innerHTML = '<span style="fontSize: 20px;">💾</span>';
                }}
              />
            </div>
            <span>バックアップ</span>
          </button>
        </div>

        {/* インストールボタン */}
        <div style={{ padding: '4px 0' }}>
          <button
            onClick={() => {
              handleInstall();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              color: '#374151',
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
              e.currentTarget.style.background = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={`${import.meta.env.BASE_URL}install.png`}
                alt="インストール"
                style={{ width: 24, height: 24, objectFit: 'contain' }}
                onError={(e) => {
                  console.error('インストール画像の読み込みに失敗しました:', `${import.meta.env.BASE_URL}install.png`);
                  const target = e.target as HTMLImageElement;
                  const container = target.parentNode as HTMLElement;
                  container.innerHTML = '<span style="fontSize: 20px;">⬇️</span>';
                }}
              />
            </div>
            <span>インストール</span>
          </button>
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