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
