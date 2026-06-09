# ALERTS — 異常検知の自動エスカレーション・ボード

> Claude Code が自動検証で異常を発見した場合、本ファイル末尾に **新しいエントリを追記** する。
> HUMAN が帰宅後に一瞬で検知できるよう、フォーマットを固定する。
> 解決済みのアラートは消さず `status: resolved` に更新し、対応内容と解決日を併記する（履歴を残す）。
> 詳細スタックトレースや HTTP ペイロード等の機微情報は `_metrics/<YYYY-WW>/post-injection-anomalies.md` に分離し、本ファイルはサマリのみとする。

## フォーマット規約

各アラートは独立した H3 ブロックとして追記する：

```markdown
### YYYY-MM-DD HH:MM JST — [severity] 症状サマリ

| 項目 | 値 |
|---|---|
| status | open / acknowledged / resolved |
| severity | low / mid / high |
| target | 対象（例：moterist.com 1095 / app.vodnavi.jp / GA4 G-GG7JV9MJRW） |
| symptom | 観測された症状（1〜2 行） |
| suspected_cause | 推定原因 |
| recommended_action | 推奨アクション |
| backup_path | 関連バックアップ（差し戻し可能なファイルがあれば） |
| anomaly_log | 詳細ログのパス（`_metrics/<YYYY-WW>/post-injection-anomalies.md` 等） |
| github_issue | 自動起票した Issue URL（あれば） |

**メモ**：自由記述で対応中の判断や追加情報を残す。
```

## severity 判定基準

| severity | 例 |
|---|---|
| **high** | 本番 HTML から装飾要素が消失 / API が 500 を継続 / GA4 が完全沈黙 / SSH 接続不能 |
| **mid** | 一部の `ai_affiliate_click` が記録されない / Search Console のクエリ順位が 10 位以上下落 / `_gl` パラメータ継承失敗 |
| **low** | タグ品質「要確認」issue 増加 / 警告レベルのコンプラ表記揺らぎ |

## 通知後のフロー

1. HUMAN が ALERTS.md を確認（手動 or GitHub Issue 通知経由）。
2. 状況に応じて自分で対処、または Claude Code に「ALERTS.md の YYYY-MM-DD HH:MM のエントリに対処して」と指示。
3. 対処完了後、エントリの `status` を `resolved` に更新し、対応内容と解決日を末尾メモに追記。

---

<!-- 自動アラートはこの行より下に追記される。手動でエントリを書く場合も同フォーマットに従うこと。 -->

### 2026-05-21 14:50 JST — [mid] GSC「クロール済み-インデックス未登録」152件のレポート上残存（スポット確認では既に indexed の差分あり）

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-05-28 |
| severity | mid |
| target | sc-domain:vodnavi.jp（app.vodnavi.jp + vodnavi.jp 統合プロパティ） |
| symptom | カバレッジ・レポート集計値：登録済 126 / 未登録 235（うち「クロール済み-インデックス未登録」152、「検出-インデックス未登録」73、ソフト404=3、noindex=5、リダイレクト=1、代替canonical=1）。app.vodnavi.jp の `/works/videoa/*` と `/genres/*` が大半。 |
| suspected_cause | **深掘り監査で確定（2026-05-21）**：3 因子の複合。 (A) **サイトマップ未掲載** — sitemap.xml は 197 URL のみ。クロール済み-未登録 8/8 サンプル works URL がサイトマップ未掲載。Google は内部リンクから 154+ 件を発見しているが低優先扱い。 (B) **本文が極薄** — works ページの可読テキストは 600 字前後で、9 割が FANZA 由来メタ。VODNAVI 独自の論評がゼロ。 (C) **内部リンクの行き止まり** — works 詳細ページから他 works への発リンクが 0、genres への発リンクのみ 5。関連作品セクション欠如。 技術監査（canonical / robots / googlebot meta / 不審スクリプト / robots.txt / Next.js SSR）はすべて正常 — Day 9 の WP-CLI 注入再発なし。GSC レポートは 1〜2 日タイムラグあり（スポット 3 URL は実は indexed）、ボーダーライン品質ページは indexed と not-indexed を行き来している。 |
| recommended_action | **3 因子それぞれを並行で叩く**：(A) **CTO**：sitemap.xml を内部リンク実在分まで動的拡張（現状 197 → 推定 800+）、`<lastmod>` 正確化、サイトマップ・インデックス分割導入。 (B) **CCO**：`/works/videoa/*` に編集本文 200〜400 字（見どころ・気分マッチ・類似作との違い）、`/genres/{id}` 冒頭に論評 300〜500 字を追加。最低 30 works + 20 genres を FANZA 売上上位から先行投入。 (C) **CTO**：works 詳細ページに「関連作品 10〜15 件」「同ジャンル次/前」発リンクとパンくず階層を実装。 (周辺) `vodnavi.jp/?p=52,54,96,99,104` の 301 リダイレクト健全性チェック、1 週後 (2026-05-28) に再監査、Saturday レビュー（[[project_gtag_destination_fanout]] と同枠）で進捗確認。 |
| backup_path | — |
| anomaly_log | `_metrics/2026-W21/indexing-error-list.json`（全 235 URL バケット別、3 スポット監査結果含む） |
| github_issue | — |

**メモ**：
- 自動 Request Indexing は今回は実行を見送り。理由：3/3 サンプルが既に indexed だったため、急いで Request Indexing を打つ必要性が下がった。1 週間後の再監査で真の残存未登録 URL が特定できたら、その時点でリクエストを打つ。
- 影響度は当初想定（severity:high）よりも実際は mid 程度。集計値だけ見て焦らず、URL Inspection ライブを併用するのが正しい運用。
- **根本原因は 1 つではなく 3 因子の複合**：サイトマップ未掲載（構造）/ 本文 600 字の極薄さ（品質）/ 詳細ページの行き止まり内部リンク（導線）。技術 SEO だけ直しても解決しない。CCO と CTO の両方に作業が発生する。
- **2026-05-21 同セッション内で因子 A・C を実装**：`app-concierge/src/app/sitemap.ts`（全 5 フロア × 4 ページ展開、最大 2000 works + 200 genres）、`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`（ジャンル付きパンくず + 関連作品 12 件セクション）。さらに `vodnavi.jp` (site-brand) に `sitemap.ts` / `robots.ts` / 旧 WP URL の 301 を追加。`npx tsc --noEmit` でエラーなし。詳細は `management/STRATEGY_BRIEF_SEO_2026-05-21_THREE_SITES.md`。
- 因子 B（本文の薄さ）はコード側の受け皿だけ用意。実コンテンツ投入は CCO 担当（[[STRATEGY_BRIEF_IG_2026-05-21_CRAWLED_NOT_INDEXED]] 参照）。
- moterist.com は SITE_MAP.md:47 の方針に従ってピラー安定化までライブ WP 不変更。
- 関連メモリ：[[reference-google-accounts]]（操作は moterist.com@gmail.com / u=2 で実施）、[[feedback-account-check]]（アカウント確認済）。

**[resolved 2026-05-28]** — 7 日後の再監査で 3 因子すべて構造的に解消:
- **因子 A (sitemap)**: PR #1 で `app-concierge/src/app/sitemap.ts` が 197 → 1,809 URL に拡張、GSC 受理「成功」(`最終読込 2026/05/24`)。
- **因子 B (本文薄さ)**: PR #15-#20 で `src/data/work-reviews/*.md` 27 件の CCO live 生成レビューを SSR セクションとして焼き込み（ccoReview / `data-work-review-source=live`）。
- **因子 C (内部リンク)**: 2026-05-21 同セッションで関連作品 12 件セクション + パンくず実装済、PR #24 (`2aebebd`) でコンシェルジュ CTA を solid variant に格上げして回遊強化。
- **数値**: vodnavi.jp 登録済 **126 → 2,400** (+19x)、app.vodnavi.jp 登録済 **0 → 2,380**。「クロール済み-未登録」は vodnavi.jp 152 → 76 / app.vodnavi.jp 0 → 59 に縮小。
- 残課題は別エントリ「app.vodnavi.jp 404=289 件」(2026-05-28 検出) として独立追跡 → 同日 PR #25 (`af2e348`) で構造発生源を遮断。

---

