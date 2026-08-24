# `SUPABASE_AI_PROPOSER_JWT` の発行・設定手順（**HUMAN 枠・CSO が実施する**）

**作成**: 2026-08-25（第107便 タスクD）
**対象読者**: **CSO（HUMAN）。全工程を CSO が自力で実施する。**
**根拠**: `FACT_GOVERNANCE` §12（`ai_proposer` の権限）/ §13-0（AI は資格情報の値に触れない）

---

## 0. 【非交渉の制約】この手順書には値が一切現れない

- **本書には、実際の値も「値の例」も一切書かない。** **`eyJ…` のような断片も書かない。**
- **CTO（AI）は、本手順のどの段階でも値を受け取らない・出力しない・記録しない。**
- **CSO は、本手順で得た値をチャットに貼り付けないこと。** **貼り付けた時点で、その値はチャット履歴に残る。**
- **CTO 側の完了後確認は「挙動のみ」で行う**（→ §5）。**値の照合はしない。**

### 【最重要・先に読むこと】JWT シークレットは `service_role` キーより強い

- **これから使う「JWT シークレット」は、__任意のロールの JWT を発行できる署名鍵__である。** **`service_role` を名乗る JWT も作れる。**
- **したがって、`SUPABASE_SERVICE_ROLE_KEY` より権限が広い。**
- **【厳守】JWT シークレットを、jwt.io などの Web サイトに貼り付けないこと。** **署名は必ず手元の端末で行う**（→ §2）。
- **Vercel に置くのは「発行済みの JWT」であって「JWT シークレット」ではない。** **この2つを取り違えないこと。**

---

## 1. 事前確認（**CTO が実測済み。CSO の作業は不要**）

| 確認項目 | 実測（2026-08-25） |
|---|---|
| `ai_proposer` ロールの実在 | **存在する**（`rolcanlogin=false` / `rolbypassrls=false` / 有効期限なし） |
| `authenticator` が `ai_proposer` のメンバーか | **メンバーである**＝**PostgREST が `set local role ai_proposer` へ切り替える前提が実在する** |
| `ai_proposer` の GRANT | **テーブル INSERT のみ**（§12） |
| プロジェクト | `xflqxxyvphqqmnzscpxr`（`vodnavi-production`） |

---

## 2. JWT の発行（**CSO の端末で実施**）

### 2-1. 【重要】Supabase のダッシュボードに「任意ロールの JWT を作るボタン」は無い

- ダッシュボードが表示するのは **`anon` / `service_role` の2つだけ**である。
- **`ai_proposer` の JWT は、プロジェクトの JWT シークレットを使って自分で署名する必要がある。**

### 2-2. JWT シークレットの場所

**Supabase ダッシュボード → 対象プロジェクト → Settings → API（JWT Keys / JWT Settings の項目）**
※ Supabase の UI は改称されることがある。**「JWT Secret」または「Legacy JWT Secret」と表示されている項目**を探す。

- **表示された値をコピーする。画面のスクリーンショットを撮らないこと。**
- **この値をファイルに保存しないこと。** 次の手順で環境変数として1回だけ使う。

### 2-3. 署名（**手元の端末・PowerShell**）

**次のファイルを作る**（このファイルに値は含まれない）:

`mint-ai-proposer-jwt.mjs`
```js
import { createHmac } from "node:crypto";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const secret = process.env.SUPABASE_JWT_SECRET;
if (!secret) { console.error("SUPABASE_JWT_SECRET が未設定"); process.exit(1); }
const now = Math.floor(Date.now() / 1000);
const YEARS = Number(process.env.JWT_YEARS ?? "1");
const payload = { role: "ai_proposer", iss: "supabase", iat: now, exp: now + YEARS * 365 * 24 * 3600 };
const head = b64({ alg: "HS256", typ: "JWT" });
const body = b64(payload);
const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
console.log(`${head}.${body}.${sig}`);          // ← これが JWT（標準出力）
console.error(`[確認] role=${payload.role} / exp=${new Date(payload.exp * 1000).toISOString()}`);
```

**実行**（PowerShell）:
```powershell
$env:SUPABASE_JWT_SECRET = '<ここに JWT シークレットを貼る>'
$env:JWT_YEARS = '1'
node mint-ai-proposer-jwt.mjs
$env:SUPABASE_JWT_SECRET = $null    # ← 実行後すぐに環境変数から消す
```

