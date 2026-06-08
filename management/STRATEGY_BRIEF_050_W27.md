# STRATEGY_BRIEF_050 — W27 クリーンコンテンツ量産 & 計測生存確認

発行: 2026-06-08 / 採番: 049 の次 = **050**（原案の無番 "W27" を採番に訂正）/ 前提: BRIEF_049（vodnavi.jp clean 運用）

## 1. 運営方針（2ドメイン集中要塞化）
- **vodnavi.jp（集客層）**: `mdToHtml`（T-06 で刷新・build verified）を活用した SSG。非成人/教養ドメインとして SEO 評価最大化。
- **app.vodnavi.jp（成約層）**: `proxy.ts` 年齢ゲートの裏。SNS の `/lp?source=sns_x&intent=*`（T-07 実装 / T-09 runtime 検証済: 403・pass-through・param 無損失）を `/concierge` へ。

## 2. W27 コアタスク
- ✅ **PoC clean 教養コラムの初回投入は T-08 で完了済**（`site-brand/03_content/philosophy-of-cinema/`、SSG 確認）。W27 は**量産・計測フェーズ**。
- [ ] clean 教養コラムの本数追加（**非成人厳守**、permalink 不変、T-06 レンダラ活用）。
- [ ] `next build` 大量 SSG 時のメモリ / レンダ速度プロファイリング。
- [ ] GA4 の `?source=moterist` / `?source=sns_x` カスタムディメンション計測の生存確認（流入元別ファネルが汚染なく集計されるか）。

## 3. ガバナンス防衛（境界の自動強制）
- **18禁ワード/FANZA リンク混入の build 前サニタイズ lint**: `03_content/*.md` に成人語・al.dmm/af_id 等が無いかを検査する簡易スクリプトを `scripts/` に追加し、clean 境界（BRIEF_034 §4 / 049）を人手に頼らずビルド前に強制する。これにより「clean ドメインに成人シグナルを載せない」を機械的に担保。
