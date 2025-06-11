// ポケモンデータの英語名を日本語名に戻すスクリプト

import fs from 'fs';
import path from 'path';

interface Pokemon {
  id: string;
  name: string;
  nameJp: string;
  pokedexId: number;
  form: string;
  sleepType: string;
  specialty: string;
  mainSkillId: number;
  fp: number;
  frequency: number;
  berryId: number;
  ing1?: any;
  ing2?: any;
  ing3?: any;
}

interface NewPokemon {
  id: string;
  pokedexId: number;
  name: string;
  form: string;
  sleepType: string;
  specialty: string;
  mainSkillId: number;
  fp: number;
  frequency: number;
  berryId: number;
  ing1?: any;
  ing2?: any;
  ing3?: any;
}

async function fixJapaneseNames() {
  try {
    // 現在のpokemons.tsファイルを読み込み
    const pokemonsPath = path.join(process.cwd(), 'config/pokemons.ts');
    const content = fs.readFileSync(pokemonsPath, 'utf-8');
    
    // データ配列の開始を特定（= [の後の[を探す）
    const equalBracketIndex = content.indexOf('= [');
    if (equalBracketIndex === -1) {
      throw new Error('ポケモンデータが見つかりません');
    }
    const arrayStart = equalBracketIndex + 2; // '= ' の後の '[' の位置
    
    let arrayEnd = content.lastIndexOf('] as const;');
    if (arrayEnd === -1) {
      arrayEnd = content.lastIndexOf('];');
      if (arrayEnd === -1) {
        throw new Error('ポケモンデータが見つかりません');
      }
    }
    const dataStr = content.substring(arrayStart, arrayEnd + 1);
    
    const pokemons: Pokemon[] = JSON.parse(dataStr);
    console.log(`${pokemons.length}件のポケモンデータを読み込みました`);
    
    // 日本語名のみに変換
    const newPokemons: NewPokemon[] = pokemons.map(pokemon => {
      const { nameJp, ...rest } = pokemon;
      return {
        ...rest,
        name: nameJp // 日本語名をnameフィールドに設定
      };
    });
    
    // 新しいファイルを生成
    const newContent = `/* eslint-disable */
import type { Pokemon } from './schema';
export const POKEMONS: readonly Pokemon[] = ${JSON.stringify(newPokemons, null, 2)} as const;
`;
    
    // バックアップを作成
    const backupPath = pokemonsPath + '.en-backup';
    fs.copyFileSync(pokemonsPath, backupPath);
    console.log(`英語名バックアップを作成しました: ${backupPath}`);
    
    // 新しいファイルを書き込み
    fs.writeFileSync(pokemonsPath, newContent);
    console.log('ポケモンデータを日本語名のみに修正しました');
    
    // サンプル出力
    console.log('\n=== 変換例 ===');
    newPokemons.slice(0, 5).forEach(pokemon => {
      console.log(`ID: ${pokemon.id}, Name: ${pokemon.name}, Form: ${pokemon.form}`);
    });
    
  } catch (error) {
    console.error('修正エラー:', error);
  }
}

// スクリプト実行
fixJapaneseNames();

export { fixJapaneseNames };