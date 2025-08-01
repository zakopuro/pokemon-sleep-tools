import React, { useRef, useState } from 'react';
import { loadAllPokemonSettings } from '../../utils/pokemon-storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      setIsProcessing(true);
      setMessage({ type: 'info', text: 'データをエクスポート中...' });

      // 全データを取得
      const allData = loadAllPokemonSettings();
      
      // エクスポート用データを作成
      const exportData = {
        version: '1.1',
        exportDate: new Date().toISOString(),
        appName: 'ポケスリ厳選管理',
        data: allData
      };

      // JSON文字列に変換
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // ファイル名を生成（日時付き）
      const now = new Date();
      const fileName = `pokesleep-backup-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.json`;

      // ダウンロード実行
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'バックアップファイルのダウンロードが完了しました！' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'エクスポートに失敗しました。' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setMessage({ type: 'error', text: 'JSONファイルを選択してください。' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: 'info', text: 'データをインポート中...' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // データ形式の検証
        if (!importData.data || typeof importData.data !== 'object') {
          throw new Error('無効なバックアップファイル形式です');
        }

        // バックアップデータをローカルストレージに保存
        localStorage.setItem('pokemon-sleep-settings', JSON.stringify(importData.data));
        
        setMessage({ type: 'success', text: 'データのインポートが完了しました！ページを再読み込みしてください。' });

        // 3秒後にページを再読み込み
        setTimeout(() => {
          window.location.reload();
        }, 3000);

      } catch (error) {
        console.error('Import error:', error);
        setMessage({ type: 'error', text: 'インポートに失敗しました。ファイル形式を確認してください。' });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setMessage({ type: 'error', text: 'ファイルの読み込みに失敗しました。' });
      setIsProcessing(false);
    };

    reader.readAsText(file);
    
    // ファイル入力をリセット
    event.target.value = '';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          width: '100%',
          maxWidth: 400,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src={`${import.meta.env.BASE_URL}backup.png`}
              alt="バックアップ"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const container = target.parentNode as HTMLElement;
                container.innerHTML = '<span style="fontSize: 24px;">💾</span>';
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 600 }}>データバックアップ</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ 
              margin: 0, 
              color: '#6b7280', 
              fontSize: 14, 
              lineHeight: '1.5' 
            }}>
              ポケモンの厳選データをバックアップまたは復元できます。<br />
              他のデバイスでもデータを共有可能です。
            </p>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 20,
                backgroundColor: message.type === 'success' ? '#dcfce7' :
                                message.type === 'error' ? '#fef2f2' : '#f0f9ff',
                border: `1px solid ${message.type === 'success' ? '#16a34a' :
                                    message.type === 'error' ? '#dc2626' : '#3b82f6'}`,
                color: message.type === 'success' ? '#166534' :
                       message.type === 'error' ? '#991b1b' : '#1e40af'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {message.text}
              </div>
            </div>
          )}

          {/* ボタンエリア */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* エクスポートボタン */}
            <button
              onClick={handleExport}
              disabled={isProcessing}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '16px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              エクスポート（データを保存）
            </button>

            {/* インポートボタン */}
            <button
              onClick={handleImport}
              disabled={isProcessing}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '16px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              インポート（データを復元）
            </button>
          </div>

          {/* 隠しファイル入力 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelected}
            style={{ display: 'none' }}
          />
        </div>

        {/* フッター */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}
        >
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
            ⚠️ インポート時は既存データが上書きされます
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;