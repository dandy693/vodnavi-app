# STRATEGY_BRIEF_126: B2デプロイ枠 実装計画(詳細設計)

- 起案: 2026-07-28 CTO / 正典: CSO添付「設計スペック: アイキャッチ自動生成+内部リンク自動化」(2026-07-26 戦略顧問版・7/28 CSO返信で全文受領=停止解除)+7/28裁定(bd116c8)
- **統治**: 本書は設計のみ。**コード変更・デプロイは層B観測確定(8月頭)後のCSO承認まで禁止**。AI(Claude API)の役割は提案生成まで=公開反映は「DB保存→CSO承認→機械的レンダ」必経。BRIEF番号126=空き確認済(125まで使用)。

## 1. スコープ(B裁定確定分+7/29追加)
①レンダラ本文リンク対応(基盤・先行必須) ②内部リンク3層(works/actresses→articles+articles間) ③U1撤収(FV枠→関連記事リンク転用) ④アイキャッチ(動的OG+Claude APIコピー) ⑤専用placement(**分離実行**=下記§9) ⑥CTAバリアント=TV Plus向け(**新規placement=①〜④と同時実行可**・CSO追加承認2026-07-29=下記§12)

## 2. スキーマ定義(DDL案・Supabase vodnavi-production)
```sql
create table internal_links (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('works','actress','article')),
  source_id text not null,          -- works: content_id / actress: id / article: slug
  target_slug text not null,        -- articlesスラグのみ(FKではなくビルド時ホワイトリスト検証)
  anchor_text text not null,
  position text not null check (position in ('fv','body','footer')),
  origin text not null check (origin in ('rule','ai')),
  status text not null default 'proposed' check (status in ('proposed','approved','live','retired')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
alter table editorial_articles add column og_copy text;    -- NULL=タイトルのみ表示(フェイルセーフ)
alter table editorial_articles add column og_accent text check (og_accent in ('green','blue','amber','rose'));
```
- RLS: 既存方針踏襲(anon read / service_role write)。**AI実行キーにはINSERT(status='proposed')のみ許可のDBロールを充てる**=「AIはproposedまで」をDB権限で強制(スペック§2-2)。
- 適用はMCPでなくManagement API(MCP supabaseはread-only)。

