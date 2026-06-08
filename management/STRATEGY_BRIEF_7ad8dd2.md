---
title: "新章メディア構築における防衛境界およびインテント調律仕様（カノニカル版）"
last_updated: "2026-06-08"
hash: "7ad8dd2"
status: "approved"
---

# メディア構築における防衛境界およびインテント調律仕様

> 関連: 詳細な 5 バケット仕様は `STRATEGY_BRIEF_IG_2026-06-08.md`。本ファイルは
> その **境界決定（②④ の扱い）に対する HUMAN カノニカル承認**を固定する上位仕様。

## 1. 物理ファクトの再定義
- `app.vodnavi.jp` におけるアクティブユーザーシェア（~97-99%）は「**アプリ内回遊シェア**」であり、検索直接着地率ではない（cross-domain 1.4%、`project_funnel_intra_app_reclassified`）。
- 既存の SEO 資産（vodnavi.jp impr 81.8k）を保護するため、インテントの刈り取りはクリーン面を汚染しない形で行う。

## 2. 境界ブロック配置の厳格化（HUMAN 承認 2026-06-08）
- **② [家族にバレない] 軸 (beginner)** および **④ [情緒・賢者タイム] 軸 (null)** は、`site-brand`（クリーン面 / vodnavi.jp）ではなく、**年齢確認サーバーの盾の「内側」= app.vodnavi.jp（成人面）にのみ配置**する。
- `site-brand` は、ゲートウェイおよびクローラーに対する「純粋なトラスト（信頼）の聖域」としての役割を厳守する（成人シグナル混入を禁止、`project_age_gate_shield_is_proxy_ts` / BRIEF_034 §4）。
- ①③⑤ は元々 app-side（年齢ゲート内）のため境界 SAFE、従来通り進行可。
