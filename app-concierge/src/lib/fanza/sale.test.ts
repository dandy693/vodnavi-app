/**
 * `sale.ts` の純関数テスト。**このリポジトリで最初の自動テスト**。
 *
 * 【なぜ Node 標準の `node:test` か】依存を1つも増やさずにテストを始められる。
 * Node v24 は `.ts` の型ストリップが既定で有効なため、ビルド工程も不要。
 * 実行: `npm test`
 *
 * 【方針】ネットワークと `Date.now()` に触れない関数だけを対象にする。
 * 期限判定は `now` を引数で渡す設計にしてあるため、**時刻を固定して検証できる**。
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  activeCampaign,
  dedupeByContentId,
  discountRate,
  formatEndsAtJst,
  groupByCampaign,
  isOnSale,
  parseFanzaDate,
  parseYen,
  jstDateString,
  saleBadgeOf,
  saleOfferOf,
  sortSaleItems,
  toPriceHistoryRows,
} from "./sale.ts";
import type { DmmItem } from "./types.ts";

/** 実測（第90便 2026-08-22）に合わせた最小の作品オブジェクトを組み立てる。 */
function item(over: Partial<DmmItem> & { content_id: string }): DmmItem {
  return {
    service_code: "digital",
    service_name: "動画",
    floor_code: "videoa",
    floor_name: "ビデオ",
    category_name: "ビデオ (動画)",
    product_id: over.content_id,
    title: `作品 ${over.content_id}`,
    URL: "https://example.invalid/",
    affiliateURL: "https://example.invalid/",
    ...over,
  } as DmmItem;
}

/** 実測の形（`campaign` は配列長1・JST の TZ なし文字列）。 */
function withSale(
  cid: string,
  price: string,
  listPrice: string,
  end: string,
  begin = "2026-08-01 00:00:00",
  title = "50％OFFキャンペーン",
): DmmItem {
  return item({
    content_id: cid,
    prices: { price, list_price: listPrice },
    campaign: [{ date_begin: begin, date_end: end, title }],
  });
}

const NOW = new Date("2026-08-22T07:00:00+09:00");

// ─────────────────────────── parseYen ───────────────────────────

test("parseYen: FANZA の価格表記を数値にする", () => {
  assert.equal(parseYen("1,980円"), 1980);
  assert.equal(parseYen("250~"), 250, "実測の price は 250~ の形で返る");
  assert.equal(parseYen("250"), 250);
  assert.equal(parseYen("11000"), 11000);
});

test("parseYen: 数字を含まない入力は null（0 や NaN を返さない）", () => {
  assert.equal(parseYen(""), null);
  assert.equal(parseYen("~"), null);
  assert.equal(parseYen(null), null);
  assert.equal(parseYen(undefined), null);
  assert.equal(parseYen("0"), null, "0円は価格として扱わない");
});

// ────────────────────────── parseFanzaDate ──────────────────────────

test("parseFanzaDate: TZ なしの文字列を JST として解釈する", () => {
  const d = parseFanzaDate("2026-08-24 09:59:59");
  assert.ok(d);
  assert.equal(
    d.toISOString(),
    "2026-08-24T00:59:59.000Z",
    "JST 09:59:59 は UTC 00:59:59（サーバ TZ に依存しない）",
  );
});

test("parseFanzaDate: 既に TZ を持つ形はそのまま解釈する", () => {
  assert.equal(parseFanzaDate("2026-08-24T00:59:59Z")?.toISOString(), "2026-08-24T00:59:59.000Z");
});

test("parseFanzaDate: 解釈できない入力は null", () => {
  assert.equal(parseFanzaDate(""), null);
  assert.equal(parseFanzaDate(null), null);
  assert.equal(parseFanzaDate("not a date"), null);
});

// ────────────────────────── discountRate ──────────────────────────

test("discountRate: 実測どおり 50% / 30% を算出する", () => {
  assert.equal(discountRate(item({ content_id: "a", prices: { price: "250~", list_price: "500~" } })), 50);
  assert.equal(discountRate(item({ content_id: "b", prices: { price: "1090~", list_price: "2180~" } })), 50);
  assert.equal(discountRate(item({ content_id: "c", prices: { price: "700", list_price: "1000" } })), 30);
});

test("discountRate: 乖離が無ければ null（同額・逆転を含む）", () => {
  assert.equal(discountRate(item({ content_id: "d", prices: { price: "500", list_price: "500" } })), null);
  assert.equal(discountRate(item({ content_id: "e", prices: { price: "600", list_price: "500" } })), null);
});

