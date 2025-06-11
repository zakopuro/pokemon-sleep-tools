// 最終進化フラグを自動で追加するスクリプト

import fs from 'fs';
import path from 'path';

interface Pokemon {
  id: string;
  pokedexId: number;
  name: string;
  form: string;
  isFinalEvolution?: boolean;
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

// 進化系統の定義（図鑑番号ベース）
const evolutionChains: { [key: number]: number[] } = {
  // フシギダネ系統
  1: [1, 2, 3],   // フシギダネ → フシギソウ → フシギバナ
  2: [1, 2, 3],
  3: [1, 2, 3],
  
  // ヒトカゲ系統
  4: [4, 5, 6],   // ヒトカゲ → リザード → リザードン
  5: [4, 5, 6],
  6: [4, 5, 6],
  
  // ゼニガメ系統
  7: [7, 8, 9],   // ゼニガメ → カメール → カメックス
  8: [7, 8, 9],
  9: [7, 8, 9],
  
  // キャタピー系統
  10: [10, 11, 12], // キャタピー → トランセル → バタフリー
  11: [10, 11, 12],
  12: [10, 11, 12],
  
  // コラッタ系統
  19: [19, 20],   // コラッタ → ラッタ
  20: [19, 20],
  
  // アーボ系統
  23: [23, 24],   // アーボ → アーボック
  24: [23, 24],
  
  // ピカチュウ系統（特別扱い - 最終進化とする）
  25: [25, 26],   // ピカチュウ → ライチュウ（ただし、ピカチュウを最終進化扱い）
  26: [25, 26],
  
  // プリン系統
  39: [39, 40],   // プリン → プクリン
  40: [39, 40],
  
  // ディグダ系統
  50: [50, 51],   // ディグダ → ダグトリオ
  51: [50, 51],
  
  // ニャース系統
  52: [52, 53],   // ニャース → ペルシアン
  53: [52, 53],
  
  // コダック系統
  54: [54, 55],   // コダック → ゴルダック
  55: [54, 55],
  
  // マンキー系統
  56: [56, 57],   // マンキー → オコリザル
  57: [56, 57],
  
  // ガーディ系統
  58: [58, 59],   // ガーディ → ウィンディ
  59: [58, 59],
  
  // イシツブテ系統
  74: [74, 75, 76], // イシツブテ → ゴローン → ゴローニャ
  75: [74, 75, 76],
  76: [74, 75, 76],
  
  // ヤドン系統
  79: [79, 80],   // ヤドン → ヤドラン
  80: [79, 80],
  
  // コイル系統
  81: [81, 82],   // コイル → レアコイル
  82: [81, 82],
  
  // ドードー系統
  84: [84, 85],   // ドードー → ドードリオ
  85: [84, 85],
  
  // ゴースト系統
  92: [92, 93, 94], // ゴース → ゴースト → ゲンガー
  93: [92, 93, 94],
  94: [92, 93, 94],
  
  // カラカラ系統
  104: [104, 105], // カラカラ → ガラガラ
  105: [104, 105],
  
  // イーブイ系統（イーブイ進化系は全て最終進化扱い）
  133: [133, 134, 135, 136, 196, 197, 470, 471], // イーブイ → 各進化系
  134: [133, 134, 135, 136, 196, 197, 470, 471], // シャワーズ
  135: [133, 134, 135, 136, 196, 197, 470, 471], // サンダース
  136: [133, 134, 135, 136, 196, 197, 470, 471], // ブースター
  196: [133, 134, 135, 136, 196, 197, 470, 471], // エーフィ
  197: [133, 134, 135, 136, 196, 197, 470, 471], // ブラッキー
  470: [133, 134, 135, 136, 196, 197, 470, 471], // リーフィア
  471: [133, 134, 135, 136, 196, 197, 470, 471], // グレイシア
  700: [133, 134, 135, 136, 196, 197, 470, 471, 700], // ニンフィア
  
  // ヨーギラス系統
  246: [246, 247, 248], // ヨーギラス → サナギラス → バンギラス
  247: [246, 247, 248],
  248: [246, 247, 248],
  
  // ラルトス系統
  280: [280, 281, 282], // ラルトス → キルリア → サーナイト
  281: [280, 281, 282],
  282: [280, 281, 282],
  
  // ナマケロ系統
  287: [287, 288, 289], // ナマケロ → ヤルキモノ → ケッキング
  288: [287, 288, 289],
  289: [287, 288, 289],
  
  // ココドラ系統
  304: [304, 305, 306], // ココドラ → コドラ → ボスゴドラ
  305: [304, 305, 306],
  306: [304, 305, 306],
  
  // ゴクリン系統
  316: [316, 317], // ゴクリン → マルノーム
  317: [316, 317],
  
  // チルット系統
  333: [333, 334], // チルット → チルタリス
  334: [333, 334],
  
  // カゲボウズ系統
  353: [353, 354], // カゲボウズ → ジュペッタ
  354: [353, 354],
  
  // ヨマワル系統
  355: [355, 356, 477], // ヨマワル → サマヨール → ヨノワール
  356: [355, 356, 477],
  477: [355, 356, 477],
  
  // アブソル（単体）
  359: [359],
  
  // タマザラシ系統
  363: [363, 364, 365], // タマザラシ → トドグラー → トドゼルガ
  364: [363, 364, 365],
  365: [363, 364, 365],
  
  // リオル系統
  447: [447, 448], // リオル → ルカリオ
  448: [447, 448],
  
  // ドクロッグ系統
  453: [453, 454], // グレッグル → ドクロッグ
  454: [453, 454],
  
  // ユキワラシ系統
  459: [459, 460, 478], // ユキワラシ → ユキノオー、オニゴーリ
  460: [459, 460, 478],
  478: [459, 460, 478],
  
  // フワンテ系統
  425: [425, 426], // フワンテ → フワライド
  426: [425, 426],
  
  // ミミロル系統
  427: [427, 428], // ミミロル → ミミロップ
  428: [427, 428],
  
  // その他単体ポケモンは最終進化扱い
};

// 特別に最終進化扱いするポケモン（主要キャラクター）
const specialFinalEvolutions = new Set([
  25,  // ピカチュウ（マスコット的存在）
  133, // イーブイ（進化の可能性があるが、イーブイ自体も人気）
]);

async function addFinalEvolutionFlags() {
  try {
    // 現在のpokemons.tsファイルを読み込み
    const pokemonsPath = path.join(process.cwd(), 'config/pokemons.ts');
    const content = fs.readFileSync(pokemonsPath, 'utf-8');
    
    // データ配列の開始を特定
    const equalBracketIndex = content.indexOf('= [');
    if (equalBracketIndex === -1) {
      throw new Error('ポケモンデータが見つかりません');
    }
    const arrayStart = equalBracketIndex + 2;
    
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
    
    // 最終進化フラグを追加
    const updatedPokemons = pokemons.map(pokemon => {
      const pokedexId = pokemon.pokedexId;
      
      // 既にフラグがある場合はスキップ
      if (pokemon.isFinalEvolution !== undefined) {
        return pokemon;
      }
      
      let isFinalEvolution = false;
      
      // 特別に最終進化扱いするポケモン
      if (specialFinalEvolutions.has(pokedexId)) {
        isFinalEvolution = true;
      }
      // 進化系統が定義されている場合
      else if (evolutionChains[pokedexId]) {
        const chain = evolutionChains[pokedexId];
        // その系統の最後のポケモンか確認
        isFinalEvolution = pokedexId === Math.max(...chain);
      }
      // 進化系統が定義されていない場合は最終進化扱い
      else {
        isFinalEvolution = true;
      }
      
      return {
        ...pokemon,
        isFinalEvolution
      };
    });
    
    // 新しいファイルを生成
    const newContent = `/* eslint-disable */
import type { Pokemon } from './schema';
export const POKEMONS: readonly Pokemon[] = ${JSON.stringify(updatedPokemons, null, 2)} as const;
`;
    
    // バックアップを作成
    const backupPath = pokemonsPath + '.before-evolution-flags';
    fs.copyFileSync(pokemonsPath, backupPath);
    console.log(`バックアップを作成しました: ${backupPath}`);
    
    // 新しいファイルを書き込み
    fs.writeFileSync(pokemonsPath, newContent);
    console.log('最終進化フラグを追加しました');
    
    // 統計情報を表示
    const finalEvolutionCount = updatedPokemons.filter(p => p.isFinalEvolution).length;
    const notFinalEvolutionCount = updatedPokemons.filter(p => !p.isFinalEvolution).length;
    
    console.log('\n=== 統計情報 ===');
    console.log(`最終進化: ${finalEvolutionCount}匹`);
    console.log(`最終進化ではない: ${notFinalEvolutionCount}匹`);
    
    // サンプル表示
    console.log('\n=== 最終進化の例 ===');
    updatedPokemons
      .filter(p => p.isFinalEvolution)
      .slice(0, 10)
      .forEach(pokemon => {
        console.log(`${pokemon.name} (${pokemon.pokedexId}) - 最終進化`);
      });
    
    console.log('\n=== 最終進化ではない例 ===');
    updatedPokemons
      .filter(p => !p.isFinalEvolution)
      .slice(0, 10)
      .forEach(pokemon => {
        console.log(`${pokemon.name} (${pokemon.pokedexId}) - 進化前`);
      });
    
  } catch (error) {
    console.error('最終進化フラグ追加エラー:', error);
  }
}

// スクリプト実行
addFinalEvolutionFlags();

export { addFinalEvolutionFlags };