# STRATEGY_BRIEF_045 — W26 新章キックオフ（実コード監査とメディアインフラ選定）

発行: 2026-06-07 / 採番: 044 の次 = **045** / 前提: BRIEF_043（moterist 凍結）/ BRIEF_044（age gate=proxy.ts 確定）

## 1. 執行ステータス（事実ベース）
- **moterist.com**: as-is 凍結（W25 CTA 修正 T-02 は中止、既存5記事/permalink/GA4 はホールド、`?source=moterist` 動線は機能継続）。
- **2ドメイン集中**: vodnavi.jp（メディア）/ app.vodnavi.jp（成約アプリ + age gate）へ集中。
- **Git**: feat/saturday-pdca-w22 に 7 コミット（`5bc8e0e..93622c1`）+ 本ブリーフが **ローカル landed 済**。**push は HUMAN が `! git push` で実行（サンドボックス push は auth hang）** — 「GitHub 同期完了」は push 後に確定。

## 2. W26 物理タスク（BRIEF_044 §3 と同一。新規定義はしない）
脳内コードを排し、**実在アセット**の監査・選定へ移行する。タスク本体は board の W26 セクション（T-20260607-05/06/07）。

- **T-20260607-05** — `app-concierge/src/proxy.ts` 監査: 既実装の `vodnavi_age_verified=1` cookie 挙動、ページ pass-through（`source`/`intent`/`_gl` 無傷着地）、API 403 の非対称ガードをコードレベルで目視確認。**`middleware.ts` 新設は永久禁止**（proxy.ts が正典）。`_gl` は GA4 client-side linker の pass-through ログであり middleware デコードではない。
- **T-20260607-06** — vodnavi.jp メディア格納環境の選定: Next.js 静的配置（SSG/ISR）か既存サーバー構造活用かを、保守コスト/パフォーマンスで比較選定。
- **T-20260607-07** — app.vodnavi.jp の SNS(X) 着地クリーン LP 設計（既存 age gate 統合）。

## 3. 注記
本ブリーフは W26 キックオフの位置づけで、技術仕様の正典は **BRIEF_044**（proxy.ts の実態記述）。重複定義は避け、進捗は board の T-20260607-05/06/07 で追跡する。