test("discountRate: list_price 欠落・prices 欠落は null", () => {
  assert.equal(discountRate(item({ content_id: "f", prices: { price: "500" } })), null);
  assert.equal(discountRate(item({ content_id: "g" })), null);
});

// ───────────────────────── activeCampaign（期限切れ除外の中核） ─────────────────────────

test("activeCampaign: date_end が未来なら返す", () => {
  const it = withSale("x1", "250~", "500~", "2026-08-24 09:59:59");
  assert.equal(activeCampaign(it, NOW)?.title, "50％OFFキャンペーン");
});

test("activeCampaign: date_end が過去なら null（期限切れの自動除外）", () => {
  const it = withSale("x2", "250~", "500~", "2026-08-21 09:59:59");
  assert.equal(activeCampaign(it, NOW), null);
});

test("activeCampaign: 境界 — 終了時刻ちょうどは対象外", () => {
  const end = "2026-08-22 07:00:00"; // NOW と同一
  assert.equal(activeCampaign(withSale("x3", "250~", "500~", end), NOW), null);
});

test("activeCampaign: date_begin が未来なら null（未開始）", () => {
  const it = withSale("x4", "250~", "500~", "2026-08-30 00:00:00", "2026-08-25 00:00:00");
  assert.equal(activeCampaign(it, NOW), null);
});

test("activeCampaign: campaign が無い / date_end が読めない場合は null", () => {
  assert.equal(activeCampaign(item({ content_id: "x5" }), NOW), null);
  const broken = item({
    content_id: "x6",
    campaign: [{ date_begin: "2026-08-01 00:00:00", date_end: "", title: "壊れた" }],
  });
  assert.equal(activeCampaign(broken, NOW), null, "期限が読めないものは安全側で掲載しない");
});

// ─────────────────────────── isOnSale ───────────────────────────

test("isOnSale: campaign と価格乖離の両方が要る", () => {
  assert.equal(isOnSale(withSale("y1", "250~", "500~", "2026-08-24 09:59:59"), NOW), true);

  const campaignOnly = item({
    content_id: "y2",
    prices: { price: "500", list_price: "500" },
    campaign: [{ date_begin: "2026-08-01 00:00:00", date_end: "2026-08-24 09:59:59", title: "t" }],
  });
  assert.equal(isOnSale(campaignOnly, NOW), false, "campaign だけでは掲載しない");

  const gapOnly = item({ content_id: "y3", prices: { price: "250", list_price: "500" } });
  assert.equal(isOnSale(gapOnly, NOW), false, "価格乖離だけでは掲載しない");
});

test("isOnSale: 期限切れは false", () => {
  assert.equal(isOnSale(withSale("y4", "250~", "500~", "2026-08-21 09:59:59"), NOW), false);
});

// ────────────────────────── dedupe / sort ──────────────────────────

test("dedupeByContentId: 先に現れたものを残す", () => {
  const a = item({ content_id: "same", title: "先" });
  const b = item({ content_id: "same", title: "後" });
  const c = item({ content_id: "other" });
  const out = dedupeByContentId([a, b, c]);
  assert.equal(out.length, 2);
  assert.equal(out[0].title, "先");
});

test("sortSaleItems: 割引率の降順 → 期限が近い順 → 価格の昇順", () => {
  const low = withSale("s-low", "700", "1000", "2026-08-30 00:00:00"); // 30%
  const highLate = withSale("s-late", "250", "500", "2026-08-30 00:00:00"); // 50% / 遅い
  const highSoon = withSale("s-soon", "300", "600", "2026-08-23 00:00:00"); // 50% / 近い
  const highSoonCheap = withSale("s-cheap", "150", "300", "2026-08-23 00:00:00"); // 50% / 近い / 安い

  const out = sortSaleItems([low, highLate, highSoon, highSoonCheap], NOW);
  assert.deepEqual(
    out.map((x) => x.content_id),
    ["s-cheap", "s-soon", "s-late", "s-low"],
  );
});

test("sortSaleItems: 同点は content_id で決定的に並ぶ（描画の揺れを防ぐ）", () => {
  const b = withSale("bbb", "250", "500", "2026-08-24 00:00:00");
  const a = withSale("aaa", "250", "500", "2026-08-24 00:00:00");
  assert.deepEqual(
    sortSaleItems([b, a], NOW).map((x) => x.content_id),
    ["aaa", "bbb"],
  );
});

// ────────────────────────── badge / group / format ──────────────────────────

