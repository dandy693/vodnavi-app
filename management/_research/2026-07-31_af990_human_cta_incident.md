# af_id 990 のヒューマンCTA混入 — 調査報告【Phase 1・調査のみ / コード修正なし】

- 実施: 2026-07-31 00:55:29〜01:04:09 JST(PowerShell実測)
- 実施範囲: **調査のみ**。**コード修正・デプロイ・設定変更=ゼロ**。DMMレポートは閲覧のみ(al系リンク不踏・CTAクリックなし)
- 検出契機: コミット16840f8(スポットチェック)。台帳ルール「990〜994=商品情報API専用・ヒューマンCTA使用厳禁」に対する実装側の不一致

## 1. 影響範囲の網羅確認(本番配信HTMLの a[href] 実測)

| ページ種別 | 実測URL | href内 990系 | href内 004 | 全990系出現(HTML全体) |
|---|---|---|---|---|
| **トップ** | `/` | **20** | 20 | 40 |
| **genres** | `/genres/6925` | **21** | 21 | 42 |
| **genres** | `/genres/307935` | **21** | 21 | 42 |
| **actresses** | `/actresses/1078618` | **28** | 28 | 56 |
| **actresses** | `/actresses/1069702` | **28** | 28 | 56 |
| works詳細 | `/works/videoa/vrkm01890` | **0** | 17 | 0 |
| works詳細(archive由来) | `/works/nikkatsu/h_198need00108r18` | **0** | 17 | 0 |
| articles | `/articles/fanza-first-guide` | **0** | 1 | 0 |
| lp | `/lp` | 0 | 0 | 0 |
| concierge | `/concierge` | 0 | 1 | 0 |

- **検出された990系の実番号=`moterist-990` のみ**(全ページ合計236件の出現すべて。991〜994は**0件**)
- **影響を受けるページ種別=一覧系3種(トップ / genres / actresses)**。works詳細・articles・lp・conciergeは**混入なし**
- **リンク文脈(原文抜粋)**: `href="https://al.fanza.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3Dsavr01132&amp;af_id=moterist-990&amp;ch=api" target="_blank" rel="nofollow noopener noreferrer sponsored" class="relative block h-11 ...">` ——**可視の金色CTAボタン**(直後のテキスト=「今すぐ視聴 →」)
- 各ページで **990と004が同数**(例: トップ=20/20)。同一カードに「990のCTAボタン」と「004のフォールバック検索リンク」が併存する構造

## 2. 原因特定(運用則7=差分の機械的洗い出しを先行)

### 差分の機械的洗い出し
| 面 | CTAのhref生成元 | 結果 |
|---|---|---|
| **works詳細**(004のみ) | `buildAffiliateURL({asp:"fanza",contentId,...})` を経由(`app/(site)/works/[floor]/[id]/page.tsx:208-210`) | **004**(env解決) |
| **articles**(004のみ) | `buildTvSignupURL()` / `buildAffiliateURL()` | **004** |
| **一覧系3種**(990混入) | **`product-card.tsx:40`** | **990** |

### 生成元コンポーネント=**`src/components/product-card.tsx`**
- 該当コード(原文):
  - L40: `const affiliateHref = item.affiliateURL ?? item.URL;`
  - L120-121: `<a href={affiliateHref} target="_blank" rel="nofollow noopener noreferrer sponsored" ...>` → 内側に `<span ...>今すぐ視聴 →</span>`(L134)
- **`item.affiliateURL` は FANZA API のレスポンス値**で、API認証に用いる `DMM_AFFILIATE_ID`(=990)が埋め込まれた `al.fanza.co.jp` URL。よって**API返却値をそのままhrefに使用**した結果、CTAが990帰属になっている
- 同ファイルのコメント(原文・L38-39): 「メイン CTA は FANZA API が返す正規のアフィリエイト URL を使う（フロア横断で最も正確。content_id から自前で URL を組むと videoa 以外で破綻するため）」——**意図的な実装**として記述されている
- 同ファイルのフォールバック側(L42-46)は `buildAffiliateURL`(=004)を使用しており、**同一カード内で2系統が併存**
- product-card を描画する面=トップ/genres/actresses(=実測で990が出た3種と一致)。works詳細は自前のCTA実装(buildAffiliateURL)のため混入なし
- **`concierge-chat.tsx:704`** にも `href={work.affiliateURL}` が存在(コメントL687: 「primary はそのまま使用、fallback のみ抽象から生成」)。ただし `/concierge` の実測では990=0件(**未ログイン状態では作品カードが描画されないため**と推定されるが、**ログイン後/対話後の描画は未検証=取得不可**)

