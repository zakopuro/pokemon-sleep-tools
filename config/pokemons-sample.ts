/* eslint-disable */
import type { Pokemon } from './schema';

// 新しいIDルールのサンプルデータ（ピカチュウ系統）
export const POKEMONS: readonly Pokemon[] = [
  {
    "id": "0010025",           // 001 + 0025 = 通常ピカチュウ
    "pokedexId": 25,
    "name": "Pikachu",
    "nameJp": "ピカチュウ",
    "form": "normal",
    "sleepType": "すやすや",
    "specialty": "きのみ",
    "mainSkillId": 1,
    "fp": 7,
    "frequency": 2700,
    "berryId": 4,
    "ing1": {
      "ingredientId": 5,
      "c1": 1,
      "c2": 2,
      "c3": 4
    },
    "ing2": {
      "ingredientId": 11,
      "c1": 2,
      "c2": 3
    },
    "ing3": {
      "ingredientId": 3,
      "c1": 3
    }
  },
  {
    "id": "0020025",           // 002 + 0025 = ハロウィンピカチュウ
    "pokedexId": 25,
    "name": "Pikachu",
    "nameJp": "ピカチュウ(ハロウィン)",
    "form": "halloween",
    "sleepType": "すやすや",
    "specialty": "きのみ",
    "mainSkillId": 2,
    "fp": 7,
    "frequency": 2500,
    "berryId": 4,
    "ing1": {
      "ingredientId": 5,
      "c1": 1,
      "c2": 2,
      "c3": 4
    },
    "ing2": {
      "ingredientId": 11,
      "c1": 2,
      "c2": 3
    },
    "ing3": {
      "ingredientId": 3,
      "c1": 3
    }
  },
  {
    "id": "0030025",           // 003 + 0025 = ホリデーピカチュウ
    "pokedexId": 25,
    "name": "Pikachu",
    "nameJp": "ピカチュウ(ホリデー)",
    "form": "holiday",
    "sleepType": "すやすや",
    "specialty": "スキル",
    "mainSkillId": 6,
    "fp": 7,
    "frequency": 2500,
    "berryId": 4,
    "ing1": {
      "ingredientId": 5,
      "c1": 1,
      "c2": 2,
      "c3": 4
    },
    "ing2": {
      "ingredientId": 11,
      "c1": 2,
      "c2": 3
    },
    "ing3": {
      "ingredientId": 3,
      "c1": 3
    }
  },
  {
    "id": "0010037",           // 001 + 0037 = 通常ロコン
    "pokedexId": 37,
    "name": "Vulpix",
    "nameJp": "ロコン",
    "form": "normal",
    "sleepType": "うとうと",
    "specialty": "きのみ",
    "mainSkillId": 1,
    "fp": 6,
    "frequency": 3700,
    "berryId": 5,
    "ing1": {
      "ingredientId": 12,
      "c1": 2,
      "c2": 5,
      "c3": 7
    },
    "ing2": {
      "ingredientId": 9,
      "c1": 4,
      "c2": 7
    },
    "ing3": {
      "ingredientId": 4,
      "c1": 6
    }
  },
  {
    "id": "0040037",           // 004 + 0037 = アローラロコン
    "pokedexId": 37,
    "name": "Vulpix",
    "nameJp": "ロコン(アローラ)",
    "form": "alolan",
    "sleepType": "うとうと",
    "specialty": "きのみ",
    "mainSkillId": 8,
    "fp": 6,
    "frequency": 3700,
    "berryId": 16,
    "ing1": {
      "ingredientId": 12,
      "c1": 2,
      "c2": 5,
      "c3": 7
    },
    "ing2": {
      "ingredientId": 9,
      "c1": 4,
      "c2": 7
    },
    "ing3": {
      "ingredientId": 4,
      "c1": 6
    }
  }
] as const;