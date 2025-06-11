// ポケモン画像ファイル名を新しいIDに一致させるスクリプト

import fs from 'fs';
import path from 'path';

// 新しいIDルールに基づく変換
const generatePokemonId = (pokedexId: number, form: string): string => {
  const formBaseNumbers: { [key: string]: string } = {
    'normal': '001',
    'halloween': '002', 
    'holiday': '003',
    'alolan': '004',
    'paldean': '005'
  };
  
  const baseNumber = formBaseNumbers[form] || '001';
  const formattedPokedexId = pokedexId.toString().padStart(4, '0');
  return baseNumber + formattedPokedexId;
};

// 旧ファイル名から図鑑番号と形式を抽出
const parseOldImageName = (fileName: string): { pokedexId: number; form: string } | null => {
  const nameWithoutExt = fileName.replace('.png', '');
  
  // 特別な姿のパターン
  if (nameWithoutExt.includes('-halloween')) {
    const pokedexId = parseInt(nameWithoutExt.replace('-halloween', ''));
    return { pokedexId, form: 'halloween' };
  }
  if (nameWithoutExt.includes('-holiday')) {
    const pokedexId = parseInt(nameWithoutExt.replace('-holiday', ''));
    return { pokedexId, form: 'holiday' };
  }
  if (nameWithoutExt.includes('-alolan')) {
    const pokedexId = parseInt(nameWithoutExt.replace('-alolan', ''));
    return { pokedexId, form: 'alolan' };
  }
  if (nameWithoutExt.includes('-paldean')) {
    const pokedexId = parseInt(nameWithoutExt.replace('-paldean', ''));
    return { pokedexId, form: 'paldean' };
  }
  
  // 通常の姿
  const pokedexId = parseInt(nameWithoutExt);
  if (!isNaN(pokedexId)) {
    return { pokedexId, form: 'normal' };
  }
  
  return null;
};

async function renameImages() {
  const imageDir = path.join(process.cwd(), 'public/image/pokemon');
  
  try {
    // 画像ディレクトリの存在確認
    if (!fs.existsSync(imageDir)) {
      throw new Error(`画像ディレクトリが見つかりません: ${imageDir}`);
    }
    
    // 画像ファイル一覧を取得
    const files = fs.readdirSync(imageDir).filter(file => file.endsWith('.png'));
    console.log(`${files.length}個の画像ファイルが見つかりました`);
    
    // 変換マップを作成
    const renameMap: Array<{ oldName: string; newName: string; pokedexId: number; form: string }> = [];
    
    for (const file of files) {
      const parsed = parseOldImageName(file);
      if (parsed) {
        const newId = generatePokemonId(parsed.pokedexId, parsed.form);
        const newName = `${newId}.png`;
        
        if (file !== newName) {
          renameMap.push({
            oldName: file,
            newName: newName,
            pokedexId: parsed.pokedexId,
            form: parsed.form
          });
        }
      } else {
        console.warn(`解析できないファイル名: ${file}`);
      }
    }
    
    console.log(`\\n${renameMap.length}個のファイルを変換します:`);
    
    // 変換予定を表示
    renameMap.forEach((item, index) => {
      if (index < 10 || item.form !== 'normal') {  // 最初の10個と特別な姿を表示
        console.log(`${item.oldName} -> ${item.newName} (図鑑番号:${item.pokedexId}, 形式:${item.form})`);
      }
    });
    
    if (renameMap.length > 10) {
      console.log(`... 他 ${renameMap.length - 10}個のファイル`);
    }
    
    // 実際にファイル名を変更
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of renameMap) {
      try {
        const oldPath = path.join(imageDir, item.oldName);
        const newPath = path.join(imageDir, item.newName);
        
        // 新しいファイル名が既に存在する場合はスキップ
        if (fs.existsSync(newPath)) {
          console.warn(`スキップ (既存): ${item.oldName} -> ${item.newName}`);
          continue;
        }
        
        fs.renameSync(oldPath, newPath);
        successCount++;
        
        if (item.form !== 'normal') {
          console.log(`✓ ${item.oldName} -> ${item.newName}`);
        }
      } catch (error) {
        console.error(`エラー: ${item.oldName} -> ${item.newName}`, error);
        errorCount++;
      }
    }
    
    console.log(`\\n=== 変換完了 ===`);
    console.log(`成功: ${successCount}個`);
    console.log(`エラー: ${errorCount}個`);
    console.log(`スキップ: ${renameMap.length - successCount - errorCount}個`);
    
    // 変換後のファイル一覧をサンプル表示
    const newFiles = fs.readdirSync(imageDir).filter(file => file.endsWith('.png')).sort();
    console.log('\\n=== 変換後のファイル例 ===');
    newFiles.slice(0, 10).forEach(file => {
      console.log(file);
    });
    
  } catch (error) {
    console.error('画像ファイル名変換エラー:', error);
  }
}

// スクリプト実行
renameImages();

export { renameImages };