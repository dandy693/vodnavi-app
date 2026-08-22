/**
 * セール（FANZA キャンペーン）判定の純関数群。
 *
 * 【設計方針】副作用を持たせない。ネットワークも `Date.now()` も直接触らず、
 * 現在時刻は必ず引数 `now` で受け取る。**そうしないと期限判定をテストできない。**
 * 取得（I/O）は `sale-source.ts` に分離してある。
 *
 * 【出典・第90便の実測 2026-08-22 06:32〜06:45】
 *   - `campaign` は `date_begin` / `date_end` / `title` を持ち、**実測 207件すべてで配列長は 1**。
 *   - **`campaign` の有無と `price < list_price` の乖離は全母集団で完全に一致した**
 *     （「campaign のみ」も「乖離のみ」も 0件）。2つは同じ事象の2つの表れであり、
 *     **両方を要求することが相互検証になる**（`isOnSale`）。
 *   - `title` に割引率が入る（「50％OFFキャンペーン」「ブランドストア30％OFF」）が、
 *     **表示に使う割引率は `title` の文字列ではなく価格から計算する**。
 *     文言が変わっても壊れないため。
 *   - 期限の実測: 50%OFF が約3日 / ブランドストア30%OFF が約7日。
 *     **入れ替わりが速いので、表示のたびに `now` で切ることが要件になる。**
 *
 * 【時刻の扱い】FANZA API の `date_begin` / `date_end` は
 * `"2026-08-24 09:59:59"` 形式で**タイムゾーンを持たない**。JST として解釈する
 * （`+09:00` を付けてパース）。**サーバの TZ に依存させない。**
 */
import type { DmmCampaign, DmmItem } from "./types";

/** JST のタイムゾーンオフセット。API の日時文字列に付けて絶対時刻へ変換する。 */
const JST_OFFSET = "+09:00";

/**
 * FANZA の価格文字列を数値へ。`"1,980円"` / `"250~"` / `"250"` に対応。
 * 数字が1桁も無ければ `null`（`"~"` だけ、空文字、undefined を含む）。
 */
