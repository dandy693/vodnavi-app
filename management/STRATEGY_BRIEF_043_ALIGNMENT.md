# STRATEGY_BRIEF_043 — Moterist 送客経路補修と2ドメイン集中化の整合

発行: 2026-06-07 / 採番: 042 の次 = **043** / HUMAN 採択: Option 1（W25 CTA 修正 → その後 moterist 凍結）
位置づけ: BRIEF_037（Option 3 集中）の延長・確定。集中先（vodnavi.jp/app）は不変、moterist の最終扱いを確定する。

## 1. 経営意思決定（2026-06-07）
moterist.com の完全冬眠（Freeze）へ移行する**前段階として、直近承認した W25 の CTA 修正（T-20260614-*）を最終執行**する。これにより、冬眠後も既存5記事資産からの流入が `?source=moterist&intent=*` の正しい intent 付き動線で `app.vodnavi.jp/concierge` に連結された状態を確定させる（漏斗底上げ）。
> 注: 本件は CTA の `source`/`intent` パラメータ整合であり、GA4 クロスドメイン linker（`_gl`）の生死とは別問題。linker 状態は T-20260614-03 で別途疎通確認する。

## 2. ドメイン個別の運用ポリシー
- **vodnavi.jp / app.vodnavi.jp**: 開発・運用リソースを集中投資する主戦場。新規集客記事・SNS 着地 LP・年齢確認ゲート（`proxy.ts`）の要塞化をここに集約。
- **moterist.com**: W25 の5アンカー軽微修正（BRIEF_042）反映 + T-03 検証完了をもって、**新規記事追加・リライトを完全停止（冬眠）**。既存5記事 (1095/1106/994/954/1018) の SEO 本文・パーマリンク・GA4 設定 (G-5HYV772ER9) は無人ホールド（現状維持）。

## 3. ガバナンス不変条件
- 既存の SEO 評価および URL 構造を無傷で保護するため、ドメイン廃止・一斉削除は**行わない**。現状の HTML 構造を維持したままホールド。
- moterist 検索流入は ~ゼロ（adult デランク確定、`gsc-panel-audit.json`）。冬眠は「Google organic 投資の停止」であり、既存資産の保全とは両立する。

## 4. 次フェーズ要求仕様
- **CTO**: `app.vodnavi.jp` の SNS 着地 LP 設計 + 年齢確認ゲート統合 / `vodnavi.jp` 側メディア記事格納環境の選定。
- **CCO**: 今後の執筆・リライト先ターゲットを moterist.com から vodnavi.jp（clean 教養コラム）へ変更（BRIEF_035 retained）。

### ■ 最終同期監査（2026-06-07）
本ブリーフをもって、W25 の Moterist 5記事 CTA 修正（T-20260614-*）の執行と、その後の完全冬眠（Freeze）プロトコルの順序関係を完全固定した。ボード履歴および副サイト登録等の Done ステータスは非破壊のまま保護される。
