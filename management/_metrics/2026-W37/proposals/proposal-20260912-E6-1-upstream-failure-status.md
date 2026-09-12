# 起案 E6① — 上流 FANZA API 失敗時の応答コードを 404 から 5xx へ（第124便 H・2026-09-12）

> **状態: 起案のみ。実装していない。実装は CSO 承認後。**
> **§24-12(B)① の設計方向「404 ではなく `503` + `Retry-After`」に対し、Next.js App Router の制約を実測で確認したうえで、到達できる形を案として並べる。CTO は推奨を書かない。**
> **②（MISS 時の退避先・Supabase スナップショット）は別起案（段階起案・§24-12(B)④）。③（FANZA サポート照会文面案）は末尾に添付。**

## 1. 現象と機構（確定・実測）

| 項目 | 実測 |
|---|---|
| 現象 | 上流 FANZA API が **400** を返す窓（例: 2026-09-09 16:16〜16:31）で、works 詳細 / actresses が **404** を返す（§24-11-8） |
| 機構 | `works/[floor]/[id]/page.tsx` の `getWork()` が `fetchItemList()` の例外を **`catch { return null }`** で握り、`if (!item) notFound()` へ落ちる。**「API が失敗した」と「作品が存在しない」を区別していない**。`actresses/[id]` / `genres/[id]` も `try { … } catch { notFound() }` で同型 |
| stale-serve の限界 | `fetchItemList` は鮮度上限内のキャッシュがある場合のみ throw を回避する。**`cache=MISS` では退避先が無く 404 に落ちる**（§24-11-8(5)） |
| 発生機構の位置づけ | H-obs は「自前負荷起因は不支持」で確定（§24-12(A-1)）。**負荷は主因である必要がない。上流 400 → フェイルクローズ 404 が本体** |

## 2. 目標と制約 — **App Router のページから 503 は直接返せない（実測）**

| 手段 | 返せるステータス | 実測・根拠 |
|---|---|---|
| `notFound()` | 404 | 現行 |
| **ページ内で `throw`** | **500**（`error.tsx` が描画） | **2026-09-12 09:07 JST ローカル実験**: `getWork` の catch を `throw` に変え、`DMM_API_ID` を無効値にして `next start` → `/works/videoa/savr01180` は **HTTP 500 / `Cache-Control: private, no-cache, no-store` / `Retry-After` なし**。GUARD ログは従来どおり発火。**実験後にソースは復元・未コミット** |
| `redirect()` | 307/308 | 別 URL へ飛ぶ＝クローラーの評価対象が変わるため不適 |
| Route Handler（`route.ts`） | 任意（**503 + `Retry-After` 可**） | ページではないため、works 詳細を Route Handler で配信する構造変更が要る |
| middleware（`proxy.ts`） | 任意 | **上流の失敗を middleware は知らない**（ページより前に走る） |

- **→ 「503 + `Retry-After`」は、ページのままでは到達できない。** **到達するには Route Handler 化かインフラ追加（下記 案B/案C）が要る。**
- **Google の扱い（出典＝一般論・§15-2 軸4）**: Google Search Central は 5xx（500/502/503）を「一時的なサーバーエラー」として扱い、クロール頻度を下げて再試行する。長期間続くと URL がインデックスから外れる旨を記載している。**503 は「計画停止」向けに推奨されているが、500 と 503 でクローラーの扱いが異なるとは明記されていない（未確認）。** **`Retry-After` を Googlebot が守るかも未確認。** **当サイトでの実測は存在しない。**

## 3. 案（並列・推奨は書かない）

| 案 | 内容 | 応答 | 差分の規模 | 併記 |
|---|---|---|---|---|
| **A. `throw` で 500** | `getWork` の catch で **`FanzaApiError` / ネットワーク例外は rethrow**、**「200 だが items が空」のときだけ `null`→404**。`actresses` / `genres` の `catch { notFound() }` も同様に分岐 | **500**（`error.tsx`「作品情報を一時的に取得できませんでした」が描画）。`Retry-After` なし | **小**（3 ファイル・各 5〜10 行） | 404 は消えるが **503 ではない**。`error.tsx` は既に存在し文言も適合。**ページの `Cache-Control` は `no-store` のまま**（§16-5(2)） |
| **B. Route Handler で 503** | `app/(site)/works/[floor]/[id]/` の前段に **`route.ts` は置けない**（同一セグメントで page と route は共存不可）→ 実現するには `next.config` の `rewrites` で `/works/:floor/:id` を `/api/works/:floor/:id` へ内部書換し、Route Handler が上流を叩いて **失敗時は 503 + `Retry-After: 300`** を返し、成功時は…**ページ描画を Route Handler から呼ぶ手段が無い**（RSC の描画は page に閉じる） | 503 | **大・実現性に疑義** | **Route Handler は HTML ページを描画できないため、成功時の描画を二重実装することになる。現実的ではない** |
| **C. middleware + 共有フラグで 503** | 上流失敗を検知した時点でフラグ（Edge Config / KV / Supabase）へ「degraded until T」を書き、`proxy.ts` が works/actresses/genres へのリクエストでフラグを読み、**degraded 中は 503 + `Retry-After`** を返す | 503 | **中〜大**（ストア追加・書込権限・TTL 設計） | **フラグが立っている間は成功しうるリクエストも 503 になる**（過剰遮断）。**Edge Config/KV の追加は資格情報の配置＝HUMAN 枠**（§3 / §12 と同じ扱い）。**§12 の「service role は RLS を迂回する」と同型の限界が Supabase 版にも生じる** |
| **D. A + ヘッダ** | 案A に加え、`error.tsx` 側で `<meta http-equiv="refresh">` 等 | 500 | 小 | **HTTP ヘッダ `Retry-After` は付けられない**（クライアント側では不可）。効果未確認 |

