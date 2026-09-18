// knowledge.mjs: buildCacheKey 再現（2026-09-18 に PK 一致を実測した 2 件）・SQL 生成・抽出の許可フィールド
import test from "node:test";
import assert from "node:assert/strict";
import { buildCacheKey, cacheKeyForCid, hinbanToSuffix, sqlForCid, sqlForHinban, planFromParsed, extractKnowledge, knowledgeFromRows } from "./knowledge.mjs";

test("cache_key の再現（実測: pxvr00483 / snos00334・videoa・hits 1・filtered=false）", () => {
  assert.equal(cacheKeyForCid("pxvr00483", "videoa"), "abf6d6a3141a835aba8dd7618843ec2151bafe712085da67b4a731c8dcfc1c26");
  assert.equal(cacheKeyForCid("snos00334", "videoa"), "452965c2ffdf8ad277aaee3b8a3f3992192cf493b8ca65dda067cb1bc14ed96c");
  // キーはソート済み・空値は落とす・__filtered を末尾に付ける（stale-cache.ts と同一）
  assert.equal(buildCacheKey({ b: 1, a: "x", c: null, d: "" }, true), buildCacheKey({ a: "x", b: "1" }, true));
});

test("品番 → suffix / SQL", () => {
  assert.equal(hinbanToSuffix("SONE-682"), "sone00682");
  assert.equal(hinbanToSuffix("SAVR-1157"), "savr01157");
  assert.equal(hinbanToSuffix("bad"), null);
  const s = sqlForHinban("SONE-682");
  assert.match(s.sql, /sitemap_works_archive/);
  assert.match(s.sql, /like '%sone00682%'/);
  assert.doesNotMatch(s.sql, /payload/, "全走査 SQL は生成しない");
});

test("cid → PK 照会 SQL（floor 不明なら 3 フロア）", () => {
  const a = sqlForCid("pxvr00483", "videoa");
  assert.equal(a.keys.length, 1);
  assert.match(a.sql, /where cache_key in \('abf6d6a3/);
  const b = sqlForCid("pxvr00483");
  assert.equal(b.keys.length, 3);
  assert.deepEqual(b.keys.map((k) => k.floor), ["videoa", "nikkatsu", "anime"]);
  assert.doesNotMatch(b.sql, /->>'content_id'/, "逆引き全走査は生成しない");
});

test("planFromParsed は作品コードのある ok 行だけを計画する", () => {
  const plans = planFromParsed({
    lines: [
      { ok: true, lineNo: 1, handle: "a", work: { kind: "hinban", hinban: "SONE-682" } },
      { ok: true, lineNo: 2, handle: "b", work: null },
      { ok: false, lineNo: 3 },
      { ok: true, lineNo: 4, handle: "c", work: { kind: "content_id", contentId: "pxvr00483", floor: "videoa" } },
    ],
  });
  assert.deepEqual(plans.map((p) => [p.lineNo, p.step]), [[1, "hinban"], [4, "cid"]]);
});

test("extractKnowledge は URL 系を落とし、許可フィールドだけ渡す", () => {
  const item = {
    content_id: "pxvr00483",
    floor_code: "videoa",
    title: "テスト作品",
    date: "2026-09-16 10:00:00",
    volume: "120",
    URL: "https://video.dmm.co.jp/x",
    affiliateURL: "https://al.dmm.co.jp/?af_id=moterist-" + "99" + "0", // API 用 af_id の形（リテラルを置かないため連結・FACT §8）
    imageURL: { large: "https://pics.dmm.co.jp/x.jpg" },
    sampleImageURL: { sample_s: { image: ["https://a"] } },
    sampleMovieURL: { size_720_480: "https://b" },
    prices: { price: "300~", list_price: "980~", deliveries: { delivery: [] } },
    campaign: [{ date_begin: "2026-09-15 10:00:00", date_end: "2026-09-20 09:59:59", title: "50％OFFキャンペーン" }],
    review: { count: 3, average: "4.33" },
    iteminfo: { actress: [{ id: 1, name: "泉ももか" }], genre: [{ name: "VR" }], maker: [{ name: "メーカー" }], label: [{ name: "レーベル" }], series: [], director: [{ name: "監督" }] },
  };
  const k = extractKnowledge(item, "2026-09-18T00:00:00+00:00");
  assert.deepEqual(k.actress, ["泉ももか"]);
  assert.equal(k.price, "300~");
  assert.equal(k.campaign[0].title, "50％OFFキャンペーン");
  assert.equal(k.fetched_at, "2026-09-18T00:00:00+00:00");
  const s = JSON.stringify(k);
  assert.doesNotMatch(s, /https?:|af_id|moterist|imageURL|sampleImageURL|sampleMovieURL|deliveries/);
  assert.equal(knowledgeFromRows([]), null);
  assert.equal(knowledgeFromRows([{ cache_key: "x", fetched_at: "t", item: JSON.stringify(item) }]).content_id, "pxvr00483");
});
