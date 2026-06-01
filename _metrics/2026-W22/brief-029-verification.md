# BRIEF 029 — 5大資産本番反映直後 GA4 クロスドメイン・Linker生存確認およびホスト名分離監査

## 1. 監査実施概要
- **実施日**: 2026-06-01
- **監査対象ホスト**: `moterist.com` (集客) ↔ `app.vodnavi.jp` (成約)
- **GA4 測定 ID**: `G-5HYV772ER9` (Moterist) / `G-GG7JV9MJRW` (共有ストリーム)
- **監査手法**: Chrome MCP を用いたヘッドレス巡回、および GA4 リアルタイムイベントストリーム（r=top-events）の物理スキャン

## 2. Linkerパラメータ（_gl）本番突合チェック
- [ ] **1095 (Beginner Guide)** 末尾CTAクリック時の URL 追跡: `_gl=` 付与確認 [ ] / client_id 継承 [ ]
- [ ] **1106 (Registration Guide)** 末尾CTAクリック時の URL 追跡: `_gl=` 付与確認 [ ] / client_id 継承 [ ]
- [ ] **994 (Safety Guide)** 末尾CTAクリック時の URL 追跡: `_gl=` 付与確認 [ ] / client_id 継承 [ ]
- [ ] **954 (Evergreen Hub)** 末尾CTAクリック時の URL 追跡: `_gl=` 付与確認 [ ] / client_id 継承 [ ]
- [ ] **1018 (Actress Material)** 末尾CTAクリック時の URL 追跡: `_gl=` 付与確認 [ ] / client_id 継承 [ ]

## 3. ホスト名（Hostname）個別識別・リアルタイム集計
GA4 `G-GG7JV9MJRW` プロパティに到達した `ai_session_start` イベントの、ホスト名ディメンション別分割生データ：

| 観測ホスト名 (Hostname) | セッション数 (Raw) | source パラメータ | 計測状態評価 |
|---|---|---|---|
| `moterist.com` (経由) | [要入力] | `moterist` | 正常 / 濁りなし |
| `vodnavi.jp` (直接) | [要入力] | `brand` | 正常 / 濁りなし |
| `app.vodnavi.jp` (直接) | [要入力] | `default` | 正常 / 濁りなし |

## 4. 監査結論と次期アクション
- **評価**: [CTOによる実測判定を入力]
- **次期トリガー**: 全ドメインの計測生存を確認後、ただちに `STRATEGY_BRIEF_030`（OpenAI スタブ解除・成約パイプライン全面開通）へ移行する。
