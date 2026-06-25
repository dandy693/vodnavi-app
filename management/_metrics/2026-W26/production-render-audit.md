# 本番レンダリング監査 — work-review 全 27 CID 物理走査（2026-06-25）

CTO 実測（read-only GET、Claude Code Bash）。CSO script `execute_total_audit.sh` の
「全 28 品番監査」前提は**不採用**（後述§6）。`work-reviews/*.md` の**実 CID 27 件**
（`README.md` は作品でないため除外）を `cco-target-cids.ts` の floor=`videoa` で
本番 curl し、実トークン照合した結果のみを記録する。

## 1. 重要な前提：/works/* は年齢ゲート裏ではない（公開）
`app-concierge/src/proxy.ts` の `config.matcher` は **`/concierge`・`/concierge/:path*`・
`/api/concierge/:path*` のみ**を対象とする（COOKIE_NAME=`vodnavi_age_verified` / VALUE=`1`）。
**`/works/*` は proxy 非対象＝クッキー無しで公開**。よって監査に「ゲート突破」は不要
（突破すべきゲートが /works に無い）。成人視聴は遷移先 FANZA 側の年齢確認に委ねる設計。
※「公開で良いか」は別途 HUMAN 判断事項（コンプラ観点で再確認の余地）。

## 2. 監査方法（実値・grep -F 固定文字列）
- URL: `https://app.vodnavi.jp/works/videoa/{cid}`（cookie なし、`-L` で redirect 追跡）
- 判定トークン（3 つ全充足 + HTTP 200 で PASS）:
  - `#PR`: `本ページにはアフィリエイトリンクが含まれます`
  - 主 CTA（可視テキスト）: `FANZA公式`
  - アフィリエイト ID（盾）: `moterist-990`

## 3. 全 27 CID 物理結果
| CID | HTTP | size(B) | #PR | CTA | af_id | 判定 |
| :-- | :--: | --: | :--: | :--: | :--: | :--: |
| `gkok00002` | 200 | 149,064 | ✅ | ✅ | ✅ | PASS |
| `snos00233` | 200 | 168,631 | ✅ | ✅ | ✅ | PASS |
| `savr00978` | 200 | 172,055 | ✅ | ✅ | ✅ | PASS |
| `mkmp00726` | 200 | 178,308 | ✅ | ✅ | ✅ | PASS |
| `dvmm00393` | 200 | 181,206 | ✅ | ✅ | ✅ | PASS |
| `ofje00630` | 200 | 178,568 | ✅ | ✅ | ✅ | PASS |
| `evis00624` | 200 | 162,644 | ✅ | ✅ | ✅ | PASS |
| `gqhb00024` | 200 | 180,384 | ✅ | ✅ | ✅ | PASS |
| `h_1724m794g00002` | **404** | 55,980 | ❌ | ❌ | ❌ | **FAIL** |
| `1asex00014` | 200 | 172,502 | ✅ | ✅ | ✅ | PASS |
| `mide00954` | 200 | 173,485 | ✅ | ✅ | ✅ | PASS |
| `ipx00821` | 200 | 172,056 | ✅ | ✅ | ✅ | PASS |
| `ssis00342` | 200 | 165,959 | ✅ | ✅ | ✅ | PASS |
| `tek00078` | 200 | 146,893 | ✅ | ✅ | ✅ | PASS |
| `dvdms00811` | 200 | 164,784 | ✅ | ✅ | ✅ | PASS |
| `jufe00233` | 200 | 171,518 | ✅ | ✅ | ✅ | PASS |
| `mide00142` | 200 | 163,738 | ✅ | ✅ | ✅ | PASS |
| `sone00911` | 200 | 174,970 | ✅ | ✅ | ✅ | PASS |
| `atid00388` | 200 | 169,930 | ✅ | ✅ | ✅ | PASS |
| `meyd00744` | 200 | 168,733 | ✅ | ✅ | ✅ | PASS |
| `snis00899` | 200 | 166,555 | ✅ | ✅ | ✅ | PASS |
| `soe00912` | 200 | 165,442 | ✅ | ✅ | ✅ | PASS |
| `ssni00744` | 200 | 169,236 | ✅ | ✅ | ✅ | PASS |
| `team00055` | 200 | 160,617 | ✅ | ✅ | ✅ | PASS |
| `venx00022` | 200 | 168,806 | ✅ | ✅ | ✅ | PASS |
| `ymdd00211` | 200 | 171,801 | ✅ | ✅ | ✅ | PASS |
| `jux00922` | 200 | 165,354 | ✅ | ✅ | ✅ | PASS |