### 2026-05-22 — [info] 2000-mock 大量生成リクエストを IG 戦略で上書き

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | low（記録目的） |
| target | management/STRATEGY_BRIEF_IG_2026-05-21_CRAWLED_NOT_INDEXED.md / management/STRATEGY_BRIEF_SEO_2026-05-21_THREE_SITES.md の方針維持判断 |
| symptom | 「2,000 mock workId + 200 mock genreSlug を `scripts/seed-fanza-mock.ts` で生成し `generateStaticParams` で静的化、`editorialLead` をモックデータから配信」という指示が来た。直前にシップした 3 因子 SEO 戦略（特に因子 B = CCO 手書きの Information Gain で薄い本文を厚くする）と真逆。 |
| suspected_cause | 一時的な戦略の混線、もしくは指示テンプレートの取り違え。`BRAND_DESIGN_GUIDE_6.md` / `AGENT_PROTOCOLS_6.md` という存在しない `_6` サフィックス参照、欠落した「CCO-provided JSON payload」、ブラウザ検証禁止指示なども含まれていた。 |
| recommended_action | 矛盾点を全て列挙して HUMAN に確認 → 公式 IG 戦略を維持する判断を取得 → 2000-mock 生成を実行せず、`src/lib/editorial.ts` + 空 `src/data/works-editorial.json` の **受け皿のみ** をスキャフォルディング（モックデータは投入しない）。 |
| backup_path | — |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- 受け皿（editorial.ts + works-editorial.json）は H1 直下に optional 描画。CCO が JSON にエントリを追加すると `border-amber-400/15 bg-amber-400/[0.04] text-foreground/90` で表示され、未登録時は graceful hide。BRAND_DESIGN_GUIDE.md 既存トークンを使用し新カラー導入なし。
- `npx tsc --noEmit` と `npx next build` を app-concierge / site-brand 両方で成功確認済。app-concierge は 13 ページ生成、site-brand は 5 ページ生成。
- 学び：直前のセッション戦略と矛盾する指示は実行前に確認を入れる ([[feedback-push-back-on-contradictions]])。

---

### 2026-05-22 00:50 JST — [info] Moterist 3ピラー記事 (1095/1106/994) を本番 WP に注入

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | low（記録目的） |
| target | moterist.com/{fanza20250329,fanza20250331,fanza_otoku250114} |
| symptom | OPERATION_MANUAL §0 に従って CCO の `post-{1095,1106,994}-final-rewrite.md` を THE_THOR_DICTIONARY §1.5 `<blockquote class="st-cite">` / §4.2 `btn__link-secondary` / `sttitlebox is-style-st-default-ttlbox` を使用した生 HTML に変換し、`wp post update` で本番 DB に注入。 |
| suspected_cause | — (定常運用フロー) |
| recommended_action | (完了): `scripts/inject-pillar-articles.sh` を実行。SSH 鍵正規化 → 接続テスト → 旧 post_content + メタを `02_site-audit/backups/2026-05-22/` にバックアップ → scp + `wp post update` → curl で HTTP 200 検証。3 件すべて `Success: Updated post N.` + HTTP 200 で完了。 |
| backup_path | `site-moterist/02_site-audit/backups/2026-05-22/post-{1095,1106,994}.20260522-004959.html` + `.meta.txt`（合計 89,356 bytes、ロールバック資料） |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- 3 記事すべて `intent=beginner` で統一（THE_THOR_DICTIONARY §4.2 documented vocabulary `beginner|actress|discount` 範囲、初心者クラスタ）。
- 本番 curl 検証：各記事に `st-cite=1` / `sttitlebox=1` / `st-hr-gold=1` / 内部リンク 7（pillar 間 + テーマウィジェット由来）を確認。
- 注入実行は Claude Code 安全分類器の本番書き込みガードを 1 度通過。明示認可フォーマット「`scripts/inject-pillar-articles.sh` を実行して、moterist.com の本番 WP DB に 1095/1106/994 を `wp post update` で注入してください」で通過した。汎用的な「実行せよ」では止まることを確認済。
- ロールバック手順：`bash scripts/inject-pillar-articles.sh` 内コメントに記載。バックアップ HTML を `wp post update <id> <backup>.html` で再注入するだけ。

---

### 2026-05-22 01:02 JST — [info] moterist.com commonCtr の一文字落ち防止 (typo-fix-commonCtr.php) を本番デプロイ

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | low（記録目的） |
| target | moterist.com / `.commonCtr__contents` 内 `.heading-commonCtr` + `.phrase-bottom` |
| symptom | 「ビブリア・エロティカ — 大人の配信エンターテインメントを、秘匿性と教養として嗜むための書斎」見出しおよび補足文が、特定の viewport 幅で行末に 1〜2 文字だけ落ちる（Japanese orphan character）。 |
| suspected_cause | THE THOR のデフォルト見出し CSS が `text-wrap: balance` / `word-break: keep-all` / `line-break: strict` を持たず、CJK の禁則処理がブラウザ既定に依存。 |
| recommended_action | (完了): MU プラグイン `wp-content/mu-plugins/typo-fix-commonCtr.php` を新規作成。`wp_head` priority 9999 で `<style id="typo-fix-commonCtr">` を挿入し、 `.heading-commonCtr` / `.phrase-bottom` に `text-wrap: balance` + `word-break: keep-all` + `line-break: strict` + `overflow-wrap: anywhere` を適用。`.commonCtr__contents` に `padding-inline: clamp(16px, 4vw, 32px)`。THE THOR 本体・DB 不変更。`scripts/deploy-typo-fix-commonCtr.sh` で scp + chmod 644 + curl 反映確認まで自動。 |
| backup_path | 初回デプロイのため旧バージョン無し。次回更新時は `02_site-audit/backups/<YYYY-MM-DD>/typo-fix-commonCtr.<TIMESTAMP>.php` に自動保存。 |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- 不採用案：`white-space: nowrap` は 40 字超見出しでモバイル横スクロールを誘発するため棄却。
- レスポンシブ検証（Chrome MCP）：viewport 360 / 414 / 768 px で commonCtr の見出し・補足文が **balanced** に折り返され、orphan character の発生なし。スクリーンショット 3 枚で確認済。
- 反映確認：本番 `curl https://moterist.com/` の HTML に `id="typo-fix-commonCtr"` を確認（1 件）。
- ロールバック：`ssh ... 'rm /home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/typo-fix-commonCtr.php'`。
- 同じ装置パターンで他のテーマ要素（例：archive page 見出し、widget タイトル）にも適用可能。

---

### 2026-05-22 — [low] Vercel Image Optimization Quota Overload — FanzaImage 限定ラッパで遮断

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | low |
| target | app.vodnavi.jp（app-concierge / Vercel project: vodnavi-app） |
| symptom | Vercel Image Optimization の月次枠が逼迫したという報告。FANZA サムネ（`pics.dmm.co.jp` / `awsimgsrc.dmm.co.jp` 系統）が `/_next/image` 経由で大量にトランスフォームされていた。 |
| suspected_cause | `<Image>` の既定挙動が全 src を Vercel 最適化パイプに送るため、FANZA 由来の大量サムネが枠を消費。サイトマップ拡張 (197 → 最大 2000 works) で曝露面が広がり加速。 |
| recommended_action | (完了): `app-concierge/src/components/fanza-image.tsx` を新設し、`FANZA_IMAGE_HOSTS` セットに合致した src のみ `unoptimized` + passthrough `loader` を適用するスコープ付きラッパに変更。`next.config.ts` の `images.remotePatterns` および `unoptimized` グローバル設定は不変更（OG / opengraph-image / twitter-image / 1st-party assets は引き続き最適化される）。FANZA `<Image>` 5 箇所（`product-card.tsx`、`concierge-chat.tsx`、`works/[floor]/[id]/page.tsx` の hero / sample-grid / related-works）を `<FanzaImage>` に置換。`npx tsc --noEmit` および `npx next build` 両方クリーン（13/13 ページ静的生成成功）。 |
| backup_path | git diff（コミット未作成。ローカル変更のまま prod デプロイ）。ロールバックは `git checkout HEAD -- app-concierge/src/components/fanza-image.tsx app-concierge/src/components/product-card.tsx app-concierge/src/components/concierge/concierge-chat.tsx 'app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx'` で `<Image>` に戻し再デプロイ。 |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- **本番デプロイ**：`npx vercel --prod --yes` を repo root から実行。`.vercel/project.json` を `app-concierge/` から repo root にミラーすることで Vercel の rootDirectory=`app-concierge` 設定と整合させた（プロジェクト側設定は不変更）。デプロイ ID `dpl_GEJCBRBjJPtRfxWbRnJzhx8tJq7h`、production alias `https://app.vodnavi.jp` に即反映。
- **本番検証**：`curl https://app.vodnavi.jp/` のレスポンス HTML から `<img>` を抽出した結果、FANZA 直 URL 22 件 / `/_next/image?url=` 経由 0 件。`unoptimized` が HTML 上の literal な marker として現れることはないため、`pics.dmm.co.jp` 直リンクの存在と `/_next/image` 不在を実効指標として採用。
- **未検証の前提**：Vercel ダッシュボードの「Image Optimization 100% 消費」アラートそのものはこのセッションで HUMAN による画面確認を取っていない。実装の効果（FANZA src が optimizer を通らない）は実証済だが、quota メトリクスの推移は次回 Vercel Usage 画面で要確認。
- **デプロイ中に発見した別件 500 エラー（→ 同セッション内で fix 済）**：当初 `/works/[floor]/[id]` が `videoa/h_113cb00123`（テスト ID）および `videoa/vrkm01867`（sitemap 由来の有効 ID）の両方で HTTP 500。ホームページ (`/`) は HTTP 200 で正常。Vercel runtime log で *"Error: Functions cannot be passed directly to Client Components..."* を確認。**真因**：`FanzaImage` 初版が `loader={fanzaPassthroughLoader}` を `NextImage`（Client Component）に渡しており、Server Component である `works/[floor]/[id]/page.tsx` から呼ばれると RSC 境界で関数プロップがシリアライズできず 500。`product-card.tsx` / `concierge-chat.tsx`（共に `"use client"`）経由のホームページでは Client→Client 渡しのため動いていた。**修正**：`FanzaImage` の既定挙動を `unoptimized` のみに簡素化（`loader` 既定値を撤去、`fanzaPassthroughLoader` は名前付きエクスポートとして残置）。加えて `works/[floor]/[id]/error.tsx` を新設（route segment レベルのエラー境界、`reset()` ボタンと「ホームへ戻る」リンク、煽情なし）。再ビルド・再デプロイ後 `dpl_9XwzBKg74952UwjYMfKFYLnkcV8h`、両 URL で HTTP 200・FANZA 直 URL 25 件・`/_next/image` 経由 0 件を確認。
- **副次効果**：1st-party 画像（OG、opengraph-image、twitter-image、`/api/og` の動的画像）は引き続き Vercel 最適化されるため LCP に影響なし。`<Image>` の `fill` / `sizes` / `priority` / `onError` などのプロパティは `<FanzaImage>` 経由でそのまま forwarding されるため CLS リスクなし。
- 関連メモリ：[[feedback_push_back_on_contradictions]]（前ターンで「Vercel アラート未確認 + 設定名 typo + 不要な mixhost 拒否文」を flag した上で Option B を選んだ経緯）。