test("saleBadgeOf: 割引率と終了時刻を返す。セール外は null", () => {
  const badge = saleBadgeOf(withSale("z1", "250~", "500~", "2026-08-24 09:59:59"), NOW);
  assert.equal(badge?.rate, 50);
  assert.equal(badge?.endsAt.toISOString(), "2026-08-24T00:59:59.000Z");
  assert.equal(saleBadgeOf(item({ content_id: "z2" }), NOW), null);
});

test("groupByCampaign: 名称別に集計し、終了が早い順に並ぶ", () => {
  const items = [
    withSale("g1", "250", "500", "2026-08-24 09:59:59", "2026-08-21 10:10:00", "50％OFFキャンペーン"),
    withSale("g2", "250", "500", "2026-08-24 09:59:59", "2026-08-21 10:10:00", "50％OFFキャンペーン"),
    withSale("g3", "700", "1000", "2026-08-25 23:59:59", "2026-08-19 00:10:00", "ブランドストア30％OFF"),
    withSale("g4", "250", "500", "2026-08-20 00:00:00", "2026-08-01 00:00:00", "終了済み"),
  ];
  const groups = groupByCampaign(items, NOW);
  assert.deepEqual(
    groups.map((g) => [g.title, g.count]),
    [
      ["50％OFFキャンペーン", 2],
      ["ブランドストア30％OFF", 1],
    ],
    "期限切れの「終了済み」は集計に含まれない",
  );
});

test("groupByCampaign: キャンペーン名を定数で持たない（入力から得る）", () => {
  const renamed = withSale("g9", "250", "500", "2026-08-24 09:59:59", "2026-08-01 00:00:00", "全く新しい名前のセール");
  const groups = groupByCampaign([renamed], NOW);
  assert.equal(groups.length, 1, "未知の名称でも 0件にならない（静かな失敗を避ける）");
  assert.equal(groups[0].title, "全く新しい名前のセール");
});

test("formatEndsAtJst: JST の M/D HH:mm（サーバ TZ に依存しない）", () => {
  assert.equal(formatEndsAtJst(new Date("2026-08-24T00:59:59Z")), "8/24 09:59");
  assert.equal(formatEndsAtJst(new Date("2026-08-25T14:59:59Z")), "8/25 23:59");
});

// ───────────────────── 価格履歴（第93便 CSO裁定B(1)） ─────────────────────

test("jstDateString: JST の日付。UTC 日付との境界がずれない", () => {
  // UTC 2026-08-21T23:00Z は JST 2026-08-22 08:00 → 日付は 08-22 でなければならない
  assert.equal(jstDateString(new Date("2026-08-21T23:00:00Z")), "2026-08-22");
  // UTC 2026-08-22T14:59Z は JST 2026-08-22 23:59 → まだ 08-22
  assert.equal(jstDateString(new Date("2026-08-22T14:59:00Z")), "2026-08-22");
  // UTC 2026-08-22T15:00Z は JST 2026-08-23 00:00 → 08-23 に切り替わる
  assert.equal(jstDateString(new Date("2026-08-22T15:00:00Z")), "2026-08-23");
});

test("toPriceHistoryRows: セール中のみを行にし、値を正しく写す", () => {
  const rows = toPriceHistoryRows(
    [withSale("p1", "250~", "500~", "2026-08-24 09:59:59", "2026-08-21 10:10:00", "50％OFFキャンペーン")],
    NOW,
  );
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    content_id: "p1",
    snapshot_date: "2026-08-22",
    floor_code: "videoa",
    price: 250,
    list_price: 500,
    campaign_title: "50％OFFキャンペーン",
    campaign_end: "2026-08-24T00:59:59.000Z",
    batch_at: NOW.toISOString(),
  });
});

test("toPriceHistoryRows: 期限切れ・未開始・campaign なしは記録しない", () => {
  const expired = withSale("p2", "250", "500", "2026-08-21 09:59:59");
  const notYet = withSale("p3", "250", "500", "2026-08-30 00:00:00", "2026-08-25 00:00:00");
  const none = item({ content_id: "p4", prices: { price: "250", list_price: "500" } });
  assert.equal(toPriceHistoryRows([expired, notYet, none], NOW).length, 0);
});

test("toPriceHistoryRows: content_id の重複を除く（主キー衝突を防ぐ）", () => {
  const a = withSale("dup", "250", "500", "2026-08-24 09:59:59");
  const b = withSale("dup", "300", "600", "2026-08-24 09:59:59");
  const rows = toPriceHistoryRows([a, b], NOW);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].price, 250, "先に現れたほうを残す");
});

