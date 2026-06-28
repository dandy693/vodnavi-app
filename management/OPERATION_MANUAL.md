# OPERATION_MANUAL — AI 自動連携・運用フロー手順書

> 人間の手作業と迷いをゼロにし、本業の傍らでも **ボタン一つで月商 100 万円を追尾できる** 運用フローを確定する。
> 本書は CSO / CTO / CCO / HUMAN（Tachi）の役割境界と、Claude Code を起点とした **2 系統の自動化フロー** を規定する：
>
> 1. **土曜 PDCA 自動化**：GA4 / Search Console から週次データを抽出し、CSO が読み込む中間ファイルを生成。
> 2. **記事反映自動化（DB 直接注入）**：CCO の出力 Markdown を WP-CLI 経由で WordPress に **生 HTML として直接注入**、Gutenberg / `wpautop` の自動整形をバイパスする。

本書と矛盾する個別運用手順は無効。改訂は CSO が承認する。

> ⚠️ **【非運用通達 — 2026-06-28 追記】** moterist.com は **2026-06-07 の経営意思決定（`STRATEGY_BRIEF_043_ALIGNMENT`）で完全凍結が確定**済み。本書 **§3（mixhost SSH 経由の WordPress 直接 DB 注入）はレガシー資産として保全するが現在は非運用** — mixhost SSH 自体が auto-mode classifier でブロックされ、事前 HUMAN 認可なしでは §3 手順は実行できない。現行の主要サーフェスは `app.vodnavi.jp`（Next.js 16）であり、年齢確認ゲートは `middleware.ts` ではなく `app-concierge/src/proxy.ts`（エッジハンドラー）に実装済み。§2 の土曜 PDCA データ抽出フロー自体は有効だが、抽出主軸は app.vodnavi.jp 側の GA4（G-GG7JV9MJRW / p489519780）へ移行している。

---

## 0. 共通前提

| 項目 | 値 |
|---|---|
| プロジェクトルート | `C:\Users\Tachi\projects\VODNAVI-GROUP` |
| Claude Code 起動 | プロジェクトルートで `claude` |
| 解析アカウント | `moterist.com@gmail.com`（必ず `?authuser=2` / `/u/2/` パスを確認） |
| SSH 接続 | `ssh -F /dev/null -i /tmp/mixhost_key -p 22 rvpuxcjb@133.125.148.25` |
| SSH 鍵正規化 | `tr -d '\r' < C:/Users/Tachi/.ssh/mixhost_codex_pc > /tmp/mixhost_key && chmod 600 /tmp/mixhost_key`（CRLF → LF）|
| 本番 WP パス | `/home/rvpuxcjb/public_html/moterist.com` |
| 中間データ保存先 | `management/_metrics/<YYYY-WW>/` |

---

## 1. ロールとトリガー

| 担当 | トリガー | 主要動作 |
|---|---|---|
| **HUMAN**（Tachi） | カレンダー通知 / 完了報告 | Claude Code を起動して各セクションのコマンドを承認 |
| **Claude Code (CTO)** | HUMAN の指示 | Chrome 連携でデータ抽出、SSH/WP-CLI で記事注入、Git 反映 |
| **CSO (Gemini 3)** | `saturday-raw-data.json` の到着 | データ解析 → 指示書発行 |
| **CCO (ChatGPT 5.5)** | CSO の指示書 | THE THOR ショートコード辞書（`site-moterist/THE_THOR_DICTIONARY.md`）に従い記事 Markdown を出力 |

---

## 2. 土曜 PDCA 自動化フロー

**目的**：HUMAN が「土曜 10:00」のリマインダーをタップするだけで、3 サイト横断のファネルデータが集計され、CSO の戦略判断に必要な状態に到達させる。

### 2.1 タイムライン

| 時刻 (JST) | 担当 | 動作 |
|---|---|---|
| 10:00 | HUMAN | Claude Code を起動し「サタデー・レビューを開始して」と入力 |
| 10:00–10:05 | Claude Code | Chrome 連携で GA4 / Search Console を操作、データ抽出 |
| 10:05 | Claude Code | `management/_metrics/<YYYY-WW>/saturday-raw-data.json` を生成 |
| 10:05–10:30 | CSO | JSON を読み込み、5 指標で診断 → 指示書を発行 |
| 10:30 | HUMAN | 指示書を確認し、CTO / CCO への割り振りを承認 |

