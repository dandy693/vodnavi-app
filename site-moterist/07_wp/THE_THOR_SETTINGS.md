# THE_THOR_SETTINGS — moterist.com WordPress / THE THOR 全設定書

> moterist.com の **WordPress + THE THOR テーマの設定値・カスタマイザー・ウィジェット・MU プラグイン・CSS・プラグイン構成・解析タグ・CTA 仕様** を、再構築時に迷わず再現できる粒度で集約する単一情報書。
> 4 つの ChatGPT「Xマネタイズ」プロジェクト・チャット（Xアフィリエイトマネタイズ方法 / Gitコミット未完了確認 / マネタイズ実現の課題 / プロジェクト再開手順）と、site-moterist/02_site-audit 配下の Day 7〜Day 9 完了サマリーからの抽出。
> 変更時は本ファイルを更新し、`management/CHANGELOG.md` と `00_admin/operation-log.md` に記録すること。

---

## 1. 基盤情報

| 項目 | 値 |
|---|---|
| プラットフォーム | WordPress |
| テーマ | **THE THOR**（フィットデザイン製） |
| 子テーマ | **未使用**（Day 9 で「子テーマ案」より MU プラグイン経由を採用） |
| ホスティング | mixhost |
| 本番ドキュメントルート | `/home/rvpuxcjb/public_html/moterist.com` |
| SSH 接続 | `ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25` |
| パーマリンク | `/<slug>/`（投稿）／`/category/<slug>/`（カテゴリー）。**slug 変更・301 はピラー安定化までしない**。 |
| サイト言語 | 日本語 |
| 検索エンジンの表示 | 公開（`noindex` はピラー 4 記事すべて未チェック維持） |
| 「広告を含む」表記 | 共通ヘッダ／フッタとピラー本文双方で明示 |

---

## 2. THE THOR カスタマイザー（重要項目）

### 2.1 PWA / Service Worker
| 設定キー | 推奨値 | 備考 |
|---|---|---|
| `fit_pwaFunction_switch` | **on（維持）** | THE THOR の PWA 機能スイッチ。Day 9 でも on のまま維持。MU プラグインで挙動を上書き済。 |
| `fit_add_serviceWorker()`（自動再生成イベント） | — | `customize_register` / `transition_post_status` / `wp_login` / `wp_logout` 発火時に `serviceWorker.js` を再生成する性質を持つ。MU プラグインで「常時上書き」する設計を採用。 |

### 2.2 サイト基本
| 項目 | 値 |
|---|---|
| サイトタイトル | moterist（モテリスト） |
| キャッチフレーズ | 心理学・教養軸の VOD 比較メディア（設定中） |
| トップ表示 | 最新の投稿（将来：固定ページ化） |
| 投稿者表示 | 運営者ハンドルを表示／プロフィール固定ページへリンク |

### 2.3 表示・デザイン
- メインビジュアル：18+ 注意と「比較・ランキング型メディア」の訴求を兼ねる構成。
- カラー：成人向けでも露骨に寄せず、信頼を担保するモノクロベース＋アクセント。
- フォント：THE THOR デフォルト。本文サイズはモバイル可読性を優先（PC 16px / Mobile 16px）。
- 投稿一覧／関連記事：抜粋表示。サムネは過度に露骨なものを避け、テキスト系を許容。

### 2.4 ヘッダ / フッタ
- ヘッダ右に「18+ 注意」「広告を含む」固定表記。
- フッタにプライバシーポリシー／運営方針／免責／お問い合わせ／コンプラ宣言を固定リンク。

### 2.5 SEO / OGP
- 個別記事の **title / meta description / canonical / 外部リンク URL** は変更しない（Day 8 監査結果で「意図しない変更なし」を確認済）。
- OGP 画像は将来運用（PWA / Service Worker 安定化後）。

---

## 3. 投稿カテゴリー / タグ