test("toPriceHistoryRows: 価格が読めなくても行は作る（null で保存する）", () => {
  const noPrice = item({
    content_id: "p5",
    campaign: [{ date_begin: "2026-08-01 00:00:00", date_end: "2026-08-24 09:59:59", title: "t" }],
  });
  const rows = toPriceHistoryRows([noPrice], NOW);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].price, null);
  assert.equal(rows[0].list_price, null);
});

// ---------------------------------------------------------------------------
// saleOfferOf — 構造化データ Offer（第95便 CSO裁定①）
// **期限切れで Offer を出力しないこと**が要件の中核。
// ---------------------------------------------------------------------------

test("saleOfferOf: 有効なキャンペーン + 読める価格 → price と priceValidUntil を返す", () => {
  const it = withSale("o1", "250", "500", "2026-08-24 09:59:59");
  const offer = saleOfferOf(it, NOW);
  assert.notEqual(offer, null);
  assert.equal(offer?.price, 250);
  // JST 09:59:59 = UTC 00:59:59
  assert.equal(offer?.priceValidUntil, "2026-08-24T00:59:59.000Z");
});

test("saleOfferOf: 期限切れなら null（＝Offer を出力しない）", () => {
  const expired = withSale("o2", "250", "500", "2026-08-01 09:59:59");
  assert.equal(saleOfferOf(expired, NOW), null);
});

test("saleOfferOf: キャンペーンが無ければ null", () => {
  const plain = item({ content_id: "o3", prices: { price: "250", list_price: "500" } });
  assert.equal(saleOfferOf(plain, NOW), null);
});

test("saleOfferOf: 価格が読めなければ null（0円の Offer を出さない）", () => {
  const noPrice = item({
    content_id: "o4",
    campaign: [{ date_begin: "2026-08-01 00:00:00", date_end: "2026-08-24 09:59:59", title: "t" }],
  });
  assert.equal(saleOfferOf(noPrice, NOW), null);
});

test("saleOfferOf: 未開始のキャンペーンは null（先出しの価格を主張しない）", () => {
  const future = item({
    content_id: "o5",
    prices: { price: "250", list_price: "500" },
    campaign: [{ date_begin: "2026-09-01 00:00:00", date_end: "2026-09-10 09:59:59", title: "t" }],
  });
  assert.equal(saleOfferOf(future, NOW), null);
});

// ---------------------------------------------------------------------------
// batch_at — 最終スナップショットの定義（第95便 CSO裁定⑤）
// **1回の実行内で全行に同じ値**でなければ「その日の最終スナップショット」を
// 集合として取り出せない。
// ---------------------------------------------------------------------------

test("toPriceHistoryRows: batch_at は全行で同一（1バッチ = 1つの値）", () => {
  const rows = toPriceHistoryRows(
    [
      withSale("b1", "250", "500", "2026-08-24 09:59:59"),
      withSale("b2", "300", "600", "2026-08-25 09:59:59"),
      withSale("b3", "400", "800", "2026-08-26 09:59:59"),
    ],
    NOW,
  );
  assert.equal(rows.length, 3);
  assert.equal(new Set(rows.map((r) => r.batch_at)).size, 1, "1バッチなら値は1種類");
});

test("toPriceHistoryRows: batch_at は既定で now、明示すればその値を使う", () => {
  const batch = new Date("2026-08-23T05:00:00.000Z");
  const rows = toPriceHistoryRows([withSale("b4", "250", "500", "2026-08-24 09:59:59")], NOW, batch);
  assert.equal(rows[0].batch_at, batch.toISOString());

  const def = toPriceHistoryRows([withSale("b5", "250", "500", "2026-08-24 09:59:59")], NOW);
  assert.equal(def[0].batch_at, NOW.toISOString());
});

test("toPriceHistoryRows: 同日2回の実行は snapshot_date が同じで batch_at だけが異なる", () => {
  // 06:00 JST と 14:00 JST（同じ JST 日付）。
  const morning = new Date("2026-08-22T21:00:00.000Z"); // = 8/23 06:00 JST
  const afternoon = new Date("2026-08-23T05:00:00.000Z"); // = 8/23 14:00 JST
  const a = toPriceHistoryRows([withSale("b6", "250", "500", "2026-08-24 09:59:59")], morning);
  const b = toPriceHistoryRows([withSale("b6", "200", "500", "2026-08-24 09:59:59")], afternoon);

  assert.equal(a[0].snapshot_date, "2026-08-23");
  assert.equal(b[0].snapshot_date, "2026-08-23", "JST では同じ日");
  assert.notEqual(a[0].batch_at, b[0].batch_at, "バッチは区別できる");
});