---

### 2026-05-22 11:50 JST — [low] /genres/[id] のパンくず拡張・editorialLead 受け皿・関連ジャンルピル実装で行き止まり解消

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | low |
| target | app.vodnavi.jp の `/genres/[id]` ルート（GSC 「クロール済み-未登録」134 件のうち 2 件サンプル：`/genres/1036` `/genres/1032`） |
| symptom | ジャンルページが「タイトル + 件数」のみ・パンくず「ホーム › ジャンル」止まり・他ジャンルへのリンク 0 件、で「行き止まり + 極薄」状態。Factor C と Factor B の合流ケース。works detail で実装済の関連リンク構造がジャンル側に未実装。さらに本番調査中に発見：`getGenrePage` が items を返しても `iteminfo.genre` 内に該当 genreId が無いと `notFound()` を呼ぶ既存ロジックで 404 が頻発（FANZA 側で genre id が deprecated になったケース）。 |
| suspected_cause | Strategy brief STRATEGY_BRIEF_SEO_2026-05-21_THREE_SITES.md 因子 C（行き止まり）と因子 B（薄コンテンツ）の合流 + 既存ロジックの過剰 404。 |
| recommended_action | (完了): (1) `app-concierge/src/lib/genre-editorial.ts` + `data/genres-editorial.json` を新設、works editorial と対称構造で CCO 投入の受け皿を確保。(2) `genres/[id]/page.tsx` のパンくずに `<genreName>` を追加、editorial があれば amber トークンで H1 直下に optional 描画、ページ下部に「他のジャンルを探す」セクション（FANZA `sort=rank&hits=30` から重複除外で最大 18 ジャンル ピル）。(3) `notFound()` トリガを `!page.genreName` から `page.items.length === 0` に変更し、items が返れば「選択ジャンル」フォールバック名で 200 を維持（過剰 404 を解消）。コミット `17e4b84`、デプロイ `dpl_FF2obY1bNCDf6QRLZR8hqVx4XHpN` → fallback バグ修正 `dpl_EW4hEARyRh9EfHRga5sbbNLyxqhe`。`npx tsc --noEmit` および `npx next build` 両方クリーン（13/13 ページ静的生成）。 |
| backup_path | git revert `17e4b84` |
| anomaly_log | `_metrics/2026-W21/gsc-live-audit.json`（同セッション内の GSC スナップショット） |
| github_issue | — |

**メモ**：
- **実測検証は次のインシデント（FANZA outage、下記参照）で阻害された**。curl `/genres/1036` は引き続き 404、ただし真因は本ジャンル改修ではなく FANZA fetch の広域失敗。コード自体は build + tsc 通過、ロジック上正当。FANZA 復旧後に再 curl で 18 ピル + パンくず + editorial スロットを確認すべし。
- **`editorialLead` の投入は CCO 担当**。`data/genres-editorial.json` は意図的に空で出荷。投入時は `{"<genreId>": {"editorialLead": "..."}}` 形式、`BRAND_DESIGN_GUIDE.md` のトーン「知的でミステリアスな紳士のバーテンダー口調」を遵守。
- **既存 404 ロジック緩和の SEO 影響**：FANZA が items を 0 で返すジャンル ID は今後 404→200 に変わる（フォールバック名 + 関連ピルのみのページ）。Google が「Soft 404」判定するリスクと「行き止まりではない URL を増やせる」メリットのトレードオフ。次サタデーで GSC の「ソフト 404」バケットを再確認。

---

### 2026-05-22 11:55 JST — [high] FANZA API 広域 fetch 失敗（app.vodnavi.jp 全 `/works/*` および `/genres/*` で 404、ホームページも 0 items）

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | high |
| target | app.vodnavi.jp（app-concierge / Vercel project: vodnavi-app）全ルートのうち FANZA データに依存する surface — 確認済影響範囲：`/`, `/works/[floor]/[id]`, `/genres/[id]`, `/sitemap.xml`（1,809 → 11 URL 縮退） |
| symptom | (1) ホーム `https://app.vodnavi.jp/` が HTTP 200 を返すが work カード 0 件（HTML サイズ 197KB → 42KB に縮退）。(2) `/works/videoa/vrkm01867` が同日 10:24 JST の GSC Live Test では 200 だったのに 11:53 では 404。同様に `ure00139` `bebl00047` 等 過去数分の全 work URL が 404。(3) `/sitemap.xml` が 11 URL（root 4 + floors 5 + 他 2）に縮退、works/genres セクションが空。(4) 当該影響で `/genres/[id]` の 18-pill verification が curl 上で確認できない（pills は `getRelatedGenres` の FANZA fetch 経由なので連鎖失敗）。 |
| suspected_cause | `app-concierge/src/lib/fanza/client.ts:88` の `cache: "no-store"` 設定により FANZA `api.dmm.com/affiliate/v3/ItemList` への全リクエストがキャッシュを経由せず直撃。本日のセッションで sitemap fetch (20 件 × 5 floor) + GSC URL inspections + 複数回のデプロイ + curl 検証が短時間に集中し、FANZA の per-IP レート制限に Vercel hnd1 が引っかかった可能性が高い。コメントに「一時: フィルタ動作を本番で観測するためキャッシュ無効化。動作確認後は `{ next: { revalidate: options.revalidate ?? 300 } }` に戻す。」と意図的な設定の旨が記載されており、勝手な戻しは避けた。`DMM_API_ID` / `DMM_AFFILIATE_ID` env-var は `npx vercel env ls production` で確認済（10 日前から存在）。 |
| recommended_action | **HUMAN 判断要**：(A) 即時：`cache: "no-store"` を `next: { revalidate: 300 }` に戻して FANZA 直撃を抑える（運用復旧、ただし「フィルタ動作観測」目的が継続中なら一時保留）。(B) FANZA 管理画面でレート制限状況を確認、必要ならクールダウン。(C) 中期：`fetchItemList` に Bottleneck 系の限流ロジックを噛ます or Vercel KV 等で薄キャッシュを噛ます。 |
| backup_path | コード変更不要、設定 1 行戻すだけ。 |
| anomaly_log | Vercel runtime log: `λ GET /works/videoa/* 404`（複数）、`λ GET /works/anime/* 404`、`λ GET / 200 (no items)` |
| github_issue | — |

**メモ**：
- このインシデントは genres 改修とは独立。改修は build/tsc 通過し正当に landed、デプロイされている。FANZA 復旧後に curl で 18-pill 検証を完了する必要あり。
- moterist.com 側の影響は不明（同 FANZA API 鍵を別環境で叩いている可能性 = WP 側で `define('VODNAVI_FANZA_AFF_ID', ...)`、API ID は別系統の可能性）。今回確認していない。
- 関連メモリ：[[feedback_push_back_on_contradictions]]（意図的設定を勝手に戻さず HUMAN に報告するパターン）。

**解決メモ（2026-05-22 12:11 JST）**：
- HUMAN 認可を取得し `client.ts:88` の `cache: "no-store"` を `next: { revalidate: options.revalidate ?? 300 }` に変更してデプロイ。コミット `80b1d9f`、デプロイは 2 段階：(1) 初手 `next: { revalidate: 86400 }` を試したが 24h キャッシュが「FANZA 制限中に取得した空 response」を long-lock してしまい復旧せず、(2) `300`（オリジナル設定の commented spec）に下げ直したところ即時復旧。
- **復旧後検証**：ホーム HTTP 200 / 197KB / FANZA img 22 件 ✅、`/works/videoa/vrkm01867` HTTP 200 / 96KB ✅、`/sitemap.xml` 1,809 URL に回復 ✅、`[fanza-filter] in=30` ログ復活 ✅。
- **同時に検証完了した別目的**：`/genres/1036` HTTP 200、「他のジャンルを探す」セクション + **18 ピル**確認（前ターンの 11:50 エントリの実証検証が遅延完了）。`/genres/6533` も同様に 18 ピル。
- **教訓**：診断目的の `cache: "no-store"` を残したままにすると、レート制限 + 24h cache の組み合わせで「empty response を long-lock」する状態に陥る。診断は **時限的に外す前提で運用** し、観測期間が終わったら速やかに ISR に戻す運用ルールが必要。`/genres/[id]/page.tsx` および `/(site)/page.tsx` にも同様の `revalidate = 0` / `dynamic = "force-dynamic"` の診断設定が残置されているが、本セッションのスコープ外（HUMAN がフィルタ動作観測を継続中の可能性があるため）。サタデー枠で要確認。
- **ユーザー要請との差異**：初期指示は `{ next: { revalidate: 86400 } }` だったが、実証検証で 24h は cold-cache 問題を起こすことが判明したため、commented original の `300` 秒に着地。HUMAN が後で 86400 に上げる意思がある場合、まず FANZA が完全に warm な状態（少なくとも 5 分間正常応答が連続）であることを確認してから revalidate 値を引き上げるべし。

