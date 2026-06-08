# STRATEGY_BRIEF_042 — W25：サージカル5アンカーアップデート執行仕様

発行: 2026-06-07 / 採番: 041 の次 = **042** / 前提: BRIEF_041 / 監査: `management/_metrics/2026-W23/w25-cta-dryrun-audit.json`

## 1. 物理監査ファクトに基づくスコープの極小化
- **監査結果**: read-only curl 監査（`w25-cta-dryrun-audit.json`）で、5記事のインテント CTA（`beginner` / `discount` / `actress`）は大部分が既に配線済みと確認。
- **改修対象**: 各記事に 1 箇所ずつ残存する「旧無印リンク（`?source=moterist`）」の**計5アンカーのみ**をサージカル更新。SEO 本文・画像・パーマリンクは完全固定、一切改変しない。

## 2. アップデート対象アンカー・マトリクス
無印リンク修正時は、WordPress の `&` エンコーディング揺らぎ（`&` / `&amp;` / `&#038;`）を許容する正規表現で、**兄弟要素と同一の intent に同調**させる（新規 intent は作らない）。

| 記事 ID | パーマリンク | 検索パターン（更新前） | 置換（更新後） |
|---|---|---|---|
| **1095** | `/fanza20250329/` | `?source=moterist`（無印・末尾） | `?source=moterist&intent=beginner` |
| **1106** | `/fanza20250331/` | `?source=moterist`（無印・末尾） | `?source=moterist&intent=beginner` |
| **994** | `/fanza_otoku250114/` | `?source=moterist`（無印・末尾） | `?source=moterist&intent=beginner` |
| **954** | `/fanzaotoku/` | `?source=moterist`（無印・末尾） | `?source=moterist&intent=discount` |
| **1018** | `/saika-kawakita-6/` | `?source=moterist`（無印・末尾） | `?source=moterist&intent=actress` |

> 置換は「`?source=moterist` の直後が `&`/`"`/`'` 以外で終端する anchor href」のみを対象にし、既に `&intent=` を持つ兄弟 CTA を二重置換しないこと。

## 3. 執行セキュリティ・ポリシー
- mixhost の SSH classifier block を踏まえ、**無人 SSH 一斉注入は不採用**。WP-CLI の手動直接投入、またはステージング環境での Safe-Append 置換で、**HUMAN の認可下**に実行する。
- 置換は anchor タグの `href` 属性のみ。タグ外のプレーンテキストには一切干渉しない。
- 置換後は各記事 1 回 curl で `&intent=` 付与を物理確認（T-20260614-03）。
- **ROI の再定義**: 検索順位の純増ではなく、W24 で landed した最序盤クッキー着火レイヤー（Option 3 / `buildEarlyCookieURL`）への完全配線による **CVR（漏斗底上げ）** の最大化が目的。moterist 検索流入は ~ゼロ（adult デランク）であり、効果は既存流入分に限定。
