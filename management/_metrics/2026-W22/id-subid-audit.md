# 物理監査ログ: アフィリエイト ID 副サイト並列配線 (案A) 確定

## 1. 監査契機
2026-06-02 セッションにて T-20260602-03-FINDING (`af_id=moterist-001` 直書き 16 件) を「ID 分離の盾 ガバナンス違反」として起票していたが、HUMAN による DMM アフィリエイト管理画面の目視確認を経て、当該 ID 群が単一アカウント配下の **副サイトID / トラッキングID** であり、ファネル識別解像度を高めるための意図的並列配線であることが判明。本ログはその確定記録。

## 2. 確定された 3-ID 並列配線 (案A)
| 副サイト ID | 用途 | 配置 |
|---|---|---|
| `moterist-001` | 集客 (Moterist WP 記事 + THE THOR 辞書) | `site-moterist/03_content/*.md` (直書き許容) |
| `moterist-004` | 成約 (app-concierge UI コンシェルジュ) | `app-concierge` 環境変数 `NEXT_PUBLIC_FANZA_AFFILIATE_ID` バインド予定 |
| `moterist-990` | データ (FANZA 商品情報取得 API) | 既存 BRIEF_030 §2 で master 指定済、API 経路のみで使用 |

## 3. 証跡
- 一次ソース: HUMAN による DMM アフィリエイト管理画面「サイト情報」タブの目視確認 (screenshot は HUMAN 端末ローカル、本リポへの artifact 配置は未定)
- 物理 grep verify (本リポ内 ID 痕跡):
  - `moterist-001`: 集客側 5 markdown + dictionary (16 hits, T-20260602-03-FINDING 由来)
  - `moterist-990`: `management/STRATEGY_BRIEF_030_CONCIERGE_OPEN.md:8` (既存仕様)
  - `moterist-004`: リポ内痕跡ゼロ (本ログ landed 時点で初出、env 配線は T-20260602-04-ENV にて実装予定)

## 4. governance への影響
- **T-20260602-03-FINDING**: 「ガバナンス違反」前提が無効化 → status: `Superseded by Option-A`
- **T-20260602-03-STEP1**: env 値 `moterist-001` → `moterist-004` への読み替えが必要 (app-concierge 側 env なので moterist-004 が正)
- **T-20260602-04**: markdown 一括置換は不要化 (副サイトID 仕様により直書き許容)
- **BRIEF_030 §2 ID分離の盾**: 単一 ID (990) 縛りから 3-ID 並列識別へ仕様改定
- **`BRAND_DESIGN_GUIDE.md` / `_gpts_knowledge/THE_THOR_DICTIONARY.md` の「af_id 直書き禁止」文言**: 「app-concierge 側でのみ禁止、site-moterist 側は副サイトID 直書き許容」と但し書きが必要 (本 commit スコープ外、後続タスク)

## 5. 残置事項
- HUMAN 端末から DMM 管理画面の screenshot を本リポ `management/_metrics/2026-W22/dmm-admin-subid-screenshot.png` にコピー配置 (artifact 物理化、任意)
- 上記 §4 の governance 文言訂正 (BRAND_DESIGN_GUIDE / `_gpts_knowledge` dictionary) は別 commit