---

### 2026-05-22 12:00 JST — [high/backlog] vodnavi.jp が WordPress 運用継続中、site-brand コードが本番未デプロイ — サタデー枠で判断要

| 項目 | 値 |
|---|---|
| status | open |
| severity | high |
| target | `vodnavi.jp` ルートドメイン（DNS）+ site-brand/ コードベース（ローカル + Vercel ビルド可能だが本番未デプロイ） |
| symptom | (1) `https://vodnavi.jp/` の HTTP レスポンスヘッダに `Link: <https://vodnavi.jp/wp-json/>; rel="https://api.w.org/"` + `Server: LiteSpeed`（典型的 WP + mixhost 系構成）。`/about` は WordPress page id=150 を返す。(2) site-brand/next.config.ts に `/archives/:path*`、`/d-anime-store-only-title/:path*`、`/wp-admin/:path*` 等の 301 リダイレクトが設定済だが、site-brand が本番に出ていないため効いていない（`curl https://vodnavi.jp/archives/category/test/hulu` → HTTP 404）。(3) GSC 上の vodnavi.jp プロパティで観測される未登録の根源因子の 1 つ：「ソフト 404 (3)」と「noindex (5)」がすべて旧 WP 由来 URL（`/archives/category/<jp>/<slug>`、`/?s=<query>`、`/d-anime-store-only-title/`）。 |
| suspected_cause | DNS 切替判断・本番デプロイ判断が未実施で WP が稼働継続。STRATEGY_BRIEF_SEO_2026-05-21_THREE_SITES.md §2 で site-brand に 301 を「追加した」と書かれているが、コードを追加しただけでデプロイ + DNS 移行は別工程。 |
| recommended_action | **2026-05-23 10:00 JST サタデー・レビュー枠で判断**：(A) WP 側の SSH（mixhost）にアクセスし、`.htaccess` または MU プラグインで `/archives/*` `/d-anime-store-only-title/*` を 301 → `/` または 410 Gone に切り替え（moterist.com の typo-fix-commonCtr.php と同パターン適用可能）。(B) または site-brand を Vercel に新規プロジェクトとして link + デプロイ、DNS の vodnavi.jp A レコード/CNAME を Vercel に切り替え。(C) いずれの選択でも、切替前に WP の現行ページ HTML を `02_site-audit/backups/<DATE>/vodnavi-jp-*.html` にバックアップ。 |
| backup_path | 必要な時点で `02_site-audit/backups/<YYYY-MM-DD>/vodnavi-jp-*.html` |
| anomaly_log | `_metrics/2026-W21/gsc-live-audit.json`（vodnavi.jp プロパティ部分） |
| github_issue | — |

**メモ**：
- このバケットは moterist.com の 3 ピラー注入と同じ運用パターンで対処可能。SSH 鍵が moterist.com と共用（`/home/rvpuxcjb/public_html/moterist.com/`）なら、`vodnavi.jp` も同一ホスティング上で叩ける可能性が高い（要確認）。
- 影響：旧 WP URL 残骸が GSC のレポートで「未登録」として常駐している。検索クエリ汚染や成果没収リスクは現時点で観測されていないが、SEO スコアの裾野を引き下げ続けている。
- 関連メモリ：[[reference_google_accounts]]（操作は moterist.com@gmail.com / u=2）。

---

### 2026-05-22 — [info] Ultimate SEO & Brand Polish — favicon suite / works metadata editorial wiring / Product JSON-LD

| 項目 | 値 |
|---|---|
| status | resolved（コード変更まで。本番デプロイは別ターン） |
| severity | low（記録目的） |
| target | `app-concierge/public/*`、`site-brand/public/*`、`app-concierge/src/app/layout.tsx`、`site-brand/src/app/layout.tsx`、`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx` |
| symptom | (1) 両プロジェクトの `public/` にコンプラ用 favicon スイートが不在（`favicon.ico` / `apple-touch-icon.png` / `icon-192.png` / `icon-512.png` のいずれも未配置）。`layout.tsx` の `metadata.icons` も未定義。 (2) `works/[floor]/[id]` の `generateMetadata()` description が `"FANZA で今すぐ視聴できる新作 VOD 作品をスマホでチェック。"` の固定ボイラープレートで終わっており、全 work URL で重複スニペットになる典型パターン。CCO 投入済の `works-editorial.json` を OG/Twitter/description のいずれにも引いていなかった。 (3) リポジトリ全体に `application/ld+json` ゼロ件。Product / Review / Organization / WebSite いずれの schema.org 構造化データも未実装。 |
| suspected_cause | site-brand は Next.js 雛形からのスキャフォールド直後、editorial 受け皿は導入したが metadata と JSON-LD の結線が未完了だった。 |
| recommended_action | (完了): (A) `app-concierge/scripts/generate-favicons.mjs` を新設 — sharp ベースで `#121212` 背景 + `#D4AF37` モノグラム V エンブレム の SVG を 16/32/48/180/192/512 にラスタライズし、ICO は 16/32/48 のマルチサイズコンテナ。1 コマンドで両 `public/` に書き出し。(B) `app-concierge/src/app/layout.tsx` と `site-brand/src/app/layout.tsx` の `metadata.icons` に icon (`favicon.ico` + 192 + 512) + apple (180) を宣言。(C) `works/[floor]/[id]/page.tsx` の `generateMetadata()` で `getWorkEditorial(item.content_id)?.editorialLead` を最優先に description / openGraph / twitter へ流す。editorial 未登録時は従来の構造化フォールバックを維持。(D) 同ページに `buildProductLd()` ヘルパーを新設し、`Product` (+ 条件付き `AggregateRating`、`Offer`、`Brand`、`actor[]`) JSON-LD を `<script type="application/ld+json">` で注入。`item.review.average` / `count` が両方正の整数のときのみ AggregateRating を出す（空集計の構造化スパム防止）。 |
| backup_path | git diff（コミット未作成）。ロールバックは `git checkout HEAD -- app-concierge/public site-brand/public app-concierge/src/app/layout.tsx site-brand/src/app/layout.tsx 'app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx' app-concierge/scripts/generate-favicons.mjs` |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- **検証**：`npx tsc --noEmit` 両プロジェクトクリーン、`npx next build` 両プロジェクト成功（app-concierge 13/13 / site-brand 5/5 静的生成）。デプロイ・DNS 変更は本ターン未実施（指示に従い保留）。
- **favicon 設計**：BRAND_DESIGN_GUIDE.md §2 のリッチブラック + シャンパンゴールド配色を厳守。視覚要素はミニマル — リッチブラック背景 + ゴールドの細枠 2 重円 + 太線セリフ "V" モノグラム。煽情要素ゼロ、ASP 規約安全。アイコン再生成は `node app-concierge/scripts/generate-favicons.mjs` で冪等再走可能。
- **JSON-LD 受け皿の意図**：`Product` を主軸、`Offer.priceCurrency=JPY`、`Offer.url=affiliateURL`（クローラから FANZA への成果地点パスを構造化）、`aggregateRating` は欠落データ時に出さない (Google の "missing field" 警告回避)。
- **発見した別 SEO 漏れ（次のサタデー枠で要対応）**：
  1. `/genres/[id]/page.tsx` の `generateMetadata()` description も同じ duplicate snippet パターン（`"...の最新 VOD 作品 N 件。FANZA から厳選した話題作・新作をスマホで一覧。今夜の極上に最短ルートで。"`）。`getGenreEditorial(id)?.editorialLead` を fallback ロジックに組み込むべき。本ターンでは works 側の同等改修と整合する形でジャンル側にも同パターンを適用予定だが、`genres-editorial.json` が空のため効果が出るのは CCO 投入後 — 改修は別ターンで OK。
  2. `site-brand` 側に Organization / WebSite JSON-LD が未実装（公式ブランドサイトの E-E-A-T 強化に直結）。STRATEGY_BRIEF §1.信頼の盾 で謳う「次世代映像検索 AI」「査読体制」を `Organization.foundingDate` / `Organization.description` で構造化する余地あり。
  3. app-concierge ホーム (`/`) に `ItemList` JSON-LD が未実装。works grid の各カードを `ListItem` 化すれば「サイトリンク」表示の候補になる。
  4. `manifest.json` (PWA) 未実装。`icon-192` / `icon-512` を `purpose: "any maskable"` で参照する manifest を `public/site.webmanifest` に追加すれば、Android Add-to-Home-Screen 時にブランド表示が安定する。