## 3. DMMレポート(af_id別・月次・2025/08〜2026/07・「現在の設定」で適用を都度確認)

| af_id | クリック | ダイレクト | カテゴリ | サービス新規 | **合計** |
|---|---|---|---|---|---|
| **moterist-990** | **7,558** | 6件 3,362円 | 2件 190円 | **1件 2,100円** | **9件 5,652円** |
| moterist-991 | 26 | 0 | 0 | 0 | 0件 0円 |
| moterist-992 | 0(データなし) | 0 | 0 | 0 | 0件 0円 |
| moterist-993 | 0(データなし) | 0 | 0 | 0 | 0件 0円 |
| moterist-994 | 0(データなし) | 0 | 0 | 0 | 0件 0円 |
| **moterist-004**(比較) | **239** | 3件 2,159円 | 3件 794円 | 0件 0円 | **6件 2,953円** |

### 990の月次内訳(原文値)
| 月 | クリック | 合計成果 |
|---|---|---|
| 2025/08 | 4 | 0 |
| 2025/09 | 1 | 0 |
| 2025/10 | 10 | 0 |
| 2025/11 | 5 | 0 |
| 2025/12 | 4 | 0 |
| 2026/01 | 3 | 0 |
| 2026/02 | 3 | 0 |
| 2026/03 | 0 | 0 |
| 2026/04 | 0 | 0 |
| **2026/05** | **1,080** | 4件 3,584円(直3件1,484円+**新規1件2,100円**) |
| **2026/06** | **3,135** | 4件 1,382円(直2件1,192円+カ2件190円) |
| **2026/07** | **3,313** | 1件 686円(直1件686円) |

- **観測事実**: 990のクリックは2026/05に1,080へ急増し以降3,000超で推移。同期間の004は239クリック(2026/07のみ)。**990のクリック数は004の約31.6倍**
- **サービス新規1件2,100円が990に計上**(2026/05)。※月額動画(アダルト)のサービス新規料率2,100円と同額
- 取得元: `affiliate.dmm.com/report/top/`(月次・ID別に「現在の設定」ヘッダで適用確認)

## 4. 是正=**未着手**(CSO承認待ち・指示どおり調査のみで停止)

- href内990→004置換・回帰ブロック追加(c237e51同型)・デプロイはいずれも**未実施**
- 修正時のデプロイタイムスタンプ記録も未実施

> 本ファイルは事実の転記のみ。提案・設計・評価は記載していない(指示準拠)。

---

# 990トラフィックの実在性判定【Phase 1・調査のみ・2026-07-31 03:20〜03:45:14 JST】

- 実施範囲: **調査のみ**。是正コードの実装・デプロイ=**ゼロ**。DMM/GA4は閲覧のみ・al系リンク不踏・CTAクリックなし

## 1. ボット判定の材料(断定はしない=事実の列挙)

### 1-1. DMMクリック vs GA4クリックイベント(2026/04/01〜07/30・hostname=app.vodnavi.jp)
| 系列 | 値 |
|---|---|
| DMM 990 クリック(2026/05-07) | **7,469**(05=1,080 / 06=3,135 / 07=3,313) |
| DMM 004 クリック(同期間) | **239**(2026/07のみ) |
| **DMM合計** | **7,708** |
| **GA4 `ai_affiliate_click` 総数(4/1-7/30)** | **672**(総ユーザー527) |
| 乖離 | **約11.5倍**(DMM側が多い) |

- GA4のplacement内訳(同期間): **(not set)=341(50.7%)** / detail_sample=159 / detail_fv_cta=122 / detail_main_cta=31 / detail_sticky_cta=17 / guide_tv_signup_cta=2
- **構造上の注記(コード確認済)**: `product-card.tsx` のCTAは **`FanzaAffiliateLink` を使わない素の `<a>` タグ**(L120-121)で、`trackProductClick`/`trackAiAffiliateClick` の発火経路を持たない。**一覧系3面のCTAクリックはGA4 `ai_affiliate_click` に計上されない構造**である。したがって本乖離は「GA4を通らない経路=ボット」の証拠には**ならない**(計測未実装との識別が不能)。**判定=判別不能**

### 1-2. ページ表示回数(同期間・GA4)
- 全体=**21,522表示**。上位: `/`=835 / `/works/videoa/lulu00423`=431 / `/works/videoa/gqhb00024`=234 / `/works/anime/h_1785trdy00021`=216 / `/concierge`=192 ほか(以下works詳細が続く)
- **一覧系の内訳**: トップ`/`=835。`/genres/*`・`/actresses/*` は上位10件に出現せず(個別値は**取得不可**=上位表示の範囲外)
- 対比: トップの表示835に対し、**トップのCTAクリック(DMM990由来)は同期間で数千規模**。※ただし990クリックはトップ以外(genres/actresses)からも発生するため、面別の内訳は**分解不能**