| カテゴリー | スラッグ | 用途 |
|---|---|---|
| **お役立ち情報** | （現状の slug を維持） | ピラー 4 記事（1095 / 1106 / 994 / 954） |
| （将来）セール／キャンペーン | — | 954 を起点に強化 |
| （将来）アクトレス系 | — | 1018 を起点（アーキテクチャ未確定） |
| （将来）教養／コラム | — | VODNAVI 連携の集客強化 |

タグ：**`河北彩伽`** は 1018 関連 evidence として保持。それ以外のタグ運用はアクトレス・アーキテクチャ確定まで保留。

---

## 4. プラグイン構成

### 4.1 必須プラグイン（推奨セット）
| 種別 | プラグイン候補 | 目的 |
|---|---|---|
| キャッシュ | サーバ側（mixhost LiteSpeed）＋ THE THOR PWA | HTML キャッシュ／Service Worker は MU で安全版に上書き |
| セキュリティ | （ログイン保護） | 管理画面ブルートフォース対策 |
| バックアップ | （定期バックアップ） | 本番更新前のスナップショット |
| SEO / メタ | THE THOR 内蔵 | 単一テーマで完結させる（衝突回避） |
| 解析タグ | サイトカスタマイザーまたは MU で挿入 | GA4 計測（後述） |

### 4.2 入れない／注意すべきプラグイン
- 他社製の Service Worker / PWA プラグインは **入れない**（THE THOR の `fit_pwaFunction_switch` と競合し、HTML stale 化を再発させる）。
- 過剰な OGP プラグインは canonical / meta description のドリフトを生むため不要。
- Ahrefs などの解析タグを WP-CLI 出力に混入させない（Day 9 残課題）。

### 4.3 MU プラグイン（最重要）
- 配置先：`/home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/`
- 役割：**`serviceWorker.js` を Service Worker / Cache Storage で HTML を stale 化させない安全版に上書きする**。
- 採用理由：THE THOR の `fit_add_serviceWorker()` が `customize_register` / `transition_post_status` / `wp_login` / `wp_logout` で再生成するため、子テーマでは恒久維持できない。MU は常時読込なので、再生成後の上書き維持・検証・ロールバックがしやすい。
- 旧 `serviceWorker.js` の問題点（上書き対象）：
  - `caches.match(event.request)` が先に実行され、ヒットしたキャッシュがあればそれを返してしまう。
  - `fetch` 後に `cache.put(event.request, responseToCache)` で保存する。
  - **`document` / `navigate` / `HTML` を除外していなかった**ため、ピラー記事の HTML が Cache Storage に残る。
- 安全版の方針：HTML（`request.mode === 'navigate'` または `accept: text/html`）は **ネットワーク優先 → 失敗時のみキャッシュ**。静的アセット（画像／JS／CSS）は **キャッシュ優先 + バックグラウンド更新**。

---

## 5. CTA 設計（記事内ボタン仕様）

### 5.1 CTA 4 配置ルール
| 位置 | 目的 | 対象読者 |
|---|---|---|
| **ファースト CTA**（リード直後） | 検討度の高い読者を即送る | 流入意図が明確 |
| **比較表下 CTA** | 比較後の意思決定者を送る | 候補比較を済ませた読者 |
| **不安解消後 CTA** | 慎重派を送る | 994 の FAQ／チェックリスト読了 |
| **記事末 CTA** | 最後まで読んだ読者を送る | 全意図段階の最終受け |

すべての記事に 4 種を貼る必要はない。**「次に何をすべきか分かった」と感じる場所に置く**ことを優先する。

### 5.2 CTA 文言
- 基本ルール：「**確認**」志向にする。事実が変動する場面ほど確認形にする。
- 良い例：
  - 「まずは無料で条件に合うか確認する」
  - 「申し込み前に料金と条件を確認する」
  - 「自分に合うプランを無料で相談する」
  - 「失敗しないために比較してから選ぶ」
  - **「FANZA 公式ページで利用前の案内を確認する」**（1106 末尾の現行採用文言）
- 弱い例（避ける）：
  - 「公式サイトはこちら」（クリック理由を言語化していない）

