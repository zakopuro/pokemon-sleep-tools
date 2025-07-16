import React, { useState, useRef, useEffect } from 'react';
import { getBerry, getBerryImageName } from '../../utils/pokemon';
import { sleepTypeColors } from '../../constants/colors';
import type { Pokemon } from '../../../config/schema';

// ポケモン名を分離（メイン名と特別な姿の説明）
const splitPokemonName = (name: string) => {
  const match = name.match(/^(.+?)\((.+)\)$/);
  if (match) {
    return {
      mainName: match[1],
      formName: `(${match[2]})`
    };
  }
  return {
    mainName: name,
    formName: ''
  };
};

interface StatusDisplayProps {
  selectedPokemon: Pokemon;
  managementStatus: string;
  onManagementStatusChange: (status: string) => void;
  canDelete?: boolean;
  onDelete?: () => void;
  currentInstanceId?: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  selectedPokemon,
  managementStatus,
  onManagementStatusChange,
  canDelete = false,
  onDelete,
  currentInstanceId
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 管理状態の選択肢
  const statusOptions = ['未設定', '厳選前', '厳選中', '完了', '保留', '中止', '対象外'];
  
  // 優先度の選択肢
  const priorityOptions = ['高', '中', '低'];

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
        setShowPriorityDropdown(false);
      }
    };

    if (showStatusDropdown || showPriorityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown, showPriorityDropdown]);

  // 管理状態アイコンを返す関数
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '未設定':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17h.01" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '厳選前':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#8b5cf6" strokeWidth="2" fill="#8b5cf6"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '厳選中':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" fill="#3b82f6"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
            <path d="m15 9-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="m9 9 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case '完了':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="#22c55e"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '保留':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b"/>
            <rect x="8" y="7" width="2" height="10" fill="white"/>
            <rect x="14" y="7" width="2" height="10" fill="white"/>
          </svg>
        );
      case '中止':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="#ef4444"/>
            <path d="M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case '対象外':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2" fill="#6b7280"/>
            <path d="M4.93 4.93l14.14 14.14" stroke="white" strokeWidth="2"/>
          </svg>
        );
      default:
        // 優先度付きの厳選中状態に対応（半角・全角両方対応）
        if (status.startsWith('厳選中(') || status.startsWith('厳選中（')) {
          return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" fill="#3b82f6"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
              <path d="m15 9-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="m9 9 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          );
        }
        return null;
    }
  };
  return (
    <div style={{ marginBottom: 4, position: 'relative' }}>
      {/* 削除ボタン（右上に絶対配置） */}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute',
            top: -16,
            right: -12,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: 0,
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 'normal',
            lineHeight: 1,
            fontFamily: 'monospace',
            textAlign: 'center',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ef4444';
          }}
          title={`個体${currentInstanceId}を削除`}
        >
          ×
        </button>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 3px 0', gap: 8 }}>
        {/* 左側：ポケモン画像と名前 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          {/* ポケモン画像 */}
          <img 
            src={`${import.meta.env.BASE_URL}image/pokemon/${selectedPokemon.id.toString().padStart(7, '0')}.png`}
            alt={selectedPokemon.name}
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain',
              flexShrink: 0
            }}
            onError={(e) => {
              console.error('ポケモン画像の読み込みに失敗しました:', e.currentTarget.src);
              // 画像が見つからない場合は非表示にする
              e.currentTarget.style.display = 'none';
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <h2 style={{ margin: 0, color: '#2d3748', fontSize: 18, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {splitPokemonName(selectedPokemon.name).mainName}
            </h2>
            {splitPokemonName(selectedPokemon.name).formName && (
              <div style={{ 
                fontSize: 12, 
                color: '#666', 
                lineHeight: 1.0,
                marginTop: -2,
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {splitPokemonName(selectedPokemon.name).formName}
              </div>
            )}
          </div>
        </div>

        {/* 中央：バッジ類（睡眠タイプ、得意なもの、きのみ） */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {/* 睡眠タイプ */}
          <span style={{
            background: sleepTypeColors[selectedPokemon.sleepType],
            color: (() => {
              switch(selectedPokemon.sleepType) {
                case 'うとうと': return '#b8860b';
                case 'すやすや': return '#1e50a2';
                case 'ぐっすり': return '#ffffff';
                default: return '#2d3748';
              }
            })(),
            padding: '2px 6px',
            borderRadius: 12,
            fontSize: 9,
            fontWeight: 600,
            border: '1px solid #e2e8f0',
            whiteSpace: 'nowrap'
          }}>
            {selectedPokemon.sleepType}
          </span>
          {/* 得意なもの */}
          <span style={{
            background: (() => {
              switch(selectedPokemon.specialty) {
                case 'きのみ': return '#38a169';
                case '食材': return '#ffa500';
                case 'スキル': return '#1e90ff';
                case 'オール': return '#ff1493';
                default: return '#f1f5f9';
              }
            })(),
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 12,
            fontSize: 9,
            fontWeight: 600,
            border: '1px solid #e2e8f0',
            whiteSpace: 'nowrap'
          }}>
            {selectedPokemon.specialty}
          </span>
          {/* きのみ画像 */}
          <img
            src={`${import.meta.env.BASE_URL}image/berry/${getBerryImageName(getBerry(selectedPokemon.berryId))}.png`}
            alt={getBerry(selectedPokemon.berryId)?.name || '不明'}
            style={{ width: 20, height: 20, objectFit: 'contain' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `${import.meta.env.BASE_URL}image/berry/cheriberry.png`;
            }}
          />
        </div>

        {/* 右側：管理状態プルダウン */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* プルダウンボタン */}
            <button
              onClick={() => setShowStatusDropdown(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
                padding: '4px 8px 4px 6px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                background: (() => {
                  switch(managementStatus) {
                    case '完了': return '#f0fdf4';
                    case '保留': return '#fffbeb';
                    case '中止': return '#fef2f2';
                    case '対象外': return '#f9fafb';
                    case '厳選前': return '#fef7ff';
                    case '厳選中': return '#eff6ff';
                    default: 
                      if (managementStatus.startsWith('厳選中')) return '#eff6ff';
                      return '#fff';
                  }
                })(),
                color: '#2d3748',
                cursor: 'pointer',
                minWidth: 100,
                whiteSpace: 'nowrap'
              }}
            >
              {getStatusIcon(managementStatus)}
              <span style={{ whiteSpace: 'nowrap' }}>{managementStatus}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {/* ドロップダウンメニュー */}
            {showStatusDropdown && (
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
                {statusOptions.map((status) => (
                  <div key={status}>
                    <button
                      onClick={() => {
                        if (status === '厳選中') {
                          setShowPriorityDropdown(true);
                        } else {
                          onManagementStatusChange(status);
                          setShowStatusDropdown(false);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
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
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </button>
                    
                    {/* 厳選中を選択したときの優先度選択 */}
                    {status === '厳選中' && showPriorityDropdown && (
                      <div style={{
                        paddingLeft: 16,
                        borderLeft: '2px solid #e2e8f0',
                        marginLeft: 8,
                        marginTop: 4
                      }}>
                        <div style={{ 
                          padding: '2px 8px', 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: '#6b7280'
                        }}>
                          優先度
                        </div>
                        {priorityOptions.map((priority) => (
                          <button
                            key={priority}
                            onClick={() => {
                              onManagementStatusChange(`厳選中(${priority})`);
                              setShowPriorityDropdown(false);
                              setShowStatusDropdown(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              padding: '4px 8px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: 4,
                              fontSize: 11,
                              color: (() => {
                                switch(priority) {
                                  case '高': return '#dc2626';
                                  case '中': return '#f59e0b';
                                  case '低': return '#10b981';
                                  default: return '#2d3748';
                                }
                              })(),
                              fontWeight: 600,
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#f1f5f9';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;