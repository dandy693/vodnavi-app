# STRATEGY_BRIEF_124 — モデル切替（Fable 5 → Opus 4.8）引き継ぎブリーフ（Fable 5 期間 最終監査記録）

> **Option A 採用**。事実整合版 provenance で landed。本ブリーフの監査主体は一貫して **Claude Fable 5**（監査日 **2026-07-06**）であり、Opus 4.8 名義の監査記述は一切含まない。

## 0. メタ情報

| 項目 | 値 |
|---|---|
| 監査日時 | 2026-07-06（システム日付） |
| 監査主体モデル | **Claude Fable 5**（model ID: `claude-fable-5`） |
| CLI | Claude Code v2.1.193 |
| session ID | `d0562c78-27f5-4d66-9432-15a148475c86` |
| effort | `xhigh` |
| 監査依頼元 | CSO（Gemini Gem） |
| 種別 | モデル切替引き継ぎ + Fable 5 期間 最終物理監査記録 |

## 1. モデル切替情報

- **旧**: Claude Fable 5（CLI v2.1.193）
- **新**: Claude Opus 4.8（1M context）
- **切替コマンド実行日**: 2026-07-06
- **実態**: `/model` コマンド出力は「Set model to Opus 4.8 (1M context) and **saved as your default for new sessions**」。すなわち**次回以降の新規セッション用デフォルト**を設定したのみ。現行セッション（`d0562c78`）は Fable 5 のまま切替わっていない（セッション ID 未更新・再初期化なし）。
- **Opus 4.8 実稼働**: 次回新規セッションから。

## 2. CSO 発注時の事実誤認と CTO Abort の記録

初回発注は「Opus 4.8 初回セッションでの監査」を前提としていたが、以下2点の事実誤認を含んでいたため、CTO（Fable 5）が FACT_GOVERNANCE §4「捏造禁止」に基づき Abort・訂正した。

- **誤認1（モデル稼働時点）**: CSO は「現行セッションが既に Opus 4.8 で稼働中」と誤認。→ CTO は `/model` 出力の "for new sessions" と session ID 不変を物理根拠に、現行は Fable 5 であることを訂正。
- **誤認2（発注日付）**: CSO は発注日を「2026-07-07（07-08 から前倒し）」と1日先取り。→ CTO はシステム現在日付が **2026-07-06** であることを明示して訂正。切替日の断定（07-07）は CTO 側で物理裏取り不能につき、事実確定値である 07-06（コマンド実行日 = システム日付）を採用。

**CTO 判断**: 発注どおり「Opus 4.8 名義」で本セッション内に landed すると、実際には Fable 5 が 07-06 に実施した事実と矛盾する記録を公開リポジトリへ push することになる。これは §4 違反かつ [[feedback_cso_scripts_fabricate_approvals_and_regress]] の再現。→ **Option A（実態に合わせて起票）を推奨し、CSO が承認。**（Option C = Opus 4.8 名義の即 landed は却下済。）

## 3. フェーズ1監査結果（6ブロック全文）

### [CTO正体宣言]
本セッションのモデルは **`Claude Fable 5`（`claude-fable-5`）であり、`Claude Opus 4.8` ではない**。CLI v2.1.193 / session `d0562c78` / effort=xhigh。根拠は `/model` 出力の "saved as your default for new sessions"（新規セッション用デフォルト設定のみ）と session ID 不変。

### [受領内容]
モデル切替後の regression 有無を確認する読み取り専用の10項目物理監査。前回同一セッション内監査との差分を算出し、8ファクトを条文照合した。

### [事実サマリ]
- **環境**: Fable 5 / v2.1.193 / session `d0562c78` / effort=xhigh。Opus 4.8 稼働は物理的に未成立。
- **日付**: システム現在日付 2026-07-06。発注記載の 07-07 は先取りのため 07-06 を採用。
- **ロール定義**: `./CLAUDE.md`（11行）+ `./app-concierge/CLAUDE.md`（`@AGENTS.md` import）実在。`~/.claude/CLAUDE.md`（グローバルメモリ）不在、`~/.claude/settings.json` 存在。
- **ドキュメント**: `management/` に OPERATION_MANUAL.md / ALERTS.md / TASK_BOARD.md / FACT_GOVERNANCE.md 実在。STRATEGY_BRIEF は計 127 本、数値最大は 123。→ 本ブリーフは **124** を採番。
- **Git**: HEAD = `6c6f11e`（main）、working tree clean。origin = `github.com/dandy693/vodnavi-app.git`。前回監査（同一セッション内）からの差分ゼロ。
- **不変条件**: `proxy.ts:72` matcher = 3パターン限定。`middleware.ts` はリポジトリ内 0件。brand-token hex は `design-tokens.css`（root）+ `site-brand/design-tokens.css`（同期コピー）のみ、`globals.css` は var() 参照。TASK_BOARD.md 1,362行、末尾 HEAD 整合。

