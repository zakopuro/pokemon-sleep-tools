
/*────────── 基本マスタ ──────────*/
export interface Berry {
    id: number
    name: string
    eng_name: string        // 英語名（画像ファイル名に使用）
    energy: number          // 基礎エナジー
  }

  export interface Ingredient {
    id: number
    name: string
    energy: number          // 基礎エナジー
  }

  export interface MainSkill {
    id: number
    majorclass: string
    minorclass: string
    name: string
    maxlevel: number
    imagename: string
  }

  /*────────── レシピ ──────────*/
  export interface RecipeIngredient {
    ingredientId: number
    quantity: number
  }

  export interface Recipe {
    id: number
    name: string
    category: 'カレー・シチュー' | 'サラダ' | 'デザート・ドリンク'
    energy: number
    ingredients: RecipeIngredient[]
  }

  /*────────── ポケモン ──────────*/
  export interface PokemonIngredientSlot {
    name: string
    c1?: number
    c2?: number
    c3?: number
  }

  export interface Pokemon {
    id: string                 // 新ルール: "001" + pokedexId(4桁) = "0010025"
    pokedexId: number         // 図鑑番号
    name: string              // 日本語名
    form: 'normal' | 'halloween' | 'holiday' | 'alolan' | 'paldean' // 姿の種類
    isFinalEvolution: boolean // 最終進化かどうか
    sleepType: 'うとうと' | 'すやすや' | 'ぐっすり'
    specialty: '食材' | 'きのみ' | 'スキル' | 'オール'
    mainSkillId: number
    fp: number
    frequency: number
    berryId: number
    ing1?: { ingredientId: number; c1?: number; c2?: number; c3?: number }
    ing2?: { ingredientId: number; c1?: number; c2?: number; c3?: number }
    ing3?: { ingredientId: number; c1?: number; c2?: number; c3?: number }
  }
