# STRATEGY BRIEF 056: 遷都期におけるインテント生存およびリダイレクト強制バインドプロトコル

- **ステータス**: APPROVED (CSO 策定 / マネタイズ防衛)
- **策定日**: 2026-06-09
- **対象ドメイン**: *.vodnavi.jp (site-brand / app-concierge)
- **関連**: `STRATEGY_BRIEF_053`〜`055`（環境変数・検証ゲート系）/ BRIEF_037（ハイブリッド防衛）

## 1. 目的と背景

`moterist.com` の完全凍結に伴い、既存の5記事資産から流入する `?source=moterist&intent=*` のトラフィック、および旧リダイレクトパスを `vodnavi.jp` の Next.js 遷都先へ完璧に受け渡す。クエリパラメータが Next.js のルーティング境界（Middleware 等）で揮発し、ユーザーが「一般フォールバック」に着地して成約率（CVR）が窒息する事故をゼロ化する。

> **物理ファクト calibration（CTO 補遺 2026-06-09）**: 現状の moterist→vodnavi クロスドメイン流入は funnel 物理分割で**全体の約 1.4%**（app.vodnavi.jp intra-app が 98.6%、[[project_funnel_intra_app_reclassified]]）、かつ moterist.com 検索流入は **~ゼロ**（[[project_moterist_zero_search_inflow]]）。したがって本プロトコルは「大量出血の救済」ではなく、**将来 source/intent タグ付き流入が増えた際に揮発させないための hygiene／future-proofing**として位置づける。要件自体は流入量に依らず正しい。

## 2. 必須インフラ要件（遵守ルール）

1. **パラメータ完全継承の原則（Intent Preservation）**:
   - `site-brand` から `app-concierge`（チャット起動画面）へリダイレクトまたは内部遷移させる際、URL に含まれる `source`, `intent`, `seed_cid` などの計測・プロンプト動作用パラメータを一字一句漏らさずフォワードしなければならない。
2. **ホスト名識別型 GA4 リンカーの生存**:
   - クロスドメイン・リンカー（`_gl`）が `moterist.com`（凍結）から遷移した際、`hostname` および `page_location` のコンテキストを維持したまま `G-GG7JV9MJRW` へ集約計測されるよう、Next.js 側の受信ハンドラはクッキー汚染を防止しつつセッションを連続させなければならない。

## 3. ガバナンス・チェックゲート

今後、Next.js 側で新しいルーティングやリダイレクトルール（`next.config.ts` の `rewrites/redirects` または `proxy.ts`／`middleware.ts`）を追加する際は、必ず「クエリパラメータが末尾まで維持されるか」の単体テストまたはランブック上の目視チェックを通過させること。

> 注: 年齢確認ゲートの実体は `app-concierge/src/proxy.ts`（Next.js 16 で `middleware.ts`→`proxy.ts` に rename 済）。`src/middleware.ts` は新規作成しない（[[project_age_gate_shield_is_proxy_ts]]）。

## 4. 境界（BRIEF_037 堅持）

moterist.com 完全凍結・5記事 SEO 永久保護・clean面/成人導線の境界は不変。本プロトコルは流入の受け渡し品質のみを対象とし、凍結対象の記事本文・パーマリンクには触れない。