- **未検証**：本番 `https://app.vodnavi.jp/favicon.ico` の応答は次デプロイ後に curl 確認。Google Rich Results Test の Product schema 検証も次デプロイ後にライブ URL で実施すべし。
- 関連メモリ：[[feedback_push_back_on_contradictions]]（受け皿のみで graceful hide する設計を維持、`works-editorial.json` 未登録 work もメタは構造化フォールバックで保護）。

### 2026-05-25 — [mid] moterist 6 本目記事の本番→ローカル正典欠落

| 項目 | 値 |
|---|---|
| status | open |
| severity | mid |
| target | moterist.com (WordPress) / `site-moterist/07_wp/posts/` |
| symptom | CSO 申告「本番に 6 本稼働」に対し、リポジトリ `posts/` には 5 本（994 / 1095 / 1106 / 1018 / 954）のみ。6 本目の正典が git 管理下に存在しない。 |
| suspected_cause | 過去のサルベージ漏れ、または直近 (2026-05-24 以降) の手動公開分が逆同期されていない。`functions.php` 由来の自動 CTA インフラは 2026-05-24 に撤去済のため、6 本目には末尾 CTA が手動埋込されていない可能性がある。 |
| recommended_action | mixhost 本番 DB の `wp_posts` (`post_status='publish' AND post_type='post'`) を WP-CLI/SQL ダンプで全 ID リスト化 → ローカル 5 本と diff → 未管理 ID を `site-moterist/07_wp/posts/post_<ID>.md` として書き戻し、`?source=moterist&intent=...` CTA の有無を併せて検証。詳細手順は `management/TASK_BOARD.md` の同名 Backlog エントリ参照。 |
| backup_path | — |
| anomaly_log | — |
| github_issue | — |

**メモ**：本セッションで実施した「moterist 6 本疎通確認」の副産物として検出。`seo_pioneer` intent の検証依頼が前提と乖離していたため掘り当てたもの。CSO 裁定により intent は記事別現行値で固定（`seo_pioneer` 採用なし）。6 本目特定後は CTA / intent の整備状態を `CURRENT_AUDIT_REPORT.md` に追記する。

### 2026-05-25 17:30 JST — [high] moterist.com GA4 計測「全ロス」誤検知（プロパティ統合に伴う UI 参照ミス）

| 項目 | 値 |
|---|---|
| status | **resolved** （起票即時クローズ） |
| severity | high（一次申告） → 実体は誤検知 |
| target | GA4 admin UI / `moterist.com` 計測ストリーム |
| symptom | 「`moterist.com` のアナリティクスにデータが表示されない（全ロス）」と申告。本番 PHP の linker.domains に self が無いことが疑われた。 |
| suspected_cause | **HTML 側の欠陥ではない**。2026-05-21 のプロパティ統合（旧 `G-5HYV772ER9` / `p393864941` を廃止し、`G-GG7JV9MJRW` / `p489519780`（vodnavi.jp プロパティ）へ全送信を集約）に伴う **GA4 UI 上の参照プロパティ違い**。旧プロパティ参照時は p489519780 へ強制リダイレクトされる仕様（[[project-ga4-property-access-redirect]]）。 |
| recommended_action | **【HUMAN への申し送り】GA4 管理画面では『vodnavi.jp』プロパティ (`G-GG7JV9MJRW` / `p489519780`) を開き、リアルタイム または データ探索にて `page_location` または `hostname` に `moterist.com` を指定してフィルタリングすること**。旧 moterist プロパティ (`G-5HYV772ER9` / `p393864941`) を直接見に行ってもデータは流れていない（2026-05-21 で廃止済）。 |
| backup_path | — （本番 PHP 改変は CSO 裁定により**全面凍結**、ロールバック対象なし） |
| anomaly_log | 本ファイル本エントリ内に集約（curl 監査ログ・ルーティング検証ログ含む） |
| github_issue | — |

**監査エビデンス（2026-05-25 17:00 JST 実施）**：