### 2.2 Claude Code への指示テンプレ（HUMAN がコピペ）

```
サタデー・レビューを開始してください。
1. Chrome を解析アカウント moterist.com@gmail.com (?authuser=2) で開く。
2. GA4 (https://analytics.google.com/analytics/web/?authuser=2) で次を取得:
   - VODまとめ研究所 (G-GG7JV9MJRW) の先週 1 週間分:
     - source × intent 別セッション数
     - ai_session_start / product_click / ai_affiliate_click の発火数とユニーク数
     - landing_page 別の直帰率と平均エンゲージメント時間
   - モテリスト (G-5HYV772ER9) の同期間:
     - 記事別の PV / ユーザー数
     - app.vodnavi.jp への outbound link クリック数
3. Search Console (https://search.google.com/search-console?authuser=2) で:
   - moterist.com の上位 30 クエリの impressions/CTR/position
   - vodnavi.jp / app.vodnavi.jp の異常 (カバレッジエラー / 急落クエリ)
4. 取得結果を management/_metrics/<今週の YYYY-WW>/saturday-raw-data.json として保存。
5. 完了したら CSO への引き渡し用に「データ抽出完了」と短いサマリを出力。
```

### 2.3 `saturday-raw-data.json` のスキーマ（CSO が依存する契約）

```json
{
  "week_id": "2026-W20",
  "captured_at": "2026-05-16T01:05:00Z",
  "captured_by": "claude-code",
  "ga4": {
    "property_id": "489519780",
    "measurement_id": "G-GG7JV9MJRW",
    "range": { "start": "2026-05-09", "end": "2026-05-15" },
    "sessions_by_source_intent": [
      { "source": "moterist", "intent": "beginner", "sessions": 0, "ai_affiliate_clicks": 0 }
    ],
    "events": {
      "ai_session_start": { "total": 0, "users": 0 },
      "product_click":    { "total": 0, "users": 0 },
      "ai_affiliate_click": { "total": 0, "users": 0 }
    },
    "landing_pages": [
      { "path": "/?source=moterist&intent=beginner", "bounce_rate": 0, "avg_engagement_s": 0 }
    ]
  },
  "ga4_moterist": {
    "measurement_id": "G-5HYV772ER9",
    "range": { "start": "2026-05-09", "end": "2026-05-15" },
    "articles": [
      { "post_id": 1095, "url": "https://moterist.com/fanza20250329/", "pv": 0, "users": 0, "outbound_app_clicks": 0 }
    ]
  },
  "search_console": {
    "moterist": {
      "top_queries": [
        { "query": "FANZA 安全", "impressions": 0, "ctr": 0, "position": 0 }
      ],
      "anomalies": []
    },
    "vodnavi": { "top_queries": [], "anomalies": [] },
    "app_vodnavi": { "top_queries": [], "anomalies": [] }
  }
}
```

### 2.4 CSO の診断とアクション分岐

CSO は `saturday-raw-data.json` を読み込み、`BRAND_DESIGN_GUIDE.md` §6.1 の 5 指標で診断し、以下のいずれかを出力する：

| 検出パターン | 出力ファイル |
|---|---|
| 送客率 -20% 超 | `STRATEGY_BRIEF_RW_<post_id>_<YYYYMMDD>.md`（CCO 宛リライト指示書） |
| CVR が intent 別目標を下回る | `STRATEGY_BRIEF_AB_<intent>_<YYYYMMDD>.md`（CTO 宛 A/B 指示書） |
| 検索順位 11〜20 位に落下 | `STRATEGY_BRIEF_IG_<post_id>_<YYYYMMDD>.md`（CCO 宛 Information Gain 強化指示） |
| 異常なし | `_metrics/<YYYY-WW>/saturday-review.md` に「異常なし」と記録のみ |

---

## 3. 記事反映自動化（DB 直接注入）

**目的**：CCO が出力した記事 Markdown を、WordPress の自動整形（`wpautop` / Gutenberg ブロック展開）に **一切汚されずに** 本番に投入する。THE THOR ショートコードと装飾 HTML を生のまま保持できる。

