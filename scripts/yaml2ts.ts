// scripts/yaml2ts.ts
//------------------------------------------------------------
// config/manual/**/*.yaml → Zod 検証 → config/*.ts 生成
//------------------------------------------------------------
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    readdirSync,
    existsSync,
  } from 'node:fs';
  import { load as yamlLoad } from 'js-yaml';
  import { z } from 'zod';
  import {
    Berry,
    Ingredient,
    MainSkill,
    Recipe,
    RecipeIngredient,
    Pokemon,
  } from '../config/schema';

  /*────────── 対象テーブル定義 ──────────*/
  type Table =
    | 'berries'
    | 'ingredients'
    | 'mainskills'
    | 'pokemons'
    | 'recipes';

  /*────────── Zod スキーマ定義 ──────────*/
  const zRecipeIngredient: z.ZodType<RecipeIngredient> = z.object({
    ingredientId: z.number(),
    quantity: z.number().min(1),
  });

  const SCHEMAS: Record<Table, z.ZodTypeAny> = {
    berries: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        energy: z.number(),
      }) satisfies z.ZodType<Berry>,
    ),

    ingredients: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        energy: z.number(),
      }) satisfies z.ZodType<Ingredient>,
    ),

    mainskills: z.array(
      z.object({
        id: z.number(),
        majorclass: z.string(),
        minorclass: z.string(),
        name: z.string(),
      }) satisfies z.ZodType<MainSkill>,
    ),

    pokemons: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        sleepType: z.enum(['うとうと', 'すやすや', 'ぐっすり']),
        specialty: z.enum(['食材', 'きのみ', 'スキル','オール']),
        mainSkillId: z.number(),
        fp: z.number(),
        frequency: z.number(),
        berryId: z.number(),
        ing1: z.any().optional(),
        ing2: z.any().optional(),
        ing3: z.any().optional(),
      }) satisfies z.ZodType<Pokemon>,
    ),

    recipes: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        category: z.enum(['カレー・シチュー', 'サラダ', 'デザート・ドリンク']),
        energy: z.number(),
        ingredients: z.array(zRecipeIngredient),
      }) satisfies z.ZodType<Recipe>,
    ),
  };

  /*────────── テーブル→型名マップ ──────────*/
  const TYPE_NAME: Record<Table, string> = {
    berries: 'Berry',
    ingredients: 'Ingredient',
    mainskills: 'MainSkill',
    pokemons: 'Pokemon',
    recipes: 'Recipe',
  };

  /*────────── 生成関数 ──────────*/
  function generate(table: Table) {
    let rawData: unknown;

    if (table === 'recipes') {
      /* ── レシピはカテゴリ別 YAML を結合 ── */
      const dir = 'config/manual/recipes';
      if (!existsSync(dir)) {
        console.warn('⚠️  recipes folder not found – skipped');
        return;
      }
      const files = readdirSync(dir).filter((f) => f.endsWith('.yaml'));
      rawData = files.flatMap((f) =>
        yamlLoad(readFileSync(`${dir}/${f}`, 'utf8')),
      );
    } else {
      const yamlPath =
        table === 'mainskills'
          ? 'config/manual/mainskills.yaml'
          : `config/manual/${table}.yaml`;

      if (!existsSync(yamlPath)) {
        console.warn(`⚠️  ${yamlPath} not found – skipped`);
        return;
      }
      rawData = yamlLoad(readFileSync(yamlPath, 'utf8'));
    }

    const data = SCHEMAS[table].parse(rawData);

    mkdirSync('config', { recursive: true });
    writeFileSync(
      `config/${table}.ts`,
      `/* eslint-disable */\n` +
        `import type { ${TYPE_NAME[table]} } from './schema';\n` +
        `export const ${table.toUpperCase()}: readonly ${TYPE_NAME[table]}[] = ` +
        JSON.stringify(data, null, 2) +
        ' as const;\n',
      'utf8',
    );
    console.log(`✔  ${table}.ts generated (${data.length} items)`);
  }

  /*────────── 実行 ──────────*/
  (['berries', 'ingredients', 'mainskills', 'pokemons', 'recipes'] as Table[]).forEach(
    generate,
  );
