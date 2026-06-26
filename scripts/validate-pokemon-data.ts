import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIELDS } from '../config/fields.ts';
import { INGREDIENTS } from '../config/ingredients.ts';
import { MAINSKILLS } from '../config/mainskills.ts';
import { POKEMONS } from '../config/pokemons.ts';
import {
  calculateRequiredCandy,
  DREAM_SHARDS_PER_CANDY,
  getExpToNextLevel,
  isValidLevelRange,
  MAX_CANDY_LEVEL,
  TOTAL_EXP_TO_LEVEL,
} from '../src/utils/candy-calculator.ts';
import { normalizeSubskillByLevel, POKEMON_LEVEL_PRESETS, SUBSKILL_LEVELS } from '../src/constants/pokemon.ts';
import { getPokemonIngredientPatterns } from '../src/utils/ingredient-patterns.ts';

const validSleepTypes = new Set(['うとうと', 'すやすや', 'ぐっすり']);
const validSpecialties = new Set(['食材', 'きのみ', 'スキル', 'オール']);
const validForms = new Set(['normal', 'halloween', 'holiday', 'alolan', 'paldean']);
const errors: string[] = [];
const seenIds = new Set<string>();
const seenMainSkillIds = new Set<number>();
const seenIngredientIds = new Set(INGREDIENTS.map(ingredient => ingredient.id));
const seenFieldIds = new Set(FIELDS.map(field => field.id));
const fieldPokemonCounts = new Map(FIELDS.map(field => [field.id, 0]));
const expectedUpdatedFieldPokemonCounts = new Map<number, number>([
  [2, 50],
  [3, 54],
  [4, 45],
  [5, 53],
  [6, 47],
  [8, 45],
]);
const expectedDrifloonLineIngredientPatterns = [
  '16:1|16:2|16:4',
  '16:1|16:2|10:4',
  '16:1|16:2|4:4',
  '16:1|10:3|16:4',
  '16:1|10:3|10:4',
  '16:1|10:3|4:4',
];
const blankInitialIngredientPokemonNames = new Set(['ミュウ', 'ダークライ']);