### 3.1 注入対象とバイパスする「バグ」

| バグ | 内容 | バイパス方法 |
|---|---|---|
| `wpautop` | 改行を勝手に `<p>` `<br>` で包む | `wp post update` は本文を生 HTML として保存する。Gutenberg を経由しないため `wpautop` トリガーが発火しない条件で更新可能 |
| Gutenberg ブロック注入 | クラシックエディタで保存しても再編集で `<!-- wp:freeform -->` が追加される | DB 直接注入では `<!-- wp:... -->` を生成しない |
| TinyMCE のスタイル削除 | 管理画面で開くと `style=""` や独自クラスが削除される | DB 直接注入 → 編集画面で開かない運用を徹底（編集が必要な場合は再生成して再注入） |

### 3.2 標準注入手順（CCO 出力 → 本番反映）

```
[CCO]
  ↓ 1. 記事 Markdown を生成（site-moterist/THE_THOR_DICTIONARY.md 準拠）
  ↓    出力: site-moterist/03_content/staging/<post_id>_<slug>.md
  ↓    フロントマター: title / meta_description / post_status / target_post_id
[HUMAN]
  ↓ 2. Claude Code に「ステージング記事 <post_id> を本番に注入」と指示
[Claude Code]
  ↓ 3. Frontmatter と body を分離、HTML 化（既に HTML なので素通し可）
  ↓ 4. ローカルにバックアップ取得:
  ↓    ssh ... "wp post get <ID> --field=post_content --path=public_html/moterist.com"
  ↓    -> site-moterist/07_wp/backups/<post_id>_<YYYYMMDD_HHMMSS>.html
  ↓ 5. WP-CLI 経由で更新:
  ↓    ssh ... "cd public_html/moterist.com && wp post update <ID> /tmp/post_body.html"
  ↓ 6. 反映確認: curl https://moterist.com/<slug>/ をパースし、装飾要素の存在を検証
  ↓ 7. 結果を management/CHANGELOG.md と site-moterist/00_admin/operation-log.md に記録
```

### 3.3 Claude Code への指示テンプレ（HUMAN がコピペ）

```
site-moterist/03_content/staging/<post_id>_<slug>.md を本番に注入してください。

手順:
1. 鍵を正規化: tr -d '\r' < C:/Users/Tachi/.ssh/mixhost_codex_pc > /tmp/mixhost_key && chmod 600 /tmp/mixhost_key
2. 現在の post_content をバックアップ:
   ssh -F /dev/null -i /tmp/mixhost_key -p 22 rvpuxcjb@133.125.148.25 \
     "wp post get <post_id> --field=post_content --path=public_html/moterist.com" \
     | sed 's|<script src="https://analytics.ahrefs.com[^"]*"[^>]*></script>||' \
     > site-moterist/07_wp/backups/<post_id>_$(date +%Y%m%d_%H%M%S).html
3. フロントマターを除去し HTML 本文だけを抽出:
   awk 'BEGIN{n=0} /^---$/{n++; next} n>=2{print}' staging/<post_id>_<slug>.md > /tmp/post_body.html
4. 本文をリモートに転送して更新:
   scp -F /dev/null -i /tmp/mixhost_key /tmp/post_body.html rvpuxcjb@133.125.148.25:/tmp/post_body.html
   ssh -F /dev/null -i /tmp/mixhost_key -p 22 rvpuxcjb@133.125.148.25 \
     "cd public_html/moterist.com && wp post update <post_id> /tmp/post_body.html"
5. 反映検証:
   curl -s https://moterist.com/<slug>/ | grep -c 'btn__link-primary'
   が 1 以上であることを確認。0 ならロールバック（バックアップ HTML で wp post update をやり直す）。
6. 完了したら CHANGELOG.md と site-moterist/00_admin/operation-log.md にエントリを追加。
```

### 3.4 ロールバック手順

```
ssh -F /dev/null -i /tmp/mixhost_key -p 22 rvpuxcjb@133.125.148.25 \
  "cd public_html/moterist.com && wp post update <post_id> \
   site-moterist/07_wp/backups/<post_id>_<TIMESTAMP>.html"
```

### 3.5 安全弁

