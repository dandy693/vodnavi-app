#!/usr/bin/env node
/**
 * X 投稿の原稿生成（テンプレート固定方式）— CSO裁定 2026-08-13（第20便）
 *
 * 方針:
 * - **AI に自由度を与えない**。テンプレートへ変数を差し込むだけ。
 *   根拠 = `FACT_GOVERNANCE.md` §11「AI の提案量は人間が承認できる量を超えてはならない」。
 *   自由記述にすると承認時に1件ずつ本文を読む必要が生じ、分類C の負荷が重くなる。
 * - **作品タイトルは含めない**（CSO裁定・確定）。既存63件で採用実績 0件。
 *   タイトルは 25〜70字で本文枠を圧迫し、FANZA 側が `〇` `●` で伏字にしている語を
 *   高頻度で含む。配信元が伏字にしている語の転記は X 規約に抵触するリスクが高い。
 * - **本スクリプトは Airtable へ書き込まない**。生成と検証のみ。書き込みは別便で CSO 承認後。
 *
 * 権限分離の限界（`FACT_GOVERNANCE.md` §13）:
 *   Airtable には行レベル権限が無く、PAT スコープでも「書ける値」を制限できない。
 *   本スクリプトが `ステータス='ストック'` を固定するのが**唯一の防御層**であり、
 *   スクリプトを書き換えれば `承認済` を直接書ける。B2②-b の三層防御とは強度が異なる。
 *   → `STOCK_STATUS` を書く箇所は**この1箇所のみ**とし、git 差分レビューの対象とする。
 */

export const STOCK_STATUS = "ストック"; // ★ここ以外で ステータス を書かないこと

// ───────────────────── 投稿種別の分類（既存63件の実測から導出） ─────────────────────
/**
 * 実測（2026-08-13・全63件）:
 *   T1改 23 / TG 12 / リンクなし 10 / T6TV 8 / T3セール 6 / T5 4
 *   リンク先: T1改 → `app.vodnavi.jp/works/` ／ TG → `/articles/` ／ T5 → `/lp`
 *             T6TV・T3セール → `al.fanza.co.jp` / `al.dmm.co.jp`（＝006直貼り）
 *
 * 判別基準（**リンク先だけで機械判定できる**）:
 *   - `workIntro`   … `app.vodnavi.jp/works/…`（＝作品紹介・T1改）
 *   - `affiliate`   … `al.dmm.co.jp` / `al.fanza.co.jp`（＝006直貼り・T6TV / T3セール）
 *   - `nonWorkIntro`… それ以外（`/articles/`・`/lp`・リンクなし＝TG / T5 / 小ネタ）
 */
export function postKind(linkUrl) {
  if (!linkUrl) return "nonWorkIntro";
  let u;
  try { u = new URL(linkUrl); } catch { return "nonWorkIntro"; }
  if (/(^|\.)al\.(dmm|fanza)\.co\.jp$/i.test(u.host)) return "affiliate";
  if (u.host === "app.vodnavi.jp" && u.pathname.startsWith("/works/")) return "workIntro";
  return "nonWorkIntro";
}

/**
 * 過去に X で登場した女優。**直近に登場した女優を再び出さない**ための除外リスト（g12 が参照）。
 * 窓の長さ（何日前まで遡って除外するか）は CSO 裁定事項＝現行 `ACTRESS_EXCLUDE_DAYS` 30日。
 *
 * 【2026-08-21・第84便 CSO裁定(2) より自動生成に切り替えた】
 * 本表は 2026-08-13 に手で作られて以降 更新されず、**その後に実配信された3件
 * （純白彩永 8/17 / 紫堂るい 8/18 / 吉永塔子 8/21）が欠落**していた。
 * **g12 はこの表だけを見るため、表が古いと直近に登場した女優が検査を素通りする。**
 * **手動更新では欠落が繰り返される**ため、Airtable の実レコードから生成する。
 *
 * 【登録基準】
 *   - **配信済み** … `ステータス=投稿済` **かつ `ポストID` を持つ**
 *     （§13: `投稿済` は X 上の実在を保証しない。実在の唯一の機械的手掛かりは `ポストID`）
 *   - **予約済み** … `ステータス=承認済` **かつ `予約日時` を持つ**
 *   - **予約日時を持たないストックは登録しない**（B8 の教訓＝存在しない配信を記録しない）
 * 女優名は**管理IDの自由記述を解析せず**、`content_id` から FANZA API の
 * `iteminfo.actress` を引いて確定する。
 *
 * 【`ACTRESS_ENTRY_SOURCE`】**まだ配信されていない行（＝予約済み）**の record id を登録する。
 * その行自身を g12 で検査するとき、**自分の登録で自分をブロックしない**ようにするため。
 * 由来＝2026-08-13 に B8 が自分の登録値で g12 にブロックされた事例。
 * **配信済みの行は登録しない**（自分から見ても他の行から見ても通常の履歴であるため）。
 *
 * 更新: `node --env-file=.env.local scripts/sync-actress-table.mjs --input dump.json --write`
 */
// <<<AUTOGEN:ACTRESS_TABLE:BEGIN>>>
// 自動生成（scripts/sync-actress-table.mjs）。**手で編集しないこと。**
// 生成元＝Airtable の実レコード。女優名は FANZA API の iteminfo.actress を正とする。
export const ACTRESS_LAST_POSTED = {
  "白石るな": "2026-07-13",
  "瀬戸環奈": "2026-07-14",
  "花宮きょうこ": "2026-07-16",
  "冬愛ことね": "2026-07-16",
  "由良かな": "2026-07-16",
  "福田ゆあ": "2026-07-18",
  "伊藤舞雪": "2026-07-20",
  "金松季歩": "2026-07-20",
  "九野ひなの": "2026-07-20",
  "桜空もも": "2026-07-20",
  "宮下玲奈": "2026-07-23",
  "博多彩葉": "2026-07-24",
  "乙アリス": "2026-07-29",
  "小沢菜穂": "2026-08-03",
  "宮上唯依花": "2026-08-04",
  "今井美優": "2026-08-05",
  "叶愛": "2026-08-06",
  "沙月恵奈": "2026-08-07",
  "永野鈴": "2026-08-08",
  "皆月ひかる": "2026-08-08",
  "希咲那奈": "2026-08-08",
  "月乃ルナ": "2026-08-08",
  "高島愛": "2026-08-08",
  "雫月心桜": "2026-08-08",
  "秋元さちか": "2026-08-08",
  "渚みつき": "2026-08-08",
  "松井日奈子": "2026-08-08",
  "倉木しおり": "2026-08-08",
  "藤田こずえ": "2026-08-08",
  "桜坂ふうか": "2026-08-10",
  "石田紗季": "2026-08-11",
  "逢見リカ": "2026-08-12",
  "美乃すずめ": "2026-08-13",
  "流川莉央": "2026-08-14",
  "みひな （あずみひな、永井みひな）": "2026-08-15",
  "愛花みちる": "2026-08-15",
  "稲場るか": "2026-08-15",
  "永井マリア": "2026-08-15",
  "夏希まろん": "2026-08-15",
  "吉根ゆりあ": "2026-08-15",
  "琴石ゆめる": "2026-08-15",
  "黒川すみれ": "2026-08-15",
  "七瀬アリス": "2026-08-15",
  "若宮穂乃": "2026-08-15",
  "小花のん": "2026-08-15",
  "小梅えな": "2026-08-15",
  "松本いちか": "2026-08-15",
  "新井リマ": "2026-08-15",
  "森沢かな（飯岡かなこ）": "2026-08-15",
  "森日向子": "2026-08-15",
  "深田えいみ": "2026-08-15",
  "深田結梨": "2026-08-15",
  "星なこ": "2026-08-15",
  "石原希望": "2026-08-15",
  "辻井ほのか": "2026-08-15",
  "椿りか": "2026-08-15",
  "天馬ゆい": "2026-08-15",
  "藤森里穂": "2026-08-15",
  "八乃つばさ": "2026-08-15",
  "美波こづえ": "2026-08-15",
  "姫咲はな": "2026-08-15",
  "百永さりな": "2026-08-15",
  "本真ゆり": "2026-08-15",
  "弥生みづき": "2026-08-15",
  "有岡みう": "2026-08-15",
  "夕季ちとせ": "2026-08-15",
  "葉月みりあ": "2026-08-15",
  "春日々音": "2026-08-16",
  "純白彩永": "2026-08-17",
  "紫堂るい": "2026-08-18",
  "吉永塔子": "2026-08-21",
};
export const ACTRESS_ENTRY_SOURCE = {
  "吉永塔子": "recchWYQDOycFkrZA",
};
// <<<AUTOGEN:ACTRESS_TABLE:END>>>

