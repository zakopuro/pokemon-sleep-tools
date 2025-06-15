import React from 'react';
import type { Pokemon } from '../../../config/schema';
import { getPokemonImageName } from '../../utils/pokemon-id';

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

interface PokemonCardProps {
  pokemon: Pokemon;
  isSelected: boolean;
  statusIcon?: React.ReactNode;
  ingredientLabel?: { label: string; backgroundColor: string } | null;
  onClick: () => void;
  size?: 'small' | 'medium';
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isSelected,
  statusIcon,
  ingredientLabel,
  onClick,
  size = 'medium'
}) => {
  const { mainName, formName } = splitPokemonName(pokemon.name);
  
  const cardSize = size === 'small' ? { width: 50, height: 58 } : { width: 60, height: 68 };
  const imageSize = size === 'small' ? 30 : 40;
  const fontSize = size === 'small' ? 7 : 8;
  const formFontSize = size === 'small' ? 5 : 6;

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? '#4299e1' : '#fff',
        border: isSelected ? '2px solid #2b6cb0' : '1px solid #e2e8f0',
        borderRadius: 4,
        padding: 4,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
        color: isSelected ? '#fff' : '#2d3748',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isSelected ? '0 2px 8px rgba(66, 153, 225, 0.3)' : 'none',
        ...cardSize,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* ポケモン画像エリア */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: imageSize, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexShrink: 0 
      }}>
        <img
          src={`${import.meta.env.BASE_URL}image/pokemon/${getPokemonImageName(pokemon)}.png`}
          alt={pokemon.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const pokedexId = pokemon.pokedexId.toString().padStart(3, '0');
            target.src = `${import.meta.env.BASE_URL}image/pokemon/${pokedexId}.png`;
            target.onerror = () => {
              target.src = '/vite.svg';
            };
          }}
        />
        
        {/* 管理状態アイコン */}
        {statusIcon}
        
        {/* 食材ラベル（A,B,C） */}
        {ingredientLabel && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: ingredientLabel.backgroundColor,
            color: '#fff',
            borderRadius: '50%',
            width: 16,
            height: 16,
            fontSize: 8,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #fff',
            zIndex: 10
          }}>
            {ingredientLabel.label}
          </span>
        )}
      </div>
      
      {/* ポケモン名エリア */}
      <div style={{ 
        fontSize, 
        fontWeight: 700, 
        lineHeight: 1.1, 
        wordBreak: 'break-word',
        textAlign: 'center',
        width: '100%',
        height: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {mainName}
        {formName && (
          <div style={{ 
            fontSize: formFontSize, 
            color: isSelected ? '#e2e8f0' : '#666', 
            lineHeight: 1.0
          }}>
            {formName}
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;