### 5.3 ピラー別 CTA ポリシー
| post_id | 主 CTA | 副 |
|---|---|---|
| **1095** | 公式・最新情報確認 CTA | 1106 への内部リンク |
| **1106** | **公式・登録／特典確認 CTA**（末尾 = 「FANZA 公式ページで利用前の案内を確認する」） | 994 への内部リンク |
| **994** | 公式・利用前案内確認 CTA | 954（セール意図発生時） |
| **954** | 公式・現行セール確認 CTA | 1106 / 994（コンテキスト不足時） |
| **1018** | スタンドアロン：作品詳細確認 CTA／統合：アクトレス・ハブ CTA | — |

### 5.4 末尾共通 CTA（3 サイト連携）
ピラー末尾には FANZA 公式 CTA に加えて、**VODNAVI コンシェルジュへの送客 CTA** を併設する：
- リンク先：`https://app.vodnavi.jp/concierge?source=moterist`
- 文言案：「迷ったら AI コンシェルジュに相談する（無料）」
- 設計意図：FANZA 単体送客 + コンシェルジュ体験を両立させ、信頼性とパーソナライズで CVR を底上げする。

---

## 6. アナリティクス（GA4）連携

### 6.1 計測イベント
| イベント名 | 用途 | パラメータ |
|---|---|---|
| `fanza_cta_click` | FANZA 関連 CTA クリック | `page_type` / `page_role` / `placement` / `cta_id` / `link_target` / `transport_type` |
| （将来）`internal_link_click` | 集客記事 → 収益記事の遷移計測 | `from_post_id` / `to_post_id` |
| （将来）`scroll_75` | 記事読了の代理 | `post_id` |
| （将来）`compare_table_click` | 比較表内クリック | `table_id` / `row` |

### 6.2 `fanza_cta_click` パラメータ規格
```js
gtag('event', 'fanza_cta_click', {
  page_type: 'registration_benefits_guide',      // beginner_guide | registration_benefits_guide | safety_anxiety_resolution | evergreen_sale_hub | actress_*
  page_role: 'consideration',                    // entry | consideration | objection_handling | commercial | architecture_dependent
  placement: 'end',                              // first | compare_table | post_reassurance | end
  cta_id: 'registration_benefits_guide__end__official_registration_benefits',
  link_target: 'official_fanza',                 // official_fanza | concierge_app | internal_link
  transport_type: 'beacon'
});
```

### 6.3 クリックハンドラ条件（Day 10 で緩和対象）
- 1106 用 JS の **`outline_1__9` 位置関係を必須条件にしている** ため発火しないクリックがある（Day 10 候補）。
- 緩和方針：`closest_content: true` && `closest_li: true` のみで発火させ、`closest_outline_class` / `closest_outline_id` は **オプション扱い** にする。
- 検証手順：Network タブで `collect` フィルタ → コンソールに `gtag('event', 'fanza_cta_click', { ... })` を直接流し、`collect` が出れば送信経路は正常。出なければ gtag 側の問題。
- `gtag('event', ...)` の戻り値は常に `undefined`。これはエラーではない。

### 6.4 計測タグ設置の現状
- ピラー 5 記事のうち **2 ページ分のタグ設置のみ完了**。残り 3 ページ分は Day 10 で順次設置予定。
- WP-CLI 出力に Ahrefs script が混入する問題（Day 9 残課題）。出力前にフィルタを通すこと。

---

## 7. ウィジェット構成

| ウィジェットエリア | 内容 |
|---|---|
| サイドバー（PC） | ・運営者プロフィール（小）<br>・ピラー 4 記事のショートカット<br>・現行セール（954）ピックアップ<br>・「18+ 注意」「広告を含む」明示 |
| 記事下 | ・関連記事（同一カテゴリー優先）<br>・コンシェルジュ送客カード（`?source=moterist`） |
| フッタ | ・サイトマップ<br>・固定ページ群（プロフィール／運営方針／18+ 注意／免責／プライバシー／お問い合わせ） |

