# STRATEGY BRIEF 105 — app.vodnavi.jp コンシェルジュデータパイプラインのファクト監査

## 1. 目的
`moterist.com` の完全凍結状態を維持しつつ、実集客の主軸である `vodnavi.jp`（Next.js）および成約アプリ（`app.vodnavi.jp`）間の GA4 `_gl`（linker）伝搬、および `proxy.ts` を通過するコアデータの整合性を、認可ゲートの手前で安全に定常監視する。

## 2. 不変条件の明文化
- **インデックスポリシーの継続**:
  - `?sort=` を含む動的URLに対し `noindex` は一切使用せず、`STRATEGY_BRIEF_101` に準拠した self-canonical consolidation（正規絶対URLへの集約）の記述コード出力を厳守する。
- **不可逆アクションの禁止**:
  - HUMAN のダッシュボード確認および明示的承認が得られるまで、Vercel環境変数の本番実配線フラグを「landed（完了）」扱いとせず、常に「未検証・確認待ち」として追跡せよ。

## 3. 計測機構の物理的事実（誤認防止）
- `proxy.ts` は `/concierge[/...]` への `_gl` 着地時に**サーバー側 `[GL_TRACKING]` console log を emit するのみ**（`_gl` は先頭10文字のみ記録・PII 回避）。これは Vercel Logs での実効件数計測用であり、**GA4 カスタムイベントそのものを発火させるわけではない**。
- GA4 カスタムイベント（`ai_session_start` 等）は**クライアント側**で発火する。定常監視は「サーバー側 GL_TRACKING ログ」と「クライアント側 GA4 イベント」を**別層として分離**して確認する（混同しない）。