**集計: PASS=26 / FAIL=1 / DEGRADED=0（of 27）**

## 4. 唯一の FAIL: `h_1724m794g00002`（孤立 404）
- **症状**: `works/videoa/h_1724m794g00002` = **404**。`videoa/amateur/anime/videoc` 全フロアで 404、連続 2 回再試行でも 404（**transient ではない**）。同時刻の control `gkok00002`=200＝**全体障害ではなく当該 CID 固有**。
- **資産は実在**: `work-reviews/h_1724m794g00002.md` は `source: live`・実タイトル「地方で若妻さんを…」・CCO 本文 226 字を保持。**レビュー資産は生きているのにページが死んでいる＝孤立**。SC では当時 17 click / 364 impr を獲得していた URL＝**link equity を 404 で失っている**。
- **根因（route 機構）**: `works/[floor]/[id]/page.tsx:173-174` が `const item = await getWork(floor, id); if (!item) notFound();`。`getWork()`（`@/lib/fanza/client`）が item を返さないと 404 化。同 route の comment 51-54 は floor パラメータの apiFloor 取り違えが「GSC 289 件の 404 構造発生源」と明記。
- **根因候補（未確定・断定しない）**: (a) `h_` maker-prefix の CID は videoa floor の FANZA API で resolve できない floor/namespace 不一致、(b) 本日の **FANZA API 400 全滅 SEV-1**（[[project_fanza_api_400_global_outage]]）で fresh fetch が失敗し、当該 CID は安定 ISR cache に未到達（26 件は stale cache で生存）、(c) DMM 側で gone-from-history。**確定には Vercel runtime log（`getWork` の null 経路 / FANZA API レスポンス）または障害復旧後の再 probe が必要**。
- **影響度**: 第1弾 SC 上位群（Sprint1 TOP10 内、17 click）の 1 枠が dead link。低〜中（収益主力 top3 は PASS だが、orphaned review 資産の救済 or 退役判断が要る）。

## 5. アフィリエイト URL 実値（盾の物理確認・代表 snos00233）
```
https://al.dmm.co.jp/?lurl=...cid%3Dsnos00233...&af_id=moterist-990&ch=link_tool&ch_id=link
```
- `af_id=moterist-990`（正規 production ID、bare link でない＝「直リンク禁止」盾 OK）。
- 26 件すべてで `moterist-990` トークン present＝`buildAffiliateURL` 盾が全 PASS ページで機能。

## 6. CSO script `execute_total_audit.sh` を不採用とした理由
| # | 欠陥 | 影響 |
| :-- | :-- | :-- |
| 1 | enumerate が `*.ts`/`*.json` glob、実体は `*.md` | `CIDS` 空→fallback で**わずか 2 件**（snos00233/savr00978）のみ走査 |
| 2 | レポート見出し「全28品番」・commit「total 28-cid … completely landed」 | 物理は 2 件なのに **28 件完走を僭称**＝git 履歴に false coverage |
| 3 | `sed 's/- \[ \] T-07.*/.../'` | 実 id は `- [ ] 🔵 T-20260625-07`＝**非マッチ silent no-op** |
| 4 | board 追記 heredoc に literal `\[x\]` / `` \`/works/*\` `` | バックスラッシュ artifact が board に混入 |

→ grep トークン自体は今回正しい（`FANZA公式`/`moterist-990`/`#PR` 全文）ため**監査ロジックは流用**し、enumeration を実 `.md` 27 件へ是正して CTO が再走査・本記録を land。

## 7. 残（未了）
- `h_1724m794g00002` の 404 根因確定（Vercel log or 障害復旧後 re-probe）と、救済（floor 修正/再 fetch）or 退役（review .md パージ + cco-target-cids から除外）の HUMAN 判断。
- 26 PASS は本日時点の本番状態。FANZA API 障害復旧後に stale cache が剥がれた際の再監査が望ましい（cache 依存 PASS の可能性）。
- 実装/反映は要 HUMAN 承認（`tsc`/`next build` + 本番 curl）。
