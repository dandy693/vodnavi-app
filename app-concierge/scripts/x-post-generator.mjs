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
 * 過去に X で登場した女優（既存63件から抽出・2026-08-13 実測）。
 * **直近に登場した女優を再び出さない**ための除外リスト。
 * 現在アカウントの履歴は約37日（2026-07-11 開始）のため、実質「直近37日」に相当する。
 * 窓の長さ（何日前まで遡って除外するか）は CSO 裁定事項。
 */
export const ACTRESS_LAST_POSTED = {
  "白石るな": "2026-07-13", "瀬戸環奈": "2026-07-14", "花宮きょうこ": "2026-07-16",
  "由良かな": "2026-07-16", "冬愛ことね": "2026-07-16", "福田ゆあ": "2026-07-18",
  "九野ひなの": "2026-07-20", "金松季歩": "2026-07-20", "桜空もも": "2026-07-20",
  "伊藤舞雪": "2026-07-20", "宮下玲奈": "2026-07-23", "博多彩葉": "2026-07-24",
  "乙アリス": "2026-07-29", "小沢菜穂": "2026-08-03", "宮上唯依花": "2026-08-04",
  "今井美優": "2026-08-05", "叶愛": "2026-08-06", "沙月恵奈": "2026-08-07",
  "松本いちか": "2026-08-08", "渚みつき": "2026-08-08", "尾崎えりか": "2026-08-09",
  "桜坂ふうか": "2026-08-10", "石田紗季": "2026-08-11", "逢見リカ": "2026-08-12",
  "美乃すずめ": "2026-08-13", "椿りか": "2026-08-15", "流川莉央": "2026-08-14",
  "七瀬アリス": "2026-08-15", "春日々音": "2026-08-16", "園田茉莉華": "2026-08-17",
};

/**
 * 未配信（ストック/承認済）の行に由来する登録の**出所**。
 *
 * 【2026-08-13 に検出した欠陥】`園田茉莉華` を「未配信ストックのため最も遅い予定日で
 * 保守的に扱う」として `2026-08-16` で登録していたため、**B8 を 8/17 に予約しようとした際、
 * B8 が自分自身の登録値で g12 にブロックされた**。
 *
 * **実測（2026-08-13）**: `園田茉莉華` / `EBWH-359` を含む行は **B8 の1件のみ・ステータス=ストック**。
 * **配信済みの投稿は 0 件**。すなわち登録値は「存在しない配信」を記録した誤りであった。
 *
 * → 対処は**ガードを緩めることではない**。登録日を実際の予定日（`2026-08-17`）に正し、
 *   **その行自身を検査するときだけ自分の登録で止めない**ようにする。
 *   他の行から見れば `園田茉莉華` は 8/17 に登場するため、**通常どおりブロックされる**。
 *
 * ※ B8 の配信後（8/17 以降）はこの登録は通常の履歴となるため、本エントリは削除してよい。
 */
export const ACTRESS_ENTRY_SOURCE = {
  "園田茉莉華": "recfiiHpFmz8h4wZC", // B8（2026-08-13 時点で未配信）
};

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
  // 既存行（Airtable に既にある同日の投稿）も件数に含める。
  for (const p of [...existing, ...posts]) {
    const kind = postKind(p.linkUrl);
    let d;
    try { d = jstDate(p.scheduledUtc); } catch { continue; }
    if (kind === "affiliate") affiliateCountByJstDate[d] = (affiliateCountByJstDate[d] ?? 0) + 1;
    if (kind === "workIntro") workIntroCountByJstDate[d] = (workIntroCountByJstDate[d] ?? 0) + 1;
  }
  const ctx = { affiliateCountByJstDate, workIntroCountByJstDate };
  const failures = [];
  for (const p of posts) {
    for (const [id, fn] of Object.entries(GUARDS)) {
      const r = fn(p, ctx);
      if (!r.ok) failures.push({ post: p.name ?? p.contentId, guard: id, ng: r.ng });
    }
  }
  return { pass: failures.length === 0, failures };
}