- **【厳守】どの案も「404 が Googlebot に『消えた』と伝わる」経路は塞ぐ。** **503 + `Retry-After` を厳密に満たすのは C のみで、A は 500。** **A と C の差（500 と 503 の扱いの差・`Retry-After` の効果）は一般論でも未確認であり、当サイトで測る手段も現状は無い**（GSC クロール統計はステータス別の比率のみ・§16-2）。

## 4. 案A の実装差分（参考・承認後に実装）

```ts
// works/[floor]/[id]/page.tsx  getWork()
} catch (e) {
  if (e instanceof FanzaConfigError) throw e;          // 設定事故は従来どおり
  if (e instanceof FanzaApiError || e instanceof TypeError /* fetch 失敗 */) throw e; // → 500（error.tsx）
  return null;                                          // それ以外は従来どおり 404
}
```
- `actresses/[id]` / `genres/[id]`: `catch { notFound() }` → **`catch (e) { if (e instanceof FanzaApiError) throw e; notFound(); }`**。`items.length === 0` は従来どおり 404。
- **`generateMetadata` も同じ `getWork()` を呼ぶ**（`cache()` で 1 回）。throw は両方で発生するが、App Router は 1 回の 500 応答にまとめる（ローカル実験で確認済み）。
- **ログ**: 分岐時に `VODNAVI_UPSTREAM_5XX` 等の構造化ログを 1 行出し、GUARD と突合できるようにする（`request path` / `upstream status` / `served status`）。

## 5. 検証（実装後）

| # | 項目 | 方法 |
|---|---|---|
| 1 | 上流 400 時に 404 を返さない | **本番ログで `VODNAVI_SILENT_DEATH_GUARD` の窓を待ち、同時刻の応答が 500 であることを Runtime Logs（status 列）で確認**（意図的に 400 を起こさない・§24-4(5)） |
| 2 | 真の 404 は維持 | 存在しない cid（対照）が 404 のまま |
| 3 | `error.tsx` の描画 | ローカルで `DMM_API_ID` を無効化して目視（本便で実施済みの手順） |
| 4 | GSC | 「見つかりませんでした（404）」レポート **867 件（2026-09-04 更新）** の推移を週次で記録。**§16-1 の反例表により「減った＝効果」とは書かない**（クロール頻度の変数探索はしない） |
| 5 | 裏取り窓（§24-12(B)①） | GSC 404 レポートの「前回のクロール」日 × Vercel ログの 400 窓の突合。**積は概ね 2026-09-03 以降のみ**（RUNBOOK §6-2）。**867 件のうち突合できるのは保持期間内のものに限られる** |

## 6. リスク・併記

| # | 内容 |
|---|---|
| ① | **500 が長期間続くと Google はインデックスから外す**（一般論）。**上流 400 バーストは 15 分以内に回復した事例が実測されている**（§24-11-6-1）が、**全てがそうとは限らない** |
| ② | 案A は `error.tsx` を通るため **`concierge_entry_click` 等の CTA が描画されない**（現行の 404 でも同じ。悪化ではない） |
| ③ | **`cache=MISS` 領域の根本対処は ②（スナップショット）であり、①は応答コードの是正に限る**（§24-12(B)④） |
| ④ | 実装コミットは `app-concierge/` の差分＝1 回ビルド。**E19 実装と同じ push に同梱すればビルドは 1 回**（裁定B の考え方） |

## 7. ③ 添付 — FANZA API サポートへの照会文面案（**送信は HUMAN・回答は要旨のみ台帳へ・§9**）

> 件名: ItemList API が断続的に HTTP 400 を返す件についての確認
>
> いつもお世話になっております。DMM アフィリエイト API（v3 `ItemList`）を `affiliate_id=moterist-990`（商品情報 API 用登録）で利用しております。
> 2026 年 9 月上旬より、通常 200 を返す同一のリクエスト（`site=FANZA&service=digital&floor=videoa&cid=…&hits=1` 等）が **短時間（数分〜15 分程度）まとめて HTTP 400（result.message: "BAD REQUEST"）** を返し、その後同じリクエストが 200 に戻る事象を複数回確認しています（例: 2026-09-09 16:16〜16:31 JST）。
> 恐れ入りますが、次の点をご教示いただけますでしょうか。
> 1. 400 が「リクエスト形式の誤り」以外の理由（例: 単位時間あたりの呼び出し上限、メンテナンス）でも返ることがあるか。
> 2. 上限がある場合、その値（回数/秒 または 回数/日）と、超過時のステータスコード・レスポンス本文。
> 3. 当該事象の発生時刻に貴社側で該当する記録があるか（当方からのリクエストは api_id / affiliate_id で特定可能かと存じます）。
> 当方のリクエスト量は 1 秒あたり数件以下です。ご確認のほど、よろしくお願いいたします。

- **【厳守】文面に api_id の値は書かない**（affiliate_id は登録名のみ）。**送信・回答受領は HUMAN。回答は §9 のとおり要旨のみ記録。**

**判定・承認: CSO。**
