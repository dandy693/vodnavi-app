# GA4/GTM 計測ガバナンス仕様（DRAFT） 2026-06-11

> 採番・配置・整合修正 (CTO): CSO 原案は repo root `_metrics/` に置き「計測要塞化の完了/確認済」と
> 記したが、(a) 配置は実体 `management/_metrics/` に修正、(b) **未検証項目を「完了」と断定しない**
> （下記 §4 検証状態を参照）。status = **draft_spec**（実装/計測の物理 verify は code-freeze 明け）。

## 1. 目的
凍結された `moterist.com` 5記事からの送客と、新設 `/actresses/[id]`(柱①17名) 経由の FANZA 送客を、
GA4 (G-GG7JV9MJRW = p489519780 cross-domain 測定ID) で漏れなく識別する計測の「あるべき姿」を定義する。

## 2. コード上の事実（確認済）
- 商品カード `src/components/product-card.tsx`: カード本体は**内部リンク** `/works/{floor}/{cid}` (L65)、
  別途**アウトバウンド DMM リンク** `affiliateURL ?? URL` (L121) を持つ。→ `/actresses/*`・`/genres/*` の
  グリッドにも DMM 外部リンクは存在する。
- 本番の `affiliateURL` は DMM API 返却値で **af_id=moterist-990(データID)** 埋込（[[reference_dmm_affiliate_id_registry]]）。
  ＝アフィリ計測は「リンク埋込ID」で成立し、GA4 イベント発火に依存しない。
- 送客識別の custom dimension は GA4 に **asp_name / source / intent** 登録済（[[project_gtm_n6zdk9lr_is_fake]]）。

## 3. あるべき計測（要実装/要検証）
- **moterist 送客**: `?source=moterist`(+intent) を保持したセッションで custom dimension `source=moterist` を着火。
  → site-brand→app の query 継承は実装済(BRIEF_056)、moterist→app は WordPress CTA 側の付与に依存。
- **女優ハブ送客 CV**: `/actresses/*` の商品カード DMM リンククリックを outbound イベント化（例 `affiliate_click`、
  param: source page=actress, content_id=作品ID）。**注**: クリック要素が運ぶのは「作品の content_id」であり
  CSO 記述の「click_element_id=女優ID」は誤り（女優IDはページ側のコンテキスト）。

## 4. 検証状態（重要・正直）
- ✅ 確認済(コード読取): カードの内部/外部リンク二層構造、affiliateURL の af_id 埋込、custom dimension 登録。
- ❓ **未検証**: `/actresses/*` の DMM 外部クリックに **GA4 クリックイベントが実際に発火するか**
  （product-card に gtag/dataLayer/onClick は不在＝グローバル outbound リスナや GTM トリガ次第。要 GTM/本番実機確認）。
- ❓ **未検証**: 「5つの盾(年齢認証/早期クッキー着火 等)の動作ログに変更なし」← CSO は「確認済」としたが
  本セッションでは未検証。code-freeze 明けに実機/ログで確認するまで断定しない。

## 5. 次アクション（code-freeze 明け）
GTM コンテナ(GTM-TKDHM348) と本番実機で §4 の❓を検証 → 必要なら outbound クリックイベントを実装（要 PR/verify）。
本仕様は「完了」ではなく**観測・実装の指針**。
