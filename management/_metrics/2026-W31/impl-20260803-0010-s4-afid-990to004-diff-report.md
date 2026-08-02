# S4 実装完了 — **デプロイ前の差分報告**（PR #65・未マージ）

- 実装: **2026-08-02 23:49 〜 2026-08-03 00:10 JST**
- ブランチ `s4-afid-990-to-004` / コミット **`29d5d69`** / **PR #65**（https://github.com/dandy693/vodnavi-app/pull/65）
- **本番へのデプロイは未実施**（指示「実装後、デプロイ前に CSO へ差分を報告すること」に従い main へは未マージ）
- §6 事前登録は**実装前**に完了済（`prereg-20260802-2348-s4-afid-990to004.md` / コミット `4949114`）
- Phase 1 で停止

---

## 1. 差分サマリ

```
 .github/workflows/affiliate-id-guard.yml           |  52 +++++   (新規)
 app-concierge/scripts/guard-affiliate-id.mjs       | 249 +++++++++++++++++++++ (新規)
 app-concierge/package.json                         |   4 +-
 app-concierge/src/app/concierge/page.tsx           |  12 +-
 app-concierge/src/components/concierge/concierge-chat.tsx | 28 ++-
 app-concierge/src/components/product-card.tsx      |  25 ++-
 app-concierge/src/lib/concierge/tools.ts           |  18 +-
 7 files changed, 367 insertions(+), 21 deletions(-)
```

## 2. 対象4面と変更箇所

| # | 面 | 変更ファイル | 変更内容 |
|---|---|---|---|
| 1 | トップ | `components/product-card.tsx` | href を `item.affiliateURL ?? item.URL` → `buildAffiliateURL({...}).primaryUrl` |
| 2 | genres | 同上（同一コンポーネント） | 同上 |
| 3 | actresses | 同上（同一コンポーネント） | 同上 |
| 4 | concierge | `app/concierge/page.tsx`・`lib/concierge/tools.ts`・`components/concierge/concierge-chat.tsx:704` | CTA URL の生成を `buildAffiliateURL().primaryUrl` へ。`withUtm` は従来どおり適用。描画側は `href={work.ctaUrl}` |

### 実際に変わる URL（機械確認済み）

| 要素 | 変更前 | 変更後 |
|---|---|---|
| host | `al.fanza.co.jp` | `al.dmm.co.jp` |
| `af_id` | `moterist-990` | `moterist-004` |
| `ch` | `api` | `link_tool&ch_id=link` |
| **`lurl`（遷移先）** | `https://video.dmm.co.jp/{av\|anime\|cinema}/content/?id=…` | **同一（不変）** |
| `utm_source`（concierge のみ） | `shared` / `concierge` | **同一（不変）** |

**lurl 不変の根拠**: 実装前（2026-08-02 23:48 JST）に本番のカード **72 枚**について、詳細リンク `/works/{floor}/{cid}` の floor から `buildAffiliateURL` のフロア別マップで生成される lurl と、現行 990 リンクの lurl を1枚ずつ突合し **72 一致 / 0 不一致**（top 23・genres 21・actresses 28、いずれも floor=videoa）。

## 3. フィールド改名 `affiliateURL` → `ctaUrl`

`Work`（`concierge-chat.tsx`）と `ConciergeWork`（`tools.ts`）の CTA 用フィールドを改名した。

- **理由**: FANZA API 返却フィールド `item.affiliateURL`（af_id=990）と**同名**であったことが、API 返却値をそのまま href へ流す回帰の温床になっていた。改名により「`affiliateURL` という名前は API 返却値（990）専用」に固定され、回帰ブロックの静的検査（`href={…affiliateURL…}` を違反とする）が意味を持つ
- **影響範囲**: サーバー↔クライアント間で受け渡す JSON のキー名が変わる。デプロイの瞬間に**既に開いているコンシェルジュ画面**が新サーバーから応答を受けると `isWork` が false となり、そのセッションでは作品カードが表示されない可能性がある（リロードで解消）。永続データではないため後遺症はない
- FANZA API 側の型 `DmmItem.affiliateURL`（`lib/fanza/types.ts:104`）は**改名していない**

## 4. 回帰ブロック（c237e51 と同型）

`app-concierge/scripts/guard-affiliate-id.mjs`（新規）+ `.github/workflows/affiliate-id-guard.yml`（新規）+ `npm run guard:affiliate`

### static モード（ネットワーク不要・push / pull_request で毎回実行）

| 検出項目 | 内容 |
|---|---|
| (1) af_id ハードコード | `af_id=` の直書き（ビルダの `af_id=${af}` のみ許可） |
| (2) 99x 直書き | `moterist-99x` / `af_id=…-99x` の直書き |
| (3) **href への affiliateURL 直渡し** | `href={…affiliateURL…}`＝**S4 の回帰そのもの**（CSO 指示の主対象） |
| (4) JSON-LD への affiliate URL 混入 | `url: …affiliateURL…`＝**c237e51 の回帰** |

