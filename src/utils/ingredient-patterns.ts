import type { Pokemon } from '../../config/schema';

export interface IngredientPatternItem {
  id: number;
  num: number;
}

export type IngredientPattern = IngredientPatternItem[];

const defaultIngredientCount = 2;

export const getPokemonIngredientPatterns = (pokemon: Pokemon): IngredientPattern[] => {
  const patterns: IngredientPattern[] = [];

  if (pokemon.ing1) {
    patterns.push([
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 ?? defaultIngredientCount },
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 ?? defaultIngredientCount },
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c3 ?? defaultIngredientCount },
    ]);
  }

  if (pokemon.ing1 && pokemon.ing2) {
    patterns.push([
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 ?? defaultIngredientCount },
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 ?? defaultIngredientCount },
      { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c2 ?? defaultIngredientCount },
    ]);
  }

  if (pokemon.ing1 && pokemon.ing3) {
    patterns.push([
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 ?? defaultIngredientCount },
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c2 ?? defaultIngredientCount },
      { id: pokemon.ing3.ingredientId, num: pokemon.ing3.c1 ?? defaultIngredientCount },
    ]);
  }

  if (pokemon.ing1 && pokemon.ing2) {
    patterns.push([
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 ?? defaultIngredientCount },
      { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 ?? defaultIngredientCount },
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c3 ?? defaultIngredientCount },
    ]);
  }

  if (pokemon.ing1 && pokemon.ing2) {
    patterns.push([
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 ?? defaultIngredientCount },
      { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 ?? defaultIngredientCount },
      { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c2 ?? defaultIngredientCount },
    ]);
  }

  if (pokemon.ing1 && pokemon.ing2 && pokemon.ing3) {
    patterns.push([
      { id: pokemon.ing1.ingredientId, num: pokemon.ing1.c1 ?? defaultIngredientCount },
      { id: pokemon.ing2.ingredientId, num: pokemon.ing2.c1 ?? defaultIngredientCount },
      { id: pokemon.ing3.ingredientId, num: pokemon.ing3.c1 ?? defaultIngredientCount },
    ]);
  }

  return patterns;
};
