import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { MAINSKILLS } from '../config/mainskills.ts';
import { POKEMONS } from '../config/pokemons.ts';

const validSleepTypes = new Set(['うとうと', 'すやすや', 'ぐっすり']);
const validSpecialties = new Set(['食材', 'きのみ', 'スキル', 'オール']);
const validForms = new Set(['normal', 'halloween', 'holiday', 'alolan', 'paldean']);
const errors: string[] = [];
const seenIds = new Set<string>();
const seenMainSkillIds = new Set<number>();

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

  const imagePath = resolve('public/image/pokemon', `${pokemon.id}.png`);
  if (!existsSync(imagePath)) {
    errors.push(`${label}: missing image ${imagePath}`);
  }
}

if (errors.length > 0) {
  throw new Error(`Pokemon data validation failed:\n${errors.join('\n')}`);
}

console.log(`Pokemon data validation passed (${POKEMONS.length} Pokemon).`);
