#!/usr/bin/env node
/**
 * scripts/ignite-vercel-env.mjs
 *
 * Vercel REST API を直接叩いて、複数プロジェクトに同一 env var を Production
 * scope で投入し、最新コミットから redeploy を発火する 0-dep スクリプト。
 *
 * 設計方針:
 *   - 自動ログインはしない。`VERCEL_TOKEN` を環境変数で受け取る (公式の正規ルート)。
 *     トークンは https://vercel.com/account/tokens で発行。スコープは
 *     書込先プロジェクトの所属チームに限定するのが安全。
 *   - GTM コンテナ ID / GA4 ID は環境変数で受け取る。発明しない。
 *     未設定なら明示エラーで abort (fake 値投入 = test gaming 防止)。
 *   - 投入後 deployments エンドポイントを叩いて redeploy をキック。
 *   - Node 18+ の組み込み fetch のみ使用 (npm 依存ゼロ)。
 *
 * 使い方:
 *   VERCEL_TOKEN=xxx \
 *   GTM_CONTAINER_ID=GTM-XXXXXXX \
 *   GA_MEASUREMENT_ID=G-GG7JV9MJRW \
 *   node scripts/ignite-vercel-env.mjs --dry-run
 *
 *   # チームスコープの場合 (個人アカウント外):
 *   VERCEL_TEAM_ID=team_xxx ... node scripts/ignite-vercel-env.mjs
 *
 *   # 本番投入 + redeploy:
 *   VERCEL_TOKEN=xxx GTM_CONTAINER_ID=GTM-XXXXXXX \
 *     node scripts/ignite-vercel-env.mjs
 *
 * 投入先 (組み込み):
 *   - app-concierge プロジェクト → NEXT_PUBLIC_GTM_ID
 *   - vodnavi-brand  プロジェクト → NEXT_PUBLIC_GTM_ID + NEXT_PUBLIC_GA_MEASUREMENT_ID
 *
 * Vercel API 参照:
 *   https://vercel.com/docs/rest-api/endpoints/projects#create-one-or-more-environment-variables
 *   https://vercel.com/docs/rest-api/endpoints/deployments#create-a-new-deployment
 */

const VERCEL_API = "https://api.vercel.com";

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID; // optional
const GTM_ID = process.env.GTM_CONTAINER_ID;
const GA_ID = process.env.GA_MEASUREMENT_ID;
const DRY_RUN = process.argv.includes("--dry-run");

const PLAN = [
  {
    project: "app-concierge",
    vars: [{ key: "NEXT_PUBLIC_GTM_ID", value: GTM_ID }],
  },
  {
    project: "vodnavi-brand",
    vars: [
      { key: "NEXT_PUBLIC_GTM_ID", value: GTM_ID },
      { key: "NEXT_PUBLIC_GA_MEASUREMENT_ID", value: GA_ID },
    ],
  },
];

function die(msg) {
  console.error(`[ignite-vercel-env] FATAL: ${msg}`);
  process.exit(1);
}

function validateInputs() {
  if (!TOKEN) die("env VERCEL_TOKEN is required (issue at https://vercel.com/account/tokens)");
  if (!GTM_ID) die("env GTM_CONTAINER_ID is required (e.g. GTM-XXXXXXX). Refusing to invent a fake value because it would break production analytics.");
  if (!/^GTM-[A-Z0-9]{4,}$/.test(GTM_ID)) die(`GTM_CONTAINER_ID=${GTM_ID} does not match GTM-XXXXXXX pattern`);
  if (!GA_ID) die("env GA_MEASUREMENT_ID is required (e.g. G-GG7JV9MJRW)");
  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) die(`GA_MEASUREMENT_ID=${GA_ID} does not match G-XXXXXXXX pattern`);
}

function withTeam(url) {
  return TEAM_ID ? `${url}${url.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(TEAM_ID)}` : url;
}

async function vercel(method, path, body) {
  const res = await fetch(withTeam(`${VERCEL_API}${path}`), {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, body: json ?? text };
}

async function getProject(name) {
  return vercel("GET", `/v9/projects/${encodeURIComponent(name)}`);
}

async function upsertEnvVar(projectName, key, value) {
  // POST /v10/projects/{id}/env  is upsert with ?upsert=true.
  // target: ["production"] only — Preview への誤投入リスクを構造的に排除。
  return vercel(
    "POST",
    `/v10/projects/${encodeURIComponent(projectName)}/env?upsert=true`,
    { key, value, target: ["production"], type: "encrypted" },
  );
}

async function triggerProductionRedeploy(projectName) {
  // 最新の本番デプロイを取得し、その gitSource を再利用して新規 deployment を作成。
  const list = await vercel(
    "GET",
    `/v6/deployments?app=${encodeURIComponent(projectName)}&target=production&limit=1`,
  );
  if (!list.ok) return { ok: false, status: list.status, reason: "list deployments failed", body: list.body };
  const last = list.body?.deployments?.[0];
  if (!last) return { ok: false, status: -1, reason: "no previous production deployment found" };
  const gitSource = last.gitSource;
  if (!gitSource) return { ok: false, status: -1, reason: "last deployment has no gitSource (cannot rebuild)" };
  return vercel("POST", `/v13/deployments`, {
    name: projectName,
    target: "production",
    gitSource,
  });
}

async function main() {
  validateInputs();

  console.log(`[ignite-vercel-env] mode=${DRY_RUN ? "DRY-RUN" : "EXECUTE"} team=${TEAM_ID ?? "(personal scope)"}`);

  for (const { project, vars } of PLAN) {
    console.log(`\n--- ${project} ---`);

    const p = await getProject(project);
    if (!p.ok) {
      console.error(`  [${project}] GET project failed: ${p.status} ${JSON.stringify(p.body).slice(0, 200)}`);
      process.exitCode = 1;
      continue;
    }
    console.log(`  ok project found id=${p.body.id ?? "?"} framework=${p.body.framework ?? "?"}`);

    if (DRY_RUN) {
      for (const v of vars) console.log(`  [dry-run] would upsert ${v.key}=*** (target=production)`);
      console.log(`  [dry-run] would trigger production redeploy`);
      continue;
    }

    for (const v of vars) {
      const r = await upsertEnvVar(project, v.key, v.value);
      console.log(`  upsert ${v.key}: ${r.ok ? "OK" : "FAIL"} status=${r.status}`);
      if (!r.ok) console.error(`    ${JSON.stringify(r.body).slice(0, 300)}`);
    }

    const dep = await triggerProductionRedeploy(project);
    if (dep.ok) {
      console.log(`  redeploy queued: ${dep.body?.url ?? "(no url)"} state=${dep.body?.readyState ?? "?"}`);
    } else {
      console.error(`  redeploy FAILED: ${dep.reason ?? ""} ${JSON.stringify(dep.body).slice(0, 200)}`);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error("[ignite-vercel-env] FATAL:", err?.stack ?? err);
  process.exit(1);
});
