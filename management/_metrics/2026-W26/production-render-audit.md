# 本番レンダリング監査 — work-review CTA/#PR 物理確認（2026-06-25）

CTO 実測（read-only GET、Claude Code Bash）。CSO script `execute_production_audit_gate.sh` の
「年齢ゲート突破 curl」前提・broken grep・false board flip は不採用とし、ソース照合のうえ
実トークンで監査し直した結果のみを記録する。

## 1. 重要な前提訂正：/works/* は年齢ゲート裏ではない（公開）
`app-concierge/src/proxy.ts` の `config.matcher` は **`/concierge`・`/concierge/:path*`・
`/api/concierge/:path*` のみ**を対象とする（COOKIE_NAME=`vodnavi_age_verified` / VALUE=`1`）。
**`/works/*` は proxy 非対象＝クッキー無しで公開**。よって BRIEF_072 / board の旧表現
「work-review は年齢ゲート裏」は不正確。実態は **SEO 集客のため /works/* は公開**で、
成人視聴は遷移先 FANZA 側の年齢確認に委ねる設計（age gate は対話型 /concierge に限定）。
※「公開で良いか」は別途 HUMAN 判断事項として記録（コンプラ観点で再確認の余地）。

## 2. 監査対象
- URL: `https://app.vodnavi.jp/works/videoa/snos00233`（cookie なし）
- 取得: `status=200` / `size≈168 KB` / redirect=0

## 3. 物理ファクト（実トークン照合・grep -F）
| 検証項目 | 実トークン | 結果 |
| :-- | :-- | :--: |
| ページ実体（CID） | `snos00233` | ✅ present |
| レビュー本文（CCO grounded） | `河北`（actress 河北彩花） | ✅ present |
| #PR 表記（ステマ規制） | `本ページにはアフィリエイトリンクが含まれます` / `（#PR）` | ✅ present |
| FANZA 主 CTA | `FANZA公式`（visible text） | ✅ present |
| アフィリエイト動線 | `al.dmm.co.jp` 実 URL | ✅ present |
| 年齢ゲート JSON（誤配信検知） | `age_verification_required` | ✅ 不在（正） |

## 4. アフィリエイト URL の実値（盾の物理確認）
```
https://al.dmm.co.jp/?lurl=...cid%3Dsnos00233...&af_id=moterist-990&ch=link_tool&ch_id=link
```
- `af_id=moterist-990`（正規 production ID、bare link でない＝「直リンク禁止」盾 OK）。
- `lurl` は cid=snos00233 の DMM 正規 detail を指す（誤 CID なし）。

## 5. 結論 / 残
- **snos00233 は本番で完全描画＝PASS**（review + #PR + FANZA CTA + 正規 af_id）。`buildAffiliateURL` 盾は機能。
- **未検証**: 残り 27 件の work-review（snos00233 1 件のみ物理確認、全 28 件への一般化は未実施＝捏造しない）。必要なら同手順で抽出検証。