- **同時編集禁止**：HUMAN が wp-admin 画面で同じ記事を開いている状態で DB 注入を走らせない（最後保存が勝つため変更が消える）。
- **編集画面で開かない**：DB 注入後の記事は wp-admin の編集画面で開かない。開くと TinyMCE が `style` 属性などを削る。修正が必要な場合は staging Markdown を更新して再注入する。
- **本番反映前の差分確認**：`diff site-moterist/07_wp/backups/<post_id>_*.html /tmp/post_body.html` を必ず目視。1,000 行を超える削除がある場合は HUMAN に確認。
- **WP-CLI の権限テスト**：`.git/index.lock` の `Permission denied` が出る場合がある。`New-Item /tmp/test_write.tmp; Remove-Item /tmp/test_write.tmp` で書込み権限を事前確認。

---

## 4. ステージングディレクトリ構成

```
site-moterist/03_content/
├─ staging/                 ← CCO が新規・更新原稿を置く
│   ├─ <post_id>_<slug>.md  ← 単独記事
│   └─ batch/               ← 同時更新する複数記事
└─ <post_id>_<slug>.md      ← 本番に注入済みの正規版（読み取り専用）
```

`staging/` 配下は注入完了後に正規ディレクトリへ移動し、staging からは削除する。これにより「未注入の差分」が一目で分かる。

---

## 4b. 成約アプリ運用（クッキーの 24 時間タイマー防衛）

ユーザーのアプリ滞在・会話時間が長引くことによる **クッキー切れ（成果計上ロスト）** を防ぐため、AI コンシェルジュには「早期クッキー着火」を **不変条件としてプロンプトに焼き込む**。

### 4b.1 設計原理：クッキーは「会話の最後」ではなく「熱量の最初」で焼く

FANZA アフィリエイトのクッキー有効期間（24h）は、ユーザーが FANZA ドメインに着地した瞬間から始まる。AI コンシェルジュが 30 分かけて完璧な 1 本を提案し終えても、その間にクッキーが焼かれていなければ、後段の「公式 CTA」クリックは別セッション扱いとなり成果が消滅する。これを構造的に防ぐため、**最初のインテント検知時点で中間アクションを差し込み、FANZA ドメインを早期に踏ませる**。

### 4b.2 プロンプトの不変条件（CTO 実装要件）

`app-concierge` の system プロンプトに以下を **追加** し、source / intent によらず常に発火させる：

```
# 不変条件：早期クッキー着火
- ユーザーの最初の発話から「気分」「状況」「求めるもの」のいずれかを読み取った直後（finalize_recommendations の前）、
  会話の自然な流れの中で「中間アクション」を 1 つ提示する。
- 中間アクションは下記のいずれかとし、選択は intent に応じて自動分岐する：
  - intent=beginner → 「公式のラインナップを一度チェック」型（FANZA トップへ）
  - intent=actress  → 「サンプル動画の確認」型（女優一覧 or 代表作サンプル）
  - intent=discount → 「現在のセール対象を確認」型（FANZA セール特集ページ）
  - intent=null     → 「気分に近いジャンルの新着を一度眺める」型（ジャンル新着）
- これらは「成約 CTA ではなく、気軽に見る用の中間 CTA」として明確に区別して提示する。
- 押しつけがましさを排除：「気になればチラッと見ておくと、後の提案がより的確になります」程度の語り口。
```

### 4b.3 UI 実装要件（CTO）

- 中間アクションは商品カードと同じ世界観（ダーク × ゴールド）の Pill ボタンを使うが、`btn__link-primary` ではなく **`btn__link-secondary`**（控えめなアウトライン）で差別化する。
- URL ビルダ：`buildEarlyCookieURL({ intent, asp: 'fanza' })` を新設し、ハードコード禁止（§ BRAND_DESIGN_GUIDE.md §4-5 と整合）。
- クリック時に GA4 `early_cookie_burn` イベントを発火（`intent` / `placement: 'mid_session'` を付与）。サタデー・レビューで「早期着火 → 最終成約」のファネルを観測する。

### 4b.4 効果検証（サタデー・レビュー上の確認指標）