/** 【CSO確定 2026-08-13】除外窓は **30日**。 */
export const ACTRESS_EXCLUDE_DAYS = 30;

/**
 * 候補に「基準日から N 日以内に登場した女優」が含まれるか（1名でも含めば除外）。
 *
 * 未来日の登録も**ブロック対象に含める**（既に 8/15 に予約済みの女優を 8/17 に再び出せば、
 * それは 30日窓内の再登場である）。差分の符号ではなく絶対的な近さで判定する。
 *
 * @param selfId 検査対象の行の record id。`ACTRESS_ENTRY_SOURCE` が同じ行を指す登録は無視する
 *               （**自分自身の登録で自分をブロックしない**）。
 */
export function hasPostedActress(actressNames, referenceJstDate, days = ACTRESS_EXCLUDE_DAYS, selfId = null) {
  const ref = new Date(`${referenceJstDate}T00:00:00+09:00`);
  return (actressNames ?? []).some((n) => {
    if (selfId && ACTRESS_ENTRY_SOURCE[n] === selfId) return false;
    const last = ACTRESS_LAST_POSTED[n];
    if (!last) return false;
    const diff = (ref - new Date(`${last}T00:00:00+09:00`)) / 86400000;
    return diff <= days;
  });
}

// ───────────────────────────── 品番変換（タスクA） ─────────────────────────────

/**
 * content_id → 本文用の品番。
 *
 * content_id の構造は `{数字接頭辞?}{英字レーベル}{5桁ゼロ埋め連番}`。
 *   例: `1dldss00539` → 接頭辞 "1" / レーベル "dldss" / 連番 "00539"
 *
 * 【2026-08-13 修正】旧実装は `String(Number(digits))` でゼロを全て落としていたため、
 * `spjur00001` が `SPJUR-1` になっていた（正しくは `SPJUR-001`）。
 * 既存63件が無事だったのは**有効桁が3桁以上のケースしか無かったため**であり、
 * 実装が正しかったからではない。→ **最小3桁へゼロ埋めする**。
 *
 * 【明示】「最小3桁」は FANZA の一般的な表記慣行からの**推定**である。
 * 本コーパスの23件はいずれも有効桁3桁以上のため、**3桁未満のケースを検証できていない**。
 * そのため `isHinbanVerifiable()` で 3桁未満を**検証不能**として扱い、抽出段階で除外する。
 */
export function toHinban(contentId) {
  const m = String(contentId).match(/^(\d*)([a-z]+)(\d+)$/);
  if (!m) return null;
  const [, , label, digits] = m;
  const n = Number(digits);
  if (!Number.isFinite(n)) return null;
  return `${label.toUpperCase()}-${String(n).padStart(3, "0")}`;
}

/** 品番 + 数字接頭辞 から content_id を再構成する（ラウンドトリップ検証用）。 */
export function fromHinban(hinban, numericPrefix = "") {
  const m = String(hinban).match(/^([A-Z]+)-(\d+)$/);
  if (!m) return null;
  return `${numericPrefix}${m[1].toLowerCase()}${String(Number(m[2])).padStart(5, "0")}`;
}

/** content_id の数字接頭辞（`1dldss00539` → "1"）。 */
export function numericPrefixOf(contentId) {
  return (String(contentId).match(/^(\d*)[a-z]/) ?? ["", ""])[1];
}

/**
 * 品番の表記が**検証可能**か。有効桁が3桁未満のものは、正しいゼロ埋め幅を
 * 本コーパスで確認できていないため false を返す（抽出段階で除外する）。
 */
export function isHinbanVerifiable(contentId) {
  const m = String(contentId).match(/^\d*[a-z]+(\d+)$/);
  if (!m) return false;
  return Number(m[1]) >= 100;
}

// ───────────────────────────── 文字数（X の重み付け） ─────────────────────────────

/** URL は t.co により一律 23 文字として計上される。 */
export const TCO_LEN = 23;
/** X の重み付き上限（半角=1 / 全角=2、上限 280 ＝ 日本語 140 字相当）。 */
export const X_WEIGHTED_LIMIT = 280;

export function weightedLength(text) {
  // URL を先に 23 の重みへ置換してから、残りを 1/2 で重み付けする。
  const urls = [];
  const stripped = String(text).replace(/https?:\/\/\S+/g, (u) => {
    urls.push(u);
    return " ";
  });
  let w = urls.length * TCO_LEN;
  for (const ch of stripped) {
    if (ch === " ") continue;
    const cp = ch.codePointAt(0);
    w += cp <= 0x10ff || (cp >= 0x2000 && cp <= 0x200d) || (cp >= 0x2010 && cp <= 0x201f) || (cp >= 0x2032 && cp <= 0x2037) ? 1 : 2;
  }
  return w;
}

// ───────────────────────────── テンプレート（タスクB） ─────────────────────────────

const VR_GENRE = /VR/;
export const isVR = (c) => (c.genresRaw ?? []).some((g) => VR_GENRE.test(g)) || /^【VR】/.test(c.title ?? "");

/** 画質ラベルをジャンルから導出（無ければ空）。 */
function qualityOf(c) {
  const g = c.genresRaw ?? [];
  if (g.some((x) => /8KVR|8K/.test(x))) return "8K";
  if (g.some((x) => /4K/.test(x))) return "4K";
  if (g.some((x) => /ハイビジョン/.test(x))) return "ハイビジョン";
  return "";
}

/**
 * テンプレート5種。**いずれも作品タイトルを含めない**（CSO裁定・確定）。
 * 誘導行は既存63件で実績のある表現をそのまま用いる。
 */
