// ポケモンID生成・管理ユーティリティ

/**
 * 姿のタイプからベース番号を取得
 */
export const getFormBaseNumber = (form: string): string => {
  switch (form) {
    case 'normal': return '001';
    case 'halloween': return '002';
    case 'holiday': return '003';
    case 'alolan': return '004';
    case 'paldean': return '005';
    default: return '001';
  }
};

/**
 * 図鑑番号を4桁の文字列に変換
 */
export const formatPokedexId = (pokedexId: number): string => {
  return pokedexId.toString().padStart(4, '0');
};

/**
 * 新しいポケモンIDを生成
 * 例: generatePokemonId(25, 'halloween') => '0020025'
 */
export const generatePokemonId = (pokedexId: number, form: string): string => {
  const baseNumber = getFormBaseNumber(form);
  const formattedPokedexId = formatPokedexId(pokedexId);
  return baseNumber + formattedPokedexId;
};

/**
 * ポケモン名から姿のタイプを判定
 */
export const detectFormFromName = (name: string): string => {
  if (name.includes('(ハロウィン)')) return 'halloween';
  if (name.includes('(ホリデー)')) return 'holiday';
  if (name.includes('(アローラ)')) return 'alolan';
  if (name.includes('(パルデア)')) return 'paldean';
  return 'normal';
};

/**
 * 日本語名から英語名を生成（基本的な変換）
 */
export const generateEnglishName = (nameJp: string): string => {
  // 特別な姿の部分を除去
  const baseName = nameJp.replace(/\(.+\)$/, '');
  
  // 基本的な名前変換マップ（必要に応じて拡張）
  const nameMap: { [key: string]: string } = {
    'フシギダネ': 'Bulbasaur',
    'フシギソウ': 'Ivysaur', 
    'フシギバナ': 'Venusaur',
    'ヒトカゲ': 'Charmander',
    'リザード': 'Charmeleon',
    'リザードン': 'Charizard',
    'ゼニガメ': 'Squirtle',
    'カメール': 'Wartortle',
    'カメックス': 'Blastoise',
    'キャタピー': 'Caterpie',
    'トランセル': 'Metapod',
    'バタフリー': 'Butterfree',
    'ラッタ': 'Raticate',
    'コラッタ': 'Rattata',
    'アーボ': 'Ekans',
    'アーボック': 'Arbok',
    'ピカチュウ': 'Pikachu',
    'ライチュウ': 'Raichu',
    'プリン': 'Jigglypuff',
    'プクリン': 'Wigglytuff',
    'ディグダ': 'Diglett',
    'ダグトリオ': 'Dugtrio',
    'ニャース': 'Meowth',
    'ペルシアン': 'Persian',
    'コダック': 'Psyduck',
    'ゴルダック': 'Golduck',
    'マンキー': 'Mankey',
    'オコリザル': 'Primeape',
    'ウィンディ': 'Arcanine',
    'ガーディ': 'Growlithe',
    'ロコン': 'Vulpix',
    'キュウコン': 'Ninetales',
    'イシツブテ': 'Geodude',
    'ゴローン': 'Graveler',
    'ゴローニャ': 'Golem',
    'ヤドン': 'Slowpoke',
    'ヤドラン': 'Slowbro',
    'コイル': 'Magnemite',
    'レアコイル': 'Magneton',
    'ドードー': 'Doduo',
    'ドードリオ': 'Dodrio',
    'イワーク': 'Onix',
    'カラカラ': 'Cubone',
    'ガラガラ': 'Marowak',
    'ラッキー': 'Chansey',
    'カイロス': 'Pinsir',
    'ケンタロス': 'Taurus',
    'コイキング': 'Magikarp',
    'ギャラドス': 'Gyarados',
    'ラプラス': 'Lapras',
    'メタモン': 'Ditto',
    'イーブイ': 'Eevee',
    'シャワーズ': 'Vaporeon',
    'サンダース': 'Jolteon',
    'ブースター': 'Flareon',
    'エーフィ': 'Espeon',
    'ブラッキー': 'Umbreon',
    'リーフィア': 'Leafeon',
    'グレイシア': 'Glaceon',
    'ニンフィア': 'Sylveon',
    'カビゴン': 'Snorlax',
    'ピチュー': 'Pichu',
    'ピィ': 'Cleffa',
    'ププリン': 'Igglybuff',
    'ウパー': 'Wooper'
    // 他のポケモンは必要に応じて追加
  };
  
  return nameMap[baseName] || baseName;
};

/**
 * 新しいポケモン画像ファイル名を取得
 * 画像ファイル名は新しいID形式 (例: "0010025", "0020025")
 */
export const getPokemonImageName = (pokemon: { id: string }): string => {
  return pokemon.id;
};

/**
 * 旧形式から新形式への画像ファイル名変換
 * 旧: "025", "025-halloween", "025-holiday", "037-alolan" 
 * 新: "0010025", "0020025", "0030025", "0040037"
 */
export const convertOldImageName = (pokedexId: number, form: string): string => {
  return generatePokemonId(pokedexId, form);
};