| 指標 | 期待値 | 異常検知 |
|---|---|---|
| `early_cookie_burn` 発火率 / `ai_session_start` | 50% 以上 | 30% を 2 週連続下回ったらプロンプトに問題あり |
| `early_cookie_burn` → `ai_affiliate_click` 同一セッション率 | 30% 以上 | 中間 CTA が「逃げ道」になっていないか確認 |
| `ai_affiliate_click` 全体の同一セッション完結率 | 70% 以上 | 残り 30% が翌日以降の自然再訪→成約となれば早期着火が効いている証拠 |

### 4b.5 禁則

- 「FANZA 公式へ今すぐ行く！」のような **AI が成約を急かす表現** は使わない。世界観（『ビブリア・エロティカ』の落ち着いた語り口）を壊す。
- 中間アクションを **複数同時提示しない**。決定疲労を生み離脱要因になる。1 セッション 1 中間アクションが原則。
- intent 別中間 URL は環境変数 `NEXT_PUBLIC_FANZA_EARLY_*` 等から組み立てる。直書き禁止。

---

## 5. 計測フィードバック・ループ

注入完了後 24 時間以内に Claude Code が以下を自動チェックする：

1. **GA4 でイベント受信確認**：`ai_affiliate_click` / `product_click` が本番 URL から発火しているか。
2. **Search Console インデックス**：`URL inspection` で新本文がクロール対象になっているか。
3. **タグ汚染チェック**：意図しない `style=""`、`<!-- wp:` の混入がないか HTML を grep。
4. **異常検知時の SOS 動線**：上記のいずれか、または §7 のエスカレーション条件が発生した場合、Claude Code は以下を **自動実行** し、HUMAN が帰宅後に一瞬で検知できる状態を作る：
   - **a. `management/ALERTS.md` に追記**：日付・対象・症状・推定原因・推奨アクション・関連バックアップパスを Markdown テーブル形式で追記する（ファイルは末尾追記方式・古いものを消さない）。
   - **b. GitHub Issues へ自動起票**（オプション、`gh issue create` 経由）：タイトルは `[ALERT] <YYYY-MM-DD> <症状サマリ>`、ラベルは `auto-alert` / `priority-<low|mid|high>` を付与する。Issue 本文は ALERTS.md エントリと同一フォーマット。
   - **c. 詳細ログの保存**：機微情報を含むスタックトレースや HTTP レスポンスは `management/_metrics/<YYYY-WW>/post-injection-anomalies.md` に分離保存（ALERTS.md にはサマリのみ）。
   - **d. 通知後の判断保留**：自動修復は行わず、HUMAN の判断を待つ。判断が下りるまで該当記事の追加注入はブロックする。

---

## 6. 担当別チェックリスト（毎週）

### HUMAN（Tachi）
- [ ] 土曜 10:00 のリマインダーを設定済み
- [ ] Claude Code を起動可能な状態（PowerShell 等）
- [ ] SSH 鍵ファイル（`~/.ssh/mixhost_codex_pc`）がローカルに存在

### Claude Code（CTO）
- [ ] §2.2 / §3.3 のテンプレ通り処理した
- [ ] 中間 JSON / バックアップ HTML を保存した
- [ ] CHANGELOG / operation-log にエントリを追加した

### CSO（Gemini 3）
- [ ] 中間 JSON を読み込み、5 指標で診断した
- [ ] 必要な指示書（RW / AB / IG）を発行した
- [ ] `_metrics/<YYYY-WW>/saturday-review.md` を更新した

### CCO（ChatGPT 5.5）
- [ ] 受領した指示書通りに記事を生成した
- [ ] `site-moterist/THE_THOR_DICTIONARY.md` §12 のチェックリストを通過した
- [ ] staging に Markdown を置いた

---

## 7. エスカレーション

以下が発生した場合、Claude Code は **直ちに作業を停止** し HUMAN に問い合わせる：

- SSH 鍵で接続できない（libcrypto エラー / Permission denied）
- WP-CLI が `Permission denied` を返す（`.git/index.lock` 系）
- 本番 HTML 検証で装飾要素が消失している
- GA4 が現アカウントで開けない（auth mismatch）
- バックアップ取得前に注入を実行しようとしている状態

---

*v1.0 — 2026-05-16 初版。CSO 所管。改訂時はバージョン番号を上げ、`CHANGELOG.md` に記録すること。*