モバイル：サイドバーは記事下に折りたたみ。**末尾導線の圧迫感を避ける**ため、CTA ボタンと内部リンク列の距離を空ける（Day 8 で過密を緩和済）。

---

## 8. CSS カスタマイズ方針

> THE THOR 本体 CSS は変更しない（テーマ更新で消失するため）。**カスタマイザーの「追加 CSS」または MU プラグインから enqueue** で対応する。

### 8.1 必須スタイル
- **CTA ボタン**：
  - 主 CTA：高コントラスト・大きめタップ領域（高さ 48〜56px）／ホバーで微差・フォーカスリング保持。
  - 副 CTA（内部リンク）：テキストリンクまたは弱コントラストのアウトラインボタン。
- **比較表（954 / 1106）**：
  - 横スクロール許容（モバイル）／ヘッダ行は sticky にせず、視認重視。
  - 行ホバーは弱め、過剰アニメーションは入れない。
- **CTA と本文の距離**：
  - 末尾 CTA の上に **最低 24px の余白**。直前パラグラフと密着させない（Day 8 で確認）。
- **「広告を含む」表記**：
  - 記事上部 / フッタの 2 箇所、`color: muted` で、ただし読める明度を維持。

### 8.2 入れない CSS
- スクロールジャック／カーソル追従／派手なホバー反転（信頼性を損なう）。
- 装飾フォント（読了率低下）。
- ダークモード自動切替（PWA キャッシュとの相互作用が読みづらいため当面は単一テーマ）。

---

## 9. パーマリンク / SEO 不変ルール

| 対象 | 不変ルール |
|---|---|
| **slug** | ピラー 4 記事は **変更しない** |
| **301** | ピラー安定化までは **設定しない** |
| **削除 / 下書き化** | ピラー 4 記事は **行わない** |
| **noindex** | ピラー 4 記事は **未チェック維持** |
| **canonical** | デフォルト維持。クロスドメイン canonical は使わない |
| **title / meta description** | 監査計画に従って計画的に変更。意図しない変更は禁止 |
| **外部リンク URL** | 監査計画に従って変更。Day 8 で「意図しない変更なし」を確認済 |

---

## 10. 投稿運用ワークフロー（Codex / 人間境界）