export function parseYen(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const digits = String(raw).replace(/[^\d]/g, "");
  if (digits.length === 0) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * `"2026-08-24 09:59:59"`（JST・TZ なし）を `Date` へ。
 * 解釈できなければ `null`。**ISO 形式（`T` 区切り・`Z` 付き）もそのまま受ける。**
 */
export function parseFanzaDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const s = String(raw).trim();
  // 既にタイムゾーンを持つ形（末尾 Z / ±hh:mm）はそのまま解釈する。
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(s);
  const iso = hasZone ? s.replace(" ", "T") : `${s.replace(" ", "T")}${JST_OFFSET}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * 割引率（%・整数へ丸め）。`price < list_price` のときのみ返す。
 * 乖離が無い / どちらかが読めない場合は `null`。
 */
export function discountRate(item: DmmItem): number | null {
  const price = parseYen(item.prices?.price);
  const list = parseYen(item.prices?.list_price);
  if (price === null || list === null) return null;
  if (price >= list) return null;
  return Math.round((1 - price / list) * 100);
}

/**
 * 有効なキャンペーンを返す。**`date_end` が `now` より過去なら `null`**。
 * `date_begin` が未来（未開始）の場合も `null`。
 *
 * **期限切れの自動除外はここに集約する。** 表示のたびに `now` で判定するため、
 * データ側のキャッシュが古くても期限切れは画面に出ない。
 */
export function activeCampaign(item: DmmItem, now: Date): DmmCampaign | null {
  const list = item.campaign ?? [];
  for (const c of list) {
    const end = parseFanzaDate(c.date_end);
    const begin = parseFanzaDate(c.date_begin);
    if (end === null) continue; // 期限が読めないものは掲載しない（安全側）
    if (end.getTime() <= now.getTime()) continue; // 期限切れ
    if (begin !== null && begin.getTime() > now.getTime()) continue; // 未開始
    return c;
  }
  return null;
}

/**
 * セール中か。**有効なキャンペーンと価格乖離の両方**を要求する。
 *
 * 【なぜ両方か】第90便の実測で両者は完全に一致した。片方だけを条件にすると、
 * 将来どちらかの挙動が変わったときに**気づかないまま誤った掲載をする**。
 * 両方を要求すれば、乖離したときは掲載0件になり**沈黙ではなく欠落として現れる**。
 */
export function isOnSale(item: DmmItem, now: Date): boolean {
  return activeCampaign(item, now) !== null && discountRate(item) !== null;
}

/** `content_id` で重複を除去する（先に現れたものを残す）。 */
export function dedupeByContentId(items: readonly DmmItem[]): DmmItem[] {
  const seen = new Set<string>();
  const out: DmmItem[] = [];
  for (const it of items) {
    const cid = it.content_id;
    if (!cid || seen.has(cid)) continue;
    seen.add(cid);
    out.push(it);
  }
  return out;
}

/**
 * 掲載順。**割引率の降順 → 期限が近い順 → 価格の昇順 → content_id 昇順**。
 * 最後の content_id は**同点時の順序を決定的にする**ため（描画の揺れを防ぐ）。
 */
export function sortSaleItems(items: readonly DmmItem[], now: Date): DmmItem[] {
  return [...items].sort((a, b) => {
    const ra = discountRate(a) ?? 0;
    const rb = discountRate(b) ?? 0;
    if (ra !== rb) return rb - ra;

    const ea = parseFanzaDate(activeCampaign(a, now)?.date_end)?.getTime() ?? Infinity;
    const eb = parseFanzaDate(activeCampaign(b, now)?.date_end)?.getTime() ?? Infinity;
    if (ea !== eb) return ea - eb;

    const pa = parseYen(a.prices?.price) ?? Infinity;
    const pb = parseYen(b.prices?.price) ?? Infinity;
    if (pa !== pb) return pa - pb;

    return a.content_id.localeCompare(b.content_id);
  });
}

export interface SaleBadge {
  /** 割引率（%）。 */
  rate: number;
  /** 終了日時（JST の絶対時刻）。 */
  endsAt: Date;
}

/** カード表示用のバッジ情報。セール中でなければ `null`。 */
export function saleBadgeOf(item: DmmItem, now: Date): SaleBadge | null {
  const c = activeCampaign(item, now);
  const rate = discountRate(item);
  const endsAt = parseFanzaDate(c?.date_end);
  if (c === null || rate === null || endsAt === null) return null;
  return { rate, endsAt };
}

export interface CampaignGroup {
  title: string;
  endsAt: Date;
  count: number;
}

/**
 * キャンペーン名別の集計（見出し表示用）。**終了が早い順**。
 *
 * 【キャンペーン名を事前に持たない設計】名称は取得結果の `campaign[0].title` から
 * 得る。定数として持つと、**名称が変わった瞬間に0件になっても正常終了してしまう**
 * （第92便で整理した「静かな失敗」）。
 */
export function groupByCampaign(items: readonly DmmItem[], now: Date): CampaignGroup[] {
  const map = new Map<string, CampaignGroup>();
  for (const it of items) {
    const c = activeCampaign(it, now);
    if (!c) continue;
    const endsAt = parseFanzaDate(c.date_end);
    if (!endsAt) continue;
    const cur = map.get(c.title);
    if (cur) cur.count += 1;
    else map.set(c.title, { title: c.title, endsAt, count: 1 });
  }
  return [...map.values()].sort(
    (a, b) => a.endsAt.getTime() - b.endsAt.getTime() || a.title.localeCompare(b.title),
  );
}

/**
 * JST の日付（`YYYY-MM-DD`）。**サーバの TZ に依存させない。**
 *
 * 価格履歴の粒度に使う。セールの境界（`date_end`）が JST で切られるため、
 * **UTC 日付で束ねると境界がずれる。**
 */
export function jstDateString(now: Date): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** `price_history` テーブルの1行（第93便 CSO裁定B(1)）。 */
export interface PriceHistoryRow {
  content_id: string;
  /** JST の日付 `YYYY-MM-DD`。主キーの一部。 */
  snapshot_date: string;
  floor_code: string;
  price: number | null;
  list_price: number | null;
  campaign_title: string | null;
  /** ISO8601。`date_end` を JST として解釈した絶対時刻。 */
  campaign_end: string | null;
  /**
   * **1回の実行内で全行に同じ値**を入れるバッチ識別子（ISO8601）。
   * cron は1日2回動くため、**その日の最終スナップショットは
   * 「`snapshot_date` ごとに `batch_at` が最大の行の集合」**として定義する。
   * `captured_at`（行ごとの `now()`）はばらつくため基準にできない。
   */
  batch_at: string;
}

/**
 * 作品の配列を `price_history` の保存行へ変換する（**純関数**）。
 *
 * **有効なキャンペーンを持たないものは落とす**（期限切れ・未開始・campaign なし）。
 * `content_id` の重複も除去する——主キーが `(content_id, snapshot_date)` のため、
 * 同一バッチ内に重複があると upsert が同じ行を二度書くことになる。
 */
export function toPriceHistoryRows(
  items: readonly DmmItem[],
  now: Date,
  batchAt: Date = now,
): PriceHistoryRow[] {
  const snapshot_date = jstDateString(now);
  const batch_at = batchAt.toISOString();
  const rows: PriceHistoryRow[] = [];
  const seen = new Set<string>();

  for (const it of items) {
    const campaign = activeCampaign(it, now);
    if (!campaign) continue;
    if (!it.content_id || seen.has(it.content_id)) continue;
    seen.add(it.content_id);

    rows.push({
      content_id: it.content_id,
      snapshot_date,
      floor_code: it.floor_code,
      price: parseYen(it.prices?.price),
      list_price: parseYen(it.prices?.list_price),
      campaign_title: campaign.title ?? null,
      campaign_end: parseFanzaDate(campaign.date_end)?.toISOString() ?? null,
      batch_at,
    });
  }
  return rows;
}

export interface SaleOffer {
  /** セール価格（円）。 */
  price: number;
  /** ISO8601。`campaign.date_end` を JST として解釈した絶対時刻。 */
  priceValidUntil: string;
}

/**
 * 構造化データ `Offer` の中身（**純関数**・第95便 CSO裁定①）。
 *
 * **有効なキャンペーンが無い／価格が読めない場合は `null` を返す。**
 * 呼び出し側は `null` のとき **`offers` を出力しない**こと。
 *
 * 【なぜ期限切れで出力しないのか】`priceValidUntil` が過去の `Offer` は、
 * 検索エンジンから見て「期限切れの価格情報」になる。セールは実測で約3日で入れ替わり、
 * §16 により再クロール時期は予測できない。**間違った価格を構造化データで主張するより、
 * 主張しないほうが安全である。**
 */
export function saleOfferOf(item: DmmItem, now: Date): SaleOffer | null {
  const campaign = activeCampaign(item, now);
  if (!campaign) return null;
  const price = parseYen(item.prices?.price);
  if (price === null) return null;
  const end = parseFanzaDate(campaign.date_end);
  if (end === null) return null;
  return { price, priceValidUntil: end.toISOString() };
}

/** 終了日時を JST の `M/D HH:mm` で表示する（サーバ TZ に依存させない）。 */
export function formatEndsAtJst(d: Date): string {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const m = jst.getUTCMonth() + 1;
  const day = jst.getUTCDate();
  const hh = String(jst.getUTCHours()).padStart(2, "0");
  const mm = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${m}/${day} ${hh}:${mm}`;
}