### 1-3. User-Agent別の分解
- **取得不可**(GA4標準レポートにUA分解の項目がなく、DMMレポートにもUA情報は存在しない)

### 1-4. 2026/05に何が起きたか(差分の機械的洗い出し=運用則7)
- **本フェーズでは未着手=取得不可**(同月のデプロイ履歴・sitemap提出・インデックス数の変化の洗い出しは未実施)

## 2. 004の月次分解(比較・2025/08〜2026/07・月次粒度)
| 月 | 990 クリック | 990 成果 | 004 クリック | 004 成果 |
|---|---|---|---|---|
| 2025/08〜2026/04 | 30(9ヶ月合計) | 0件 0円 | 0 | 0件 0円 |
| 2026/05 | 1,080 | 4件 3,584円 | 0 | 0件 0円 |
| 2026/06 | 3,135 | 4件 1,382円 | 0 | 0件 0円 |
| 2026/07 | 3,313 | 1件 686円 | **239** | **6件 2,953円** |
| **合計** | **7,558** | **9件 5,652円** | **239** | **6件 2,953円** |

### EPC(円/クリック・上表からの算術)
| 系列 | 2026/05 | 2026/06 | 2026/07 | 全期間 |
|---|---|---|---|---|
| **990** | **3.32円** | **0.44円** | **0.21円** | **0.75円** |
| **004** | — | — | **12.36円** | **12.36円** |
- 990のEPCは3ヶ月で **3.32→0.21円=約1/16に低下**。同月(2026/07)の004との比は **004が990の約59倍**
- ※004の004は2026/07のみに計上(それ以前は0)。**004の本番適用は2026-07-07**(台帳既知)であり、期間の非対称は仕様

## 3. 着地精度の検証(URL生成レベル・実クリックはHUMAN枠)

### 3-1. 生成URLの機械的比較(2026-07-31 03:22 JST・API最新1件ずつ)
| UIフロア | APIフロア | builder(004)の着地先 | API `affiliateURL` の着地先 | 一致 |
|---|---|---|---|---|
| videoa | videoa | `www.dmm.co.jp/digital/videoa/-/detail/=/cid=vrkm01890/` | `video.dmm.co.jp/av/content/?id=vrkm01890` | **不一致**(ホスト・パスとも) |
| anime | anime | `www.dmm.co.jp/digital/videoa/-/detail/=/cid=196glod00426/` | `video.dmm.co.jp/**anime**/content/?id=196glod00426` | **不一致** |
| nikkatsu | nikkatsu | `www.dmm.co.jp/digital/videoa/-/detail/=/cid=174okuram00787/` | `video.dmm.co.jp/**cinema**/content/?id=174okuram00787` | **不一致** |
| amateur | videoa | `www.dmm.co.jp/digital/videoa/-/detail/=/cid=vrkm01890/` | `video.dmm.co.jp/av/content/?id=vrkm01890` | **不一致** |

- **builder(004)は全フロアで固定パス `digital/videoa/-/detail/` を使用**(`url-builder.ts` の `FANZA_DETAIL_BASE`)。API側は**フロア別に異なるパス**(`av` / `anime` / `cinema`)を返す
- product-card.tsx のコメント(L38-39・原文)「content_id から自前で URL を組むと videoa 以外で破綻するため」は、**この差分を指していると読める記述**

### 3-2. 到達性の実測(最終ターゲットへの直接curl・al系不踏・03:24 JST)
- 上記8URL(builder側4・API側4)すべて **HTTP 302 → `www.dmm.co.jp/age_check/=/?rurl=<元URL>`**(年齢確認へ・**rurlに元パスを保持**)
- **年齢確認より先の実ページ到達可否・作品同一性の確認は未実施=HUMAN枠**(ffe3cd1と同手順)。302の時点では**builder側URLが「破綻する」ことも「正しく着地する」ことも確認できていない**

## 4. concierge の未検証分
- **未検証=取得不可**。`/concierge` は年齢確認クッキー未通過状態では作品カードが描画されず、対話後の描画状態でのaf_id確認には**対話操作(=読み取り専用の範囲を超える入力)**が必要なため、本フェーズでは実施していない

## 5. 是正=未着手(変更なし)
- href内990→004置換・回帰ブロック追加・デプロイ=**すべて未実施**(CSO承認待ち)

> 本追記は事実の転記のみ。提案・設計・評価は記載していない(指示準拠)。

---

# S1/S2 実装・デプロイ・検証【2026-07-31・CSO承認済み】

