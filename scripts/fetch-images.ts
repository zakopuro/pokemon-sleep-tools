//------------------------------------------------------------
// Pokémon Sleep：ポケモン画像ダウンロード（variant 修正版）
//------------------------------------------------------------
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import fetch from 'node-fetch';

const LIST_URL =
  'https://wikiwiki.jp/poke_sleep/%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%81%AE%E4%B8%80%E8%A6%A7';
const OUT_DIR = resolve('public/image/pokemon');

/* 日本語 → 英語 slug */
const slugMap: Record<string, string> = {
  アローラ: 'alolan',
  ハロウィン: 'halloween',
  ホリデー: 'holiday',
  パルデア: 'paldean',
};

/* ベース URL */
const BASE =
  'https://cdn.wikiwiki.jp/to/w/poke_sleep/%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%81%AE%E4%B8%80%E8%A6%A7/::ref';

/* URL 組み立て */
const buildUrl = (no: string, slug = '') =>
  slug ? `${BASE}/${no}-${slug}.png.webp` : `${BASE}/${no}.png.webp`;

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const html = await fetch(LIST_URL).then((r) => r.text());
  const $ = load(html);

  const $table = $('table')
    .filter((_, t) => $(t).find('th').filter((_, th) => $(th).text().includes('No')).length)
    .first();
  if (!$table.length) return console.error('❌ 表が見つかりません');

  const rows = $table.find('tr').filter((_, tr) => $(tr).find('td').length >= 2);
  console.log('detected rows:', rows.length);

  for (const tr of rows.toArray()) {
    const $td = $(tr).find('td');

    const raw = $td.eq(1).text().trim().replace(/[^\d]/g, '');
    const no = Number(raw).toString().padStart(3, '0');
    if (!no) continue;

    const $img = $td.eq(0).find('img').first();
    const alt  = $img.attr('alt')?.trim() ?? '';
    const href = $img.parent('a').attr('href');

    const jpKey = Object.keys(slugMap).find((k) => alt.includes(`(${k}`));
    const slug  = jpKey ? slugMap[jpKey] : '';

    /* 画像 URL 候補 */
    const candidates = [
      href,            // 1) <a href> 直リンク
      buildUrl(no, slug), // 2) no-slug.png.webp
      buildUrl(no),       // 3) 通常 no.png.webp
    ].filter(Boolean) as string[];

    let buf: ArrayBuffer | null = null;
    let ext = '.png';

    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        buf = await res.arrayBuffer();
        ext = url.match(/\\.(png|gif|jpg|webp)/i)?.[0] ?? '.png';
        break;
      } catch {
        /* 次の候補へ */
      }
    }

    if (!buf) {
      console.warn('⚠️  skip (not found):', alt || no);
      continue;
    }

    /* 保存名: 001.png / 037-alolan.png など */
    const fileName =
      slug ? `${no}-${slug}${ext.replace('.webp', '.png')}` : `${no}${ext.replace('.webp', '.png')}`;

    await writeFile(resolve(OUT_DIR, fileName), Buffer.from(buf));
    console.log('✔ saved', fileName);
  }

  console.log('done.');
}

main().catch(console.error);
