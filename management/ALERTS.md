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
| status | open |
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
