// ポケモンデータ移行スクリプト

import fs from 'fs';
import path from 'path';
import { generatePokemonId, detectFormFromName, generateEnglishName } from '../src/utils/pokemon-id';

interface OldPokemon {
  id: number;
  name: string;
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

async function migratePokemonData() {
  try {
    // 現在のpokemons.tsファイルを読み込み
    const pokemonsPath = path.join(process.cwd(), 'config/pokemons.ts');
    const content = fs.readFileSync(pokemonsPath, 'utf-8');
    
    // データ部分を抽出（簡易的な方法）
    let oldPokemons: OldPokemon[];
    
    const dataMatch = content.match(/export const POKEMONS[^=]*=\s*(\[.*?\]);/s);
    if (!dataMatch) {
      console.log('正規表現でマッチしなかったため、別の方法を試します');
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
      console.log('パースしようとしているデータ（最初の500文字）:');
      console.log(dataStr.substring(0, 500));
      oldPokemons = JSON.parse(dataStr);
      console.log(`${oldPokemons.length}件のポケモンデータを読み込みました`);
    } else {
      // 正規表現でマッチした場合
      const dataStr = dataMatch[1];
      oldPokemons = JSON.parse(dataStr);
      console.log(`${oldPokemons.length}件のポケモンデータを読み込みました`);
    }
    
    // 新しい形式に変換
    const newPokemons: NewPokemon[] = oldPokemons.map(oldPokemon => {
      const form = detectFormFromName(oldPokemon.name);
      const newId = generatePokemonId(oldPokemon.id, form);
      
      return {
        ...oldPokemon,
        id: newId,
        pokedexId: oldPokemon.id,
        name: oldPokemon.name, // 日本語名をそのまま使用
        form: form
      };
    });
    
    // 新しいファイルを生成
    const newContent = `/* eslint-disable */
import type { Pokemon } from './schema';
export const POKEMONS: readonly Pokemon[] = ${JSON.stringify(newPokemons, null, 2)} as const;
`;
    
    // バックアップを作成
    const backupPath = pokemonsPath + '.backup';
    fs.copyFileSync(pokemonsPath, backupPath);
    console.log(`バックアップを作成しました: ${backupPath}`);
    
    // 新しいファイルを書き込み
    fs.writeFileSync(pokemonsPath, newContent);
    console.log('ポケモンデータの移行が完了しました');
    
    // サンプル出力
    console.log('\n=== 変換例 ===');
    newPokemons.slice(0, 5).forEach(pokemon => {
      console.log(`${pokemon.name} -> ID: ${pokemon.id}, Form: ${pokemon.form}`);
    });
    
  } catch (error) {
    console.error('移行エラー:', error);
  }
}

// スクリプト実行
migratePokemonData();

export { migratePokemonData };