1. ローカル設計フェーズで `02_site-audit/dayN-*.md` を作る（読み取り専用、本番に触れない）。
2. 監査 → 編集計画 → 投稿用ペースト・パッケージ（`07_wp/post-<id>-wordpress-paste-package.md`）を生成。
3. **本番反映は人間が WordPress 管理画面から実施**。Codex は本番ファイルを編集しない（明示指示がある場合のみ）。
4. 反映後、`day*-*-result.md` または `day*-completion-summary.md` を作成。
5. `00_admin/operation-log.md` に追記。
6. Git は **人間が PowerShell で実行**：
   ```powershell
   cd C:\Users\Tachi\projects\VODNAVI-GROUP\site-moterist
   git status
   git add 00_admin\operation-log.md `
     02_site-audit\day<N>-*.md
   git commit -m "Record Day <N> ..."
   git log --oneline -5
   ```
7. Day 跨ぎでは「引き継ぎメモ」を新規 Chat の最初に貼る。

### 10.1 既知の Git エラー対応
- Codex が `.git/index.lock` 不在でも `Permission denied` で `git add` に失敗するケースが繰り返し発生。
- 対応：Codex に続行させず、人間が PowerShell で手動コミット。必要に応じて `New-Item .git\write-test.tmp -ItemType File; Remove-Item .git\write-test.tmp -Force` で書込権限を確認（過去成功実績あり）。

---

## 11. バックアップ・ロールバック

| 種別 | 場所 | 同期方針 |
|---|---|---|
| 記事リライト前のコピー | `07_wp/article-backups/<post-id>-<date>.md` | **Git に追加しない** |
| 投稿用ペーストパッケージ | `07_wp/post-<id>-wordpress-paste-package.md` | **Git に追加しない**（機微・ペースト用） |
| WordPress エクスポート | `07_wp/export/` | **Git に追加しない** |
| サーバ／DB バックアップ | `07_wp/backups/` | **Git に追加しない** |
| スクリーンショット | `07_wp/screenshots/` | **Git に追加しない** |
| Playwright MCP | `.playwright-mcp/` | **Git に追加しない** |
| `.env` | ルート | **Git に追加しない** |

ロールバック条件：本番反映後 24 時間以内に「title / canonical / 外部リンク URL の意図しない変更／HTML stale 化／CTA リンク切れ／重大なレイアウト崩れ」を検知した場合は、**バックアップから本文を戻し**、`operation-log.md` に時刻付きで記録する。

---

## 12. 既知の問題と監視ポイント

| ID | 問題 | 対応 |
|---|---|---|
| **D8-01** | 通常 URL でブラウザ側に旧 HTML が残る | Day 9 で MU プラグイン経由の安全版 `serviceWorker.js` に切替済 |
| **D9-01** | 既存ブラウザに旧 Service Worker / Cache Storage が残るユーザーへの扱い | サイト先頭で軽量な「再読み込み案内」を Day 10 候補で検討 |
| **D9-02** | WP-CLI 出力に Ahrefs script が混入 | 出力前にフィルタを通す。Day 10 候補 |
| **D10-01** | 1106 GA4 `fanza_cta_click` がクリックハンドラの `outline_1__9` 必須条件で発火しない | 条件を緩和（`closest_content && closest_li` のみ必須）し、再検証 |
| **G-01** | Codex の Git 権限エラー（`Permission denied`） | 人間が PowerShell で手動コミット |
| **D8-02** | 末尾 CTA と本文の距離が近すぎ圧迫感 | Day 8 で CSS の `margin-top` を増やし緩和済。再発防止のために本書に明記 |

---

## 13. 再構築時の最小チェックリスト

新規環境で moterist.com を再構築する際の **絶対チェック**：

- [ ] テーマ：THE THOR を導入。子テーマは作らない。
- [ ] パーマリンク：`/<slug>/`。
- [ ] カテゴリー：「お役立ち情報」を作成。
- [ ] ピラー 4 記事（1095 / 1106 / 994）を旧 URL のまま復元。`fanza20250329` / `fanza20250331` / `fanza_otoku250114` の slug を維持。
- [ ] 954 を Evergreen Sale Hub として整備（季節依存表現を除去）。
- [ ] 内部リンク：1095 / 1106 / 994 の相互リンクを Day 7 状態で復元。
- [ ] MU プラグインを `wp-content/mu-plugins/` に配置し、安全版 `serviceWorker.js` を上書き。
- [ ] `fit_pwaFunction_switch` は on のまま維持。
- [ ] GA4 タグを全ピラーに設置（現状は 2 ページのみ）。
- [ ] 末尾 CTA に FANZA 公式 + `concierge?source=moterist` の 2 系統を併設。
- [ ] 「広告を含む」「18+ 注意」を共通ヘッダ／フッタに明示。
- [ ] 固定ページ群（プロフィール／運営方針／18+ 注意／免責／プライバシー／お問い合わせ）を最小セットで設置。
- [ ] `noindex` 未チェック、`canonical` デフォルト、`title` / `meta description` 既存維持。
- [ ] バックアップ運用：`07_wp/backups/` と `07_wp/article-backups/` を `.gitignore` 済であることを確認。
- [ ] SSH 鍵：`C:\Users\Tachi\.ssh\mixhost_codex_pc`（人間のみ使用）。
- [ ] 自動デプロイは行わず、Codex は本番に触れない（明示指示時のみ）。

---

*v1.0 — 4 つの ChatGPT「Xマネタイズ」プロジェクト・チャットと site-moterist/02_site-audit 配下の Day 7〜Day 9 完了サマリー、`fanza-page-type-design.md` から合成。更新時はバージョン番号を上げ、`management/CHANGELOG.md` と `00_admin/operation-log.md` に記録すること。*
