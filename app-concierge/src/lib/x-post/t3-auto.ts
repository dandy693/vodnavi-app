/**
 * T3（セール速報）の自動投稿フロー（第99便 タスクA / CSO裁定(1) 案α＝Vercel cron 内）。
 *
 * **【厳守】初期値は OFF。`T3_AUTO_POST_ENABLED=1` を明示しない限り何も書かない。**
 * **稼働の ON は CSO の最終確認後**であり、本モジュールの存在は稼働を意味しない。
 *
 * **【稼働の先行条件・CSO裁定(1)】**
 *   1. **Make.com のフィルタ修正の完了**（§13-3・現状の実測は `management/_metrics/2026-W34/`
 *      `verify-20260823-2230-bin99h-make-filter.md` を参照。**2026-08-23 時点で未修正**）
 *   2. **専用 PAT（posts のみ・Sensitive ON）の発行と配置**（CSO 作業）
 *
 * 【設計原則】**迷ったら書かない。** T3 を1件落として失うのは1投稿だが、
 * 誤った投稿は配信後に取り消せない（削除しても配信された事実は残る）。
 */
import {
  createPost,
  FIELD,
  getPost,
  isAirtableConfigured,
  listRecentPosts,
  plain,
  STATUS_APPROVED,
  TYPE_T3,
  type AirtableRecord,
} from "./airtable";
// ガードと生成は `scripts/x-post-generator.mjs`（依存ゼロの ESM）を単一の正とする。
// **同じロジックを src 側に写さない**——写した瞬間に二重管理になり、片方だけ直る。
import {
  buildT3,
  jstString,
  runGuardsAsync,
} from "../../../scripts/x-post-generator.mjs";

/** `VODNAVI_NEW_CAMPAIGN` の1件ぶん（cron の検知結果と同じ形）。 */
export interface T3Material {
  campaign_title: string;
  items: number;
  ends_at: string;
  max_discount: number | null;
  samples: { content_id: string; floor_code: string; price: number | null; list_price: number | null }[];
}

export interface T3AutoResult {
  /** 何もしなかった理由（`null` なら書き込みまで到達した）。 */
  skipped: string | null;
  /** ガード違反。**1件でもあれば書き込んでいない。** */
  failures: { post?: string; guard: string; ng: string | null }[];
  /** 書き込めた場合のレコード ID。 */
  recordId: string | null;
  /** 読み戻し検算の結果（6項目）。 */
  verify: { item: string; ok: boolean; detail: string }[];
  /** 予約した JST 時刻。 */
  scheduledJst: string | null;
}

/** 稼働フラグ。**明示的に "1" のときだけ true。** */
export function isT3AutoPostEnabled(): boolean {
  return process.env.T3_AUTO_POST_ENABLED === "1";
}

/**
 * 配信枠の候補（JST）。**`g8` の 21:00〜23:00 の内側**。
 * 既存の運用枠（21:00 / 22:30）を避け、**空いている枠を前から取る**。
 * **どれも埋まっていれば書かない**——枠を無理に作らない。
 */
const SLOT_CANDIDATES_JST = ["22:00", "21:30", "23:00"] as const;