※ コメント行は検査対象から除外（禁則を説明するコメント自体を違反にしないため）

### live モード（schedule 6時間ごと / 手動）

- `<script>` を除去した**素の HTML の href** に `af_id=99x` が **0 件**であること
- **JSON-LD ブロックに `af_id` が含まれないこと**（c237e51 の禁則）
- 検査面は sitemap から解決（**URL 推測をしない**）: top / genres / actresses / works 詳細 / concierge（cids はトップの作品から取得）

## 5. 【重要】API 認証用途は非接触

| 箇所 | 状態 |
|---|---|
| `DMM_AFFILIATE_ID`（API 呼び出しの認証パラメータ） | **未変更** |
| `src/lib/fanza/client.ts`（`getCredentials` 等） | **未変更** |
| API 返却値 `item.affiliateURL` の値そのもの | **未加工**（参照をやめただけ） |
| `ch=api` を生成する箇所 | **本リポジトリ内に無い**（DMM 側が付与） |

## 6. 検証結果（実装後・デプロイ前）

| 検証 | 結果 |
|---|---|
| `npx tsc --noEmit` | **exit 0** |
| `npx eslint`（変更5ファイル） | **exit 0** |
| static ガード（実装後） | **合格**（走査 86 ファイル／違反 0） |
| static ガード **負テスト**（`href={item.affiliateURL}` を意図的に注入） | **exit 1 で検出**（注入ファイルは削除済・作業ツリーに残していない） |
| live ガード（**現行本番＝置換前**） | **exit 1**。top 23 / genres 21 / actresses 28 / concierge 3 = **75 件の 990 を検出**、works 詳細は **0 件（既に適合）**、JSON-LD の af_id は全面 **0** |

→ live ガードが現行本番の違反を正しく検出したことで、**検査自体が機能する**ことを置換前に確認済み。

## 7. デプロイ後に実施する検証（指示の4項＋公開後チェック）

| # | 検証項目 | 期待値 |
|---|---|---|
| 1 | 4面の href 内 990 | **0 件**（現在: top 23 / genres 21 / actresses 28 / concierge(cids3) 3） |
| 2 | 004 リンクの lurl と置換前 990 リンクの lurl の突合 | **全件一致**（機械突合。置換前の実測値は §6 事前登録に保全済み） |
| 3 | script 内の af_id 990（ch=api） | 下記 §8 の注記を参照 |
| 4 | 各面の HTTP | **200** |
| 5 | 公開後チェック第4項（Canceled 確認） | コード変更を含むため **Canceled ではなく READY** が期待値 |
| 6 | 公開後チェック第5項（sitemap 生成時刻） | デプロイ時刻付近へ更新されること（`lastModified` はビルド時刻） |

## 8. 【CSO 判断を要する事実】検証3 について

指示「**script 内の af_id 990(ch=api) は変更されていないこと ※API 認証用の正規の用途。ここを変えてはならない**」について、実装後に生じる事実を分けて記録する。

| 対象 | デプロイ後の状態 |
|---|---|
| **API 認証用途**（`DMM_AFFILIATE_ID` による DMM API 呼び出し） | **完全に不変**（§5） |
| トップ / genres / actresses の `<script>`（RSC flight payload）内の 990 | **残る見込み**。`ProductCard` は `item`（`affiliateURL` を含む）を丸ごと受け取るため、href に使わなくてもプロパティとしてシリアライズされる |
| **concierge の `<script>` 内の 990** | **消える見込み**。`Work` から 990 を運ぶフィールド自体が無くなるため（§3 の改名）。これは**描画プロパティの変化であって API 認証の変更ではない** |

→ 検証3を「script 内に 990 の文字列が残っていること」として機械実行すると、**concierge のみ 0 件になる**。API 認証用途は不変であるため、判定基準の確認をお願いする。

## 9. 【併記】発見した潜在経路（今回の変更対象外・未修正）

`lib/concierge/url-builder.ts` L91-102 の `resolveAffiliateId` は
`NEXT_PUBLIC_FANZA_AFFILIATE_ID ?? DMM_AFFILIATE_ID` の順で解決する。
**`DMM_AFFILIATE_ID` は API 用の 990**（`components/config-error.tsx` L19 のサンプル表記 `your_affiliate_id-990`）であるため、
`NEXT_PUBLIC_FANZA_AFFILIATE_ID` が未設定になると **`buildAffiliateURL` が 990 で人間 CTA を生成しうる**。

- 現行本番では works 詳細・fallback リンクがいずれも 004 で出力されているため、**`NEXT_PUBLIC_FANZA_AFFILIATE_ID` は設定済みで 004 に解決されている**（実測）
- この経路は S4 の指示範囲（href の 990→004 置換）外のため**変更していない**
- ただし live ガードが本番描画を 6 時間ごとに検査するため、万一この経路で 990 が出た場合は CI で検出される

---

> 本記録は事実の転記と、指示に基づくデプロイ前差分報告のみ。判断・評価・提案は含まない（§8 は判定基準の確認要請、§9 は実測事実の併記）。
