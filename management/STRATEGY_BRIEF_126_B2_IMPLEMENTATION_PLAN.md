# STRATEGY_BRIEF_126: B2デプロイ枠 実装計画(詳細設計)

- 起案: 2026-07-28 CTO / 正典: CSO添付「設計スペック: アイキャッチ自動生成+内部リンク自動化」(2026-07-26 戦略顧問版・7/28 CSO返信で全文受領=停止解除)+7/28裁定(bd116c8)
- **統治**: 本書は設計のみ。**コード変更・デプロイは層B観測確定(8月頭)後のCSO承認まで禁止**。AI(Claude API)の役割は提案生成まで=公開反映は「DB保存→CSO承認→機械的レンダ」必経。BRIEF番号126=空き確認済(125まで使用)。

## 1. スコープ(B裁定確定分)
①レンダラ本文リンク対応(基盤・先行必須) ②内部リンク3層(works/actresses→articles+articles間) ③U1撤収(FV枠→関連記事リンク転用) ④アイキャッチ(動的OG+Claude APIコピー) ⑤専用placement(**分離実行**=下記§9)

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
- **将来の再検討パス(CSO指示・実装はしない)**: 層B確定後、**soft-keep専用のaf_id新規取得を検討**する(DMM側で新規af_id発行が可能なら、収益化と系列分離を両立できる——990系=API専用と同じ「用途別ID分離」の設計思想)。発行可否の確認と申請はその時点のCSO裁定事項。**それまで(b)生URLを維持**。
- 実装規模: PR-2へ同梱可能。棄却案の記録: (a)410+sitemap除外=エクイティ放棄/(c)404現状維持=GSC 404蓄積(過去237件問題の再演リスク)。

## 11. 見積り
- 設計完了=本書(スペック受領同日)。実装=PR-1〜4で実働1〜2日(8月頭・CSO承認後)。OGコピーバッチのCSOレビューは6記事で5分規模(スペック§1-2)。
