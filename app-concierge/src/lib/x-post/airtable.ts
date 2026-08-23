/**
 * Airtable `posts` テーブルの最小クライアント（第99便 タスクA(3)）。
 *
 * 【資格情報】`AIRTABLE_POSTS_PAT` を env から読むだけで、**値には一切触れない**
 * （ログにも例外メッセージにも出さない）。CSO 裁定(1) により
 * **posts テーブルのみのスコープを持つ専用 PAT / Sensitive ON** が前提。
 *
 * 【なぜフィールド ID で読み書きするか】列名は Airtable の UI から変更できる。
 * **名前で書くと、改名された瞬間に「書けているのに違う列」という静かな失敗になる。**
 * ID は不変。ID は `scripts/audit-posts.mjs` の実測値と同一。
 *
 * 【権限の限界・§13】**Airtable に行レベル権限は無く、PAT のスコープでは
 * 「書ける値」を制限できない。** write を与えた時点で任意フィールドに任意の値を書ける。
 * **T3 を守るのはガード21件という一層のみ**であり、B2②-b の三層（GRANT なし +
 * RLS `with check` + トリガ）とは保証の強度が異なる。**同じ「自動化」として並べない。**
 */

export const BASE_ID = "app0VKGU2B16qny6c";
export const TABLE_ID = "tblZMqvjtJY8MfaWZ";

/** フィールド ID（`scripts/audit-posts.mjs` と同一の実測値）。 */
export const FIELD = {
  name: "fldSFgqqf40w8D2hQ",        // 名称
  text: "fldFMfnZXxnhSviDr",        // 投稿文
  linkUrl: "fldkk8CfCKXyqPNFO",     // リンクURL
  type: "fldWn1DLzKGacDC26",        // タイプ（単一選択）
  status: "fldiGogHs9F7w5t2q",      // ステータス（単一選択）
  scheduledUtc: "fldDrNzqVRb9LxxqD",// 予約日時（UTC 格納・§13 の最重要ガード）
  postId: "fldLdjZEjuCqGt0UH",      // ポストID
} as const;

/** 単一選択の値。**存在しない選択肢を書くと 422 になる**（第84便で実測）。 */
export const TYPE_T3 = "T3セール";
export const STATUS_APPROVED = "承認済";

const API = "https://api.airtable.com/v0";

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

/** PAT の**有無だけ**を返す。値は返さない。 */
export function isAirtableConfigured(): boolean {
  return Boolean(process.env.AIRTABLE_POSTS_PAT);
}

function authHeaders(): Record<string, string> {
  const pat = process.env.AIRTABLE_POSTS_PAT;
  if (!pat) throw new Error("AIRTABLE_POSTS_PAT が未設定");
  return { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" };
}

/**
 * エラーメッセージから資格情報の断片が漏れないよう、**本文は先頭200字に切り、
 * `Bearer` を含む行は落とす。** Airtable のエラー本文に PAT は含まれないが、
 * **含まれないことを前提にしない。**
 */
function safeError(status: number, body: string): string {
  const cleaned = body
    .split("\n")
    .filter((l) => !/bearer|authorization|pat[A-Za-z0-9]/i.test(l))
    .join(" ")
    .slice(0, 200);
  return `Airtable HTTP ${status}: ${cleaned}`;
}

/**
 * 予約日時が指定範囲にある行を取る。**フィールド ID で返させる**
 * （`returnFieldsByFieldId=true`）。
 *
 * 【なぜ範囲で取るか】`g18`（1日1件）と `g21`（同名の再報告）を判定するには
 * **当日ぶんの既存行が要る**。**取れなければ判定できないので書かない**（B(3)）。
 */
export async function listRecentPosts(
  sinceUtcIso: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AirtableRecord[]> {
  const formula = `IS_AFTER({予約日時}, DATETIME_PARSE("${sinceUtcIso}"))`;
  const url =
    `${API}/${BASE_ID}/${TABLE_ID}` +
    `?returnFieldsByFieldId=true&pageSize=100&filterByFormula=${encodeURIComponent(formula)}`;

  const res = await fetchImpl(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(safeError(res.status, await res.text()));
  const json = (await res.json()) as { records?: AirtableRecord[] };
  return json.records ?? [];
}

export interface CreatePostInput {
  name: string;
  text: string;
  linkUrl: string;
  /** ISO8601・**Z 終端**（§13: JST をそのまま書くと9時間ずれる）。 */
  scheduledUtc: string;
}

/**
 * 1件だけ作る。**`ステータス` は `承認済` を固定で書く。**
 *
 * 【§13 の緩和策】**`status` を書く箇所をこの1関数に限定する**——
 * git の差分レビューで「どこで承認済が書かれるか」が1箇所に見えるようにするため。
 * **これは保証ではなく緩和である**（スクリプトを書き換えれば任意の値を書ける）。
 */
export async function createPost(
  input: CreatePostInput,
  fetchImpl: typeof fetch = fetch,
): Promise<AirtableRecord> {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(input.scheduledUtc)) {
    // ここで落とすのは g9 と二重だが、**書き込みの直前でもう一度見る**
    // （§10: 書く側の最後の砦を1つ残す）。
    throw new Error(`予約日時が Z 終端の ISO でない: ${input.scheduledUtc}`);
  }

  const body = {
    fields: {
      [FIELD.name]: input.name,
      [FIELD.text]: input.text,
      [FIELD.linkUrl]: input.linkUrl,
      [FIELD.type]: TYPE_T3,
      [FIELD.status]: STATUS_APPROVED,
      [FIELD.scheduledUtc]: input.scheduledUtc,
    },
    // **typecast は使わない。** 使うと存在しない選択肢を勝手に作ってしまう
    // （第84便で `T5` を書こうとして 422 になったのは、この保護が効いた結果）。
    typecast: false,
  };

  const res = await fetchImpl(`${API}/${BASE_ID}/${TABLE_ID}?returnFieldsByFieldId=true`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(safeError(res.status, await res.text()));
  return (await res.json()) as AirtableRecord;
}

/** 1件を ID で読み直す（§10 の読み戻し検算用）。 */
export async function getPost(
  recordId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AirtableRecord> {
  const res = await fetchImpl(
    `${API}/${BASE_ID}/${TABLE_ID}/${recordId}?returnFieldsByFieldId=true`,
    { headers: authHeaders(), cache: "no-store" },
  );
  if (!res.ok) throw new Error(safeError(res.status, await res.text()));
  return (await res.json()) as AirtableRecord;
}

/** 単一選択は `{name}` オブジェクトで返ることがある。素の値へ均す。 */
export function plain(v: unknown): unknown {
  return v && typeof v === "object" && "name" in (v as Record<string, unknown>)
    ? (v as { name: unknown }).name
    : v;
}
