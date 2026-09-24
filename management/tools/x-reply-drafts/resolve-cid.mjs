#!/usr/bin/env node
// t.co → al.fanza / al.dmm の Location を辿って content_id を解決する。
//
// CSO 判定 2026-09-24（木曜 PDCA）3:
//   「リスト方式でも、メーカー公式の投稿内リンク（t.co → al.fanza / video.dmm）を辿って
//    content_id を解決する手順を復活させる（9/19 の Chrome 抽出と同じ機械的な Location 追跡・
//    video.dmm 本体へはアクセスしない）。Q 候補判定はこの content_id を使う。」
//
// 【厳守・最小アクセス】既定は **t.co へ 1 回だけ GET（redirect: manual）** し、その Location
//   （= `al.fanza.co.jp/?lurl=...`）の URL 文字列から content_id を抜く。
//   **al.fanza.co.jp 以降へは到達しない。** 理由＝`ip.affiliate.dmm.com` / `rcv.ixd.*` /
//   `lp.ixd.*` はアフィリエイトのクリック計測が走るドメインであり（2026-09-24 実測で
//   `rcv.ixd.dmm.com/api/click` を確認）、他社 af_id のクリックを踏むことになる。
// 【厳守・FACT_GOVERNANCE §5-2】`video.dmm.co.jp` / `tv.dmm.co.jp` / `premium.dmm.co.jp` は
//   ツール層遮断ドメインであり到達を試みない。本スクリプトは Location ヘッダの URL 文字列から
//   content_id を抽出するだけで、当該ドメインへ GET / HEAD を送らない。
//
// floor は遷移先 URL に出ないため解決しない（`video.dmm.co.jp/av/content/?id=<content_id>` 形式）。
// floor は `knowledge.mjs` が 3 フロア（videoa / nikkatsu / anime）の cache_key を作って
// PK 照会する既存の仕組みで解決する（cache ヒット時に payload の `floor_code` が取れる）。
//
// 使い方:
//   node resolve-cid.mjs <t.co URL...> [--json out.json]
//   node resolve-cid.mjs --file urls.txt [--json out.json]
//   node resolve-cid.mjs --tco tco.tsv [--fill runs/<日付>/input.txt] [--json out.json]
//     tco.tsv = 「@ハンドル <TAB> t.co URL」（抽出時に作る。区切りは TAB / ｜ / | のいずれか）
//     --fill  = input.txt の当該ハンドル行で作品コード欄（⑤）が空の行に content_id を付ける。
//               書き換え後は読み戻して表示する（§10）。
//   --hops N  で段数を増やせるが、**既定 1 を超えるとクリック計測を踏むため通常は使わない**。
//     → 運用則（FACT_GOVERNANCE §26-12-2 運用則・CSO 確定 2026-09-24）:
//       「短縮 URL から遷移先を知るときは Location を 1 段読むだけにする」。
//       既定を超える段数の使用は CSO の個別許可を要する。

import fs from "node:fs";

const TAB = String.fromCharCode(9);

/** 到達しないドメイン */
const BLOCKED_HOSTS = new Set([
  // アフィリエイトのクリック計測が走るドメイン（他社 af_id のクリックを踏まないため）
  "al.fanza.co.jp",
  "al.dmm.co.jp",
  "ip.affiliate.dmm.com",
  "rcv.ixd.dmm.com",
  "rcv.ixd.dmm.co.jp",
  "rcv.ixd.fanza.jp",
  "lp.ixd.dmm.com",
  // ツール層遮断ドメイン（FACT_GOVERNANCE §5-2）
  "video.dmm.co.jp",
  "tv.dmm.co.jp",
  "premium.dmm.co.jp",
  "www.dmm.co.jp",
  "dmm.co.jp",
]);

