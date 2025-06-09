
/*────────── 基本マスタ ──────────*/
export interface Berry {
    id: number
    name: string
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
    id: number
    name: string
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