- **標準出力の1行が JWT である。** **標準エラーには `role` と有効期限だけが出る（値は出ない）。**
- **`exp` を確認すること。** **有効期限が切れると提案バッチは動かなくなる**（再発行が必要＝分類B が1件増える）。**期間は CSO の判断事項**（長いほど運用は楽だが、漏洩時の影響期間が延びる）。
- **【動作確認済み】本スクリプトの形式は、ダミー値による自己検証（同じ秘密で再署名して一致するか）で確認してある**（2026-08-25・CTO）。**実際の秘密は使っていない。**
- **【厳守】実行後にコマンド履歴を確認すること。** PowerShell の履歴（`Get-PSReadLineOption` の `HistorySavePath`）に、シークレットを代入した行が残る場合がある。**残っていれば当該行を削除する。**
- **`mint-ai-proposer-jwt.mjs` はリポジトリ配下に置かないこと**（値は含まれないが、リポジトリ内に置く必要がない）。

---

## 3. Vercel への設定

**Vercel ダッシュボード → プロジェクト `vodnavi-app` → Settings → Environment Variables**

| 項目 | 設定する値 |
|---|---|
| **Key** | **`SUPABASE_AI_PROPOSER_JWT`** |
| **Value** | **§2-3 で得た JWT**（**シークレットではない**） |
| **Environment** | **Production のみ**（**Preview / Development のチェックは外す**） |
| **Sensitive** | **ON** |

**併せて必要なもの**（実測で未設定・§12 の訂正）:

| 項目 | 設定する値 | Sensitive |
|---|---|---|
| **Key** | **`SUPABASE_URL`** | **OFF でよい**（秘密ではない） |
| Value | Supabase ダッシュボード → Settings → API の **Project URL** | — |
| Environment | **Production のみ** | — |

### 【厳守】設定の理由

- **Production のみ**にするのは、**preview デプロイから DB へ書ける余地を残さない**ため（`T3_AUTO_POST_ENABLED` / `AIRTABLE_POSTS_PAT` と同じ判断）。
- **Sensitive ON** にすると **Vercel のダッシュボードから値を再表示できなくなる。** **控えが必要なら設定前に用意すること**（ただし、控えを残さず再発行する運用でもよい）。

---

## 4. デプロイによる反映（**設定しただけでは反映されない**）

- **Vercel の環境変数は「設定」と「反映」が別である。**
- **`vercel.json` の `ignoreCommand` により、`app-concierge/` に差分を含む push が無いとビルドが起動しない。** **ダッシュボードの Redeploy も `ignoreCommand` を通過して CANCELED になる**（第102便 実測）。
- **→ 設定後、`app-concierge/` 配下に差分を含むコミットを push する必要がある。** **この push は CTO 側で行う**（B2②-b 本体の実装コミットが兼ねる）。

---

## 5. CTO 側の完了確認は「挙動のみ」

- **CTO は値を確認しない。** **`AIRTABLE_POSTS_PAT` と同じ扱いである**（§13-0）。
- **確認するのは次の1点のみ**:
  - **提案バッチのログから「`SUPABASE_AI_PROPOSER_JWT` が未設定」という趣旨のメッセージが消えること。**
- **【厳守】「未設定のメッセージが消えた」は「JWT が有効である」ことを意味しない。** **署名が誤っていれば PostgREST は 401 を返す。** **有効性は INSERT が通ることで確認する。**
- **§10 の読み戻し検算をどの経路で行うかは未裁定**（第107便 タスクC の起案・`ai_proposer` には SELECT ポリシーが無い）。

### 想定される失敗と、その見え方

| 失敗 | 見え方 |
|---|---|
| 環境変数が反映されていない（push を忘れた） | ログに「未設定」が出続ける |
| 署名が誤っている / シークレットを取り違えた | **PostgREST が 401** |
| **`role` クレームに custom role を使う経路が拒否される** | **PostgREST が 401 または権限エラー** |
| `exp` が切れた | **PostgREST が 401**（設定は残っているのに動かなくなる） |
| RLS `with check` に反する値を書こうとした | **PostgREST が 403 または 42501** |

- **【厳守・未検証】3行目について。** **§12 は「PostgREST が JWT の `role` クレームで `set local role` する」ことを__前提__として記述しているが、Supabase のホスト版でこの経路が実際に通ることは検証されていない。** **`authenticator` が `ai_proposer` のメンバーであることは実測で確認済み（§1）だが、これは必要条件であって十分条件ではない。** **もしここで詰まった場合、原因は本手順の誤りではなく前提そのものにある。**

---

## 6. この手順書が扱わないこと

- **`link_approver` の JWT。** **提案バッチのプロセスに `link_approver` の鍵を渡さないことが、人間の承認を担保する唯一の手段である**（§12 原文）。**同じ手順で発行しないこと。**
- **§12 の service role の限界。** **service role は RLS を迂回する。** **レンダラを実装した時点で同じ限界が生じる。** **本手順は提案バッチの資格情報だけを扱う。**
- **JWT の失効監視。** **`exp` が来たことを検知する仕組みは無い。** **静かに 401 になる。** 監視の要否は CSO の判断事項。