/**
 * 【2026-08-13 修正・書き込み前に検出】`build()` は **URL を含めない本文**を返す。
 * 既存63件の実測で **`投稿文` フィールドに URL は入っておらず、`リンクURL` フィールドに
 * 分離されている**（配信時に付加される想定）。本文に URL を埋め込むと**投稿時に URL が
 * 二重になる**。文字数はここでは本文のみを数え、`postedText()` で URL 込みを評価する。
 */
export const TEMPLATES = {
  X1: {
    name: "単体作品・基本形",
    build: (c) => {
      const q = qualityOf(c);
      return `${c.actress}の単体作品、${c.hinban}。${q ? `${q}収録です。` : "配信中です。"}\n収録内容・サンプル・出演情報はこちらから↓`;
    },
  },
  X2: {
    name: "収録時間訴求",
    build: (c) =>
      `${c.actress}の${c.hinban}は${c.minutes}分の収録。${qualityOf(c) ? `${qualityOf(c)}収録です。` : ""}\n収録内容・サンプル・出演情報はこちらから↓`,
  },
  X3: {
    name: "レビュー訴求",
    build: (c) =>
      `${c.hinban}（${c.actress}）はレビュー${c.rc}件で平均${c.rating.toFixed(1)}。\n収録内容・サンプル・出演情報はこちらから↓`,
  },
  X4: {
    name: "VR特化",
    build: (c) => {
      // `qualityOf` は 8K/4K/ハイビジョン のみを返し、VR 作品では空になることがある。
      // 旧実装は `qualityOf(c) || "VR"` としていたため空のとき「VRVR作品」になった
      // （2026-08-13 ドライランで検出）。**ガードレールは文言の自然さを検査しない**ため、
      // ここで構造的に潰す。
      const q = qualityOf(c);
      const label = q && q !== "VR" ? `${q}VR作品` : "VR作品";
      return `${c.actress}の${label}、${c.hinban}。${c.minutes}分の収録です。\nVR対応環境・収録内容の詳細はこちらから↓`;
    },
  },
  X5: {
    name: "シリーズ／メーカー軸",
    build: (c) =>
      `${c.maker}の${c.hinban}、出演は${c.actress}。${c.minutes}分収録。\n収録内容・サンプル・出演情報はこちらから↓`,
  },
};

/** 実際に X へ投稿される文字列（本文 + 改行 + リンクURL）。文字数検査はこれで行う。 */
export const postedText = (p) => (p.linkUrl ? `${p.text}\n${p.linkUrl}` : p.text);

// ─────────────── T5（コンシェルジュ誘導）— CSO承認 2026-08-13 ───────────────
/**
 * 実測（既存4件）: **リンクURL は全件 `/lp` 固定**。本文は
 *   [0] フック行（悩みの提示・毎回言い換えられている）
 *   [1] 本体（「VODNAVIのAIコンシェルジュは、好みを3つ答えるだけで今夜の1本を提案します。無料・登録不要です」）
 * の2行構成が主（初期の2件は3行）。**末尾の本体行は4件中3件が実質同一**。
 *
 * **同一文面の反復は X でスパム判定されうる**ため、**表層の差分はフック行のローテーション**で作る。
 * 本体は事実（3問・無料・登録不要）を含むため変えない。
 */
export const T5_LP_URL = "https://app.vodnavi.jp/lp";
export const T5_BODY = "VODNAVIのAIコンシェルジュは、好みを3つ答えるだけで今夜の1本を提案します。無料・登録不要です";
export const T5_HOOKS = [
  "「今夜どれを観るか」で時間が溶ける人へ。",
  "作品を探す時間のほうが長くなっている人へ。",
  "ジャンル名で探すより、好みを答えて選んでもらう方が早いこともあります。",
  "候補が多すぎて決められない夜に。",
  "「とりあえず新着を上から」をやめたい人へ。",
];
export function buildT5(hookIndex) {
  return { text: `${T5_HOOKS[hookIndex % T5_HOOKS.length]}\n\n${T5_BODY}`, linkUrl: T5_LP_URL };
}

// ─────────────── TG（ガイド誘導）— CSO承認 2026-08-13 ───────────────
/**
 * 実測（既存12件）:
 *   - **固定**: `utm_source=x_vodnavi` / `utm_medium=social`
 *   - **可変**: `utm_campaign` = slug のハイフンをアンダースコアへ / `utm_content` = `tg{連番}`
 *   - **TG-1 / TG-2 は UTM を持たない**（初期2件）
 *   - **TG-3 は `utm_campaign=fanza_first_guide` だが slug は `fanza-tv-free-trial`＝不一致**
 *     （既存データの誤り。**本実装では slug から機械的に導出**して再発を防ぐ）
 */
export const TG_UTM_SOURCE = "x_vodnavi";
export const TG_UTM_MEDIUM = "social";
export function buildTgUrl(slug, seq) {
  const campaign = slug.replace(/-/g, "_");
  return `https://app.vodnavi.jp/articles/${slug}?utm_source=${TG_UTM_SOURCE}&utm_medium=${TG_UTM_MEDIUM}&utm_campaign=${campaign}&utm_content=tg${seq}`;
}

/**
 * 対象は**公開済み8本**。訴求文は既存投稿の実績表現を踏襲する。
 * `fanza-subscription-vs-single-purchase`（記事A・2026-08-11 公開）は **TG 初回**。
 */
export const TG_ARTICLES = [
  { slug: "fanza-first-guide",  hook: "はじめてのFANZA、「登録自体にお金がかかるのか」「支払いはカード以外に何が使えるのか」あたりで手が止まりがちです。", cta: "登録から購入までの全体像を1本のガイドにまとめています↓" },
  { slug: "fanza-kaiyaku",      hook: "FANZA TVの解約、「いつから解約できるのか」「解約したらすぐ見られなくなるのか」で迷いがちです。", cta: "答えと手順を1本のガイドにまとめています。登録前に読んでおくと安心です↓" },
  { slug: "fanza-payment-methods", hook: "FANZAの支払いはクレジットカードだけではありません。DMMポイント払いなら、カード情報を入れずに購入まで完結できます。", cta: "使える手段と注意点を登録前に1本で確認できます↓" },
  { slug: "fanza-payment-statement", hook: "FANZAで買ったとき、クレジットカードの明細には何と表示されるのか。", cta: "請求名義を実際に確認してガイドにまとめています。登録前に目を通しておくと安心です↓" },
  { slug: "fanza-tv-free-trial", hook: "FANZA TVの14日間無料、「0円のまま終える」には解約のタイミングだけ知っておく必要があります。", cta: "やめ方まで含めた手順をガイドにまとめました↓" },
  { slug: "fanza-tv-guide",     hook: "「FANZA TVって結局何が見放題なのか」。", cta: "料金・見放題の範囲・登録の手順を、ガイドにまとめています↓" },
  { slug: "fanza-tv-review",    hook: "FANZA TVは人を選ぶサービスです。", cta: "「ひどい」と言われる理由と、向かない人の特徴を正直に書いたレビューがこちらです↓" },
  // 記事A（2026-08-11 公開・TG 初回）。works 詳細では見放題対象か分からない（§5-2）という
  // 構造的な空白に答える記事であるため、その点を訴求の起点にする。
  { slug: "fanza-subscription-vs-single-purchase", hook: "この作品は単品で買うのが得なのか、それとも見放題で見られるのか。", cta: "単品購入と見放題の損益分岐を、在庫データで検証してまとめています↓" },
];

