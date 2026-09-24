// resolve-cid.mjs の純関数テスト（ネットワークには触れない）
import test from "node:test";
import assert from "node:assert/strict";
import { extractCid, floorFromUrl, fillInput } from "./resolve-cid.mjs";

const TAB = String.fromCharCode(9);

test("extractCid: al.fanza の lurl から新形式 id= を抜く（2026-09-24 実測の形）", () => {
  const u = "https://al.fanza.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3Dmdvr00441&af_id=WILLaffi-061&ch=toolbar&ch_id=link";
  assert.equal(extractCid(u).cid, "mdvr00441");
});

test("extractCid: 旧形式 cid= も拾う（floor はパスから）", () => {
  const u = "https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3Dsone00682%2F";
  const r = extractCid(u);
  assert.equal(r.cid, "sone00682");
  assert.equal(r.floor, "videoa");
});

test("extractCid: video.dmm / fanza を含まない URL の id= は拾わない（誤検出の抑止）", () => {
  assert.equal(extractCid("https://example.com/page?id=abcd1234").cid, null);
});

test("extractCid: 該当なしは null", () => {
  assert.equal(extractCid("https://t.co/AbCdEf").cid, null);
  assert.equal(extractCid("").cid, null);
  assert.equal(extractCid(null).cid, null);
});

test("floorFromUrl: 新形式には floor が無い", () => {
  assert.equal(floorFromUrl("https://video.dmm.co.jp/av/content/?id=mdvr00441"), null);
  assert.equal(floorFromUrl("https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=sone00682/"), "videoa");
});

test("fillInput: 作品コード欄が空の行にだけ付ける", () => {
  const text = [
    "@A｜2026-09-24 00:15｜https://x.com/A/status/1｜本文",
    "@B｜2026-09-24 05:00｜https://x.com/B/status/2｜本文｜abcd00123",
  ].join("\n");
  const res = fillInput(text, new Map([["A", "mdvr00441"], ["B", "zzzz00999"]]));
  assert.equal(res.filled.length, 1);
  assert.equal(res.filled[0].handle, "A");
  assert.equal(res.skipped.length, 1);
  assert.match(res.text.split("\n")[0], /｜mdvr00441$/);
  assert.match(res.text.split("\n")[1], /｜abcd00123$/); // 既存は書き換えない
});

test("fillInput: 対象ハンドル以外・空行・コメント行は触らない", () => {
  const text = ["", "# メモ", "@C｜2026-09-24 00:15｜https://x.com/C/status/3｜本文"].join("\n");
  const res = fillInput(text, new Map([["A", "mdvr00441"]]));
  assert.equal(res.filled.length, 0);
  assert.equal(res.text, text);
});

test("fillInput: 半角 | 区切りの行も同じ区切りで付ける", () => {
  const text = "@A|2026-09-24 00:15|https://x.com/A/status/1|本文";
  const res = fillInput(text, new Map([["A", "mdvr00441"]]));
  assert.equal(res.text, text + "|mdvr00441");
});

test("tco.tsv の区切り（TAB / ｜ / |）がいずれも 2 列に割れる", () => {
  const re = new RegExp("[" + TAB + "｜|]+");
  for (const line of ["@A" + TAB + "https://t.co/x", "@A｜https://t.co/x", "@A|https://t.co/x"]) {
    const cols = line.split(re).filter(Boolean);
    assert.equal(cols.length, 2);
    assert.equal(cols[0], "@A");
  }
});