/** Location を 1 段だけ読む（リダイレクトは追跡しない） */
async function peekLocation(url, { timeoutMs = 10000 } = {}) {
  const host = new URL(url).hostname;
  if (BLOCKED_HOSTS.has(host)) return { status: null, location: null, blocked: true };
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: ac.signal,
      headers: { "user-agent": "vodnavi-cid-resolver/1" },
    });
    return { status: res.status, location: res.headers.get("location"), blocked: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * URL 文字列（および lurl 等に埋まった遷移先）から content_id を抜く。
 * 2026-09-24 実測: FANZA の遷移先は `video.dmm.co.jp/av/content/?id=<content_id>` 形式。
 * 旧形式の `cid=` も併せて見る。汎用の `id=` の誤検出を避けるため video.dmm / fanza を含む URL に限る。
 */
export function extractCid(urlStr) {
  if (!urlStr) return { cid: null, floor: null };
  const candidates = [urlStr];
  try {
    const u = new URL(urlStr);
    for (const key of ["lurl", "turl", "lpurl", "url", "link"]) {
      const v = u.searchParams.get(key);
      if (v) candidates.push(decodeURIComponent(v));
    }
  } catch {
    /* URL として解釈できないときは文字列のまま検査する */
  }
  for (const c of candidates) {
    // 旧形式はパス中に出る（…/detail/=/cid=sone00682/）ため ? & / のいずれかを直前に許す
      const byCid = /[?&/]cid=([A-Za-z0-9_]+)/.exec(c);
    if (byCid) return { cid: byCid[1].toLowerCase(), floor: floorFromUrl(c) };
    const scoped = /video[.]dmm[.]co[.]jp|fanza/.test(c);
    if (scoped) {
      const byId = /[?&]id=([a-z0-9_]{4,})/.exec(c);
      if (byId) return { cid: byId[1], floor: floorFromUrl(c) };
    }
  }
  return { cid: null, floor: null };
}

/** 旧形式 `/digital/<floor>/` のパスからのみ floor を拾う。新形式には出ないので null を返す。 */
export function floorFromUrl(urlStr) {
  const m = /[/]digital[/]([a-z0-9]+)[/]/.exec(urlStr || "");
  return m ? m[1] : null;
}

/** t.co から Location を辿って content_id を解決する（既定 1 段）。 */
export async function resolveOne(input, { maxHops = 1 } = {}) {
  const chain = [];
  let url = input;
  let note = "";
  for (let hop = 0; hop < maxHops; hop++) {
    const got = extractCid(url);
    if (got.cid) return { input, chain, cid: got.cid, floor: got.floor, note };
    let r;
    try {
      r = await peekLocation(url);
    } catch (e) {
      note = "fetch 失敗: " + (e && e.name === "AbortError" ? "timeout" : String((e && e.message) || e));
      break;
    }
    if (r.blocked) {
      note = "到達しないドメインのため停止（" + new URL(url).hostname + "）";
      break;
    }
    chain.push({ url, status: r.status, location: r.location });
    if (!r.location) {
      note = "Location なし（HTTP " + r.status + "）";
      break;
    }
    url = new URL(r.location, url).toString();
  }
  const got = extractCid(url);
  if (got.cid) return { input, chain, cid: got.cid, floor: got.floor, note };
  return {
    input,
    chain,
    cid: null,
    floor: null,
    note: note || "maxHops " + maxHops + " で未取得（al.fanza 以降はクリック計測が走るため既定では辿らない）",
  };
}

/**
 * input.txt の該当ハンドル行で作品コード欄（⑤）が空なら content_id を付ける。
 * 純関数。戻り値 { text, filled: [{lineNo, handle, cid}], skipped: [{lineNo, handle, reason}] }
 */
export function fillInput(text, byHandle) {
  const lines = text.split("\n");
  const filled = [];
  const skipped = [];
  const out = lines.map((raw, idx) => {
    const lineNo = idx + 1;
    const line = raw.replace(/[\r]+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) return raw;
    const sep = line.includes("｜") ? "｜" : line.includes("|") ? "|" : null;
    if (!sep) return raw;
    const cols = line.split(sep);
    const handle = (cols[0] || "").trim().replace(/^@/, "");
    if (!handle || !byHandle.has(handle)) return raw;
    const cid = byHandle.get(handle);
    // 既に⑤（5 列目以降）が埋まっているか判定する。本文に区切りが含まれうるため、
    // 「末尾フィールドが小文字英数（content_id の形）」なら埋まっているとみなす。
    const tail = (cols[cols.length - 1] || "").trim();
    if (cols.length >= 5 && /^[a-z0-9_]+$/.test(tail) && /\d/.test(tail)) {
      skipped.push({ lineNo, handle, reason: "作品コード欄が既に埋まっている（" + tail + "）" });
      return raw;
    }
    filled.push({ lineNo, handle, cid });
    return line + sep + cid;
  });
  return { text: out.join("\n"), filled, skipped };
}

function jstNow() {
  return new Date(Date.now() + 9 * 3600e3).toISOString().replace("T", " ").slice(0, 19) + " JST";
}

async function main() {
  const argv = process.argv.slice(2);
  const urls = [];
  let outJson = null;
  let tcoTsv = null;
  let fillPath = null;
  let maxHops = 1;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") { outJson = argv[++i]; continue; }
    if (a === "--tco") { tcoTsv = argv[++i]; continue; }
    if (a === "--fill") { fillPath = argv[++i]; continue; }
    if (a === "--hops") { maxHops = Number(argv[++i]) || 1; continue; }
    if (a === "--file") {
      const txt = fs.readFileSync(argv[++i], "utf8");
      for (const line of txt.split("\n")) {
        const m = /(https?:[/][/][^\s]+)/.exec(line.trim());
        if (m) urls.push(m[1]);
      }
      continue;
    }
    urls.push(a);
  }

  /** @type {Array<{handle:string,url:string}>} */
  const tcoPairs = [];
  if (tcoTsv) {
    for (const line of fs.readFileSync(tcoTsv, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const cols = t.split(new RegExp("[" + TAB + "｜|]+")).map((x) => x.trim()).filter(Boolean);
      const handle = (cols.find((c) => c.startsWith("@")) || "").replace(/^@/, "");
      const url = cols.find((c) => /^https?:[/][/]/.test(c));
      if (!handle || !url) continue;
      tcoPairs.push({ handle, url });
      urls.push(url);
    }
  }

  if (urls.length === 0) {
    process.stderr.write("usage: node resolve-cid.mjs <t.co URL...> | --file urls.txt | --tco tco.tsv [--fill input.txt] [--json out.json] [--hops N]\n");
    process.exit(2);
  }

  const items = [];
  for (const u of urls) {
    const r = await resolveOne(u, { maxHops });
    items.push(r);
    const hops = r.chain.map((c) => new URL(c.url).hostname + "(" + c.status + ")").join(" → ");
    process.stdout.write(
      u + "\n  経路: " + (hops || "(なし)") + "\n  content_id: " + (r.cid || "未取得") +
      (r.note ? " / " + r.note : "") + "\n"
    );
  }

  // ハンドル → content_id
  const byHandle = new Map();
  for (const p of tcoPairs) {
    const hit = items.find((x) => x.input === p.url && x.cid);
    if (hit) byHandle.set(p.handle, hit.cid);
  }
  if (tcoPairs.length > 0) {
    process.stdout.write("\n[resolve-cid] ハンドル別:\n");
    for (const p of tcoPairs) {
      process.stdout.write("  @" + p.handle + TAB + (byHandle.get(p.handle) || "未取得") + "\n");
    }
  }

  let fill = null;
  if (fillPath) {
    if (byHandle.size === 0) {
      process.stdout.write("\n[resolve-cid] 解決できた content_id が無いため --fill は行わない\n");
    } else {
      const before = fs.readFileSync(fillPath, "utf8");
      const res = fillInput(before, byHandle);
      fs.writeFileSync(fillPath, res.text);
      // §10 読み戻し
      const after = fs.readFileSync(fillPath, "utf8");
      const readback = after === res.text;
      fill = { path: fillPath, filled: res.filled, skipped: res.skipped, readbackMatch: readback };
      process.stdout.write("\n[resolve-cid] --fill " + fillPath + "\n");
      for (const f of res.filled) process.stdout.write("  L" + f.lineNo + " @" + f.handle + " → " + f.cid + "\n");
      for (const s of res.skipped) process.stdout.write("  L" + s.lineNo + " @" + s.handle + " skip: " + s.reason + "\n");
      process.stdout.write("  読み戻し: " + (readback ? "一致" : "🔴不一致") + "（付与 " + res.filled.length + " / skip " + res.skipped.length + "）\n");
    }
  }

  const resolvedAtJst = jstNow();
  if (outJson) {
    fs.writeFileSync(outJson, JSON.stringify({ resolvedAtJst, maxHops, items, byHandle: Object.fromEntries(byHandle), fill }, null, 1));
    process.stdout.write("\n[resolve-cid] wrote " + outJson + "\n");
  }
  const ok = items.filter((x) => x.cid).length;
  process.stdout.write("\n[resolve-cid] " + ok + " / " + items.length + " 件で content_id を解決（" + resolvedAtJst + "）\n");
}

if (process.argv[1] && process.argv[1].endsWith("resolve-cid.mjs")) {
  main().catch((e) => { process.stderr.write(String((e && e.stack) || e) + "\n"); process.exit(1); });
}
