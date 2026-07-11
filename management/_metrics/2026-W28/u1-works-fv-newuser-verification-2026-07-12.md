# U1 (works_fv_newuser) 生存確認報告 — 判定 (c) 描画・発火とも正常

- 確認日時: 2026-07-12 JST（CSO発行 2026-07-11「U1生存確認＋報告永続化」）
- 実施: CTO（コード監査 + 本番curl + claude-in-chrome 実ブラウザ検証。修正は一切実施していない）

## 判定: **(c) 描画・発火とも正常（＝クリック0件は露出母数/行動率の問題）**

## 1. 表示条件（コード引用・平易説明）

`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx:216-219`

```tsx
// U1 新規ユーザー向けFVモジュール（新規会員導線 設計書v1）のリリースゲート。
// コピー確定（設計書 §4 HUMAN確認 → CSO確定版発行）まで OFF が既定。
// 有効化は Vercel env `FEATURE_FV_NEWUSER=1` + 再デプロイ。
const showNewUserModule = process.env.FEATURE_FV_NEWUSER === "1";
```

**重要**: 表示条件は**サーバ環境変数のフィーチャーフラグのみ**。訪問者ごとの「新規ユーザー判定」（cookie・初回訪問検知等）は**存在しない**。フラグONの現在、**作品詳細ページの全訪問者**（新規・リピーター問わず、mobile FV直下 + デスクトップ右カラムの2箇所、`<details>`折りたたみ状態）に表示される。「新規ユーザー向け」はコピー文言のターゲティングであって表示制御ではない。

## 2. 本番描画確認

- 本番curl: `/works/videoa/vrkm01889`・`/works/videoa/vrkm01870` の2ページで HTTP 200 + モジュールコピー「FANZAがはじめての方へ」+ `works_fv_newuser` 文字列を確認 → **フラグは本番でON**。
- 実ブラウザ: メインCTA直下に折りたたみ1行で描画、展開で3項目リスト + ガイドリンク + 「FANZA公式でこの作品を観る（初めての方はこちらから・18禁）」CTAリンクを確認（スクショ ID: ss_0880u0rez / ss_9267bldkh / ss_512186w7h）。

## 3. イベント発火確認

- 機構: `fanza-affiliate-link.tsx` onClick → `analytics.ts track()` → `gtag('event', ...)`
- 検証法: 検証用Chrome＝GA4 collect不送信のため、CSO指示どおり **gtag呼出の生成をもって発火と判定**。`window.gtag` をラップして呼出をキャプチャ + capture-phase `preventDefault` でFANZAへの実遷移（実アフィクリック計上）を抑止した上で、U1リンクへ mousedown+click をディスパッチ。
- 結果: 以下2イベントの生成を確認（**双発正常**）:
  - `product_click` {asp_name: fanza, content_id: vrkm01889, floor_code: videoa, **placement: works_fv_newuser**, link_target: fanza_affiliate, transport_type: beacon}
  - `ai_affiliate_click` {asp_name: fanza, content_id: vrkm01889, floor_code: videoa, link_variant: primary, **placement: works_fv_newuser**, transport_type: beacon}

## 4. 露出母数（(c)につき追加報告）

GA4 7/8〜7/11・ページフィルタ `/works/`（185 URL）:

- **表示回数 666 / アクティブユーザー 305**
- 表示制御に新規判定がないため、**U1の実露出母数はこの全数**（ページビュー666）。
- 参考（新規側の代理値）: サイト全体 `first_visit` = 201（7/8〜7/11、ページ別内訳は標準レポートでは取得不可）。
- 解釈: 露出約666ビューに対しクリック0＝**モジュール自体は生きているが、折りたたみ`<details>`のsummary 1行からの展開→クリックという2段階行動の突破率が現状ゼロ**。7/14判断の際は「機能死」ではなく「露出量・行動導線の問題」として扱うのが妥当（対処はCSO判断）。