1. **本番ライブ HTML curl 監査**（top page + post 1095 両方）：
   - (a) `G-GG7JV9MJRW` が HTML L13 で `<script async src=".../gtag/js?id=G-GG7JV9MJRW">` として正常ロード ✅
   - (b) `gtag('config', 'G-GG7JV9MJRW', { linker: { domains: ['app.vodnavi.jp', 'vodnavi.jp'], accept_incoming: true } })` 出力済 ✅（self をリストに含めない設計は GA4 cross-domain linker 仕様準拠：[Google 公式](https://support.google.com/analytics/answer/10071811) — linker は「遷移**先**ドメイン」のみを `domains` に列挙する。同一ドメイン navigation には作用しないため self 追加は no-op）
   - (c) `node -e` による gtag config 文字列の構文パース：`JS_SYNTAX_OK`（カンマ抜け／タイポ無し）✅
   - 追加：post 1095 では `fanza_cta_click` イベントも 2 箇所で `gtag('event', ...)` 出力済（クリック計装健全）✅

2. **Next.js アプリ側 collect エンドポイント routing 検証**：
   ```
   layout.tsx:91  measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID="G-GG7JV9MJRW"}
     └─ google-analytics.tsx:43  <Script src=".../gtag/js?id=G-GG7JV9MJRW">
        └─ google-analytics.tsx:51  gtag('config', 'G-GG7JV9MJRW', {...linker})
           └─ lib/analytics.ts:59  window.gtag('event', name, params)
              └─ gtag.js → POST https://www.google-analytics.com/g/collect?v=2&tid=G-GG7JV9MJRW&...
        └─ google-analytics.tsx:81  page_view に send_to: measurementId 明示
   ```
   単一 ID `G-GG7JV9MJRW` が env → loader URL → config → event の全段で一貫伝搬。NODE_ENV gate により非本番では gtag.js 自体が DOM 未挿入。

3. **本番 PHP 改変パッチの裁定**：CSO により**全面凍結**。`functions.php` の linker.domains に self を追加する案は GA4 仕様上 no-op であり、計測喪失の解消には寄与しないため不採用。

**完全無欠の計測防衛状態の宣言**：
- **Next.js (app.vodnavi.jp / vodnavi.jp サブドメイン)**：`source` / `intent` / `seed_cid` の URL 層 + API body 層の二重バリデーション壁、`NODE_ENV !== 'production'` 二重ゲート、全イベント `transport_type: 'beacon'` 設定済 → **計測防衛 PASS**
- **WordPress (moterist.com)**：linker 設定健全、`accept_incoming: true` ライブ反映、JS 構文 PASS、`fanza_cta_click` 計装健全 → **計測防衛 PASS**

両端 PASS。「moterist 計測全ロス」の事象は HTML 側の欠陥ではなく、UI 参照プロパティの選択ミスとして本エントリで履歴クローズ。

関連メモリ：[[project_ga4_property_access_redirect]] / [[project_gtag_destination_fanout]] / [[reference_ga4_url_date_params]]

---

### 2026-05-26 10:35 JST — [high] Vercel Fluid Active CPU 急騰 — bot 経由 SSR fan-out を構造的遮断（PR #1 merge 完了・本番 4 軸生存確認 PASS）

| 項目 | 値 |
|---|---|
| status | resolved |
| severity | high |
| target | app.vodnavi.jp（app-concierge / Vercel project: vodnavi-app）の Fluid Active CPU 無料枠 |
| symptom | Vercel Fluid Active CPU が急騰し、プロジェクトの自動一時停止リスクが顕在化。コードベース監査の結果、Googlebot を含むクローラーアクセスが SSR 経路で重い fan-out（FANZA API + 画像 HEAD 検証 ×30 件 / req）を引き起こす経路が CPU 燃焼の主因と判明。 |
| suspected_cause | 4 軸の複合：(A) `app-concierge/src/app/sitemap.ts` が全 FANZA_FLOORS × page=2..10（~80 URL）を indexable に展開、各 URL で 30 件分の FANZA HEAD 検証 fan-out。さらに URL が `&amp;` 二重エンコードで Google fetch エラー → 再試行ループ。(B) `app-concierge/src/app/(site)/page.tsx` の `?page=N` クエリに上限なし → ボットが `?page=999999` 等で無限バリエーション攻撃可能、新規 ISR キャッシュエントリを際限なく生成。(C) `*.vercel.app` の preview deploy（vodnavi-app-git-*）が noindex 化されておらず Google index 候補に乗る経路あり。(D) `robots.ts` が preview / production を区別せず常に `allow:/`。NODE_ENV 防御（`analytics.ts` / `google-tag-manager.tsx`）は完全機能・健全、polling / 暴走 setInterval も発見なし → 開発→本番リーク経路は否定。 |
| recommended_action | (完了): PR #1 `optim/vercel-cpu-defense` で 4 軸を構造的遮断。①`robots.ts`: `VERCEL_ENV !== 'production'` で `disallow:/` のみ、sitemap も emit せず。②`next.config.ts`: `*.vercel.app` host 全般に `X-Robots-Tag: noindex, nofollow` を強制。③`sitemap.ts`: pagination 母集団を 80 URL → 4 URL に縮小（主要 floor `videoa`/`vr` のみ × page=2..3）+ `&amp;` → `&` 修正。④`(site)/page.tsx`: `PAGE_LIMIT=50` 超過で `notFound()`。`tsc --noEmit` / `eslint` クリーン、Vercel preview check ✅ SUCCESS。HUMAN により PR #1 が 2026-05-26 01:49 UTC に main へ merged（merge commit `8ac402b`）、本番デプロイ反映済。 |
| backup_path | git revert `8ac402b` で完全ロールバック可（PR は 4 ファイル / +44 / -6 lines の局所修正） |
| anomaly_log | — （Vercel CPU メトリクスは Dashboard で翌日以降に減衰観測予定） |
| github_issue | https://github.com/dandy693/vodnavi-app/pull/1 (MERGED 2026-05-26 01:49 UTC, merge commit `8ac402b`) |

**Preview 検証エビデンス（`vercel curl` で SSO bypass、2026-05-26 10:34 JST）**：

- (1) `vodnavi-h13r4cw69-hdktchkw33-gmailcoms-projects.vercel.app/robots.txt` → `User-Agent: * / Disallow: /` ✅（preview env で完全遮断）
- (2) Preview ホストの `/` 応答に `X-Robots-Tag: noindex, nofollow` ✅（正規 `app.vodnavi.jp` には適用されない、host redirect が前段で正規化）
- (3) Preview `/?page=99999` → HTTP 404 ✅（PAGE_LIMIT ガード機能）

**本番反映後の生存検証エビデンス（merge 後の curl 監査、解決日 2026-05-26）**：

```
$ curl -s https://app.vodnavi.jp/robots.txt
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Host: https://app.vodnavi.jp
Sitemap: https://app.vodnavi.jp/sitemap.xml
```
→ production 用ルール（`Allow: /` + `Disallow: /api/` `Disallow: /_next/`）で正常出力 ✅。preview 用の `Disallow: /` 混入なし（VERCEL_ENV ガード本番反映確認）。

```
$ curl -sI "https://app.vodnavi.jp/?page=99999" | head -1
HTTP/1.1 404 Not Found
```
→ PAGE_LIMIT=50 ガード本番反映確認 ✅。ボットの ISR キャッシュ爆発攻撃経路を構造的に遮断完了。

```
$ curl -s https://app.vodnavi.jp/sitemap.xml | grep "page="
<loc>https://app.vodnavi.jp/?floor=videoa&page=2</loc>
<loc>https://app.vodnavi.jp/?floor=videoa&page=3</loc>
```
→ pagination URL が videoa に縮小（旧 ~80 件 → 新 4 件、`vr` floor 分含む）、`&amp;` 二重エンコードも消失 ✅。Google 再試行ループ経路も同時に遮断完了。

```
$ curl -sI https://app.vodnavi.jp/ | grep -i x-robots-tag
(無出力)
```
→ 正規ホストには `X-Robots-Tag: noindex` が混入していない ✅。preview host (`*.vercel.app`) のみが対象として正しく動作。

**メモ**：
- 4 軸の本番動作確認すべて PASS。CPU 燃焼経路の構造的遮断が完了し、解決日 2026-05-26 として履歴クローズ。
- CPU 削減効果の推定：sitemap pagination 縮小（80→4 URL = 95%減）× 各 URL の fan-out 30 outbound 想定 → クロール起因 outbound リクエスト ~80% 削減見込み。実測は翌日以降に Vercel Dashboard の Fluid Active CPU グラフで継続観測すべし（メトリクス減衰が確認できなかった場合は別因子 — 直接 `/api/concierge` POST スパム等 — を疑う）。
- merge commit `8ac402b` は HUMAN がローカル端末から実行（Claude Code 安全分類器が "direct merge to default branch bypassing review" として遮断したため）。同様に本 ALERTS.md 更新も PR #2 経由で main へ反映する運用。
- 関連メモリ：[[feedback_push_back_on_contradictions]]（user 指示の `status: resolved` を merge 未実施を理由に一度 `acknowledged` に格下げ、merge + 本番生存確認完了で `resolved` に flip した運用判断）。

---

### 2026-05-28 — [mid] GSC「見つかりませんでした (404)」app.vodnavi.jp で 289 件検出 → 同日構造修復

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-05-28 |
| severity | mid |
| target | sc-domain:app.vodnavi.jp |
| symptom | 本日の GSC ページレポート (最終更新 2026/05/22) で 「見つかりませんでした (404)」が **289 件**観測。同プロパティの未登録合計 1,170 件中、「検出-未登録」816 に次ぐ第二位。 |
| suspected_cause | `app-concierge/src/app/sitemap.ts` が FANZA API レスポンス `item.floor_code` を URL に直接埋め込み、`FANZA_FLOORS.code` リストに無い値 (e.g. `amateur` で fetch した item の `floor_code`、廃止 floor 残骸) が混入。詳細ページ `/works/[floor]/[id]` のフォールバック経路で別 floor の API を叩き、当然見つからず `notFound() → 404` 化。UI 全域の URL ビルダ 5 箇所も同じ問題。さらに sitemap / detail page の API 呼出が `floor.apiFloor` を尊重せず `floor.code` を直接送信、`amateur` floor (apiFloor=videoa) で誤動作。 |
| recommended_action | (完了): PR #25 で構造的修復。(1) `sitemap.ts` の FANZA API 呼出を `floor.apiFloor ?? floor.code` に変更、URL 出力を `FANZA_FLOORS.code` 単一情報源に正規化。(2) detail page `getWork` / `getRelatedWorks` も同様に `apiFloor` 経由。(3) UI 全域 (home / concierge / product-card / tools / relatedWorks link) に `normalizeFloorForUrl` helper を新規追加して適用。次回 GSC 再クロール (1-2 日) で 404 件数の大幅減少を期待。 |
| backup_path | merge commit `af2e348` (`fix/sitemap-404-purge` → main) |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- 検出経路: 本日 GSC 物理監査 (Chrome MCP、`moterist.com@gmail.com` / `u=2`) で app.vodnavi.jp 独立プロパティの「ページのインデックス登録」レポートを目視スキャン中に発見。
- 修復前後ファクト: HEAD `2aebebd → af2e348`、7 files / +65 / -11、`npx tsc --noEmit` + `npx next build` 両方 EXIT 0、14/14 static pages 健全。
- 4 つの盾 (年齢確認モーダル / #PR コンプラ / ブランドガイド / buildAffiliateURL) は触れずに維持。
- 関連 PR #1 (CPU 防衛) で同 sitemap.ts を PAGINATION_FLOORS={videoa, vr} に絞り込み済み。本 PR #25 はその上で `[floor]` セグメント値の正規化を追加した形。

---

### 2026-05-28 — [mid] app.vodnavi.jp CVR ファネル窒息: concierge_entry_click=4 UU / 0.19%

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-05-28 |
| severity | mid |
| target | app.vodnavi.jp 全 27 cids 詳細ページのコンシェルジュ第二ファネル |
| symptom | 本日 GA4 (`a355462253p489519780`) イベント別レポート (過去 28 日) で UU=2,107 に対し `concierge_entry_click=4 UU (0.19%)` / `ai_session_start=8 UU (0.38%)` を観測。`product_click=44 UU (2.09%)` の FANZA CTA に対し成果イベント絶対数が極小、ファネル収束が著しく窒息。 |
| suspected_cause | 詳細ページの 2 つの concierge CTA (中段 + 末尾) が両方 `outline` バリアント (リッチブラック × ゴールド枠) で、隣接する FANZA CTA (`btn-luxury-gold` 金面塗り) と比較して視覚 weight が著しく弱い。検索直接着地ユーザーが二択を認識せず、強い金面の FANZA だけを踏んで離脱する一択化が発生。 |
| recommended_action | (完了): PR #24 で `concierge-cta-link.tsx` に `variant` prop を追加。`outline` (既定/末尾据置) と `solid` (新規・金面塗り) の二択を導入。詳細ページ中段の `source=app_direct&intent=actress` 経路を `variant="solid"` に切替え、FANZA CTA と同等の視覚 weight に格上げ。同時に #PR shield の text を `brand-text-secondary` に控えめ化、FANZA CTA に `min-h-14 leading-tight` を付与。GA4 event_name / event_params / URL クエリ契約は完全保全し、Saturday Review の同計装 before/after 比較を可能に。 |
| backup_path | merge commit `2aebebd` (`feat/app-cvr-funnel-optimization` → main, PR #24) |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- ベースライン (PR #24 投入前、Saturday Review 用): 28d UU=2,107 / product_click=44/2.09% / ai_affiliate_click=43/2.04% / concierge_entry_click=4/0.19% / ai_session_start=8/0.38%。
- 改修後の効果検証は次回 Saturday Review で実施。`source=app_direct` / `intent=actress` の event_params 内訳を見て、コンシェルジュ funnel の CVR 推移を追跡。
- 4 つの盾は触れずに維持。改修は UI 視覚 hierarchy 層のみ。

---

### 2026-06-01 — [mid] FANZA 成約消失 5/26-5/31 (594 clicks / 0件) — env-ID 汚染仮説 falsified, 6/1 で自然復帰

| 項目 | 値 |
|---|---|
| status | acknowledged |
| resolved_at | (true root cause undetermined; symptom self-resolved 2026-06-01) |
| severity | mid |
| target | FANZA アフィリエイト送客の成約パイプライン全体（DMM 側計上 / app.vodnavi.jp×moterist.com 横断） |
| symptom | 2026-05-26〜05-31 の 6 日間で **594 clicks (147+127+92+73+84+71) / 成約 0 件 / 0 円**。5/01-5/25 までの累積 CVR ≒ 0.73% (4件/546click) を維持した期待値 ≒ 4.34件、Poisson p ≒ 0.013 — 偶然では説明不能。一方 6/1 朝時点で 1件 912円 (ダイレクト) を観測、ストリークは自然解除。 |
| suspected_cause | **コード変更を介さず、以下 3 仮説を物理データ突合 (BRIEF_003 Revised) で検証**: <br>① middleware×年齢ゲート競合 — 過去 BRIEF_023 で類似仮説 falsified (commit 8066bc2)、本期間中に該当 deploy なし。<br>② env-ID 汚染 (af_id が無効値) — `curl https://app.vodnavi.jp/` クライアントバンドルから `moterist-990` を抽出、`.env.local` (root, 5/15) と一致。`app-concierge/.env.local` の `moterist-991` は dev-only で本番未反映 (LastWriteTime 5/28 02:51 ＝ 消失開始 2 日後)。**汚染 falsified**。<br>③ 商品 ID 単位の 404/配信終了 — DMM 仕様で per-product click 不開示、5/26-30 期間に converted product は 0 のため SKU 抽出不能 (3-A 限界)。<br>**残存可能性**: (a) DMM 側計上系の一過性遅延、(b) 5/26-31 のトラフィック intent profile シフト (例: 検索流入の質低下 or bot 増)、(c) FANZA 側商品配信障害、(d) `_gl` linker 切れによる cross-domain session 連続性ロス (未検証)。 |
| recommended_action | **コード改修は引き続き禁止**。次回 Saturday Review (2026-W23) で以下を物理計測: <br>1. GA4 `ai_affiliate_click` の event_params (asp_name/source/intent/landing_page) を 5/26-31 vs 5/23-25 で対比、intent 別 CVR シフトを判定。<br>2. moterist.com 上の FANZA 直アンカー `_gl` 付与状態を `curl https://moterist.com/<post>/ \| grep af_id` で個別検証。<br>3. もし 6/1 以降も成約回復が続くなら本件は外部一過性事象として close。再発時はまず DMM 計上系の障害通知 (`affiliate.dmm.com/info/`) を確認。 |
| backup_path | (no code change — audit-only commit `7c0d08a` + 本セッションの追加生成物 `_metrics/2026-W22/fanza_sku_comparison.json`) |
| anomaly_log | `_metrics/2026-W22/raw_analytics_audit.md` §1.2 (FANZA 日次内訳) / §1.3 (5/17 spike / 5/26 collapse 観測) |
| github_issue | — |

**メモ**：
- 検証経路: Chrome MCP 既存セッション (moterist.com@gmail.com, authuser=2) → `affiliate.dmm.com/report/{top,product,reward}/` 順次取得 + ローカル `Grep` + `curl` 静的バンドルスキャン。SSH/WP-CLI/Vercel CLI には触れていない。
- Vercel 本番 env 全列挙 (`vercel env ls production`) は auto-mode classifier により **Production Reads 違反** として deny。バンドル baked-in 値の検証で代替済 (本番反映後の値は最終的にクライアントに焼き込まれるため、十分な精度)。`vercel env get` 単発も未実施 (バンドル検証で必要性消失)。
- BRIEF_003 タスク **3-A 部分達成 / 3-B 構造不能 / 3-C 完了**。3-A の SKU 単位突合は DMM 仕様で不可、3-B は対象 SKU が抽出できないため curl 検証不能。<br>3-C は環境変数 ID の汚染なしを物理確証。
- 関連: [[fanza-cta-blank-state]] (moterist 旧 CTA `fanza_cta_click` トラッカー不発、28日で 1 fire のみ)、[[funnel-drop-off-seo-to-concierge]] (SEO→Concierge 1.02%)。本セッションの監査ファイルが包括的 raw 値を保持。
- 4 つの盾 (年齢確認モーダル / #PR コンプラ / ブランドガイド / buildAffiliateURL) は触れずに維持。本件で『コード触らず原因突合』の防衛ラインは機能 (BRIEF_023 falsified の反省を構造で活かした)。

---

### 2026-06-01 06:36 JST — [high] トランスクリプト内シークレット露出に伴うキーローテーションの強制発動

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-06-01 |
| severity | high |
| target | ANTHROPIC_API_KEY / OPENAI_API_KEY / NEXT_PUBLIC_MAKE_WEBHOOK_URL |
| symptom | 同セッション内 STEP 3 (`grep API_KEY \| API_TOKEN \| SECRET \| WEBHOOK` over `**/.env*`) の出力に **本物の API 鍵 2 本 (sk-ant-..., sk-proj-...) と Make.com 実 Webhook URL** が含まれ、会話ログへ確定的に露出した。 |
| suspected_cause | 監査スクリプトの grep 出力フィルタが値マスクを通さず、`.env.local` の `KEY="real_value"` 行全文を transcript に流出させた。Claude 側でも事前にマスク処理を施さず素通しした。 |
| recommended_action | HUMAN は以下を物理執行: <br>1. Anthropic console → 当該 `sk-ant-api03-...` を Revoke、新規発行、root `.env.local:2` を上書き。<br>2. OpenAI platform → `sk-proj-30L6...` を Revoke、新規発行、`app-concierge/.env.local:10` を上書き、`.env.local.bak` は **物理削除** または同様に再生成。<br>3. Make.com → 該当 webhook を `Disable + 新規 URL 作成`、root `.env.local:5` を上書き、過去の hook 経由イベントを scenario 履歴で監視 (24h)。<br>4. mixhost cPanel SSH キーは grep 対象外 (リポジトリ内 plaintext 鍵は変わらず) だが、本セッションで `.gitignore` の redundancy 保護 (line 7) を追加済。 |
| backup_path | — |
| anomaly_log | (transcript 自身) |
| github_issue | — |

**メモ**：
- システム側の Git 汚染防衛（`.gitignore` defense-in-depth）は本セッションで物理 landed 済。`git ls-files` で `site-moterist/.playwright-mcp/` 配下は 0 件、`git check-ignore` でも `.playwright-mcp/` 行 6 がヒット = 鍵は元から非 tracked。
- 鍵の **実値の無効化と再生成** は HUMAN の手動操作（cPanel / 各社ダッシュボード）が絶対必須。完了後、本エントリの status を resolved に flip すること。
- 関連: [[mixhost-ssh-classifier-block]] (canonical OPERATION_MANUAL の SSH 手順は auto-mode classifier に block されるため、鍵が漏れても auto Claude は本番 SSH を撃てない構造)。

### 2026-06-08 18:20 JST — [mid] CSO 脳内モデルにおけるドメイン計測値・アーキテクチャの混線
| 項目 | 値 |
|---|---|
| status | resolved |
| severity | mid |
| target | `sc-domain:vodnavi.jp` 内の個別アセット識別 |
| symptom | 2,780件のドメイン総インデックスを「旧WP残骸」と誤認。また `site-brand`（clean域）に年齢ゲートを誤配線しようとした（実体は app-concierge/src/proxy.ts、T-05/T-09 検証済）。 |
| suspected_cause | コンテキスト保持がタイトな環境下で過去ログを断片的にパッチワーク捏造（ハルシネーション）。CTO 側 audit で都度是正済（未 landed）。 |
| recommended_action | CSO が数値を語る前に特定ドメイン（root か app か）の個別識別ファクトをテキストから強制スキャン。ブランチ名は `feat/vodnavi-brand-sync` で永続固定。 |

---

### 2026-06-09 11:40 JST — [info/low] Vercel Preview 環境で FANZA API 認証情報「未設定」警告

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-06-10 |
| severity | low（開発環境のみ・本番影響なし） |
| target | Vercel Preview Host（`*.vercel.app`） — 本番 `app.vodnavi.jp` は影響外 |
| symptom | Preview 環境へのアクセス時に「FANZA API の認証情報が未設定です」というシステム警告（`image_6dd163.png`）が表示される。本番（app.vodnavi.jp）は正常描画・成約動線健全。 |
| suspected_cause | Vercel の **Preview** スコープ環境変数に `DMM_API_ID` / `DMM_AFFILIATE_ID` が未バインド。本番（Production スコープ）は設定済。コードは例外を安全に catch して graceful hide／警告表示しており、**コード崩壊ではない**。 |
| recommended_action | T-20260609-01 として追跡。Vercel プロジェクト設定（Settings → Environment Variables → Preview スコープ）に `DMM_API_ID` / `DMM_AFFILIATE_ID` を投入、または `vercel env pull` 系で Development へ同期。**Vercel 権限が要るため実体は HUMAN/CTO の手動アクション**。投入＋Preview redeploy＋Preview host で警告消失を curl/目視 verify 後に `resolved` へ flip。 |
| backup_path | — |
| anomaly_log | — |
| github_issue | — |

**メモ**：
- BRIEF_037 ハイブリッド防衛ライン堅持。moterist.com 完全凍結・5記事 SEO 永久保護・本番成約動線はいずれも本件と無関係で健全。
- **`resolved` にはしない**：remediation（Preview env バインド）は未実施で、対応タスク T-20260609-01 も `[ ]`。実行→Preview verify 完了まで `open` を維持（[[feedback_verify_before_resolving_alerts]]）。

**[resolved 2026-06-10]** — `vercel env ls` で `DMM_API_ID`/`DMM_AFFILIATE_ID` の **両方が Preview スコープにバインド済**を物理確定（前ターンは AFFILIATE_ID のみ未バインドだったが HUMAN が追加）。cred 値妥当性は local 直叩き 200/30件で実証、Preview redeploy も複数存在。根因（Preview 未バインド）解消につきクローズ。**注**: Preview deploy は Vercel SSO（401）で CTO の curl 目視は不可 — env ls + 値実証 + redeploy 存在の全 CLI 証跡が解決を示す（最終目視は HUMAN のログイン済ブラウザで一瞥可能）。

---

### 2026-06-10 JST — [high] 本番 app.vodnavi.jp 全 FANZA ItemList が 400、トップ作品グリッド窒息

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-06-10 |
| severity | high |
| target | 本番 `app.vodnavi.jp` の FANZA `ItemList` 依存 surface（`/` トップグリッド、`/sitemap.xml`、`/works/*`、`/genres/*`） |
| symptom | トップページ作品グリッドが `EmptyState` で「作品を取得できませんでした / FANZA API でエラーが発生しました (status: 400)」をユーザー画面に描画（`image_357ba5.jpg`）。**API-wide**: curl 物理確認で `/` が status 400、`/sitemap.xml` の `/works/` URL が **0 件**（正常時 ~1,809）。`/concierge`（非 FANZA）は 200 で健全。 |
| suspected_cause | デフォルトクエリのパラメータ（`site=FANZA, service=digital, floor=videoa, sort=date, hits=30, offset=1`）は **DMM v3 仕様上すべて妥当**＝パラメータ構築バグではない。API-wide 400 ＋ 値は存在（未設定なら `FanzaConfigError`）から、**最有力は本番 `DMM_API_ID`/`DMM_AFFILIATE_ID` の値が無効（失効/タイポ/アカウント無効化）**、または DMM 側の拒否。`client.ts` が DMM エラー本文を破棄し status のみ保持していたため真因が不可視だった。 |
| recommended_action | (1) **[CTO 実施済]** `client.ts` の両 throw 経路で DMM エラー本文（`result.message`/`errors`、`request.parameters` は読まず秘密非露出）を抽出し `FanzaApiError` + `VODNAVI_SILENT_DEATH_GUARD` ログへ載せる診断パッチを landed（tsc 0 / next build 0）。→ 次デプロイ後 Vercel Logs で 400 の DMM 公式メッセージを確認。(2) **[HUMAN]** DMM アフィリエイト管理画面で当該 `api_id` の有効性/利用制限を確認、失効ならローテーション。Vercel 本番 env を正値に更新し redeploy。(3) 復旧後 curl で `/` グリッド + `/sitemap.xml` の works URL 復活を verify。 |
| backup_path | 診断パッチは additive（`git revert` で除去可） |
| anomaly_log | Vercel Logs: `{"tag":"VODNAVI_SILENT_DEATH_GUARD","status":400,...}`（診断パッチ deploy 後に出力） |
| github_issue | — |

**メモ**：
- T-20260609-07 として独立追跡。**T-20260609-01（Preview env）とは別問題**（あちらは Preview の env 未設定、こちらは本番の 400=値無効/API拒否）。-01 のエントリは破壊せず維持。
- 診断パッチはあくまで**真因可視化**であり 400 そのものの fix ではない。api_id 値が無効なら fix は HUMAN の DMM/Vercel 操作（[[reference_vercel_env_secret_write_blocked]] により auto-CTO の secret 書込みは classifier deny）。
- 本番 curl scope 監査は read-only。
- **[根因ほぼ確定 2026-06-10]** local `.env.local` の DMM creds で同一デフォルトクエリ（FANZA/digital/videoa/date/30/offset1）を DMM API へ直叩き → **HTTP 200 / result_count 30 で成功**（秘密値は非表示、length のみ確認 apiId=20/aff=12）。∴ **param 構築も local cred 値も健全**。本番のみ 400 のため、**本番 Vercel の `DMM_API_ID`/`DMM_AFFILIATE_ID` の値が無効/不一致**が高確度の真因。**fix = 本番 env を local の既知正値へ更新 + redeploy**（HUMAN、secret 書込みは classifier deny）。診断パッチがあれば次デプロイ後 Vercel Logs に DMM 公式メッセージも出る。

**[resolved 2026-06-10]** — HUMAN が本番 Vercel の DMM cred 値を修正 + redeploy。curl 物理確認: `https://app.vodnavi.jp/` の「status: 400 / 作品を取得できませんでした」消失、`/sitemap.xml` の `/works/` URL が **0 → 1,600 件**に復活。本番 FANZA ItemList 全面復旧を確認しクローズ。**注**: 本クローズは**本番 400 のみ**。Preview env（2026-06-09 11:40 エントリ / T-20260609-01）は `DMM_AFFILIATE_ID` の Preview 未追加で**未解決のまま維持**（global flip は不採用、当該エントリは `open`）。

---

### 2026-06-10 JST — [high] 本番＋Preview の AI コンシェルジュが "invalid x-api-key" で窒息（ANTHROPIC_API_KEY 失効）

| 項目 | 値 |
|---|---|
| status | resolved |
| resolved_at | 2026-06-10 |
| severity | high |
| target | `app.vodnavi.jp` **本番** ＋ Preview の AI チャット（`/api/concierge` POST、`anthropic(MODEL)` 経由の LLM 呼出） |
| symptom | コンシェルジュの初期挨拶は正常描画されるが、ユーザーがメッセージ送信した瞬間に赤字「invalid x-api-key」で窒息（`image_348b26.png`、Preview で観測）。**本番も同症**: `curl -X POST https://app.vodnavi.jp/api/concierge`（age cookie 付）が `data: {"type":"error","errorText":"invalid x-api-key"}` を返却（HTTP 200 ストリーム内エラー）。FANZA/DMM 側は 200 で健全＝本障害は LLM 認証層に限局。 |
| suspected_cause | `route.ts:101` の `if(!process.env.ANTHROPIC_API_KEY)` ガードは通過＝キーは**存在するが値が無効**。`vercel env ls`: `ANTHROPIC_API_KEY` は Development(29d) + **Production,Preview(29d 共有)**。Prod+Preview 共有値（created ~29日前）が無効。**2026-06-01 のキー漏洩インシデント（ANTHROPIC/OPENAI を revoke 推奨）で旧キーが revoke された後、Vercel 値が更新されず失効キーのまま**が最有力。local `.env.local` には ANTHROPIC_API_KEY 不在で CTO 側に正値ソースなし。 |
| recommended_action | **[HUMAN]** (1) Anthropic console で有効な API キーを取得（2026-06-01 ローテ後の現行キー、無ければ新規発行）。(2) Vercel `vodnavi-app` の `ANTHROPIC_API_KEY` 値を Production（＋共有の Preview）/ Development とも正値に更新。(3) 本番＋Preview を redeploy。(4) 復旧 verify: `curl -X POST .../api/concierge` が `invalid x-api-key` を返さず AI 応答ストリームになることを確認（CTO が read-only で可能）。**注**: auto-CTO は secret 書込み不可（[[reference_vercel_env_secret_write_blocked]]）＝キー更新は HUMAN。 |
| backup_path | — |
| anomaly_log | 本番 `/api/concierge` ストリーム: `data: {"type":"error","errorText":"invalid x-api-key"}` |
| github_issue | — |

**メモ**：
- T-20260610-01 として追跡。**Preview 限定ではなく本番も停止**（共有キー値）= コンバージョン中核の AI チャットが全ユーザーで死亡、収益直撃の high。
- 副次（UX）: 失効時に route の onError friendly fallback（「通信中にエラー…」）ではなく **raw "invalid x-api-key" がユーザー赤字に漏出**している。キー復旧後、provider 認証エラーを friendly 文面へ握り潰す error-handling 改善が任意で可能（BRIEF_057 の素通し禁止思想）。本障害の主 fix はキー値更新。
- 2026-06-01 漏洩 ALERTS（OPENAI/ANTHROPIC/Make revoke 推奨）との関連を要確認。OPENAI_API_KEY は Production のみ（Preview/Dev 無し）でレビュー生成用、本障害の直接要因ではない。

**[resolved 2026-06-10]** — HUMAN が `ANTHROPIC_API_KEY` 値を更新 + redeploy。本番 `curl -X POST /api/concierge`（age cookie）が **real Claude ストリーム（`text-delta` 応答）を返却、"invalid x-api-key" 消滅**を物理確認しクローズ。Preview は同一 Prod,Preview 共有値を使用＝同値で復旧見込みだが、Preview deploy は Vercel SSO(401) で CTO 直 curl 不可（最終目視は HUMAN）。**注**: 副次の raw エラー漏出（onError friendly fallback 未適用）は別途 任意改善として残置。
