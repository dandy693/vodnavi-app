# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 Option α (Safe Append) ランブックによる過去記事5資産の本番WordPress直接注入完了（Landed: f6b6b6e）
- [x] 🟢 BRIEF_029: GA4 クロスドメインLinker物理監査完了（verdict: セッション属性疎通・client_id断跡受託）
- [x] 🟢 BRIEF_030: 新回転 OpenAI Key 疎通テスト成功および DMM 環境変数補完完了（Landed: 21d4810、1,617 tokens 再生成確認済）
- [ ] 🔴 **【次期トリガー・待機中】** SATURDAY_REVIEW: 2026-06-06 (土) 10:00 JST 執行。GA4生データ（source×intent）に基づくデータ駆動リライトループの自律起動（仕様書 BRIEF_031 マージ済）
- [x] 🟢 T-20260601-01: vodnavi.jp Ahrefs 被リンク・404 物理監査完了。Ahrefs Free `/backlinks` (Top 100 by Traffic) + curl HEAD 物理 probe で **3 URL の 404 確定** (`/u-next-second-free-trial/`, `/u-next-second-free-trial/u-next-free-trial`, `/wordpress-sango-review/`) — DR 73/66/62 の link equity 失効。SPAM PBN 60+ 行検出（SEOExpress 系 40+ / CZ-RU aged-domain 10+ / Stats 系 7）。Report: `management/audit/vodnavi_backlink_audit_20260601_222359.md`
- [x] 🟢 T-20260601-02 (CSO): サルベージ戦略確定。`STRATEGY_BRIEF_002_SALVAGE.md` landed — 判定: 復元（301 ではなく直接配置）。SANGO 公式 DR 73 / leawo + videoconverterfactory DR 66/62 を直接受託
- [x] 🟢 T-20260601-03 (CTO): `site-brand/next.config.ts:36` の `/wordpress-sango-review/:path*` 301 redirect 削除完了 (`tsc --noEmit` 通過)。**配信トポロジー所見**: `site-brand/` には `.vercel/project.json` も `vercel.json` も未配置。root + `app-concierge/` の Vercel mapping は同一 (`projectId=prj_42GkXv2njAJTxYbmDoLdP8JoZbkx` / `projectName=vodnavi-app`) — **site-brand/ は本リポから vodnavi.jp に紐づけられておらず**、サルベージページ配信前に Vercel project 作成 + ドメイン紐付けが必須。`/d-anime-store-only-title/:path*` 301 は BRIEF スコープ外として保持
- [ ] 🔵 T-20260601-04 (CCO): サルベージ 2 記事（SANGO 論 / U-NEXT 無料体験の調律論）の最高品質原稿執筆。`BRAND_DESIGN_GUIDE.md` + `THE_THOR_DICTIONARY.md` 準拠、ピンクネオン排除
- [x] 🟢 T-20260601-05 (CSO/CTO): SPAM PBN disavow.txt ドラフト生成完了 (`management/disavow.txt`、audit MD §3 由来の実ドメイン ~52 件)。GSC への upload は手動アクション
- [ ] 🔵 T-20260601-06: `intent=discount` 流入時における app-concierge プロンプト動的最適化の検証（バックログ）
- [x] 🟢 T-20260601-07 (CTO): Vercel Rewrites scaffold 配置完了。`app-concierge/vercel.json` に host=`vodnavi.jp` 条件付き rewrite 2 件追加（`/wordpress-sango-review/:path*` と `/u-next-second-free-trial/:path*` → `https://site-brand-vodnavi.vercel.app/...`、JSON 構文 validate 済）。**残課題**: T-09 (site-brand の Vercel deploy + vodnavi.jp ドメイン紐付け) が完了するまで rewrite は機能しない (destination URL がプレースホルダ)
- [ ] 🟡 T-20260601-08 (CCO): `site-brand/` サルベージ 2 記事原稿の生成・配置。`STRATEGY_BRIEF_004_PRODUCTION.md` §2 準拠 — 記事A「官能のライブラリを構築する美学：WordPress テーマ『SANGO』の UI/UX 論」(/wordpress-sango-review/, CTA: `app.vodnavi.jp/concierge?source=brand`) / 記事B「孤独な夜を満たす、至高のシネマ体験設計」(/u-next-second-free-trial/, CTA: `?source=brand&intent=discount`)。配置先: `site-brand/03_content/` または指定領域
- [ ] 🔴 T-20260601-09 (人間操作 + CTO): **配線実体化の前提条件**。(1) `cd site-brand && vercel link` で新規 Vercel project 作成、(2) 実 deploy URL を取得し `app-concierge/vercel.json` の `destination` プレースホルダ (`site-brand-vodnavi.vercel.app`) を実 URL に置換、(3) vodnavi.jp ドメインを vodnavi-app project に紐付け（または site-brand project へ直接紐付ける独立 Project 構成への切替）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 app-concierge 本番Next.js 16 routes clean build (exit 0) 検証完了
- [ ] 🟡 T-04: moterist 側 gtag.js 初期化順序の修復（async解除およびlinkerParamタイムアウトの解決、子テーマ検証経由限定）
- [ ] 🔵 **【優先度:低・クリーンアップ】** BRIEF_030_AMEND: AI SDK 警告および環境変数のマイナーリファクタ
  - [ ] scripts/generate-work-reviews.ts 冒頭への import 'dotenv/config' 追加による --env-file フラグ不要化
  - [ ] プロンプトインジェクション対策としての system message の system option 移行
  - [ ] gpt-5.5 reasoning model における temperature 設定の削除
