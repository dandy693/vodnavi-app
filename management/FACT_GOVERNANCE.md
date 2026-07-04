# VODNAVI FACT GOVERNANCE RULES

> 先祖返り（regression）抑止用の**確定ファクト正典**。CSO/CTO スクリプトが繰り返し再導入する誤りを1箇所に固定する。BRIEF_101〜115 で個別訂正した内容の集約。**新規ブリーフ/スクリプトは本ファイルに反しないこと。**

## 1. 開発・インフラ不変条件
- **`vodnavi.jp` は既に Next.js（App Router）構築済**（`site-brand/`：`next.config.ts` / `src/app/layout.tsx` / `[slug]/page.tsx` dual-read / `03_content/`）。新規 init/スクラッチ構築は厳禁＝既存への拡張のみ。
- **ブランドトークンは定義済**：`site-brand/src/app/globals.css` の `--brand-gold`(#D4AF37) / `--brand-dark`(#121212) 等 CSS 変数を**参照**。hex 直書き・再定義は禁止。
- **年齢確認制御は `app-concierge/src/proxy.ts`**（Next.js 16 規約・旧 `middleware.ts` 後継）。`src/middleware.ts` の新規作成は厳禁。
- **年齢ゲートの守備範囲は固定（非対称ガード）**: matcher は `/concierge`・`/concierge/:path*`（**パススルー＝redirect しない**・`_gl` 着地 log のみ）+ `/api/concierge/:path*`（cookie 未通過 403）に**限定**。`/works` および clean 面 vodnavi.jp は**公開＝ゲート非対象**（SEO 面・BRIEF_051）。cookie 不在時の全パス redirect/rewrite 型ゲート化・matcher 拡大は禁止（2026-07-04 CSO 案で再導入を観測＝live 検証済み T-20260701-MIDDLEWARE-AUTH の破壊）。
- **クッキーは3機構を絶対に混載しない**：①年齢確認 `vodnavi_age_verified`（`proxy.ts` 検査）②FANZA 早期着火 `buildEarlyCookieURL`（`af_id`）③GA4 クロスドメイン linker `_gl`（gtag 自動消費）。各々独立実装。
- **実在正典法人格は `合同会社トレンドネット` のみ**（`site-brand` の `layout.tsx` JSON-LD legalName / terms / privacy / about / footer に浸透した検証済値）。`Safari株式会社` 等の架空法人名の捏造・コミットは永久禁止（特商法表記の不備防止・BRIEF_035 で不採用確定）。

## 2. SEO・ルーティング不変条件
- **`?sort=` 等クエリURLへの `noindex` は厳禁**。必ず self-canonical consolidation（正規絶対URLへ評価集約）。noindex は consolidation を阻害する（e82a670 / BRIEF_101）。slug 付き canonical + not-found のみ noindex は実装済。
- **`moterist.com` は完全凍結（as-is hold・削除/移送しない、BRIEF_043）**。「完全遷都」は**未承認の gated**（board `T-20260628-11`）＝既成事実化しない。流入は `?source=moterist` / GA4 hostName で識別。

## 3. 計測（GA4）確定値（2026-07-01 claude-in-chrome 物理確認）
- プロパティ `p489519780`（アカウント VODまとめ研究所 `a355462253`）＝vodnavi.jp。測定ID `G-GG7JV9MJRW`、web stream `11225897844`。アクセスは `authuser=2`=`moterist.com@gmail.com`（`authuser=0`=hdktchkw33 の他社既定プロパティ罠に注意）。
- クロスドメイン linker 構成済：`vodnavi.jp`(完全一致) + `app.vodnavi.jp`(含む) + `moterist.com`(含む)。タイムゾーン (GMT+09:00) 日本時間 / 通貨 JPY(¥)。

## 4. ガバナンス手続き不変条件
- **TASK_BOARD.md は in-place のみ**：`cat >` / `mv tmp` の全面上書き禁止、`>>` 追記 or `Edit` 部分置換のみ（履歴保全）。日本語 append は heredoc（`printf` はマルチバイト破損）。
- **タスク ID / BRIEF 番号は一意**。既存作業への重複タスクは新規起票せず既存へ集約（cross-ref）。
- **捏造禁止**：HUMAN 承認 / 実行完了 / gate 通過を勝手に既成事実化しない。目視/物理確認できた事実のみ記載、未確認は「未確認」と明記。