export function buildTg(slug, seq) {
  const a = TG_ARTICLES.find((x) => x.slug === slug);
  if (!a) return null;
  return { text: `${a.hook}\n${a.cta}`, linkUrl: buildTgUrl(slug, seq) };
}

// ─────────── T3（セール速報）— 第98便 タスクA。**CSO 最終裁定まで稼働しない** ───────────
/**
 * 【位置づけ】T3 は **FANZA API の実測値の事実通知**であり、訴求文の生成ではない。
 * 本ブロックが作るのは **数値を差し込むだけのテンプレート**で、
 * **形容・評価・推奨の語を一切含めない**（`T3_BANNED_WORDS` が機械的に拒否する）。
 *
 * 【§13 の T6TV 保留との違い（CSO 判断材料・CTO は可否を決めない）】
 *   - T6TV … `al.*.dmm` への**直リンク**＝押されれば即成果。**訴求文を量産する**構造。
 *   - T3   … リンク先は**自サイト `/sale`**。**直リンクではない**。本文は API 実測値の転記のみ。
 *   **ただし `/sale` の先には af_id 004 のアフィリエイトリンクが 240本ある。**
 *   **「収益導線ではない」とは書かない。** 1クッション挟まるという違いに留まる。
 *
 * 【時限性】実測（§5-4 / 第96便補遺）: 50%OFF ≈3日 / ブランドストア30%OFF ≈7日 /
 * **日替わりセール★ は当日 23:59:59 JST 終了**。**当日終了のものは承認待ちの間に期限が切れる。**
 * これが自動投稿を検討する理由だが、**採否は CSO が決める。**
 */
export const T3_SALE_URL = "https://app.vodnavi.jp/sale";

/**
 * **形容・評価・推奨の語**。1つでも含まれたら g20 が拒否する。
 * 月次ルーティンの「法務表現一斉パトロール」対象語（絶対 / 最安 / 業界No.1）を含む。
 * **迷ったら足す**——**足しすぎて生成が止まるのは安全側**であり、
 * 通ってしまうより望ましい（§13 の「ガードレールは文言の自然さを検査しない」の教訓）。
 */
export const T3_BANNED_WORDS = [
  "絶対", "最安", "業界No.1", "業界no.1", "お得", "おトク", "激安", "破格", "格安",
  "見逃せない", "見逃さないで", "今すぐ", "急いで", "急げ", "お早めに", "お見逃しなく",
  "必見", "おすすめ", "オススメ", "神", "ヤバ", "やばい", "爆", "驚き", "衝撃",
  "チャンス", "見どころ", "人気", "話題", "注目", "厳選", "満足", "楽しめ", "おすすめし",
];

