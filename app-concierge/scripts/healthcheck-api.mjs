/**
 * API 疎通検証ゲート（T-20260609-03 / BRIEF_055）
 *
 * 本番（既定 https://app.vodnavi.jp）の **サーバーサイド API 健全性** を外形監視し、
 * 1 つでも異常なら exit 1 で落とす。2026-06-10 に多発した
 *   - FANZA ItemList 全面 400（トップグリッド窒息）
 *   - AI チャット "invalid x-api-key"（ANTHROPIC_API_KEY 失効）
 * を **自動検知**するための probe を実装する。CI（GitHub Actions）から定期/手動実行。
 *
 * 使い方:
 *   node scripts/healthcheck-api.mjs                  # 本番
 *   HEALTHCHECK_BASE=https://xxx node scripts/healthcheck-api.mjs
 *
 * 注: Vercel Preview は SSO(401) 保護のため外形 probe 不可。Preview は
 *     `vercel env ls` のスコープ確認 + HUMAN 目視で代替（runbook 参照）。
 */

const BASE = process.env.HEALTHCHECK_BASE ?? "https://app.vodnavi.jp";
const TIMEOUT_MS = 30_000;

let failures = 0;
function pass(name) {
  console.log(`PASS  ${name}`);
}
function fail(name, detail) {
  failures++;
  console.error(`FAIL  ${name} — ${detail}`);
}

async function fetchText(path, init) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, signal: ctrl.signal });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

// 1) FANZA ItemList health — sitemap が works URL を含むこと（list クエリ成功の証跡）
try {
  const { status, body } = await fetchText("/sitemap.xml");
  const works = (body.match(/\/works\//g) ?? []).length;
  if (status === 200 && works > 0) pass(`fanza.sitemap works=${works}`);
  else fail("fanza.sitemap", `status=${status} works=${works} (expected 200 & >0)`);
} catch (e) {
  fail("fanza.sitemap", String(e));
}

// 2) トップグリッド — ユーザー向け 400/窒息文言が出ていないこと
try {
  const { status, body } = await fetchText("/");
  if (status === 200 && !/status: 400|作品を取得できませんでした/.test(body)) {
    pass("fanza.home grid");
  } else {
    fail("fanza.home grid", `status=${status} errorUiPresent=${/status: 400|作品を取得できませんでした/.test(body)}`);
  }
} catch (e) {
  fail("fanza.home grid", String(e));
}

// 3) AI コンシェルジュ LLM 認証 — invalid x-api-key 等のプロバイダ拒否が無いこと
try {
  const { status, body } = await fetchText("/api/concierge", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: "vodnavi_age_verified=1" },
    body: JSON.stringify({
      messages: [{ id: "hc", role: "user", parts: [{ type: "text", text: "こんにちは" }] }],
      source: "default",
    }),
  });
  if (/invalid x-api-key|authentication|api[_-]?key/i.test(body)) {
    fail("llm.concierge", `auth error in stream (status=${status})`);
  } else if (status >= 400) {
    fail("llm.concierge", `status=${status}`);
  } else {
    pass("llm.concierge stream");
  }
} catch (e) {
  fail("llm.concierge", String(e));
}

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`} — base=${BASE}`);
process.exit(failures === 0 ? 0 : 1);
