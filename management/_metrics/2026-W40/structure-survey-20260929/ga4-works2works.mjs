import fs from "node:fs"; import { createSign } from "node:crypto";
const key=JSON.parse(fs.readFileSync("app-concierge/ga4-service-account.json","utf8"));
const b64u=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
const now=Math.floor(Date.now()/1000);
const h=b64u({alg:"RS256",typ:"JWT"}),c=b64u({iss:key.client_email,scope:"https://www.googleapis.com/auth/analytics.readonly",aud:"https://oauth2.googleapis.com/token",exp:now+3600,iat:now});
const s=createSign("RSA-SHA256");s.update(`${h}.${c}`);const jwt=`${h}.${c}.${s.sign(key.private_key,"base64url")}`;
const tok=(await (await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt})})).json()).access_token;
const run=async body=>{const r=await fetch("https://analyticsdata.googleapis.com/v1beta/properties/489519780:runReport",{method:"POST",headers:{authorization:`Bearer ${tok}`,"content-type":"application/json"},body:JSON.stringify(body)});return r.json();};
const and=ex=>({andGroup:{expressions:ex}});
const f=(field,op,value)=>({filter:{fieldName:field,stringFilter:{matchType:op,value}}});
const notCN={notExpression:f("country","EXACT","China")};
const dr=[{startDate:"2026-09-01",endDate:"2026-09-28"}];
// 1) page_view on /works/ grouped by referrer class
const r1=await run({dateRanges:dr,dimensions:[{name:"pageReferrer"}],metrics:[{name:"eventCount"}],dimensionFilter:and([f("eventName","EXACT","page_view"),f("hostName","EXACT","app.vodnavi.jp"),f("pagePath","BEGINS_WITH","/works/"),notCN]),limit:100000});
if(r1.error){console.log(JSON.stringify(r1.error));process.exit(1);}
const cls={};let tot=0;
for(const row of r1.rows||[]){const ref=row.dimensionValues[0].value,n=+row.metricValues[0].value;tot+=n;
 let k=/app\.vodnavi\.jp\/works\//.test(ref)?"works":/app\.vodnavi\.jp\/genres\//.test(ref)?"genres":/app\.vodnavi\.jp\/actresses\//.test(ref)?"actresses":/app\.vodnavi\.jp\/?(\?|$)/.test(ref)?"top":/app\.vodnavi\.jp\/articles/.test(ref)?"articles":/app\.vodnavi\.jp/.test(ref)?"app_other":ref===""||ref==="(not set)"?"empty":/google\./.test(ref)?"google":/t\.co|x\.com|twitter/.test(ref)?"x":"external_other";
 cls[k]=(cls[k]||0)+n;}
const ext=(r1.rows||[]).filter(r=>{const x=r.dimensionValues[0].value;return !/app\.vodnavi|google\.|t\.co|x\.com|twitter/.test(x)&&x!==""&&x!=="(not set)"}).map(r=>[r.dimensionValues[0].value,+r.metricValues[0].value]);const agg={};for(const[k,v] of ext){const d=k.split("/")[2]||k;agg[d]=(agg[d]||0)+v;}console.log(JSON.stringify(Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,10)));
console.log(JSON.stringify({window:dr,rows:(r1.rows||[]).length,total_pageview_works:tot,by_referrer:cls},null,1));
// 2) events list on works pages (custom click events?)
const r2=await run({dateRanges:dr,dimensions:[{name:"eventName"}],metrics:[{name:"eventCount"}],dimensionFilter:and([f("hostName","EXACT","app.vodnavi.jp"),f("pagePath","BEGINS_WITH","/works/"),notCN]),limit:100});
console.log(JSON.stringify((r2.rows||[]).map(r=>[r.dimensionValues[0].value,+r.metricValues[0].value])));