- 実装〜検証: 2026-07-31 05:50頃〜**06:27:51 JST**(PowerShell実測)
- PR **#64**(squash `5c2579a`)。**S3・S4は未承認のため未着手**

## S1: 一覧系CTAのGA4計装(href不変)
- 変更: `product-card.tsx` の素の `<a>` を **`FanzaAffiliateLink`** へ差し替え(works詳細と同一の計装経路=`trackProductClick`+`trackAiAffiliateClick`)
- **href の値は一切変更していない**(`item.affiliateURL ?? item.URL` のまま=API返却の af_id=**990** を維持)
- placement(新設4値・`fanza-affiliate-link.tsx` の型に追加): `list_top_card_cta` / `list_genres_card_cta` / `list_actresses_card_cta` / `list_card_cta`(面未指定時)
- 配線: `ProductGrid` に `surface` propを追加 → トップ(`surface="top"`)・genres(`"genres"`)・actresses(`"actresses"`)から引き渡し
- **本番検証(06:27 JST・href不変の確認)**: `/`=href_990 **23**/href_004 23・`/genres/6925`=**21**/21・`/actresses/1078618`=**28**/28 → **990は置換されずそのまま**(=指示どおり)。※トップの件数が20→23に増えているのは新着ローテーションによる掲載作品数の変動

## S2: buildAffiliateURL のフロア別パス対応(990とは独立の是正)
- 変更: `FANZA_DETAIL_BASE`(全フロア `digital/videoa/-/detail/=/cid=` 固定)を廃し、**`FANZA_CONTENT_BASE` マップ**へ:
  - `videoa` / `amateur` → `https://video.dmm.co.jp/av/content/?id=`
  - `anime` → `https://video.dmm.co.jp/anime/content/?id=`
  - `nikkatsu` → `https://video.dmm.co.jp/cinema/content/?id=`
  - 未指定・未知フロア → av 面(従来相当の既定)
- `BuildAffiliateURLInput` に `floor?: string | null` を追加。works詳細(`normalizeFloorForUrl(floor)`)と product-card のfallback(`normalizeFloorForUrl(item.floor_code)`)から引き渡し
- **【検証】生成URL vs API返却 `affiliateURL` の機械的突合(4フロア×2作品=8件)**: **一致8件 / 不一致0件**(不一致の残存なし)
- **本番検証(06:27 JST・works詳細の実出力)**: videoa→`video.dmm.co.jp/av` / anime→`video.dmm.co.jp/anime` / nikkatsu→`video.dmm.co.jp/cinema` / amateur→`video.dmm.co.jp/av` = **全フロアでAPI準拠のパスに是正**

### S2の副次確認(修正前の実測=是正の根拠)
- 修正前(2026-07-31 05:4x JST)、`works/anime/196glod00426` と `works/nikkatsu/174okuram00787` の**004リンクはいずれも `www.dmm.co.jp/digital/videoa/-/detail/=/cid=<当該cid>/` を出力**していた(=videoa固定パス)。**anime 3,869件・nikkatsu 6,125件の既存リンクが同じ形式だった**ことになる
- **ffe3cd1同系統の着地不良の有無**: 修正前URLは**302 → `www.dmm.co.jp/age_check/=/?rurl=<元URL>`**(パス保持)までは確認済み。**年齢確認より先の実ページ到達可否・作品同一性は未確認=HUMAN枠**(ffe3cd1と同手順)。したがって「着地不良が発生していた」とも「していなかった」とも本フェーズでは判定していない
- 本修正はaf_id 990の件とは**独立の是正**(対象=004リンクの着地先パス)

## 繰越項目の進捗
| # | 項目 | 状態 |
|---|---|---|
| 1 | **GSC最終更新日** | **2026/07/24 のまま**(2026-07-31 06:1x JST確認)=**7日間更新なし**。登録済1.25万・未登録4,700・代替canonical1,829・検出未登録607・クロール済未登録595 も**7/24時点から全て不変**。※本日は7/31であり8/1判定日は未到来だが、通常ラグ(2〜3日)は既に超過 |
| 2 | 2026/05の差分洗い出し(デプロイ履歴・sitemap提出・インデックス変化) | **未着手** |
| 3 | ahrefs(DR/参照ドメイン・japanero.jpの向き先) | **未着手** |
| 4 | Make.comシナリオ5615632の投稿af_id | **未着手** |
| — | concierge検証 | **HUMAN枠へ移管**(CSO承認済み・ひでき氏が/conciergeで対話し作品カードのリンクURLを1件確認) |

> 本追記は事実の転記のみ。提案・設計・評価は記載していない(指示準拠)。
