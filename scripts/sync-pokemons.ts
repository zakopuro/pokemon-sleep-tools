// scripts/sync-pokemons.ts
//------------------------------------------------------------
// Pokémon Sleep ─ ポケモン一覧をスクレイプして pokemons.yaml 更新
//------------------------------------------------------------
import {
    mkdirSync,
    writeFileSync,
    readFileSync,
    existsSync,
  } from 'node:fs';
  import { load as $load } from 'cheerio';
  import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
  import { z } from 'zod';

  /*──────────────────────────────────────────*
   * 1. マスタ YAML 読み込み
   *──────────────────────────────────────────*/
  function loadYaml<T>(path: string): T[] {
    if (!existsSync(path)) throw new Error(`${path} が見つかりません`);
    return yamlLoad(readFileSync(path, 'utf8')) as T[];
  }

  const BERRIES     = loadYaml<{ id: number; name: string }>('config/manual/berries.yaml');
  const INGREDIENTS = loadYaml<{ id: number; name: string }>('config/manual/ingredients.yaml');
  const MAINSKILLS  = loadYaml<{ id: number; name: string }>('config/manual/mainskills.yaml');

  const berryMap = new Map(BERRIES.map(b => [b.name, b.id]));
  const ingMap   = new Map(INGREDIENTS.map(i => [i.name, i.id]));
  const skillMap = new Map(MAINSKILLS.map(s => [s.name, s.id]));

  /*──────────────────────────────────────────*
   * 2. 型定義
   *──────────────────────────────────────────*/
  type SleepType = 'うとうと' | 'すやすや' | 'ぐっすり';
  type Specialty = '食材' | 'きのみ' | 'スキル' | 'オール';

  const IngredientSlotSchema = z.object({
    ingredientId: z.number(),
    c1: z.number().optional(),
    c2: z.number().optional(),
    c3: z.number().optional(),
  });
  type IngredientSlot = z.infer<typeof IngredientSlotSchema>;

  const PokemonSchema = z.object({
    id: z.number(),
    name: z.string(),
    sleepType: z.enum(['うとうと', 'すやすや', 'ぐっすり']),
    specialty: z.enum(['食材', 'きのみ', 'スキル' , 'オール']),
    mainSkillId: z.number(),
    fp: z.number(),
    frequency: z.number(),
    berryId: z.number(),
    ing1: IngredientSlotSchema.optional(),
    ing2: IngredientSlotSchema.optional(),
    ing3: IngredientSlotSchema.optional(),
  });
  type Pokemon = z.infer<typeof PokemonSchema>;

  /*──────────────────────────────────────────*
   * 3. 定数
   *──────────────────────────────────────────*/
  const LIST_URL =
    'https://wikiwiki.jp/poke_sleep/%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%81%AE%E4%B8%80%E8%A6%A7';

  /*──────────────────────────────────────────*
   * 4. ユーティリティ
   *──────────────────────────────────────────*/
  async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.text();
  }

  function parseIngredientCell($cell: cheerio.Cheerio): IngredientSlot | undefined {
    const $img = $cell.find('img');
    const alt  = $img.attr('alt')?.trim() ?? '';
    const src  = $img.attr('src') ?? '';

    // spacer.gif ＝ 食材なし
    if (!alt || src.includes('spacer')) return;

    const ingredientId = ingMap.get(alt);
    if (!ingredientId) {
      skipped.push({ name: alt, reason: 'Ingredient not mapped' });
      return;
    }

    const counts = $cell
      .text()
      .trim()
      .split(/[、,]/)
      .map(s => Number(s.trim()))
      .filter(n => !Number.isNaN(n));

    const slot: IngredientSlot = { ingredientId };
    if (counts[0] !== undefined) slot.c1 = counts[0];
    if (counts[1] !== undefined) slot.c2 = counts[1];
    if (counts[2] !== undefined) slot.c3 = counts[2];
    return slot;
  }

  /*──────────────────────────────────────────*
   * 5. メイン
   *──────────────────────────────────────────*/
  const skipped: { name: string; reason: string }[] = [];

  async function main() {
    const html = await fetchHtml(LIST_URL);
    const $    = $load(html);

    const $table = $('table')
      .filter((_, tbl) =>
        $(tbl).find('th').filter((_, th) => $(th).text().includes('No')).length,
      )
      .first();
    if (!$table.length) throw new Error('一覧テーブルが見つかりません');

    const $rows = $table.find('tr').filter((_, tr) => $(tr).find('td').length >= 12);
    console.log(`${$rows.length} rows scraped`);

    const pokemons: Pokemon[] = [];

    $rows.each((_, tr) => {
      const td = $(tr).find('td');

      const pokeName  = $(td[2]).text().trim();
      const sleepType = $(td[3]).text().trim() as SleepType;
      const specialty = $(td[4]).text().trim() as Specialty;

      if (!['うとうと', 'すやすや', 'ぐっすり'].includes(sleepType)) {
        skipped.push({ name: pokeName, reason: `Invalid sleepType: ${sleepType}` });
        return;
      }
      if (!['食材', 'きのみ', 'スキル' , 'オール'].includes(specialty)) {
        skipped.push({ name: pokeName, reason: `Invalid specialty: ${specialty}` });
        return;
      }

      const skillName   = $(td[9]).text().trim();
      const mainSkillId = skillMap.get(skillName);
      if (!mainSkillId) {
        skipped.push({ name: pokeName, reason: `MainSkill not mapped: ${skillName}` });
        return;
      }

      const berryName = $(td[5]).find('img').attr('alt')?.trim() ?? '';
      const berryId   = berryMap.get(berryName);
      if (!berryId) {
        skipped.push({ name: pokeName, reason: `Berry not mapped: ${berryName}` });
        return;
      }

      const poke: Pokemon = {
        id: Number($(td[1]).text().replace(/[^\d]/g, '')),
        name: pokeName,
        sleepType,
        specialty,
        mainSkillId,
        fp: Number($(td[10]).text().replace(/[^\d]/g, '')),
        frequency: Number($(td[11]).text().replace(/[^\d]/g, '')),
        berryId,
        ing1: parseIngredientCell($(td[6])),
        ing2: parseIngredientCell($(td[7])),
        ing3: parseIngredientCell($(td[8])),
      };

      const res = PokemonSchema.safeParse(poke);
      if (res.success) pokemons.push(res.data);
      else skipped.push({ name: pokeName, reason: 'Schema mismatch' });
    });

    /* 6. YAML 出力 */
    mkdirSync('config/manual', { recursive: true });
    writeFileSync(
      'config/manual/pokemons.yaml',
      yamlDump(pokemons, { lineWidth: 0, quotingType: '"', noRefs: true }),
      'utf8',
    );
    console.log(`✔  pokemons.yaml updated (${pokemons.length} Pokémon)`);

    /* 7. スキップ行を表示 */
    if (skipped.length) {
      console.log('\n⛔  Skipped rows');
      skipped.forEach(s => console.log(`- ${s.name}: ${s.reason}`));
    }
  }

  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