/** JST の `M/D HH:mm` 表記（サーバ TZ に依存させない）。 */
export function t3JstLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return null;
  const j = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${j.getUTCMonth() + 1}/${j.getUTCDate()} ${String(j.getUTCHours()).padStart(2, "0")}:${String(j.getUTCMinutes()).padStart(2, "0")}`;
}

/** JST の `YYYY-MM-DD`。 */
export function t3JstDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(+d) ? null : new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * 配信時点で残り何時間か。**当日終了のセールで「あと N 時間」を出すために使う。**
 * 配信時刻（`scheduledUtc`）を基準にする——**生成時刻ではない**。
 * 生成は 14:00、配信は 21:00 で 7時間ずれるため、生成時刻で書くと嘘になる。
 */
export function t3HoursLeft(endsAtIso, scheduledUtc) {
  const end = new Date(endsAtIso), at = new Date(scheduledUtc);
  if (Number.isNaN(+end) || Number.isNaN(+at)) return null;
  return Math.floor((end.getTime() - at.getTime()) / 3600000);
}

/**
 * **数値固定テンプレート**（第98便 タスクA(3)）。
 *
 * 差し込むのは **名称 / 割引率 / 期限 / 件数 / 代表作品 / `/sale` リンク** のみ。
 * **文の骨格は定数で、可変部はすべて `material` 由来の数値・文字列**である。
 * **`material` は `VODNAVI_NEW_CAMPAIGN` の出力をそのまま渡す**（人が値を打ち直さない）。
 *
 * 【件数の但し書きを本文に入れる理由】`items` は **rank 走査（4フロア×4ページ＝上位400）で
 * 見えた件数**であって全対象数ではない（§5-4(6) の悉皆値とは母集団が違う・§15-2 軸5）。
 * **「N件」とだけ書くと総数と誤読される**ため、必ず「確認できた範囲で」を添える。
 */
export function buildT3(material, scheduledUtc) {
  const { campaign_title, items, ends_at, max_discount, samples } = material ?? {};
  if (!campaign_title || !ends_at || typeof items !== "number") return null;

  const endLabel = t3JstLabel(ends_at);
  if (!endLabel) return null;

  const left = t3HoursLeft(ends_at, scheduledUtc);
  const sameDay = t3JstDate(ends_at) === t3JstDate(scheduledUtc);

  // 期限の書き方。**当日終了なら残り時間を明記する**（g19 が機械的に要求する）。
  const deadline = sameDay
    ? `${endLabel}まで（配信時点で残り約${left}時間）`
    : `${endLabel}まで`;

  const rate = typeof max_discount === "number" ? `最大${max_discount}%OFF` : null;
  const sample = samples?.[0]?.content_id
    ? `例: ${samples[0].content_id}（${samples[0].price}円 / 通常${samples[0].list_price}円）`
    : null;

  const lines = [
    `FANZAで「${campaign_title}」を確認しました。`,
    [rate, `${deadline}`].filter(Boolean).join(" / "),
    `確認できた範囲で${items}件。`,
    sample,
    "",
    "対象作品の一覧はこちら↓",
    "#PR",
  ].filter((x) => x !== null);

  return { text: lines.join("\n"), linkUrl: T3_SALE_URL, kind: "T3", material };
}

/**
 * 既存行の投稿文から `campaign_title` を復元する（`g21` の入力用）。
 *
 * 【なぜ本文から取るか】Airtable の行に「どのキャンペーンを扱ったか」を持つ列は無い。
 * **列を増やすのは Airtable のスキーマ変更＝CSO 枠**であり、本文で足りるなら足す必要がない。
 * `buildT3` の1行目は `FANZAで「{名称}」を確認しました。` に固定されているため復元できる。
 *
 * **テンプレートの1行目を変えるときは、ここも併せて変えること。**
 * 変え忘れると `g21` が既報告を見落とし、**同じキャンペーンを二度投稿する。**
 */
export function extractCampaignTitle(text) {
  const m = String(text ?? "").match(/^FANZAで「(.+?)」を確認しました。/m);
  return m ? m[1] : null;
}

/** 同一記事の再登場間隔の下限（**実測の最短 4日**を基準とする。最長は9日）。 */
export const TG_MIN_REAPPEAR_DAYS = 4;
/** 既存 TG の slug 別 最終使用日（実測 2026-08-13）。 */
export const TG_LAST_USED = {
  "fanza-first-guide": "2026-08-04", "fanza-tv-free-trial": "2026-07-22",
  "fanza-kaiyaku": "2026-08-06", "fanza-payment-methods": "2026-08-09",
  "fanza-payment-statement": "2026-08-10", "fanza-tv-guide": "2026-08-12",
  "fanza-tv-review": "2026-08-14",
  // fanza-subscription-vs-single-purchase は TG 未使用
};

/**
 * ローテーション: **直前2件と同じ ID を使わない**。VR 作品は **X4 固定**
 * （X1/X2 の「単体作品」表現が VR と噛み合わないため）。
 */
export function pickTemplate(c, recentIds) {
  if (isVR(c)) return "X4";
  const order = ["X1", "X2", "X3", "X5"];
  const banned = new Set(recentIds.slice(-2));
  const usable = order.filter((id) => !banned.has(id));
  const pool = usable.length > 0 ? usable : order;
  // 直前2件を避けたうえで、**最も長く使っていないもの**を選ぶ（LRU）。
  // 単純な先頭一致だと X1/X2 だけが循環し、表層の差分が作れないため。
  const lastUsedAt = (id) => {
    const i = recentIds.lastIndexOf(id);
    return i === -1 ? -1 : i;
  };
  return pool.slice().sort((a, b) => lastUsedAt(a) - lastUsedAt(b))[0];
}

// ───────────────────────────── ガードレール10件（タスクC） ─────────────────────────────

const AFFILIATE_HOSTS = /(^|\.)al\.(dmm|fanza)\.co\.jp$/i;

/** 各ガードは `{ok, ng}` を返す純関数。副作用なし。 */
export const GUARDS = {
  g1_afid_006: (p) => {
    const m = String(p.linkUrl ?? "").match(/[?&]af_id=([^&]+)/);
    if (!m) return { ok: true, ng: null }; // アフィリエイトURLでなければ対象外
    return m[1] === "moterist-006"
      ? { ok: true, ng: null }
      : { ok: false, ng: `af_id が moterist-006 でない: ${m[1]}` };
  },
  g2_no_99x: (p) => {
    const hit = `${p.text ?? ""}\n${p.linkUrl ?? ""}`.match(/moterist-99[0-9]/);
    return hit ? { ok: false, ng: `API専用 af_id を検出: ${hit[0]}` } : { ok: true, ng: null };
  },
  /** 【T1改のみ】リンク先が works 詳細であること。T5/TG は g14 が種別別に検査する。 */
  g3_link_is_works: (p) => {
    if (/al\.(dmm|fanza)\.co\.jp/i.test(p.text ?? "")) return { ok: false, ng: "本文にアフィリエイトURLが直書きされている" };
    if (p.kind && p.kind !== "T1") return { ok: true, ng: null };
    let u;
    try { u = new URL(p.linkUrl); } catch { return { ok: false, ng: `URL として解析できない: ${p.linkUrl}` }; }
    if (AFFILIATE_HOSTS.test(u.host)) return { ok: true, ng: null }; // 直リンク投稿は g4 で #PR を要求
    if (u.host !== "app.vodnavi.jp") return { ok: false, ng: `想定外のホスト: ${u.host}` };
    if (!/^\/works\/[a-z]+\/[a-z0-9]+$/.test(u.pathname)) return { ok: false, ng: `works 詳細のパスでない: ${u.pathname}` };
    return { ok: true, ng: null };
  },
  g4_pr_when_affiliate: (p) => {
    let isAff = false;
    try { isAff = AFFILIATE_HOSTS.test(new URL(p.linkUrl).host); } catch { isAff = false; }
    if (!isAff) return { ok: true, ng: null }; // 自サイトリンクは #PR 不要（既存63件の実測に一致）
    return /#PR/.test(p.text ?? "") ? { ok: true, ng: null } : { ok: false, ng: "アフィリエイト直リンクに #PR がない" };
  },
  /**
   * g5 は **T1改（自動化対象）のみ**に適用する。既存 T3セール投稿
   * （「30%OFF」「最大80%OFF」の実績あり）へは**遡及適用しない**（CSO裁定・確定）。
   */
  g5_no_discount_amount: (p) => {
    if (p.kind !== "T1") return { ok: true, ng: null };
    const t = p.text ?? "";
    if (/[0-9０-９]{1,3}\s*[%％]\s*OFF/i.test(t)) return { ok: false, ng: "%OFF の記載" };
    if (/クーポン/.test(t)) return { ok: false, ng: "クーポンの記載" };
    return { ok: true, ng: null };
  },
  g6_one_affiliate_per_day: (p, ctx) => {
    let isAff = false;
    try { isAff = AFFILIATE_HOSTS.test(new URL(p.linkUrl).host); } catch { isAff = false; }
    if (!isAff) return { ok: true, ng: null };
    const day = jstDate(p.scheduledUtc);
    const n = (ctx?.affiliateCountByJstDate?.[day] ?? 0);
    return n <= 1 ? { ok: true, ng: null } : { ok: false, ng: `${day} のアフィリエイト直リンクが ${n} 件` };
  },
  /** 文字数は **本文 + リンクURL**（実際に投稿される形）で数える。 */
  g7_length: (p) => {
    const w = weightedLength(postedText(p));
    return w <= X_WEIGHTED_LIMIT
      ? { ok: true, ng: null }
      : { ok: false, ng: `重み付き ${w} > 上限 ${X_WEIGHTED_LIMIT}` };
  },
  /**
   * 【CSO確定 2026-08-13】投稿時刻は **21:00〜23:00 JST**。
   * 旧設定 20:45〜24:00 を実測（21:00 が29件 / 22:30 が24件 / 範囲 21:00〜23:00）に合わせて狭めた。
   * **21:00 / 22:30 への固定ではなく範囲**とする。
   */
  g8_time_window: (p) => {
    const d = new Date(p.scheduledUtc);
    if (Number.isNaN(+d)) return { ok: false, ng: "予約日時が不正" };
    const jstMin = ((d.getUTCHours() + 9) % 24) * 60 + d.getUTCMinutes();
    const lo = 21 * 60, hi = 23 * 60;
    const hhmm = `${String(Math.floor(jstMin / 60)).padStart(2, "0")}:${String(jstMin % 60).padStart(2, "0")}`;
    return jstMin >= lo && jstMin <= hi
      ? { ok: true, ng: null }
      : { ok: false, ng: `JST ${hhmm} は 21:00〜23:00 の外` };
  },
  /** 【最重要】UTC 格納の検証。9時間ずれると 22:30 のつもりが翌 07:30 になる。 */
  g9_utc_iso: (p) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(String(p.scheduledUtc)))
      return { ok: false, ng: `ISO が Z 終端でない: ${p.scheduledUtc}` };
    const want = p.intendedJst; // "2026-08-17 21:00"
    if (!want) return { ok: false, ng: "intendedJst が未指定（照合できない）" };
    return jstString(p.scheduledUtc) === want
      ? { ok: true, ng: null }
      : { ok: false, ng: `JST 換算 ${jstString(p.scheduledUtc)} が意図 ${want} と不一致` };
  },
  /**
   * 【CSO裁定 2026-08-13・厳守】1日2件のうち**作品紹介は1件まで**。
   * アフィリエイト色を薄めるための意図的な設計であり、自動化で変更してはならない。
   * 実測の裏付け: 既存63件の対象35日で **作品紹介が2件以上の日は 0日**。
   */
  g11_one_work_intro_per_day: (p, ctx) => {
    if (postKind(p.linkUrl) !== "workIntro") return { ok: true, ng: null };
    const day = jstDate(p.scheduledUtc);
    const n = ctx?.workIntroCountByJstDate?.[day] ?? 0;
    return n <= 1 ? { ok: true, ng: null } : { ok: false, ng: `${day} の作品紹介が ${n} 件（上限1件）` };
  },
  /** 既出女優の再登場を禁止（CSO裁定 2026-08-13。分類C を増やさないため機械化する）。 */
  g12_actress_not_recent: (p) => {
    if (postKind(p.linkUrl) !== "workIntro") return { ok: true, ng: null };
    const ref = intervalBaseDate(p);
    const dup = (p.actressNames ?? []).filter((n) => hasPostedActress([n], ref, ACTRESS_EXCLUDE_DAYS, p.id));
    return dup.length === 0
      ? { ok: true, ng: null }
      : { ok: false, ng: `${ACTRESS_EXCLUDE_DAYS}日以内に登場済みの女優: ${dup.join("・")}` };
  },
  /**
   * 【全種別】投稿文に URL を含めない。
   * 第22便で検出した defect（既存63件は `投稿文` に URL を入れず `リンクURL` に分離しており、
   * 本文に埋めると**配信時に URL が二重になる**）の再発防止。
   */
  g13_no_url_in_body: (p) =>
    /https?:\/\//.test(p.text ?? "")
      ? { ok: false, ng: "投稿文に URL が埋め込まれている（リンクURL フィールドに分離すること）" }
      : { ok: true, ng: null },
  /**
   * 【種別別】リンク先の検査。T1改=works / T5=/lp / TG=/articles/{slug}。
   *
   * 【2026-08-13 修正】種別判定より先に `new URL()` を実行していたため、
   * **リンクを持たない種別（小ネタ）で必ず誤発火**していた（実測で検出）。
   * 既存63件のうち **リンクなしは10件**あり、この種別は正当に `linkUrl` を持たない。
   * → **種別の判定を先に行い、T5/TG 以外は URL 解析そのものを行わない**。
   */
  g14_link_target_by_kind: (p) => {
    if (!p.kind) return { ok: true, ng: null };
    // 【2026-08-23・第98便】T3 を追加。**第94便で「T3 のリンク先は現在まったく検査されて
    // いない＝誤りも検出しない」と実測で判明した箇所の修正である。**
    // T3 のリンク先は `/sale` 固定。**クエリ（UTM 等）は許容し origin+pathname で判定する。**
    if (p.kind === "T3") {
      let t;
      try { t = new URL(p.linkUrl); } catch { return { ok: false, ng: `URL として解析できない: ${p.linkUrl}` }; }
      return t.origin + t.pathname === T3_SALE_URL
        ? { ok: true, ng: null }
        : { ok: false, ng: `T3 のリンク先は ${T3_SALE_URL} 固定: ${p.linkUrl}` };
    }
    if (p.kind !== "T5" && p.kind !== "TG") return { ok: true, ng: null };
    let u;
    try { u = new URL(p.linkUrl); } catch { return { ok: false, ng: `URL として解析できない: ${p.linkUrl}` }; }
    if (p.kind === "T5")
      return u.origin + u.pathname === T5_LP_URL ? { ok: true, ng: null } : { ok: false, ng: `T5 のリンク先は ${T5_LP_URL} 固定: ${p.linkUrl}` };
    if (p.kind === "TG") {
      const m = u.pathname.match(/^\/articles\/([a-z0-9-]+)$/);
      if (u.host !== "app.vodnavi.jp" || !m) return { ok: false, ng: `TG のリンク先が /articles/{slug} でない: ${p.linkUrl}` };
      return TG_ARTICLES.some((a) => a.slug === m[1]) ? { ok: true, ng: null } : { ok: false, ng: `公開記事8本に無い slug: ${m[1]}` };
    }
    return { ok: true, ng: null }; // T1改 は g3 が検査済み
  },
  /** 【TG】UTM の形式検査。`utm_campaign` は slug から機械的に導出されていること。 */
  g15_utm_format: (p) => {
    if (p.kind !== "TG") return { ok: true, ng: null };
    let u;
    try { u = new URL(p.linkUrl); } catch { return { ok: false, ng: "URL 解析不可" }; }
    const q = u.searchParams;
    const slug = u.pathname.replace("/articles/", "");
    if (q.get("utm_source") !== TG_UTM_SOURCE) return { ok: false, ng: `utm_source が ${TG_UTM_SOURCE} でない: ${q.get("utm_source")}` };
    if (q.get("utm_medium") !== TG_UTM_MEDIUM) return { ok: false, ng: `utm_medium が ${TG_UTM_MEDIUM} でない: ${q.get("utm_medium")}` };
    const want = slug.replace(/-/g, "_");
    if (q.get("utm_campaign") !== want) return { ok: false, ng: `utm_campaign が slug と不一致: ${q.get("utm_campaign")} ≠ ${want}` };
    if (!/^tg\d+$/.test(q.get("utm_content") ?? "")) return { ok: false, ng: `utm_content が tg{連番} でない: ${q.get("utm_content")}` };
    return { ok: true, ng: null };
  },
  /** 【TG】同一記事の再登場間隔（実測の最短 4日を下限とする）。 */
  g16_article_interval: (p) => {
    if (p.kind !== "TG") return { ok: true, ng: null };
    let slug;
    try { slug = new URL(p.linkUrl).pathname.replace("/articles/", ""); } catch { return { ok: false, ng: "URL 解析不可" }; }
    const last = TG_LAST_USED[slug];
    if (!last) return { ok: true, ng: null }; // TG 未使用の記事
    const ref = intervalBaseDate(p);
    const diff = (new Date(`${ref}T00:00:00+09:00`) - new Date(`${last}T00:00:00+09:00`)) / 86400000;
    return diff >= TG_MIN_REAPPEAR_DAYS
      ? { ok: true, ng: null }
      : { ok: false, ng: `${slug} の前回使用 ${last} から ${Math.round(diff)}日（下限 ${TG_MIN_REAPPEAR_DAYS}日）` };
  },
  // ───────── T3（セール速報）専用 4件・第98便 タスクA(2)(3)(4) ─────────
  //
  // 【既存ガードで既に担保されているもの＝ここで重複させない】
  //   - 配信枠 21:00〜23:00 JST … **g8 が全種別に適用済**
  //   - 重み 280 以下           … **g7 が全種別に適用済**
  //   - リンク先の実在（最終200）… **g17（ASYNC_CHECKS）が own host に適用済**。
  //     `/sale` は `app.vodnavi.jp` なので**自動的に最終 200 が要求される**
  //   - 本文への URL 直書き禁止 … g13 ／ 99x の混入禁止 … g2
  // **重複した検査を足さない**——同じことを2箇所に書くと、片方だけ直したときに矛盾する。

  /**
   * 【T3】1日1件まで。
   *
   * 【なぜ専用ガードが要るか】`/sale` は **`al.*` ホストでないため g6（アフィリエイト直リンク
   * 1日1件）に載らず**、**`/works/` でないため g11（作品紹介1日1件）にも載らない**
   * （第94便で実測・確認済み）。**T3 は既存の枠をどちらも消費しない。**
   * **枠を消費しないということは、上限が無いということでもある。** ここで明示的に絞る。
   */
  g18_t3_one_per_day: (p, ctx) => {
    if (p.kind !== "T3") return { ok: true, ng: null };
    const day = jstDate(p.scheduledUtc);
    const n = ctx?.t3CountByJstDate?.[day] ?? 0;
    return n <= 1 ? { ok: true, ng: null } : { ok: false, ng: `${day} の T3 が ${n} 件（上限1件）` };
  },

  /**
   * 【T3】期限の扱い。**配信時点で既に切れているものは投稿しない。**
   *
   * 生成（cron 06:00 / 14:00）から配信（21:00〜23:00）まで最大15時間空くため、
   * **生成時点で有効でも配信時点で切れていることがある**（日替わりセール★は当日
   * 23:59:59 JST 終了で、23:00 配信なら残り約1時間）。
   * **判定は必ず `scheduledUtc` を基準に行う。生成時刻ではない。**
   *
   * **当日終了のセールは禁止しない**——時限性こそが T3 の存在理由であるため。
   * **代わりに「配信時点で残り約N時間」の明記を本文に要求する。**
   */
  g19_t3_deadline: (p) => {
    if (p.kind !== "T3") return { ok: true, ng: null };
    const endsAt = p.material?.ends_at;
    if (!endsAt) return { ok: false, ng: "material.ends_at が無い（期限を検証できない）" };
    const left = t3HoursLeft(endsAt, p.scheduledUtc);
    if (left === null) return { ok: false, ng: `期限または予約日時が不正: ${endsAt} / ${p.scheduledUtc}` };
    if (left <= 0) return { ok: false, ng: `配信時点で期限切れ（残り ${left} 時間）: ${endsAt}` };
    const sameDay = t3JstDate(endsAt) === t3JstDate(p.scheduledUtc);
    if (!sameDay) return { ok: true, ng: null }; // 翌日以降の期限は残り時間の明記を要さない
    return /残り約\d+時間/.test(p.text ?? "")
      ? { ok: true, ng: null }
      : { ok: false, ng: "当日期限なのに本文へ残り時間が明記されていない" };
  },

  /**
   * 【T3】数値固定テンプレートへの適合。
   *
   * **本文中のすべての数値が `material` 由来であること**を検査する。
   * 目的は**手打ちや LLM による数値の混入を機械的に塞ぐこと**——
   * §13 の「ガードレールは文言の自然さを検査しない」（VRVR作品が10ガードを通過した）
   * と同じ失敗を、**数値については起こさない**ようにする。
   */
  g20_t3_template: (p) => {
    if (p.kind !== "T3") return { ok: true, ng: null };
    const t = p.text ?? "";
    const m = p.material;
    if (!m) return { ok: false, ng: "material が無い（数値を照合できない）" };
    if (!/#PR/.test(t)) return { ok: false, ng: "#PR がない" };

    const banned = T3_BANNED_WORDS.filter((w) => t.includes(w));
    if (banned.length > 0) return { ok: false, ng: `形容・評価・推奨の語: ${banned.join("・")}` };

    if (!t.includes(m.campaign_title)) return { ok: false, ng: `キャンペーン名が本文に無い: ${m.campaign_title}` };

    // 本文に現れる整数を集め、material から説明できないものが残らないことを確認する。
    const allowed = new Set();
    const add = (v) => { if (v !== null && v !== undefined) allowed.add(String(v)); };
    add(m.items); add(m.max_discount);
    for (const sm of m.samples ?? []) { add(sm.price); add(sm.list_price); }
    add(t3HoursLeft(m.ends_at, p.scheduledUtc));
    for (const n of (t3JstLabel(m.ends_at) ?? "").match(/\d+/g) ?? []) allowed.add(String(Number(n)));

    // **content_id を先に取り除く。** 品番は `125umd00960` のように数字を含み、
    // そのまま走査すると `125` / `00960` が「説明できない数値」として誤検出される
    // （2026-08-23 の実材料 `125umd00960` で実際に発生した）。
    // **content_id は material 由来なので、文字列ごと除外するのが正しい**——
    // 桁を allowed に足すと、無関係な 125 も通ってしまう。
    let scan = t;
    for (const sm of m.samples ?? []) {
      if (sm.content_id) scan = scan.split(sm.content_id).join("");
    }

    const unexplained = [];
    for (const n of scan.match(/\d+/g) ?? []) if (!allowed.has(String(Number(n)))) unexplained.push(n);
    if (unexplained.length > 0)
      return { ok: false, ng: `material から説明できない数値: ${unexplained.join("・")}` };

    // 件数は総数と誤読されるため但し書きを必須にする（§15-2 軸5）。
    if (!t.includes("確認できた範囲で"))
      return { ok: false, ng: "件数の但し書き（確認できた範囲で）が無い" };

    return { ok: true, ng: null };
  },

  /**
   * 【T3】再報告の重複除外（第98便 タスクA(4)）。
   *
   * 【なぜ要るか・第96便補遺の実測】差分検知は **「当日の最終スナップショット vs 前日の
   * 最終スナップショット」**を比較する。**基準が前日で固定されているため、06:00 で新規と
   * 判定されたキャンペーンは 14:00 の実行でも再び新規として報告される。**
   * **検知が2回出るのは仕様であり、投稿を2回出してよい理由にはならない。**
   *
   * `ctx.postedCampaignTitles` は **既存 Airtable 行が扱った `campaign_title` の集合**。
   * **名称の同一性で判定する**——`items` や期限は走査のたびに変わるため鍵にできない。
   */
  g21_t3_not_reported: (p, ctx) => {
    if (p.kind !== "T3") return { ok: true, ng: null };
    const title = p.material?.campaign_title;
    if (!title) return { ok: false, ng: "material.campaign_title が無い" };
    return ctx?.postedCampaignTitles?.has?.(title)
      ? { ok: false, ng: `同名のキャンペーンを既に投稿済み: ${title}` }
      : { ok: true, ng: null };
  },

  /** 品番のラウンドトリップ検証（変換ロジックの誤りを検知する）。 */
  g10_hinban_roundtrip: (p) => {
    if (p.kind && p.kind !== "T1") return { ok: true, ng: null }; // 品番を持つのは T1改 のみ
    if (!p.contentId || !p.hinban) return { ok: false, ng: "contentId / hinban が欠落" };
    if (!isHinbanVerifiable(p.contentId)) return { ok: false, ng: `有効桁3桁未満で表記を検証できない: ${p.contentId}` };
    const back = fromHinban(p.hinban, numericPrefixOf(p.contentId));
    if (back !== p.contentId) return { ok: false, ng: `ラウンドトリップ不一致: ${p.hinban} → ${back} ≠ ${p.contentId}` };
    if (!new RegExp(p.hinban.replace("-", "")).test((p.text ?? "").replace("-", "") ) && !(p.text ?? "").includes(p.hinban))
      return { ok: false, ng: `本文に品番 ${p.hinban} が含まれない` };
    return { ok: true, ng: null };
  },
};

/**
 * 「間隔」を測る基準日。**掲出される日（予約日時）を優先**し、無ければ生成日を使う。
 *
 * 【2026-08-13 修正】旧実装は生成日を優先していたため、**8/14 に使った記事を 8/18 に
 * 再掲する（＝4日空く）ケースを、生成日 8/17 基準で「3日」と判定して誤って拒否**した。
 * 間隔は**実際に掲出される日**で測るのが正しい。g12（女優）・g16（記事）で共通に使う。
 *
 * 【CSO への申し送り】この修正により g12 の判定も掲出日基準になる。
 * 例: 瀬戸環奈（最終 2026-07-14）は **生成日 8/13 基準では30日でちょうど除外**されるが、
 * **掲出日 8/18 基準では35日となり除外されない**。30日窓の運用としては後者が正しいが、
 * CSO が 8/13 に「約1ヶ月での再登場は反復に映る」として除外を指示した意図とは差が出る。
 * **窓を35日以上にするかは CSO 裁定事項**。
 */
export function intervalBaseDate(p) {
  if (p.scheduledUtc) { try { return jstDate(p.scheduledUtc); } catch { /* fallthrough */ } }
  return p.referenceJstDate;
}

export function jstString(utcIso) {
  const d = new Date(utcIso);
  const j = new Date(+d + 9 * 3600e3);
  const p = (n) => String(n).padStart(2, "0");
  return `${j.getUTCFullYear()}-${p(j.getUTCMonth() + 1)}-${p(j.getUTCDate())} ${p(j.getUTCHours())}:${p(j.getUTCMinutes())}`;
}
export const jstDate = (utcIso) => jstString(utcIso).slice(0, 10);
/** JST の "YYYY-MM-DD HH:mm" → UTC の ISO（Z 終端）。 */
export function jstToUtcIso(jst) {
  const m = String(jst).match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h - 9, mi, 0)).toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

/** 全ガードを実行。**1件でも NG なら全体を中断**する。 */
/**
 * 【2026-08-14 新設・g17】リンク先が実在することを検査する。
 *
 * 【なぜ必要か】`g3` は **URL のパス形式しか検査していなかった**。そのため
 * `works/videoa/ebwh00359`（**FANZA API が `result_count=0` を返す＝作品が取得できない**）が
 * **16ガードすべてを通過し、`承認済`・8/17 21:00 配信予定まで到達した**（第30便で本番 HTTP 404 を実測）。
 * **行のデータだけを見る検査では、リンク先の実在は分からない。**
 *
 * 【判定】
 * - **自サイト（app.vodnavi.jp）はリダイレクトを追って最終 200 を要求する。** works 詳細は
 *   `getWork()` 失敗時に `notFound()`＝404 を返すため、404 はここで確実に捕まる。
 * - **アフィリエイト直リンクは 2xx / 3xx を許容する**（`al.fanza.co.jp` / `al.dmm.co.jp` は
 *   正常時に **302** を返すことを実測済み。追跡すると遮断ドメインへ到達しうるため追わない）。
 */
export const OWN_HOST = "app.vodnavi.jp";

export async function checkLinkReachable(linkUrl, fetchImpl = fetch) {
  if (!linkUrl) return { ok: true, ng: null, status: null }; // リンクなし種別は対象外
  let u;
  try { u = new URL(linkUrl); } catch { return { ok: false, ng: `URL として解析できない: ${linkUrl}`, status: null }; }
  const own = u.host === OWN_HOST;
  try {
    const r = await fetchImpl(linkUrl, { redirect: own ? "follow" : "manual" });
    const s = r.status;
    if (own) {
      return s === 200
        ? { ok: true, ng: null, status: s }
        : { ok: false, ng: `自サイトのリンク先が HTTP ${s}（200 でない）: ${u.pathname}`, status: s };
    }
    return s < 400
      ? { ok: true, ng: null, status: s }
      : { ok: false, ng: `外部リンク先が HTTP ${s}: ${u.host}`, status: s };
  } catch (e) {
    return { ok: false, ng: `取得に失敗: ${String(e).slice(0, 80)}`, status: null };
  }
}

/** 非同期の検査。`GUARDS` は同期関数の集合という契約を壊さないため別立てにしている。 */
export const ASYNC_CHECKS = { g17_link_reachable: (p) => checkLinkReachable(p.linkUrl) };

/**
 * **書き込み前と、承認・予約日時の設定前の両方で呼ぶこと。**
 * 書き込みから配信までに時間が空くため、**その間にリンク先が失われうる**
 * （B8 は 7/19 作成 → 8/17 配信予定で、その間に FANZA 側から取得できなくなった）。
 */
export async function runGuardsAsync(posts, existing = []) {
  const sync = runGuards(posts, existing);
  const failures = [...sync.failures];
  for (const p of posts) {
    for (const [id, fn] of Object.entries(ASYNC_CHECKS)) {
      const r = await fn(p);
      if (!r.ok) failures.push({ post: p.name ?? p.contentId, guard: id, ng: r.ng });
    }
  }
  return { pass: failures.length === 0, failures };
}

export function runGuards(posts, existing = []) {
  const affiliateCountByJstDate = {};
  const workIntroCountByJstDate = {};
  const t3CountByJstDate = {};
  // 既存行（Airtable に既にある同日の投稿）も件数に含める。
  for (const p of [...existing, ...posts]) {
    const kind = postKind(p.linkUrl);
    let d;
    try { d = jstDate(p.scheduledUtc); } catch { continue; }
    if (kind === "affiliate") affiliateCountByJstDate[d] = (affiliateCountByJstDate[d] ?? 0) + 1;
    if (kind === "workIntro") workIntroCountByJstDate[d] = (workIntroCountByJstDate[d] ?? 0) + 1;
    // T3 は `/sale` 宛で `al.*` でも `/works/` でもないため postKind では数えられない。
    // **種別そのもの、またはリンク先が /sale であることで数える**——既存行は `kind` を
    // 持たない場合があるため両方を見る。
    let isT3 = p.kind === "T3";
    if (!isT3 && p.linkUrl) {
      try { const u = new URL(p.linkUrl); isT3 = u.origin + u.pathname === T3_SALE_URL; } catch { /* URL でなければ T3 ではない */ }
    }
    if (isT3) t3CountByJstDate[d] = (t3CountByJstDate[d] ?? 0) + 1;
  }
  // 既に投稿・予約済みの T3 が扱ったキャンペーン名（g21 が参照）。
  // **posts 側は含めない**——同一バッチ内の自分自身を「既報告」と誤判定するため。
  const postedCampaignTitles = new Set();
  for (const p of existing) {
    // 優先順: 明示の material → 明示の列 → **本文からの復元**。
    // Airtable の行は前2つを持たないため、実運用で効くのは3番目である。
    const t = p.material?.campaign_title ?? p.campaignTitle ?? extractCampaignTitle(p.text);
    if (t) postedCampaignTitles.add(t);
  }
  const ctx = { affiliateCountByJstDate, workIntroCountByJstDate, t3CountByJstDate, postedCampaignTitles };
  const failures = [];
  for (const p of posts) {
    for (const [id, fn] of Object.entries(GUARDS)) {
      const r = fn(p, ctx);
      if (!r.ok) failures.push({ post: p.name ?? p.contentId, guard: id, ng: r.ng });
    }
  }
  return { pass: failures.length === 0, failures };
}
