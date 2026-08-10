# VODNAVI FACT GOVERNANCE RULES

> 先祖返り（regression）抑止用の**確定ファクト正典**。CSO/CTO スクリプトが繰り返し再導入する誤りを1箇所に固定する。BRIEF_101〜115 で個別訂正した内容の集約。**新規ブリーフ/スクリプトは本ファイルに反しないこと。**

## 1. 開発・インフラ不変条件
- **`vodnavi.jp` は既に Next.js（App Router）構築済**（`site-brand/`：`next.config.ts` / `src/app/layout.tsx` / `[slug]/page.tsx` dual-read / `03_content/`）。新規 init/スクラッチ構築は厳禁＝既存への拡張のみ。
- **ブランドトークンは定義済**：hex 定義の物理正典は monorepo ルート直下の `design-tokens.css`（`--brand-gold`(#D4AF37) / `--brand-dark`(#121212) 等の `:root` カスタムプロパティ）＝単一情報源。`site-brand/design-tokens.css` は Vercel 単体 deploy 用の**同期コピー**（root 更新時に sync）。`site-brand/src/app/globals.css` は `@import "../../design-tokens.css"` + `@theme inline` による **var() 参照のみ**の露出層で hex を再定義しない。**運用帰結は不変：brand-token を参照せよ・hex 直書き・再定義は禁止。**
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
- **予測は既知の残存要因を定量的に織り込む（CSO確定 2026-08-08）**：§6 事前登録などで予測を立てる際、施策が**触らない**要因（例: sitemap 本体に残る amateur 400 URL、既提出分の自然減衰）を**件数で明示**すること。「ゼロにはならない」という**定性的な但し書きだけでは増減の方向を誤る**。実例＝Q の予測「代替canonicalは減少する」は本体400の寄与を過小評価して**不支持**となった（実装は archive 側で意図どおり機能。**Q は失敗ではなく、予測の設計が不完全だった**）。

## 5. FANZA TV / TV Plus の料金・見放題本数（誤読の再発防止・CSO確定 2026-08-06）
戦略顧問側が「**2,200作品以上は TV Plus 側の見放題本数**」と指摘したが**これは誤り**。確定ファクト台帳 v2026-07-22（`TASK_BOARD.md` L2006 / L1839 / L1955）が正典:
- **DMMプレミアム（月550円・税込）** … FANZA TV の見放題特典は **対象作品 2,200本以上**（≠FANZA全作品。但し書き必須）
- **FANZA TV Plus（+1,078円・税込/月）** … 追加すると見放題が **合計10万作品以上に拡張**（出典: **登録画面実表示**・2026-07-22 HUMAN実査）
- したがって「月550円で2,200作品以上が見放題」は**正しい記述**であり、修正不要。
- **1,078円と2,200円は矛盾しない**: **1,078円=読者の支払額** / **2,200円=TV Plus 初回登録の成果報酬**（`TASK_BOARD.md` L1771 報酬料率）。**別項目**であり「併存＝未確定」ではない。
- **TV Plus の未確認事項は「追加手続きの実画面URL」のみ**（`url-builder.ts` の `TVPLUS_ADD_TARGET` 禁則解除に必要）。料金の矛盾は台帳照合で解決済み。
- **`premium.dmm.co.jp` は遮断ドメイン**（2026-08-06 権限モード変更後の再確認でも `This site is not allowed due to safety restrictions.`）＝実画面URLの確認は **HUMAN 実査枠**。

### 5-2. 見放題作品数と判別方法（**CSO/HUMAN 実査確定 2026-08-11**・実画面スクリーンショット）
- **実確認日 2026-08-11 / 実施者 CSO（HUMAN）/ 根拠＝`tv.dmm.co.jp` および `video.dmm.co.jp` の実画面**
- **作品数（確定値）**: FANZA TV（DMMプレミアム 550円）＝**2,287作品** / Plus限定＝**101,383作品** / **合計 103,670作品**。LP表記は「2,300作品以上」「毎月120〜150作品更新」
- 台帳の従来記述「TV Plus 2,200作品以上→合計10万作品以上」は **「2,200＝基本プラン側 / 10万＝Plus込み合計」の読みで正しかった**ことが確定（§5 の解釈を追認）
- **見分け方**: `tv.dmm.co.jp` の一覧で **赤い「Plus」バッジあり＝TV Plus（+1,078円）が必要** / **バッジなし＝550円プランで見放題**。左サイドバー「サービス」で `FANZA TV` / `Plus限定` の絞り込みも可能
- **【最重要・構造的制約】`video.dmm.co.jp` の作品ページには見放題対象か否かの表示が存在しない**。実証＝同一作品 **MIFD-173** の二面比較: `video.dmm.co.jp` 側は単品購入のみ（DL980円 / DL+ST680円 / ST300円）で見放題表示なし、`tv.dmm.co.jp` 側は「プレミアム会員なら2,300作品以上見放題」＝550円対象
- **帰結: FANZA API に見放題フラグが存在しない（2026-08-05 実呼び出しで確定）ことと表裏。VODNAVI の works 詳細は `video.dmm.co.jp` 側データで構成されるため、サイト上に見放題情報を持てない構造である。** works 詳細の CTA 文言が「作品ページを見る」（＝単品/見放題を断定しない）である理由もこれ
- **`tv.dmm.co.jp` / `video.dmm.co.jp` はツール層遮断＝Chrome 連携でも到達を試みない（恒久ルール）。作品数の更新は四半期ごとの HUMAN 実査枠**

## 6. トラフィック指標の情報源（運用則・CSO確定 2026-08-07）
- **サーバサイドのリクエスト数を実ユーザー指標として使用しない**。対象＝Vercel Runtime Logs のリクエスト件数 / Firewall の Allowed 件数・Top Request Paths / Runtime Errors の `users`。
- 根拠（2026-08-06 実測・24時間）: `/concierge` 16,017件のうち **Bot Category 付与＝15,843件＝98.9%**（ai_crawler 6.3K / search_engine_optimization 4.6K / browser_impersonation 4.3K / search_engine_crawler 650）。ボット分類なし（`not set`）は **174件＝1.09%** のみ。**Bot Protection は Inactive**（＝ボットは遮断されずすべて計上される）。
- **人間のトラフィック指標は GA4 のみを正とする**（GA4 は JS 実行が前提のためボットを計上しない）。乖離の実測: Vercel 24h ÷ GA4 単日 は `/concierge` ≈3,998倍 / actresses ≈858倍 / genres ≈380倍 / works ≈165倍 / トップ ≈157倍。**乖離は全面に存在する**。
- 帰結: 「Vercel のログにリクエストが多い＝読者が多い / 障害の影響ユーザーが多い」と読まないこと。障害の**人的**影響を見積もるときは GA4 の同期間アクティブユーザーと突き合わせる。
- 例外: **検証用 Chrome は `/g/collect` を送信しない**ため、CTO の実操作分は GA4 に計上されない（別途 `dataLayer` で確認する）。

## 7. VODNAVI_SILENT_DEATH_GUARD（FANZA API 400）の扱い（CSO確定 2026-08-07・**対処不要／監視のみ**）
- **スパイク型の事象**。直近7日 2,684件のうち **2,172件（81%）が 2026-08-05（UTC）の1日に集中**。最終発生 **2026-08-05T19:01:27Z＝2026-08-06 04:01 JST**、以後26時間以上ゼロ。恒常的な障害ではない。
- **読者影響は限定的**: `fetchItemList` は stale-serve ラッパ（`0667855` 2026-07-14）で、鮮度上限内（**一覧48h / cid単品7日**）のキャッシュがあれば throw せず**通常どおり描画**する。**CTA が消えるのは works 詳細の `getWork()` が失敗して `notFound()`＝404 になった場合のみ**（関連作品の取得失敗は `[]` を返すだけで CTA は残る）。発生率は works リクエストに対し **約1.1%**。
- **`users` を実ユーザー数として読まない**（§6）。7日 `users` 1,321 に対し GA4 の同日サイト全体アクティブユーザーは **56**（約20倍）＝大半がボット由来と**推定**（直接判別する手段は無い）。
- **記録すべき符合（因果は断定しない）**: ①初回発火 2026-06-21T13:36:09Z は **`23669e9`（6/21 19:22 JST・actresses/genres へ JSON-LD 注入 + robots.ts で AI クローラー明示 allow）の3時間14分後** ②この JSON-LD 注入箇所は **`c237e51` が「af_id 露出→bot fetch」経路として是正したのと同じ場所** ③2026-08-06 実測のボット内訳で **ai_crawler 39.3%**（amazonbot 5.2K / claudebot 919）。**時系列の一致と場所の一致のみを記録し、因果は未確定**。
- **監視方法**: Vercel Runtime Errors で GUARD の発生を**週次確認**。**1日1,000件を超えるバーストが再発した場合のみ報告**する（それ未満は記録も報告も不要）。
- 調査全文 → `management/_metrics/2026-W32/datapull-20260807-0630-silent-death-guard.md`