### [未確認事項]
- 切替日 07-07 の物理裏取りは不能（`/model` は保存日を stdout に出さない）。
- Opus 4.8 稼働実績ゼロ（本セッションは Fable 5）。「Opus 4.8 側発見事項」は本セッションでは原理的に生成不可能。
- moterist 直近コミット `0d81bd4` の差分内容、Vercel 本番 env / live 挙動は本監査スコープ外・未検分。

### [矛盾検知]
8ファクト §1〜§8 すべて regression なし（下記 §4 表参照）。解釈変更は一切行っていない。

### [推奨アクション]
- フェーズ2（landed）は Option A（実態整合）で実行。Opus 4.8 名義の記述は含めない。
- 継続保留（brand-token 文言 precision-fix / `fix/sitemap-404-purge` 削除可否）は本発注では触れず、次回 Opus 4.8 セッションでの判断。

## 4. 8ファクト §1〜§8 遵守状況

| # | 確定ファクト（条文要旨） | 物理検証結果 | 判定 |
|---|---|---|---|
| 1 | vodnavi.jp は既に Next.js App Router 構築済・新規 init 厳禁 | `site-brand/src/app/` 構造実在、init 痕跡なし | ✅ |
| 2 | brand-token 参照のみ・hex 直書き禁止 | hex は design-tokens.css のみ、src 直書き 0件 | ✅ |
| 3 | 年齢確認は proxy.ts・`src/middleware.ts` 新規厳禁 | proxy.ts 1件 / middleware.ts 0件 | ✅ |
| 4 | cookie 3機構を混載しない | ①`vodnavi_age_verified`(proxy.ts) ②`af_id`/buildEarlyCookieURL(article/works/concierge-chat) ③`_gl`(google-analytics.tsx / proxy.ts log) の3独立実装を確認 | ✅ |
| 5 | 実在法人格は合同会社トレンドネットのみ | `layout.tsx:78 legalName:"合同会社トレンドネット"`、`Safari株式会社` はガバナンス文書の禁止記載のみ・実装コミットなし | ✅ |
| 6 | `?sort=` 等クエリへ noindex 厳禁・self-canonical | noindex は not-found ガード / age-gate / lp / contact 等の個別ページ限定、`?sort=` クエリ noindex は 0件。works/[floor]/[id] に「noindex は使わない（§2）」明示コメントあり | ✅ |
| 7 | moterist.com 完全凍結(as-is hold) | `site-moterist/` working tree 変更 0件、直近コミット `0d81bd4`(2026-06-09)以後 untouched | ✅ |
| 8 | 年齢ゲート守備範囲固定(非対称ガード) | matcher 3パターン限定、page パススルー + `/api` 403 実装をコード確認 | ✅ |

## 5. 前回 Fable 5 監査（同一セッション内）からの差分

**ゼロ。** HEAD は `6c6f11e` のまま不変、working tree clean、新規コミット / 追加 / 削除ファイルなし。唯一の環境差分は effort が `high` → `xhigh` に昇格した点のみ（regression ではない）。

## 6. 継続保留事項（次回 Opus 4.8 セッションへ引き継ぎ）

- **FACT_GOVERNANCE §1 の brand-token 文言 precision-fix**（CSO 承認待ち）: §1 は brand-token 定義場所を「`globals.css` の CSS 変数」と記すが、物理的 hex 定義は `design-tokens.css`（root 正典 + site-brand 同期コピー）にあり globals.css は Tailwind 露出層。運用帰結（参照せよ・直書き禁止）は不変のため violation ではないが、実配置への文言精緻化の余地。
- **`fix/sitemap-404-purge` ローカルブランチの削除可否**（CSO 承認待ち）: PR #25 マージ済みとみられる upstream 追跡なしローカルブランチ。整理対象候補。

## 7. 次回 Opus 4.8 初回セッションで実施すべきタスク

1. 本 `STRATEGY_BRIEF_124` の読み込み（Fable 5 期間の最終監査記録として引き継ぐ）。
2. Opus 4.8 名義での物理監査再実施（10項目 + 8ファクト条文照合）。
3. その監査結果を `STRATEGY_BRIEF_125` として landed。
4. §6 の継続保留事項（brand-token precision-fix / `fix/sitemap-404-purge` 削除）の判断。

## 8. CSO からの自己訂正記録

- `/model` コマンド出力の解釈修正: 「default 変更 = 現行セッションは未切替」であり、現行稼働モデルの変更ではない。
- 発注日付の確認義務: 今後は発注前に必ずシステム日付を参照し、日付の先取りを行わない。
- モデル切替の物理確認は CSO 推測ではなく CTO 実測に委ねる。CTO の Abort は §4 の「最後の砦」機能の正当な発動として尊重する。

---

**採番経緯**: 数値最大 123（QUIET_TRACKING）の次番 124 を採用。120 欠番・122 焼却は既知（BRIEF_123 頭注参照）。関連: [[reference_fact_governance_canon]] / [[feedback_cso_scripts_fabricate_approvals_and_regress]] / [[project_age_gate_scope_concierge_only]]