/** `YYYY-MM-DD` + `HH:mm`（JST）→ UTC の ISO（Z 終端）。 */
export function jstToUtcZ(jstDate: string, hhmm: string): string {
  const d = new Date(`${jstDate}T${hhmm}:00+09:00`);
  return d.toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

/** JST の `YYYY-MM-DD`。 */
function jstDateOf(now: Date): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Airtable の行を、ガードが読める形へ均す。 */
function toGuardPost(rec: AirtableRecord): Record<string, unknown> {
  const f = rec.fields;
  return {
    id: rec.id,
    name: (f[FIELD.name] as string) ?? rec.id,
    text: (f[FIELD.text] as string) ?? "",
    linkUrl: (f[FIELD.linkUrl] as string) ?? null,
    type: plain(f[FIELD.type]),
    status: plain(f[FIELD.status]),
    scheduledUtc: (f[FIELD.scheduledUtc] as string) ?? null,
    postId: (f[FIELD.postId] as string) ?? null,
  };
}

/**
 * 検知された新規キャンペーン1件を T3 として投稿予約する。
 *
 * **戻り値の `skipped` が非 null なら、Airtable には一切書いていない。**
 */
export async function autoPostT3(
  material: T3Material,
  now: Date,
  fetchImpl: typeof fetch = fetch,
): Promise<T3AutoResult> {
  const empty: T3AutoResult = {
    skipped: null, failures: [], recordId: null, verify: [], scheduledJst: null,
  };

  // ── 0. 稼働フラグと資格情報 ──────────────────────────────
  if (!isT3AutoPostEnabled()) {
    return { ...empty, skipped: "T3_AUTO_POST_ENABLED が 1 でない（既定は OFF）" };
  }
  if (!isAirtableConfigured()) {
    return { ...empty, skipped: "AIRTABLE_POSTS_PAT が未設定" };
  }

  // ── 1. 既存行の読み込み ─────────────────────────────────
  // **取れなければ書かない。** `g18`（1日1件）と `g21`（同名の再報告）は
  // 既存行が無いと判定できず、**判定できないまま書くと重複・上限超過を検出できない**。
  let existing: Record<string, unknown>[];
  try {
    const since = new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString();
    existing = (await listRecentPosts(since, fetchImpl)).map(toGuardPost);
  } catch (e) {
    return {
      ...empty,
      skipped: `既存行を取得できなかったため書き込まない: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  // ── 2. 空いている配信枠を選ぶ ───────────────────────────
  const jstDate = jstDateOf(now);
  const usedJst = new Set(
    existing
      .map((p) => (p.scheduledUtc ? jstString(p.scheduledUtc as string) : null))
      .filter((x): x is string => Boolean(x)),
  );
  const slot = SLOT_CANDIDATES_JST.find((hhmm) => !usedJst.has(`${jstDate} ${hhmm}`));
  if (!slot) {
    return { ...empty, skipped: `${jstDate} の候補枠（${SLOT_CANDIDATES_JST.join(" / ")}）がすべて埋まっている` };
  }
  const scheduledUtc = jstToUtcZ(jstDate, slot);
  const intendedJst = `${jstDate} ${slot}`;

  // ── 3. 原稿生成 ─────────────────────────────────────────
  const built = buildT3(material, scheduledUtc);
  if (!built) {
    // **推測で埋めない。** 材料が欠けているなら投稿しない。
    return { ...empty, skipped: "材料が不足しており原稿を生成できなかった", scheduledJst: intendedJst };
  }

  const post = {
    ...built,
    scheduledUtc,
    intendedJst,
    name: `T3 ${material.campaign_title} ${jstDate}`,
  };

  // ── 4. ガード21件（同期20 + g17 リンク先実測） ──────────
  const guarded = await runGuardsAsync([post], existing);
  if (!guarded.pass) {
    // **書き込まない。通知のみ。**
    return { ...empty, failures: guarded.failures, skipped: "ガード違反のため書き込まない", scheduledJst: intendedJst };
  }

  // ── 5. 書き込み ─────────────────────────────────────────
  let created: AirtableRecord;
  try {
    created = await createPost(
      { name: post.name, text: post.text, linkUrl: post.linkUrl, scheduledUtc },
      fetchImpl,
    );
  } catch (e) {
    // **再試行しない。** §10: 失敗の戻り値も着地の否定にならない。
    // **書けている可能性があるため、次回の `g21` / `g18` に判断を委ねる。**
    return {
      ...empty,
      skipped: `書き込みが失敗を返した（着地は未確認・再試行しない）: ${e instanceof Error ? e.message : "unknown"}`,
      scheduledJst: intendedJst,
    };
  }

  // ── 6. 読み戻し検算 6項目（§10） ────────────────────────
  const verify = await verifyWrittenPost(created.id, post, scheduledUtc, existing, fetchImpl);

  return {
    skipped: null,
    failures: [],
    recordId: created.id,
    verify,
    scheduledJst: intendedJst,
  };
}

/**
 * 読み戻し検算（第99便 タスクA(2)）。
 *
 * **【厳守】不一致でも取り消さない。** 既に書かれている可能性があり、
 * **削除すると状態がさらに分からなくなる**。**報告して人が見る。**
 */
export async function verifyWrittenPost(
  recordId: string,
  post: { text: string; linkUrl: string },
  scheduledUtc: string,
  existing: Record<string, unknown>[],
  fetchImpl: typeof fetch = fetch,
): Promise<{ item: string; ok: boolean; detail: string }[]> {
  const out: { item: string; ok: boolean; detail: string }[] = [];
  const add = (item: string, ok: boolean, detail: string) => out.push({ item, ok, detail });

  let rec: AirtableRecord;
  try {
    rec = await getPost(recordId, fetchImpl);
  } catch (e) {
    // **「書けていない」か「読めていない」かは区別できない。断定しない。**
    add("1_レコードの存在", false, `読み戻せなかった（書けていないか読めていないかは区別できない）: ${e instanceof Error ? e.message : "unknown"}`);
    return out;
  }
  add("1_レコードの存在", true, recordId);

  const f = rec.fields;
  const gotText = (f[FIELD.text] as string) ?? "";
  add("2_投稿文の完全一致", gotText === post.text, gotText === post.text ? "一致" : `不一致（長さ ${gotText.length} / 期待 ${post.text.length}）`);

  const gotUrl = (f[FIELD.linkUrl] as string) ?? "";
  add("3_リンクURL", gotUrl === post.linkUrl, gotUrl || "(空)");

  const gotStatus = String(plain(f[FIELD.status]) ?? "");
  add("4_ステータス", gotStatus === STATUS_APPROVED, gotStatus || "(空)");

  const gotSched = (f[FIELD.scheduledUtc] as string) ?? "";
  const zOk = /Z$/.test(gotSched);
  const jstOk = zOk && jstString(gotSched) === jstString(scheduledUtc);
  add(
    "5_予約日時（Z終端 + JST換算の一致）",
    zOk && jstOk,
    `${gotSched || "(空)"} → JST ${zOk ? jstString(gotSched) : "?"}（期待 ${jstString(scheduledUtc)}）`,
  );

  const gotType = String(plain(f[FIELD.type]) ?? "");
  add("5b_タイプ", gotType === TYPE_T3, gotType || "(空)");

  // 6: 読み戻した行そのものでガードを再実行する。
  // **書き込み前と後の両方でガードを通す**（既存の契約と同じ考え方）。
  const reread = {
    ...toGuardPost(rec),
    kind: "T3",
    // 本文から復元させるため material は渡さない——**復元経路そのものを検証する。**
  };
  try {
    const again = await runGuardsAsync([reread], existing);
    // g19 / g20 / g21 は material を要求するため、material 無しでは NG になりうる。
    // **ここで見たいのは「書かれた行が g14 / g8 / g9 / g7 / g13 / g2 を満たすか」**なので、
    // material 依存の3件は除いて評価する。
    const materialDependent = new Set(["g19_t3_deadline", "g20_t3_template", "g21_t3_not_reported"]);
    const relevant = again.failures.filter((x: { guard: string }) => !materialDependent.has(x.guard));
    add(
      "6_読み戻した行でガード再実行（material 非依存分）",
      relevant.length === 0,
      relevant.length === 0 ? "PASS" : JSON.stringify(relevant),
    );
  } catch (e) {
    add("6_読み戻した行でガード再実行（material 非依存分）", false, `実行できなかった: ${e instanceof Error ? e.message : "unknown"}`);
  }

  return out;
}
