// node --test management/tools/x-reply-drafts/*.test.mjs  （ネットワーク・Airtable・Supabase に触れない）
import test from "node:test";
import assert from "node:assert/strict";
import { parseLine, parseInput, parseWorkCode, parseJstDateTime } from "./parse.mjs";

const URL1 = "https://x.com/FANZAdougaX/status/2100752031036342529";

test("全角｜区切り・作品コード（品番）あり", () => {
  const r = parseLine(`@FANZAdougaX｜2026-09-18 10:00｜${URL1}｜本文です｜SONE-682`);
  assert.equal(r.ok, true);
  assert.equal(r.handle, "FANZAdougaX");
  assert.equal(r.postedAtIso, "2026-09-18T01:00:00.000Z");
  assert.equal(r.targetPostId, "2100752031036342529");
  assert.equal(r.body, "本文です");
  assert.deepEqual(r.work, { kind: "hinban", hinban: "SONE-682", raw: "SONE-682" });
  assert.deepEqual(r.warnings, []);
});

test("半角|区切り・@ 省略・作品コードなし", () => {
  const r = parseLine(`kawaii_pr|2026/09/18 12:30|https://twitter.com/kawaii_pr/status/2100918766158950416|本文だけ`);
  assert.equal(r.ok, true);
  assert.equal(r.handle, "kawaii_pr");
  assert.equal(r.work, null);
  assert.equal(r.body, "本文だけ");
});

test("本文中に区切り文字を含む（末尾が作品コードでなければ本文に含める）", () => {
  const r = parseLine(`@a｜2026-09-18｜https://x.com/a/status/12345678｜第1弾｜第2弾も予定`);
  assert.equal(r.ok, true);
  assert.equal(r.body, "第1弾｜第2弾も予定");
  assert.equal(r.work, null);
  assert.ok(r.warnings.some((w) => w.includes("本文の一部")));
});

test("作品コード 3 形式: 品番 / content_id / works URL", () => {
  assert.deepEqual(parseWorkCode("sone-682"), { kind: "hinban", hinban: "SONE-682", raw: "sone-682" });
  assert.deepEqual(parseWorkCode("pxvr00483"), { kind: "content_id", contentId: "pxvr00483", floor: null, raw: "pxvr00483" });
  assert.deepEqual(parseWorkCode("https://app.vodnavi.jp/works/videoa/1sdjs00123"), { kind: "content_id", contentId: "1sdjs00123", floor: "videoa", raw: "https://app.vodnavi.jp/works/videoa/1sdjs00123" });
  assert.deepEqual(parseWorkCode("/works/amateur/abc00001").floor, "videoa");
  assert.equal(parseWorkCode("第1弾"), null);
  assert.equal(parseWorkCode("hello"), null);
});

test("全角の品番・日付も解釈する", () => {
  assert.deepEqual(parseWorkCode("ＳＯＮＥ－６８２"), { kind: "hinban", hinban: "SONE-682", raw: "SONE-682" });
  assert.equal(parseJstDateTime("２０２６／０９／１８ １０：００"), "2026-09-18T01:00:00.000Z");
});

test("投稿日時が解釈不能でも続行（警告）", () => {
  const r = parseLine(`@a｜きのう｜https://x.com/a/status/12345678｜本文`);
  assert.equal(r.ok, true);
  assert.equal(r.postedAtIso, null);
  assert.ok(r.warnings.some((w) => w.includes("投稿日時")));
});

test("区切り混在・不正 URL・フィールド不足は行ごとに拒否", () => {
  assert.equal(parseLine("@a｜2026-09-18|https://x.com/a/status/1234567｜本文").ok, false);
  assert.match(parseLine("@a｜2026-09-18｜https://example.com/a｜本文").error, /status 形式でない/);
  assert.match(parseLine("@a｜2026-09-18｜本文").error, /フィールド不足/);
  assert.equal(parseLine("").ok, false);
});

test("URL のハンドルが①と違えば警告", () => {
  const r = parseLine(`@a｜2026-09-18｜https://x.com/b/status/12345678｜本文`);
  assert.ok(r.warnings.some((w) => w.includes("一致しない")));
});

test("parseInput は複数行を集計する（BOM・CRLF・# コメント行 許容）", () => {
  const res = parseInput(`﻿# comment\n@a｜2026-09-18｜https://x.com/a/status/11111111｜本文1\r\n\r\nbad\r\n@b｜2026-09-18｜https://x.com/b/status/22222222｜本文2\r\n`);
  assert.equal(res.okCount, 2);
  assert.equal(res.ngCount, 1);
  assert.equal(res.lines[1].lineNo, 4);
});

test("不正な日付は null（2026-02-30）", () => {
  assert.equal(parseJstDateTime("2026-02-30 10:00"), null);
  assert.equal(parseJstDateTime("2026-09-18 23:30"), "2026-09-18T14:30:00.000Z");
});
