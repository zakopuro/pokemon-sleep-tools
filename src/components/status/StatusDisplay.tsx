import React from 'react';
import { getBerry, getBerryImageName } from '../../utils/pokemon';
import { sleepTypeColors } from '../../constants/colors';
import type { Pokemon } from '../../../config/schema';

interface StatusDisplayProps {
  selectedPokemon: Pokemon;
  managementStatus: string;
  onManagementStatusChange: (status: string) => void;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  selectedPokemon,
  managementStatus,
  onManagementStatusChange
}) => {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 6px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ margin: 0, color: '#2d3748', fontSize: 18, fontWeight: 700 }}>
            {selectedPokemon.name}
          </h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600,
              border: '1px solid #e2e8f0'
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
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 600,
              border: '1px solid #e2e8f0'
            }}>
              {selectedPokemon.specialty}
            </span>
            {/* きのみ画像 */}
            <img
              src={`${import.meta.env.BASE_URL}image/berry/${getBerryImageName(getBerry(selectedPokemon.berryId)?.name || '')}.png`}
              alt={getBerry(selectedPokemon.berryId)?.name || '不明'}
              style={{ width: 24, height: 24, objectFit: 'contain' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `${import.meta.env.BASE_URL}image/berry/cheriberry.png`;
              }}
            />
          </div>
        </div>
        {/* 育成状態管理プルダウンと詳細開閉ボタン */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={managementStatus}
              onChange={(e) => onManagementStatusChange(e.target.value)}
              style={{
                padding: '4px 24px 4px 28px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                fontSize: 12,
                background: (() => {
                  switch(managementStatus) {
                    case '完了': return '#f0fdf4';
                    case '保留': return '#fffbeb';
                    case '中止': return '#fef2f2';
                    case '対象外': return '#f9fafb';
                    default: return '#fff';
                  }
                })(),
                color: '#2d3748',
                appearance: 'none'
              }}
            >
              <option value="未設定">未設定</option>
              <option value="完了">完了</option>
              <option value="保留">保留</option>
              <option value="中止">中止</option>
              <option value="対象外">対象外</option>
            </select>
            {/* ステータスアイコン */}
            <div style={{
              position: 'absolute',
              left: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {managementStatus === '未設定' && (
                <svg width="16" height="16" viewBox="0 0 512 512">
                  <path fill="#6b7280" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM232 256a24 24 0 1 1 48 0v128a24 24 0 1 1 -48 0V256z"/>
                </svg>
              )}
              {managementStatus === '完了' && (
                <svg width="16" height="16" viewBox="0 0 512 512">
                  <path fill="#22c55e" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
                </svg>
              )}
              {managementStatus === '保留' && (
                <svg width="16" height="16" viewBox="0 0 512 512">
                  <path fill="#f59e0b" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM224 192V320c0 17.7 14.3 32 32 32s32-14.3 32-32V192c0-17.7-14.3-32-32-32s-32 14.3-32 32zm64 0V320c0 17.7 14.3 32 32 32s32-14.3 32-32V192c0-17.7-14.3-32-32-32s-32 14.3-32 32z"/>
                </svg>
              )}
              {managementStatus === '中止' && (
                <svg width="16" height="16" viewBox="0 0 512 512">
                  <path fill="#ef4444" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
                </svg>
              )}
              {managementStatus === '対象外' && (
                <svg width="16" height="16" viewBox="0 0 512 512">
                  <path fill="#6b7280" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c23.4 0 45.1 9.5 60.6 25L361 197.4c15.5 15.5 25 37.2 25 60.6s-9.5 45.1-25 60.6L317.7 361c-15.5 15.5-37.2 25-60.6 25s-45.1-9.5-60.6-25L151 317.7c-15.5-15.5-25-37.2-25-60.6s9.5-45.1 25-60.6L194.3 153c15.5-15.5 37.2-25 60.6-25z"/>
                </svg>
              )}
            </div>
            {/* ドロップダウン矢印 */}
            <div style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;