/**
 * GA4 Data API — 9/12 判定に向けたデータ鮮度の確認（第124便 ②）
 * 【厳守】読み取り専用。鍵の値は出力しない。
 */
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json","utf8"));
const PROPERTY = "489519780";
const b64u = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
async function token(){
  const now = Math.floor(Date.now()/1000);
  const h=b64u({alg:"RS256",typ:"JWT"});
  const c=b64u({iss:KEY.client_email,scope:"https://www.googleapis.com/auth/analytics.readonly",aud:"https://oauth2.googleapis.com/token",exp:now+3600,iat:now});
  const s=createSign("RSA-SHA256"); s.update(`${h}.${c}`); s.end();
  const jwt=`${h}.${c}.${s.sign(KEY.private_key,"base64url")}`;
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})});
  const j=await r.json(); if(!j.access_token) throw new Error("token 取得失敗"); return j.access_token;
}
const tok = await token();
const run = async (b) => (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`,{method:"POST",headers:{authorization:`Bearer ${tok}`,"content-type":"application/json"},body:JSON.stringify(b)})).json();
const rt  = async (b) => (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runRealtimeReport`,{method:"POST",headers:{authorization:`Bearer ${tok}`,"content-type":"application/json"},body:JSON.stringify(b)})).json();

console.log("=== ①処理済み最終日（date 次元・直近14日） ===");
const a = await run({dateRanges:[{startDate:"14daysAgo",endDate:"today"}],dimensions:[{name:"date"}],metrics:[{name:"sessions"},{name:"activeUsers"},{name:"screenPageViews"}],orderBys:[{dimension:{dimensionName:"date"},desc:true}]});
(a.rows??[]).forEach(r=>console.log(`  ${r.dimensionValues[0].value}  sessions=${r.metricValues[0].value}  users=${r.metricValues[1].value}  pv=${r.metricValues[2].value}`));
if(!a.rows) console.log("  (行なし) raw:", JSON.stringify(a).slice(0,300));

console.log("\n=== ②Realtime（収集の生存確認・§6） ===");
const b = await rt({metrics:[{name:"activeUsers"}]});
console.log("  activeUsers =", b.rows?.[0]?.metricValues?.[0]?.value ?? "0（行なし）");

console.log("\n=== ③記事A を含む /articles/ 面の日別 PV（9/1〜） ===");
const c = await run({dateRanges:[{startDate:"2026-09-01",endDate:"today"}],dimensions:[{name:"pagePath"}],metrics:[{name:"screenPageViews"},{name:"sessions"}],
  dimensionFilter:{filter:{fieldName:"pagePath",stringFilter:{matchType:"BEGINS_WITH",value:"/articles/"}}},orderBys:[{metric:{metricName:"screenPageViews"},desc:true}]});
(c.rows??[]).forEach(r=>console.log(`  ${r.dimensionValues[0].value}  pv=${r.metricValues[0].value}  sessions=${r.metricValues[1].value}`));
if(!c.rows) console.log("  0件（/articles/ の PV が期間内に無い）");

console.log("\n=== ④記事A 単体（全期間 2026-08-01〜） ===");
const d = await run({dateRanges:[{startDate:"2026-08-01",endDate:"today"}],dimensions:[{name:"date"}],metrics:[{name:"screenPageViews"}],
  dimensionFilter:{filter:{fieldName:"pagePath",stringFilter:{matchType:"CONTAINS",value:"fanza-subscription-vs-single-purchase"}}},orderBys:[{dimension:{dimensionName:"date"},desc:true}]});
(d.rows??[]).forEach(r=>console.log(`  ${r.dimensionValues[0].value}  pv=${r.metricValues[0].value}`));
if(!d.rows) console.log("  **0件** — 2026-08-01 以降、記事A の PV は1件も無い");
