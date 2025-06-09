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
    'モーモーミルク': 'moomoomilk',
    'げんきのかたまり': 'honey',
    'ピュアなオイル': 'pureoil',
    'あまいミツ': 'honey',
    'あったかジンジャー': 'warmingginger',
    'リラックスカカオ': 'soothingcacao',
    'やわらかポテト': 'softpotato',
    'ぐっすりトマト': 'snoozytomato',
    'あんみん茶葉': 'soothingcacao',
    'みどりくさコーン': 'greengrasscorn',
    'みどりくさだいず': 'greengrasssoybeans',
    'マメミート': 'beansausage',
    'ヤドンのしっぽ': 'slowpoketail',
    'とくせんリンゴ': 'fancyapple',
    'めざましコーヒー': 'めざましコーヒー',
    'ねむけざましコーヒー': 'めざましコーヒー',
    'あかいきのみ': 'cheriberry',
    'あおいきのみ': 'oranberry',
  };
  return imageMap[ingredientName] || 'honey';
};

// きのみ名から画像ファイル名のマッピング
export const getBerryImageName = (berryName: string) => {
  const berryImageMap: Record<string, string> = {
    'チーゴのみ': 'cheriberry',
    'オレンのみ': 'oranberry',
    'オボンのみ': 'pechaberry',
    'ヒメリのみ': 'leppaberry',
    'カゴのみ': 'chestoberry',
    'フィラのみ': 'figyberry',
    'ウイのみ': 'wikiberry',
    'マゴのみ': 'magoberry',
    'バンジのみ': 'aguavberry',
    'イアのみ': 'iapapberry',
    'ラムのみ': 'lumberry',
    'オッカのみ': 'occaberry',
    'イトケのみ': 'passoberry',
    'ソクノのみ': 'wacanberry',
    'リンドのみ': 'rindoberry',
    'ヤチェのみ': 'yacheberry',
    'ヨプのみ': 'chopleberry',
    'ビアーのみ': 'kebiaberry',
    'シュカのみ': 'shucaberry',
    'バコウのみ': 'cobaberry',
    'ウタンのみ': 'payapaberry',
    'タンガのみ': 'tangaberry',
    'ヨロギのみ': 'chartiberry',
    'カシブのみ': 'kasibberry',
    'ハバンのみ': 'habanberry',
    'ナモのみ': 'colburberry',
    'リリバのみ': 'babiriberry',
    'ホズのみ': 'chilanberry',
    'チイラのみ': 'liechiberry',
    'リュガのみ': 'ganlonberry',
    'カムラのみ': 'salacberry',
    'ヤタピのみ': 'petayaberry',
    'ズアのみ': 'apicotberry',
    'ブルーのみ': 'blukberry',
    'ナナシのみ': 'nanabberry',
    'セシナのみ': 'wepearberry',
    'パイルのみ': 'pinapberry',
    'ザロクのみ': 'pomegberry',
    'ネコブのみ': 'kelpsyberry',
    'タポルのみ': 'qualotberry',
    'ロメのみ': 'hondewberry',
    'ウブのみ': 'grepaberry',
    'マトマのみ': 'tamatoberry',
    'モコシのみ': 'cornnberry',
    'ゴスのみ': 'magostberry',
    'ラブタのみ': 'rabutaberry',
    'ノメルのみ': 'nomelberry',
    'ノワキのみ': 'spelonberry',
    'シーヤのみ': 'pamtreberry',
    'カイスのみ': 'watmelberry',
    'ドリのみ': 'durinberry',
    'ベリブのみ': 'belueberry',
    'ロゼルのみ': 'roselberry',
    'キーのみ': 'keeberry',
    'マルルのみ': 'marangaberry',
    'ジニアのみ': 'ziniaberry',
    'アッキのみ': 'enigmaberry',
    'タラプのみ': 'micleberry',
    'スターのみ': 'custarberry',
    'ナゾのみ': 'jabocaberry',
  };
  return berryImageMap[berryName] || 'cheriberry';
};