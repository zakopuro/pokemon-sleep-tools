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

// きのみの画像ファイル名を取得（Berryオブジェクトのeng_nameを使用）
export const getBerryImageName = (berry: any) => {
  // Berryオブジェクトが渡された場合はeng_nameを使用
  if (berry && typeof berry === 'object' && berry.eng_name) {
    return berry.eng_name;
  }
  
  // 後方互換性のため、文字列が渡された場合の従来のマッピング
  if (typeof berry === 'string') {
    const berryImageMap: Record<string, string> = {
      'チーゴのみ': 'rawstberry',
      'オレンのみ': 'oranberry', 
      'オボンのみ': 'sitrusberry',
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
      'クラボのみ': 'cheriberry',
      'ブリーのみ': 'blukberry',
      'モモンのみ': 'pechaberry',
      'キーのみ': 'persimberry',
    };
    return berryImageMap[berry] || 'cheriberry';
  }
  
  return 'cheriberry'; // デフォルト
};