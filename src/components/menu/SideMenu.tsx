import React, { useEffect } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenBackup?: () => void;
  dynamicHeight: number;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentPage, onNavigate, onOpenBackup, dynamicHeight }) => {
  const menuItems = [
    { id: 'breeding', label: '厳選管理', icon: null }, // 画像を使用
    { id: 'field', label: '出現フィールド', icon: '🗺️' },
    { id: 'type', label: 'タイプ別', icon: null }, // SVGを使用
    { id: 'candy', label: 'アメ計算', icon: '🍬' }
  ];

  // サイドメニューが開いている時にbodyのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      // 現在のスクロール位置を保存
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // スクロール位置を復元
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // クリーンアップ
    return () => {
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen]);

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
          onTouchMove={(e) => {
            // オーバーレイ部分でのタッチスクロールを防止
            e.preventDefault();
          }}
        />
      )}

      {/* サイドメニュー */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: dynamicHeight,
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
        <div style={{ 
          padding: '8px 0',
          height: dynamicHeight - 240, // ヘッダー、ボタン類、フッターを除いた高さ
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch', // iOS用のスムーズスクロール
          minHeight: 200 // 最小高さを保証
        }}>
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
                  ) : item.id === 'type' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640">
                      <path fill="#ec46de" d="M180.7 97.8C185.2 91.7 192.4 88 200 88L440 88C447.6 88 454.8 91.6 459.3 97.8L571.3 249.8C578.1 259 577.4 271.7 569.8 280.2L337.8 536.2C333.3 541.2 326.8 544.1 320 544.1C313.2 544.1 306.8 541.2 302.2 536.2L70.2 280.2C62.5 271.7 61.9 259 68.7 249.8L180.7 97.8zM219.2 137.6C215.9 140.1 215 144.6 217.1 148.1L274.5 243.8L127.3 256C123.2 256.3 120 259.8 120 264C120 268.2 123.2 271.6 127.3 272L319.3 288C319.7 288 320.2 288 320.6 288L512.6 272C516.7 271.7 519.9 268.2 519.9 264C519.9 259.8 516.7 256.4 512.6 256L365.4 243.7L422.8 148.1C424.9 144.6 424 140 420.7 137.6C417.4 135.2 412.8 135.6 410 138.6L320 236.2L229.9 138.6C227.1 135.6 222.5 135.2 219.2 137.6z"/>
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
            v1.1.1
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;