## 3. レンダラ変更点(app-concierge)
- **記事レンダラ**(現行: プレーンmd・`## `のみh2・本文リンク非対応): `[text](/articles/slug)`形式の内部リンクのみ許容するリンク描画を追加。描画時にtarget_slugのホワイトリスト(editorial_articles公開slug)照合、外部URL・af_id・DMMドメインは描画拒否(スペック§2-4ガードレールの後段)。既存のテキスト参照(#2内2箇所ほか)はinternal_links(live)経由の実リンクへ移行。
- **works詳細**(`src/app/(site)/works/[floor]/[id]/page.tsx`): U1撤収跡のFV枠に固定2リンク(「初めての方へ: 14日無料の始め方」→#1/「明細・支払いが不安な方へ」→#3)。テンプレート=internal_links(rule・approved一括)から描画。
- **actresses詳細**: 上位5ページ(河北彩花ほか順位形成済み)に「◯◯の作品を14日無料で見る方法」→#1を段階導入。対象IDはinternal_linksの行有無で制御(コードフラグ不要)。
- U1撤収差分: `new-user-fv-module.tsx`の呼び出し2箇所(works FV/本文下)を関連記事リンクコンポーネントに置換。defaultOpen prop経路は撤去(PR#59の逆適用+転用)。

## 4. アイキャッチ(スペック§1)
- `/api/og/[slug]` route(@vercel/og/satori)。テンプレ=ロゴ+タイトル+og_copy+accent色帯。edgeキャッシュで実質静的。画像生成AIは不使用(スペック確定)。
- Claude APIバッチ(`scripts/generate-og-copy.ts`・1回/記事): 入力=記事本文→出力JSON `{catch_copy(12〜20字), accent, alt_text}`。モデル=claude-sonnet-4-6。プロンプト制約=台帳準拠(本文にある数字・事実のみ/クーポン・同時登録系語彙禁止/煽り禁止)。出力一覧→CSOレビュー→承認後にog_copy/og_accentへUPDATE。
- APIキー=Vercel env(secret書込みはHUMAN Dashboard手動=確定ルート)。

## 5. AI層(articles間リンク・スペック§2-4)
- バッチ(`scripts/propose-internal-links.ts`): 全記事本文+slug一覧→Claude API(claude-sonnet-4-6)→JSON提案→internal_links(proposed)へINSERT。
- ガードレール(プロンプト+後段バリデーション二重): slugホワイトリストのみ/外部URL・af_id・DMMドメイン自動リジェクト/1記事発リンク上限3/同一ターゲット重複禁止/アンカーは自然文(「こちら」禁止)。
- 承認: 初期はproposed一覧をTASK_BOARDインライン報告→CSO承認→CTOがstatus=live UPDATE(承認画面UIは後日・6〜15記事規模ではインライン運用で十分)。頻度=新記事公開時+月1全体見直し。

## 6. PR分割とデプロイ手順(auto-deploy=main push・検証は本番curl)
| PR | 内容 | プリフライト |
|---|---|---|
| PR-1 基盤 | internal_linksテーブル+記事レンダラリンク対応+ホワイトリストassert | tsc/既存記事レンダ差分ゼロ確認(リンク行0件時は現状同一出力) |
| PR-2 ルール層 | works FV固定2リンク(U1撤収同梱)+actresses上位5 | 本番curlでリンク描画+#1/#3の200・U1コンポーネント残骸ゼロgrep |
| PR-3 OG | /api/og+メタ配線(og_copy NULLフェイルセーフ) | 全記事og:image 200・Twitterカードvalidator |
| PR-4 AI層 | 提案バッチ+バリデーション(scripts のみ・レンダ影響なし) | 出力JSONのリジェクトテスト |
- 公開前grep検査に追加(スペック§2-5): レンダ済みHTMLのaタグが「internal_links(live)+CTA共通コンポーネント」由来以外を含まないassertをビルドに組込。

## 7. ロールバック手順
- 内部リンク: internal_linksをstatus=retiredへUPDATE→次レンダで消滅(**コードrevert不要**が第一手)。レンダラ自体の不具合はPR単位revert(basis: works/actressesはリンク行ゼロなら従前出力)。
- OG: og:imageメタを従前値へ差し戻すenv/フラグ(route自体は残置可・参照断ちで無効化)。
- U1撤収の巻き戻し: PR#59時点のコンポーネントはgit履歴に残存=revertで復元可能(ただしU1=No確定につき想定外)。

## 8. 効果測定接続(スペック§4+7/28 CSO追加指示)
- DATAPULL_SPEC v1.2: articlesクエリ数週次(現状8種23impr・順位40〜90台+#4=6.0)/actresses順位・vol推移(河北彩花21位ほか)/**Organic由来とX由来の分離集計(7/29以降必須・確認済=X系utmはOrganic Socialに分類)**。
- actresses効果測定: リンク設置5ページvs非設置ページのGSC順位・表示差分。
- アイキャッチ: X経由(T1改)クリック率の前後比較。

## 9. ⑤専用placementの分離実行条件(CSO承認済・7/28)
- guide_tv_signup_ctaの値変更を伴う場合、層B時系列(7/24起点)が分断されるため**層B観測確定後の実行または新旧値並記期間の設置**。実装時はGA4カスタムディメンション既存枠との整合を先に確認。B2 PR-1〜4には含めない(独立PR)。

## 10. C2方針=soft-keep【CSO承認済 2026-07-28・条件付き】
- **裁定: (b) soft-keep採用**。キャッシュ済みメタで「配信終了」表示・インデックスとリンクエクイティを維持し、再配信時に自動復帰。sitemap-archiveは現状維持(DB突合1,418一致の仕組みを流用)。
- **CSO条件(遵守必須)**: soft-keepページには**af_id 004のCTAを表示しない**(detail_sample/fv/main/stickyの購入系CTAブロックは非表示)。導線は**fallbackUrl検索導線のみ**。価格・特典表示は落とす(台帳整合)。
- **fallbackUrl=(b)生URL化【CSO裁定確定 2026-07-28】**: soft-keepページのfallbackUrlはaf_idラップなしの生URL(検索一覧直リンク)とする。理由(CSO): DMMレポートはaf_id単位でしか分解できずGA4のplacement分離では防げないため、**層B評価中のEPC系列(分母180cl)を汚染しない方を優先**。期待収益の逸失は現状規模では無視可能。実装: soft-keep描画経路では`wrapWithDmmAffiliate`を通さない非ラップ分岐(既存の「ID未解決時は生URL」分岐と同型)。
  - **※教訓の但し書き(2026-07-29 rev2)**: 「DMMレポートはaf_id単位でしか分解できない」は**ページ・CTA単位の分解**についての記述であり、**商材・報酬種別単位の分解には当てはまらない**(7/28実績: 004内でカテゴリ2件254円/ダイレクト1件213円/サービス新規0件を行分解できている)。生URL裁定自体は不変(クリック側分母の汚染回避が根拠のため)。
- **将来パス→申請確定(2026-07-29 CSO裁定で更新)→【見送り(同日rev2で再改訂)】**: 通常af_idは**実在サイトURLとの紐付けが必須**と判明(990〜999末尾はDMM API仕様上の制約=「URLなし・用途別登録」の一般則は存在しない)し取得コスト上昇のため、**007・008は当面取得しない**。(b)生URLを継続運用。再検討トリガー=DMMサポート照会(同一ドメイン別ディレクトリの別ID登録可否/ID内サブパラメータの有無・HUMAN枠=CSO実施)の回答受領時。
- 実装規模: PR-2へ同梱可能。棄却案の記録: (a)410+sitemap除外=エクイティ放棄/(c)404現状維持=GSC 404蓄積(過去237件問題の再演リスク)。

## 11. 見積り
- 設計完了=本書(スペック受領同日)。実装=PR-1〜4で実働1〜2日(8月頭・CSO承認後)。OGコピーバッチのCSOレビューは6記事で5分規模(スペック§1-2)。⑥は+0.5日(PR-5独立)。

## 12. ⑥CTAバリアント=TV Plus向け【CSO追加承認 2026-07-29】

### 背景と層B系列への影響(⑤との区別・CSO裁定)
- 次記事(C1決定=TV Plus追加手順・第2ファネル¥2,200)の主対象=**既存プレミアム会員**。既存共通CTA(着地=premium.dmm.co.jp・文言「FANZA TVを見てみる(登録3分)」・placement=guide_tv_signup_cta)を登録済みユーザーに出すのは**着地不整合と同型のUX問題**→別CTAが必要。
- **⑤=既存guide_tv_signup_ctaの「値変更」→層B時系列を分断=分離実行条件つき(§9)**。
- **⑥=新規CTAへの「新規placement付与」→既存系列に一切非接触=⑤の分離条件の対象外・①〜④と同時実行可**。
- **TV Plus記事の公開は⑥実装に依存**(執筆・レビューは先行可)。

### 設計論点
1. **着地URL方式**: HUMAN実査①(TV Plus追加の実画面手順・premium.dmm.co.jp=HUMAN枠)で確認された**実URLのみ使用**(新規パス捏造禁止の原則)。ログイン必須画面の可能性が高いため、プリフライトでは未ログイン時のリダイレクト挙動を記録し、表示整合の最終確認はHUMAN実クリック(ログイン済み状態)。**成果計上条件(FANZAドメイン経由要件がTV Plus追加成果にも適用されるか)は実査時にCSOへ確認**。
2. **af_id=案B(第2ファネル専用af_id新規取得)【CSO裁定確定 2026-07-29】→【同日rev2で差し替え: af_id=004で実装】**: 差し替え理由(CSO rev2)——①通常af_idは実在サイトURLとの紐付けが必須と判明(案Bの前提「用途別URLなし登録」は990系のAPI仕様制約の誤読)=取得コスト上昇 ②DMMレポートは**同一af_id内でも報酬種別で行分解可**(7/28実績)=CV側の識別は004混在でも可能(**指示1-Dのレポート分解実データ確認が前提条件**・分解不能なら段階1で停止) ③残る実害=クリック側分母汚染のみ=GA4 placement+二本立てEPC注記(§12-3)で処理。**af_idは設定定数として外出し**(将来007へ差し替える可能性を残す・ロールバック第一手status=retiredも維持)。
3. **placement命名**: 新規値=`guide_tvplus_add_cta`(**rev2で確定**)。既存カスタムディメンション枠への**値追加のみ=GA4側設定変更不要**・既存値guide_tv_signup_ctaは不変。
4. **文言案**: A向け(主CTA)=「TV Plusを追加する(月+1,078円)」——「登録3分」は既登録者に不適のため不使用。B向け(記事冒頭/末尾の第2導線)=既存CTA(「FANZA TVを見てみる(登録3分)」・004・guide_tv_signup_cta)をそのまま併置=既存系列の自然な継続として計上。
5. **既存CTAとの共存方法**: レンダラのマーカー方式を拡張——**`[[CTA:tvplus_add]]`を新設**し既存`[[CTA:tv_signup]]`は不変。1記事内に両マーカー共存可(読者A/B分岐設計に対応)。コンポーネントは**別実装**とし既存共通コンポーネントに条件分岐を入れない(リグレッション面の分離・url-builderには`buildTvPlusAddURL()`を新設で対応)。
6. **プリフライト追加検査(B3標準への追加項目)**: grep=「(登録3分)」がtvplus_addブロックに不含/同時登録誘導文言なし/tvplus着地URL=実査確認済URLと完全一致。curl=最終ターゲット直接curl+未ログイン時挙動記録(alラッパー不踏)。HUMAN実クリック=配信前(会員状態での着地表示整合)。

### §12-2. af_id新規申請 情報パッケージ【2026-07-29 rev2で申請見送り=アーカイブ】
> **007・008は当面取得しない**(rev2決定ログ2)。本パッケージはDMMサポート照会の回答次第で再利用する可能性があるため記録として残置。

**共通サイト情報**(既存登録と同一プロパティ・法人登録済アカウント):
- サイト名: VODNAVI / URL: `https://app.vodnavi.jp/` / 運営: 合同会社トレンドネット
- サイト概要: FANZA作品データベース(5万本超・女優/ジャンル/シリーズ横断)+初心者向けガイド記事+AIコンシェルジュ
- 既存ID: moterist-001〜006(人間導線)・990〜999(API専用)。**空き番号=007以降**
- PR方法(申請フォーム用): サイト内記事・作品ページからのテキストリンク(al.dmm.co.jp link_tool形式)。カテゴリ: FANZA(アダルト)

**ID 1: 第2ファネル用(B2⑥)**
- 希望命名: **moterist-007**(自動採番の場合は発行実番号を台帳記録)
- 用途(申請記載案): 「記事面(/articles/)におけるDMMプレミアム会員向けFANZA TV Plus追加手続き案内のテキストリンク専用」
- 掲載面: /articles/fanza-tv-plus(B2⑥実装後公開)ほかTVクラスタ記事。placement=guide_tvplus_add_cta・着地=HUMAN実査①確認URL

**ID 2: soft-keep用(§10)**
- 希望命名: **moterist-008**(同上)
- 用途(申請記載案): 「配信終了作品ページにおけるFANZA内検索一覧への誘導テキストリンク専用」
- 掲載面: /works/ 配信終了(APIデリスト)ページの検索フォールバック導線。発行後も**切替は層B確定後のCSO承認まで(b)生URL維持**

**発行後のCTO作業(それぞれCSO承認後)**: af_id台帳(v2追補)へ実番号・用途・発行日を追記→007=B2 PR-5でbuildTvPlusAddURL()に配線→008=fallbackUrl切替PR(独立・層B確定後)

### §12-3. 分母注記の運用ルール【rev2新設・遵守必須】
TV Plus CTA(guide_tvplus_add_cta)公開時刻以降、004クリックには2種類の導線が混在する。以降のEPC算出は**二本立て**で報告する:

| 指標 | 定義 | 用途 |
|---|---|---|
| **総EPC** | 004総成果 ÷ 004総クリック | 従来系列との連続性維持 |
| **層B評価EPC** | (004総成果−TV Plus初回登録分) ÷ (004総クリック−GA4 `guide_tvplus_add_cta` クリック数) | 層B(サービス新規)評価用 |

- 分母控除は**GA4値によるDMMクリック数からの近似控除**であり、GA4-DMM差(7/27=4件・C3再確認中)のぶん誤差を含む→**毎回この旨を注記**。
- 境界=**TV Plus CTA公開時刻(JST秒・PowerShell実測で台帳記録必須)**。それ以前の期間は控除不要。
- 誤差が層B解釈を左右する規模(概ね総クリックの10%超)に達したら報告しCSO裁定。

### 実装【rev2で前倒し: 段階1=今週CTO実装・マージはCSO承認後】
- **PR-5(独立)**。①〜④と同時実行可。af_id=**004**(設定定数外出し・007発行待ちは解除)。
- **前提条件=指示1-D**(DMMレポートでTV Plus初回登録¥2,200が独立行として分解されるかの実データ確認)。分解されない/判別不能なら段階1で停止しCSO報告。
- 着地URL: HUMAN実査①の確認済URLのみ使用(実査前はプレースホルダ不可=定数未確定のまま公開しない)。公開は二段階フロー(Phase1プリフライト→HUMAN実クリック→CSO最終承認→Phase2公開→公開時刻JST秒記録)。