function expectEqual<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected}, got ${actual}`);
  }
}

for (const mainSkill of MAINSKILLS) {
  const label = `mainSkill ${mainSkill.id} ${mainSkill.name}`;

  if (seenMainSkillIds.has(mainSkill.id)) {
    errors.push(`${label}: duplicate main skill id`);
  }
  seenMainSkillIds.add(mainSkill.id);

  if (mainSkill.maxlevel <= 0) {
    errors.push(`${label}: maxlevel must be positive`);
  }

  const imagePath = resolve('public/image/mainskill', `${mainSkill.imagename}.png`);
  if (!existsSync(imagePath)) {
    errors.push(`${label}: missing image ${imagePath}`);
  }
}

for (const pokemon of POKEMONS) {
  const label = `${pokemon.id} ${pokemon.name}`;

  if (seenIds.has(pokemon.id)) {
    errors.push(`${label}: duplicate pokemon id`);
  }
  seenIds.add(pokemon.id);

  if (!/^\d{7}$/.test(pokemon.id)) {
    errors.push(`${label}: id must be 7 digits`);
  }

  const expectedSuffix = pokemon.pokedexId.toString().padStart(4, '0');
  if (!pokemon.id.endsWith(expectedSuffix)) {
    errors.push(`${label}: expected id suffix ${expectedSuffix}`);
  }

  if (!validForms.has(pokemon.form)) {
    errors.push(`${label}: invalid form ${pokemon.form}`);
  }

  if (!validSleepTypes.has(pokemon.sleepType)) {
    errors.push(`${label}: invalid sleepType ${pokemon.sleepType}`);
  }

  if (!validSpecialties.has(pokemon.specialty)) {
    errors.push(`${label}: invalid specialty ${pokemon.specialty}`);
  }

  if (pokemon.fp <= 0) {
    errors.push(`${label}: fp must be positive`);
  }

  if (pokemon.frequency <= 0) {
    errors.push(`${label}: frequency must be positive`);
  }

  if (pokemon.berryId <= 0) {
    errors.push(`${label}: berryId must be positive`);
  }

  if (!seenMainSkillIds.has(pokemon.mainSkillId)) {
    errors.push(`${label}: unknown mainSkillId ${pokemon.mainSkillId}`);
  }

  const pokemonFieldIds = new Set<number>();
  for (const fieldId of pokemon.fieldIds) {
    if (!seenFieldIds.has(fieldId)) {
      errors.push(`${label}: unknown fieldId ${fieldId}`);
    }

    if (pokemonFieldIds.has(fieldId)) {
      errors.push(`${label}: duplicate fieldId ${fieldId}`);
    }

    pokemonFieldIds.add(fieldId);
    fieldPokemonCounts.set(fieldId, (fieldPokemonCounts.get(fieldId) ?? 0) + 1);
  }

  if (pokemon.availableMainSkillIds) {
    if (pokemon.availableMainSkillIds.length === 0) {
      errors.push(`${label}: availableMainSkillIds must not be empty`);
    }

    for (const mainSkillId of pokemon.availableMainSkillIds) {
      if (!seenMainSkillIds.has(mainSkillId)) {
        errors.push(`${label}: unknown availableMainSkillId ${mainSkillId}`);
      }
    }
  }

  if (pokemon.availableIngredients) {
    if (
      blankInitialIngredientPokemonNames.has(pokemon.name)
      && (pokemon.availableIngredients.slot2[0]?.ingredientId !== 0 || pokemon.availableIngredients.slot3[0]?.ingredientId !== 0)
    ) {
      errors.push(`${label}: slot2 and slot3 initial ingredients must be blank`);
    }

    for (const slotName of ['slot1', 'slot2', 'slot3'] as const) {
      const slot = pokemon.availableIngredients[slotName];
      if (!slot || slot.length === 0) {
        errors.push(`${label}: availableIngredients.${slotName} must not be empty`);
        continue;
      }

      for (const option of slot) {
        if (!seenIngredientIds.has(option.ingredientId)) {
          errors.push(`${label}: unknown ingredientId ${option.ingredientId} in availableIngredients.${slotName}`);
        }

        for (const countKey of ['c1', 'c2', 'c3'] as const) {
          const count = option[countKey];
          if (count !== undefined && count < 0) {
            errors.push(`${label}: ${slotName}.${countKey} must not be negative`);
          }
        }
      }
    }
  }

  const imagePath = resolve('public/image/pokemon', `${pokemon.id}.png`);
  if (!existsSync(imagePath)) {
    errors.push(`${label}: missing image ${imagePath}`);
  }
}

for (const [fieldId, expectedCount] of expectedUpdatedFieldPokemonCounts) {
  const actualCount = fieldPokemonCounts.get(fieldId) ?? 0;
  if (actualCount !== expectedCount) {
    errors.push(`field ${fieldId}: expected ${expectedCount} Pokemon, got ${actualCount}`);
  }
}

for (const pokedexId of [425, 426]) {
  const pokemon = POKEMONS.find(item => item.pokedexId === pokedexId);
  if (!pokemon) {
    errors.push(`pokedex ${pokedexId}: missing Drifloon line Pokemon`);
    continue;
  }

  const actualPatterns = getPokemonIngredientPatterns(pokemon).map(pattern =>
    pattern.map(item => `${item.id}:${item.num}`).join('|')
  );

  for (const expectedPattern of expectedDrifloonLineIngredientPatterns) {
    if (!actualPatterns.includes(expectedPattern)) {
      errors.push(`${pokemon.id} ${pokemon.name}: missing ingredient pattern ${expectedPattern}`);
    }
  }
}

expectEqual(MAX_CANDY_LEVEL, 70, 'candy calculator max level');
expectEqual(TOTAL_EXP_TO_LEVEL[MAX_CANDY_LEVEL], 82162, 'Lv70 total exp');
expectEqual(DREAM_SHARDS_PER_CANDY[MAX_CANDY_LEVEL], 1272, 'Lv70 dream shards per candy');
expectEqual(getExpToNextLevel(65, 600), 3095, 'Lv65 to Lv66 exp');
expectEqual(getExpToNextLevel(69, 600), 3255, 'Lv69 to Lv70 exp');
expectEqual(getExpToNextLevel(70, 600), 0, 'Lv70 next level exp');
expectEqual(isValidLevelRange(65, 70), true, 'Lv65 to Lv70 range');
expectEqual(isValidLevelRange(70, 70), false, 'Lv70 to Lv70 range');

const level10To30Candy = calculateRequiredCandy({
  currentLevel: 10,
  targetLevel: 30,
  expType: 600,
  nature: 'normal',
  eventType: 'none',
  remainingExp: getExpToNextLevel(10, 600),
});
expectEqual(level10To30Candy.requiredCandies, 273, 'Lv10 to Lv30 required candies');
expectEqual(level10To30Candy.requiredDreamShards, 22688, 'Lv10 to Lv30 dream shards');
expectEqual(level10To30Candy.requiredExp, 10432, 'Lv10 to Lv30 required exp');

const level65To70Candy = calculateRequiredCandy({
  currentLevel: 65,
  targetLevel: 70,
  expType: 600,
  nature: 'normal',
  eventType: 'none',
  remainingExp: getExpToNextLevel(65, 600),
});
expectEqual(level65To70Candy.requiredCandies, 632, 'Lv65 to Lv70 required candies');
expectEqual(level65To70Candy.requiredDreamShards, 691983, 'Lv65 to Lv70 dream shards');
expectEqual(level65To70Candy.requiredExp, 15799, 'Lv65 to Lv70 required exp');

expectEqual(JSON.stringify(SUBSKILL_LEVELS), JSON.stringify([10, 25, 50, 70, 80]), 'subskill unlock levels');
expectEqual(JSON.stringify(POKEMON_LEVEL_PRESETS), JSON.stringify([10, 25, 30, 50, 60, 70]), 'pokemon level presets');

const migratedSubskills = normalizeSubskillByLevel({
  10: 1,
  25: 2,
  50: 3,
  75: 4,
  100: 5,
});
expectEqual(migratedSubskills[70], 4, 'legacy Lv75 subskill migrates to Lv70');
expectEqual(migratedSubskills[80], 5, 'legacy Lv100 subskill migrates to Lv80');
expectEqual(Object.prototype.hasOwnProperty.call(migratedSubskills, 75), false, 'legacy Lv75 subskill key is removed');
expectEqual(Object.prototype.hasOwnProperty.call(migratedSubskills, 100), false, 'legacy Lv100 subskill key is removed');

if (errors.length > 0) {
  throw new Error(`Pokemon data validation failed:\n${errors.join('\n')}`);
}

console.log(`Pokemon data validation passed (${POKEMONS.length} Pokemon).`);
