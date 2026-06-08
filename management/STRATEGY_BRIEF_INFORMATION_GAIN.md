# STRATEGY BRIEF — 作品詳細面における独自査読（Information Gain）の live 通電

> 注記 (CTO, 2026-06-08): 本ブリーフは CSO 原案 `STRATEGY_BRIEF_INFORMATION_GAIN` を物理ファクトに整合させて landed したもの。原案 §1 の「検索着地 96.99%」「微減は自然減である」は未検証の断定だったため、CTO が下記の通り訂正した（[[project_funnel_intra_app_reclassified]] / T-20260608-01 物理監査結果）。

## 1. 物理ファクトに基づく背景
2026-06-08 の物理監査（T-20260608-01）により、`app.vodnavi.jp/works/videoa/*` のインフラは健全と確定: 本番 HTTP 200、`G-GG7JV9MJRW` + `GTM-TKDHM348` 両ドメイン生存（計測剥離なし）、サーバーサイド年齢ゲート正常（500/クラッシュなし）。**よって「計測剥離」「年齢ゲートクラッシュ」のインフラ要因は棄却済み。**

ただし注意:
- **数値上の微減の有無・規模は未確認**。14日間日次数値抽出は `G-GG7JV9MJRW` 宛先プロパティ未特定のため Deferred（Saturday Review 正規フローへ）。「オーガニック評価揺らぎ／自然減」と断定する根拠は現時点で無い。
- `app.vodnavi.jp` の hostName シェア ~98.6% は **アプリ内回遊**であり、検索直接着地率ではない（cross-domain 1.4%）。「検索着地 96.99%」は原案の誤りとして撤回。

インフラ要因が棄却された以上、攻めの次手は守りではなく**コンテンツ層の差別化**。FANZA 公式あらすじの単純引き写しを脱し、Google が重視する「情報獲得（Information Gain）」を HTML レイヤーに肉付けして E-E-A-T を強化する。これは検索評価とは独立に価値がある施策（数値微減の有無に依存しない）。

## 2. CTO (Claude) への実装要求
- `/works/videoa/{cid}` のレンダリング（Next.js SSR）に `components/works/review-section.tsx` を新設。
- 各作品メタデータ下部に「独自査読論評」カラムを live 出力。**ガード**: CTO はコンポーネント + fixture スロット（型・差し込み口）を scaffold するのみ。実際の 300 文字超の査読本文は **CCO/HUMAN 生成のアダルト文脈コピー**であり、CTO は捏造しない（fixture は placeholder で型検証のみ）。
- スタイルは `design-tokens.css` のブランドゴールド（`#D4AF37`）/ダーク（`#121212`）の CSS 変数を参照（TS 重複定義を作らない、既存 brand-* 慣習準拠）。
- **境界**: 本施策は app.vodnavi.jp（年齢ゲート内）限定。アダルト査読本文を clean 面 vodnavi.jp へ載せない（[[project_age_gate_shield_is_proxy_ts]] / BRIEF_034 境界）。

## 3. ガバナンス
コード変更は `npx tsc --noEmit` + `npx next build` のローカルクリーン通過を確認した上でコミットする。本番 DB / 本番デプロイは HUMAN 承認。空中戦は禁止。
