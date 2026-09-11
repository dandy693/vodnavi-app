/**
 * GA4 Data API — 記事A 判定材料（第124便 D・2026-09-12）
 * 【厳守】読み取り専用。鍵の値は出力しない。判定文は書かない。
 * 出力: ①処理済み最終日 ②Realtime ③記事A 日別 PV/セッション(2026-08-11〜) ④/articles/ 面 URL 別(8/11〜)
 *       ⑤補助指標 ①-a works_to_articles_cta / actresses_to_articles_cta の product_click 件数(計装 8/3〜)
 *       ⑥①-c articles 面の product_click placement 別(8/11〜) ⑦記事A の sessionSource/medium
 */
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
const KEY = JSON.parse(readFileSync("C:/Users/Tachi/projects/VODNAVI-GROUP/app-concierge/ga4-service-account.json","utf8"));
const PROPERTY = "489519780";
const A = "/articles/fanza-subscription-vs-single-purchase";
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
const rows = (x) => (x.rows ?? []).map(r => [...r.dimensionValues.map(v=>v.value), ...r.metricValues.map(v=>v.value)]);
const jst = () => new Date(Date.now()+9*3600e3).toISOString().replace("T"," ").slice(0,19)+" JST";
console.log("取得開始:", jst());

console.log("\n=== ①処理済み最終日（date・直近7日） ===");
rows(await run({dateRanges:[{startDate:"7daysAgo",endDate:"today"}],dimensions:[{name:"date"}],metrics:[{name:"sessions"},{name:"screenPageViews"}],orderBys:[{dimension:{dimensionName:"date"},desc:true}]})).forEach(r=>console.log("  ",r.join("  ")));

console.log("\n=== ②Realtime activeUsers ===");
const b = await rt({metrics:[{name:"activeUsers"}]}); console.log("  ", b.rows?.[0]?.metricValues?.[0]?.value ?? "0（行なし）");

console.log("\n=== ③記事A 日別（2026-08-11〜today・pagePath 完全一致） ===");
const c = rows(await run({dateRanges:[{startDate:"2026-08-11",endDate:"today"}],dimensions:[{name:"date"}],metrics:[{name:"screenPageViews"},{name:"sessions"},{name:"activeUsers"}],
  dimensionFilter:{filter:{fieldName:"pagePath",stringFilter:{matchType:"EXACT",value:A}}},orderBys:[{dimension:{dimensionName:"date"},desc:false}]}));
c.forEach(r=>console.log("  date=%s pv=%s sessions=%s users=%s", ...r)); if(!c.length) console.log("  0件");
console.log("  合計 pv=%d sessions=%d", c.reduce((a,r)=>a+ +r[1],0), c.reduce((a,r)=>a+ +r[2],0));

console.log("\n=== ④/articles/ 面 URL 別（2026-08-11〜today） ===");
rows(await run({dateRanges:[{startDate:"2026-08-11",endDate:"today"}],dimensions:[{name:"pagePath"}],metrics:[{name:"screenPageViews"},{name:"sessions"}],
  dimensionFilter:{filter:{fieldName:"pagePath",stringFilter:{matchType:"BEGINS_WITH",value:"/articles/"}}},orderBys:[{metric:{metricName:"screenPageViews"},desc:true}]})).forEach(r=>console.log("  ",r.join("  ")));

console.log("\n=== ⑤補助 ①-a: product_click × placement（works_to_articles_cta / actresses_to_articles_cta）2026-08-03〜today ===");
const e = rows(await run({dateRanges:[{startDate:"2026-08-03",endDate:"today"}],dimensions:[{name:"customEvent:placement"}],metrics:[{name:"eventCount"}],
  dimensionFilter:{andGroup:{expressions:[{filter:{fieldName:"eventName",stringFilter:{matchType:"EXACT",value:"product_click"}}},{filter:{fieldName:"customEvent:placement",inListFilter:{values:["works_to_articles_cta","actresses_to_articles_cta"]}}}]}}}));
e.forEach(r=>console.log("  ",r.join("  "))); if(!e.length) console.log("  0件（両 placement とも行なし）");

console.log("\n=== ⑥補助 ①-c: articles 面の product_click placement 別 2026-08-11〜today ===");
const f = rows(await run({dateRanges:[{startDate:"2026-08-11",endDate:"today"}],dimensions:[{name:"customEvent:placement"},{name:"pagePath"}],metrics:[{name:"eventCount"}],
  dimensionFilter:{andGroup:{expressions:[{filter:{fieldName:"eventName",stringFilter:{matchType:"EXACT",value:"product_click"}}},{filter:{fieldName:"pagePath",stringFilter:{matchType:"BEGINS_WITH",value:"/articles/"}}}]}}}));
f.forEach(r=>console.log("  ",r.join("  "))); if(!f.length) console.log("  0件");

console.log("\n=== ⑦記事A の流入元（sessionSource / sessionMedium）2026-08-11〜today ===");
const g = rows(await run({dateRanges:[{startDate:"2026-08-11",endDate:"today"}],dimensions:[{name:"sessionSource"},{name:"sessionMedium"}],metrics:[{name:"sessions"},{name:"screenPageViews"}],
  dimensionFilter:{filter:{fieldName:"pagePath",stringFilter:{matchType:"EXACT",value:A}}}}));
g.forEach(r=>console.log("  ",r.join("  "))); if(!g.length) console.log("  0件");
console.log("\n取得終了:", jst());
