/**
 * 第116便 補遺16 タスクA — Phase 1 A型動画の生成（静止画スライドショー）
 *
 * 【固定仕様・3本共通（§21-5 の制作統一条項）】
 *  - 構成: パッケージ表面画像 + テキストスライド（カウントダウン / 価格 / キャッチ）のみ
 *  - **サンプル画像は使用しない**
 *  - **素材加工（トリミング・ぼかし等）は行わない**。アスペクト比を保った縮小と余白付与のみ
 *  - 出力: 1080x1920（9:16）/ 約20秒 / H.264(High) + AAC / yuv420p / faststart
 *
 * 【scratchpad 配下で完結】本番コードには一切触れない。
 *
 * 使い方:
 *   node make-video.mjs --cid <content_id> [--out out.mp4]
 *   （候補データは candidates.json から読む。パッケージ画像は公開 URL から取得）
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const FFMPEG = "C:/Users/Tachi/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.1-essentials_build/bin/ffmpeg.exe";
// ffmpeg の drawtext は Windows パスのコロンをエスケープする必要がある
const FONT = "C\\:/Windows/Fonts/meiryob.ttc";      // Meiryo Bold
const FONT_R = "C\\:/Windows/Fonts/meiryo.ttc";     // Meiryo Regular
const W = 1080, H = 1920;

// 【当日生成ルール・ひでき指定 2026-09-04】
// カウントダウンの基準日は **生成を実行した日（JST の当日 00:00）** とする。
// 固定日をハードコードすると、生成日と投稿日がずれたときに日数表記が誤る。
// --asof YYYY-MM-DD で明示的に上書きできるが、その場合は警告を出す。
const todayJst = () => {
  const n = new Date(Date.now() + 9 * 3600e3);
  return new Date(`${n.toISOString().slice(0, 10)}T00:00:00+09:00`);
};

// 【出力先・2026-09-04 ひでき指定】恒久フォルダへ直接出力する。
// scratchpad（Temp 配下）はセッションごとに変わり OS のクリーンアップで消えるため。
const OUT_BASE = "C:/Users/Tachi/Videos/vodnavi-phase1";

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const cid = arg("--cid");
if (!cid) { console.error("--cid <content_id> を指定すること"); process.exit(1); }

// 作品ごとに content_id 名のサブフォルダを作る
const outDir = arg("--outdir", join(OUT_BASE, cid));
mkdirSync(outDir, { recursive: true });
const outFile = arg("--out", join(outDir, `video_${cid}.mp4`));

// 候補ファイルは --cands で切替可能（既定 candidates.json / 3本目は candidates3.json）
const candsFile = arg("--cands", "candidates.json");
const cands = JSON.parse(readFileSync(candsFile, "utf8"));
const it = cands.find((c) => c.cid === cid);
if (!it) { console.error(`${candsFile} に ${cid} が無い`); process.exit(1); }
console.log(`候補ファイル: ${candsFile}`);

const pkgPath = join(outDir, `${cid}_pkg.jpg`);

// --- パッケージ表面画像の取得（加工しない） ---
if (!existsSync(pkgPath)) {
  const r = await fetch(it.pkgLarge, { headers: { "User-Agent": "Mozilla/5.0 (compatible; VodnaviAudit/1.0)" } });
  if (!r.ok) { console.error(`パッケージ画像の取得に失敗: HTTP ${r.status}`); process.exit(1); }
  writeFileSync(pkgPath, Buffer.from(await r.arrayBuffer()));
}
const pkgBytes = readFileSync(pkgPath).length;

// --- テキスト素材 ---
const asofArg = arg("--asof");
const BASE_JST = asofArg ? new Date(`${asofArg}T00:00:00+09:00`) : todayJst();
if (asofArg) {
  console.log(`【警告】--asof ${asofArg} で基準日を上書きしている。当日生成ルールから外れる。`);
}
const rel = new Date(it.date.replace(" ", "T") + "+09:00");
const daysLeft = Math.round((rel - BASE_JST) / 86400000);
// 【厳守】JST の日付を出すときに toISOString() をそのまま使わない（UTC 日付になる）。
// 9/4 00:00 JST は UTC では 9/3 15:00 であり、slice(0,10) は "2026-09-03" を返す。
const jstDate = (d) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
console.log(`基準日（カウントダウンの起点）: ${jstDate(BASE_JST)} JST`);
console.log(`配信開始: ${it.date.slice(0, 10)} → 表示は「あと ${daysLeft} 日」`);
if (daysLeft < 1) {
  console.error(`【中止】あと ${daysLeft} 日 は投稿文として成立しない。基準日か対象作品を見直すこと。`);
  process.exit(1);
}
const relStr = `${rel.getFullYear()}年${rel.getMonth() + 1}月${rel.getDate()}日`;
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\u2019").replace(/%/g, "\\%");

// 【2026-09-05・第119便 裁定(2)】タイトル帯が画面幅を超えないようにする。
// **旧実装は「26字で切り詰め + fontsize 44 固定」で、全角26字 ≒ 1,144px +
//   boxborderw 48px ＝ 約1,192px となり画面幅 1,080px を必ず超えていた**
//   （1本目 1sun00067a・2本目の初版で実際にはみ出した）。
// 方式: **実幅を推定して fontsize を動的に下げる。下限でも収まらない場合のみ字数を切る。**
// 裁定の位置づけ: 描画バグの是正であり §21-5-1 の統一条項に違反しない（TZ バグ修正と同カテゴリ）。
const TEXT_MAX_W = 984; // 1080 − box(boxborderw 24×2=48) − 左右セーフマージン(24×2=48)
const textWidth = (s, size) => {
  let w = 0;
  for (const ch of s) w += /[\x00-\x7F]/.test(ch) ? size * 0.5 : size; // 半角は全角の半分と近似
  return w;
};
const fitText = (raw, sizeMax, sizeMin, maxW = TEXT_MAX_W) => {
  if (!raw) return { text: "", size: sizeMax, mode: "empty" };
  for (let s = sizeMax; s >= sizeMin; s -= 2) {
    if (textWidth(raw, s) <= maxW) return { text: raw, size: s, mode: s === sizeMax ? "そのまま" : `縮小 ${sizeMax}→${s}` };
  }
  // 下限でも収まらない → 字数側を切る（コードポイント単位。サロゲートペアを壊さない）
  let cps = Array.from(raw);
  while (cps.length > 1 && textWidth(cps.join("") + "…", sizeMin) > maxW) cps.pop();
  return { text: cps.join("") + "…", size: sizeMin, mode: `下限 ${sizeMin} + ${cps.length}字で切詰め` };
};
const fitTitle = fitText(it.title, 44, 30);
const fitActress = fitText(it.actress ? `出演: ${it.actress}` : "", 40, 26);
console.log(`タイトル: fontsize ${fitTitle.size}（${fitTitle.mode}）/ 推定幅 ${Math.round(textWidth(fitTitle.text, fitTitle.size)) + 48}px ≤ 1080`);
console.log(`出演    : fontsize ${fitActress.size}（${fitActress.mode}）/ 推定幅 ${Math.round(textWidth(fitActress.text, fitActress.size)) + 48}px ≤ 1080`);

const L = {
  brand: esc("VODNAVI"),
  catch1: esc("配信開始まで"),
  days: esc(`あと ${daysLeft} 日`),
  rel: esc(`配信開始 ${relStr}`),
  title: esc(fitTitle.text),
  actress: esc(fitActress.text),
  volume: esc(it.volume ? `収録 ${it.volume}分` : ""),
  price: esc(`${Number(it.price).toLocaleString("ja-JP")}円`),
  cta: esc("詳細はプロフィールのリンクから"),
};

// --- フィルタグラフ ---
// 3シーン各 6.67 秒 = 20 秒
const D = 6.67;
const drawtext = (o) => {
  const p = [
    `fontfile='${o.font ?? FONT}'`, `text='${o.text}'`,
    `fontcolor=${o.color ?? "white"}`, `fontsize=${o.size}`,
    `x=${o.x ?? "(w-text_w)/2"}`, `y=${o.y}`,
    o.box ? `box=1:boxcolor=${o.box}:boxborderw=24` : null,
    o.enable ? `enable='${o.enable}'` : null,
  ].filter(Boolean);
  return `drawtext=${p.join(":")}`;
};

// scene1: パッケージ表面画像（縮小 + 余白。トリミングしない）
const scene1 = [
  `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
  `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x101010,setsar=1[bg]`,
  `[bg]${drawtext({ text: L.brand, size: 46, y: 96, color: "0xD4AF37" })},` +
  `${drawtext({ text: L.title, size: fitTitle.size, y: `${H}-300`, box: "black@0.55" })},` +
  `${drawtext({ text: L.actress, size: fitActress.size, y: `${H}-210`, font: FONT_R, box: "black@0.55" })}[s1]`,
].join(";");

// scene2 / scene3: 単色テキストスライド
const slide = (idx, lines, bg) => {
  let f = `color=c=${bg}:s=${W}x${H}:d=${D},format=yuv420p[b${idx}]`;
  let cur = `b${idx}`;
  lines.forEach((ln, i) => {
    const next = `t${idx}_${i}`;
    f += `;[${cur}]${drawtext(ln)}[${next}]`;
    cur = next;
  });
  return { filter: f, label: cur };
};
const s2 = slide(2, [
  { text: L.catch1, size: 56, y: 620, font: FONT_R },
  { text: L.days, size: 150, y: 760, color: "0xD4AF37" },
  { text: L.rel, size: 44, y: 1020, font: FONT_R },
], "0x101010");
const s3 = slide(3, [
  { text: L.volume, size: 48, y: 640, font: FONT_R },
  { text: L.price, size: 132, y: 760, color: "0xD4AF37" },
  { text: L.cta, size: 42, y: 1040, font: FONT_R },
  { text: L.brand, size: 40, y: 1200, color: "0xD4AF37" },
], "0x101010");

const graph = [
  scene1,
  `[s1]trim=duration=${D},setpts=PTS-STARTPTS[v1]`,
  s2.filter, `[${s2.label}]trim=duration=${D},setpts=PTS-STARTPTS[v2]`,
  s3.filter, `[${s3.label}]trim=duration=${D},setpts=PTS-STARTPTS[v3]`,
  // 入力 JPEG は full range のため、明示的に tv range へ変換する（X 互換・yuvj420p を避ける）
  `[v1][v2][v3]concat=n=3:v=1:a=0,scale=in_range=full:out_range=tv,format=yuv420p[vout]`,
  `anullsrc=channel_layout=stereo:sample_rate=44100[aout]`,
].join(";");

const outArgs = [
  "-y", "-loop", "1", "-t", String(D * 3), "-i", pkgPath,
  "-filter_complex", graph,
  "-map", "[vout]", "-map", "[aout]",
  "-c:v", "libx264", "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
  "-r", "30", "-b:v", "5M", "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
  "-shortest", "-movflags", "+faststart", outFile,
];

console.log(`パッケージ画像: ${pkgPath}（${pkgBytes.toLocaleString()} バイト・加工なし）`);
console.log(`生成中: ${outFile} …`);
try {
  execFileSync(FFMPEG, outArgs, { stdio: ["ignore", "pipe", "pipe"] });
} catch (e) {
  console.error("ffmpeg 失敗:\n" + String(e.stderr ?? e).slice(-2500));
  process.exit(1);
}

// --- 検証用の1フレーム画像を各シーンから出力（ひでき目視用） ---
const frames = [];
for (const [name, ss] of [["frame1", "2"], ["frame2", "9"], ["frame3", "16"]]) {
  const f = join(outDir, `${name}_${cid}.png`);
  execFileSync(FFMPEG, ["-y", "-ss", ss, "-i", outFile, "-frames:v", "1", f], { stdio: "ignore" });
  frames.push(f);
}
const winPath = (p) => p.replace(/\//g, "\\");
console.log(`\n=== 保存先（エクスプローラーで開ける形式）===`);
console.log(`フォルダ : ${winPath(outDir)}`);
console.log(`動画     : ${winPath(outFile)}`);
for (const f of frames) console.log(`画像     : ${winPath(f)}`);
console.log(`パッケージ: ${winPath(pkgPath)}`);

// --- はみ出しの機械チェック（左右 48px のセーフマージンに明るい画素が無いこと） ---
// テキストスライド（scene2 / scene3）は背景 0x101010 なので、マージン内の YMAX が
// 閾値を超えていれば文字が端に接している＝はみ出しとみなす。
const MARGIN = 48, YMAX_TH = 60;
console.log("\n--- はみ出しの機械チェック（左右 48px セーフマージン・背景輝度 16 に対し閾値 60）---");
let overflow = false, undecidable = 0;
// 【2026-09-05 追加】scene1（タイトル帯）を検査対象へ加える。
// それまで scene2 / scene3 しか見ておらず、**検査していない範囲について
// 「はみ出しなし」と報告していた**（1本目 1sun00067a で実際にはみ出していた）。
// scene1 はパッケージ画像が背景のため全面では閾値が使えない。
// タイトル/出演の帯（y=1580..1810）に限定し、左右 4px の端だけを見る。
for (const [label, ss] of [["scene1(タイトル帯)", 2]]) {
  for (const side of ["L", "R"]) {
    const x = side === "L" ? 0 : W - 4;
    let ymax = null;
    try {
      const r = execFileSync(FFMPEG,
        ["-hide_banner", "-loglevel", "info", "-ss", String(ss), "-i", outFile, "-frames:v", "1",
         "-vf", `crop=4:230:${x}:1580,signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-`,
         "-f", "null", "-"],
        { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
      const m = String(r).match(/YMAX=(\d+)/); ymax = m ? Number(m[1]) : null;
    } catch (e) {
      const s = String(e.stdout ?? "") + String(e.stderr ?? "");
      const m = s.match(/YMAX=(\d+)/); ymax = m ? Number(m[1]) : null;
    }
    if (ymax == null) { undecidable++; console.log(`  ${label} ${side}端: **判定不可**（YMAX を取得できなかった）`); continue; }
    const ng = ymax > YMAX_TH;
    if (ng) overflow = true;
    console.log(`  ${label} ${side}端: YMAX=${ymax} → ${ng ? "**はみ出しの疑い**" : "OK"}`);
  }
}
for (const [label, ss] of [["scene2(カウントダウン)", 9], ["scene3(価格/CTA)", 16]]) {
  for (const side of ["L", "R"]) {
    const crop = side === "L" ? `crop=${MARGIN}:${H}:0:0` : `crop=${MARGIN}:${H}:${W - MARGIN}:0`;
    let ymax = null;
    try {
      // metadata=print は stderr へ出るため 2>&1 相当で拾う
      const r = execFileSync(FFMPEG,
        ["-hide_banner", "-loglevel", "info", "-ss", String(ss), "-i", outFile, "-frames:v", "1",
         "-vf", `${crop},signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-`,
         "-f", "null", "-"],
        { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
      const m = String(r).match(/YMAX=(\d+)/);
      ymax = m ? Number(m[1]) : null;
    } catch (e) {
      const s = String(e.stdout ?? "") + String(e.stderr ?? "");
      const m = s.match(/YMAX=(\d+)/);
      ymax = m ? Number(m[1]) : null;
    }
    if (ymax == null) { undecidable++; console.log(`  ${label} ${side}端: **判定不可**（YMAX を取得できなかった）`); continue; }
    const ng = ymax > YMAX_TH;
    if (ng) overflow = true;
    console.log(`  ${label} ${side}端: YMAX=${ymax} → ${ng ? "**はみ出しの疑い**" : "OK"}`);
  }
}
// 【厳守】判定不可を「OK」と読み替えない（§10）
if (overflow) console.log("\n**判定: はみ出しの疑いあり。フォントサイズを見直すこと。**");
else if (undecidable > 0) console.log(`\n**判定: 不可（${undecidable}/4 が測定できず）。目視確認に委ねる。「はみ出しなし」とは書かない。**`);
else console.log("\n判定: はみ出しなし（左右マージンはすべて背景輝度）");
