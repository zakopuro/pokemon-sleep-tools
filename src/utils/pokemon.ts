import { BERRIES, INGREDIENTS, MAINSKILLS } from '../config';

// データ取得のユーティリティ関数
export const getBerry = (berryId: number) => BERRIES.find(b => b.id === berryId);
export const getIngredient = (ingredientId: number) => INGREDIENTS.find(i => i.id === ingredientId);
export const getMainSkill = (skillId: number) => MAINSKILLS.find(s => s.id === skillId);

// 食材名から画像ファイル名のマッピング
export const getIngredientImageName = (ingredientName: string) => {
  const imageMap: Record<string, string> = {
    'ふといながねぎ': 'largeleek',
    'あじわいキノコ': 'tastymushroom',
    'とくせんエッグ': 'fancyegg',
    'ほっこりポテト': 'softpotato',
    'とくせんリンゴ': 'fancyapple',
    'げきからハーブ': 'fieryherb',
    'マメミート': 'beansausage',
    'モーモーミルク': 'moomoomilk',
    'あまいミツ': 'honey',
    'ピュアなオイル': 'pureoil',
    'あったかジンジャー': 'warmingginger',
    'あんみんトマト': 'snoozytomato',
    'リラックスカカオ': 'soothingcacao',
    'おいしいシッポ': 'slowpoketail',
    'ワカクサ大豆': 'greengrasssoybeans',
    'ワカクサコーン': 'greengrasscorn',
    'めざましコーヒー': 'めざましコーヒー',
  };
  return imageMap[ingredientName] || 'honey';
};

// きのみ名から画像ファイル名のマッピング
export const getBerryImageName = (berryName: string) => {
  const berryImageMap: Record<string, string> = {
    // 実際にゲームに存在し、画像ファイルがあるきのみのみ
    'チーゴのみ': 'cheriberry',
    'オレンのみ': 'oranberry', 
    'オボンのみ': 'sitrusberry',  // sitrusberryが正しい画像ファイル名
    'ヒメリのみ': 'leppaberry',
    'カゴのみ': 'chestoberry',
    'フィラのみ': 'figyberry',
    'ウイのみ': 'wikiberry',
    'マゴのみ': 'magoberry',
    'ラムのみ': 'lumberry',
    'ヤチェのみ': 'yacheberry',
    'ウブのみ': 'grepaberry',
    'ベリブのみ': 'belueberry',
    'ドリのみ': 'durinberry',
    'シーヤのみ': 'pamtreberry',
    // 画像ファイルがない場合のフォールバック用
    'クラボのみ': 'rawstberry',    // クラボ → rawstberry
    'ブリーのみ': 'blukberry',     // ブリー → blukberry  
    'モモンのみ': 'persimberry',   // モモン → persimberry
    'キーのみ': 'cheriberry',      // キー → cheriberry（似た色）
  };
  return berryImageMap[berryName] || 'cheriberry';
};