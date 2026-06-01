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
- [x] 🟢 T-20260601-08 (CCO): `site-brand/` サルベージ 2 記事原稿生成・配置完了。`site-brand/03_content/wordpress-sango-review/article.md` + `site-brand/03_content/u-next-second-free-trial/article.md` に landed。BRIEF_004 §2 準拠（タイトル / CTA URL / #PR 表記 / ダーク×ゴールド美学）
- [x] 🟢 T-20260601-09 (HUMAN + CTO): site-brand 本番 deploy + vodnavi.jp DNS/SSL 完全落成 (2026-06-02)。(1) `vercel link` 完了 (project: site-brand-vodnavi)、(2) 初回 deploy で globals.css の `../../../design-tokens.css` が Vercel 単体プロジェクトの project root 範囲外を指す事故 → site-brand/design-tokens.css に同期コピーを配置し `../../` 参照に修正、(3) Production: `https://site-brand-vodnavi.vercel.app` (alias) / READY、(4) placeholder URL は alias と完全一致のため app-concierge/vercel.json 置換不要、(5) **HUMAN cPanel DNS 調律完了** → 物理 probe verify: `vodnavi.jp → 76.76.21.21` (Vercel anycast)、`https://vodnavi.jp/` 200、`https://vodnavi.jp/wordpress-sango-review/` 200、`https://vodnavi.jp/u-next-second-free-trial/` 200、SSL valid (ssl_verify=0)。E2E 救済パイプライン物理開通 (✅ HUMANによるブラウザキャッシュ破棄および常時HTTPS暗号化通信の完全生存を目視確認済み)
- [x] 🟢 T-20260601-10 (CTO): `site-brand/src/app/[slug]/page.tsx` 動的コンテンツローダー配線完了。Next.js 16.2.6 async params + SSG (`generateStaticParams`) で `03_content/{slug}/article.md` を fs 読込、ダーク×ゴールド inline style で render (`tsc --noEmit` 通過)。デプロイ後 `/wordpress-sango-review/` `/u-next-second-free-trial/` が SSG で配信される
- [x] 🟢 T-20260602-01 (CTO/DESIGN): `site-brand/src/app/page.tsx:51` H1 hero 内の `<span className="text-brand-gold">AI コンシェルジュ</span>` に `whitespace-nowrap` を追加。狭幅 viewport 時に「AI コンシェル / ジュ」で改行される視覚バグを最小 fix で解消。`npm run build` 通過 (7/7 SSG)
- [x] 🟢 T-20260602-02 (CTO): site-brand 本番 Vercel re-deploy 完了 (deployment id `dpl_GRYdWCNRnWVWnp3hhyKxpVeYhkEX`、READY、UI fix bae32b1 を production に反映)。alias `https://site-brand-vodnavi.vercel.app` 200、`https://vodnavi.jp/` 200 物理確認
- [x] 🟢 T-20260602-03-FINDING (CCO/CTO): **[Superseded by Option-A, 2026-06-02]** — 当初は「ID 分離の盾 ガバナンス違反」として起票（`site-moterist/03_content/*.md` の `af_id=moterist-001` 直書き 16 件: 1018:1/1095:1/1106:1/**954:12**/994:1）。HUMAN による DMM 管理画面目視で当該 ID 群が **副サイトID（トラッキングID）** であり、3-ID 並列識別 (001=集客/004=成約/990=データ) が正規仕様と確定。markdown 直書きは仕様準拠のため finding 取り下げ。確定証跡: `management/_metrics/2026-W22/id-subid-audit.md`
- [ ] 🟦 (注釈) script Step 3 (SSH/WP-CLI 疎通) は echo only theater + `reference_mixhost_ssh_classifier_block` memory 通り classifier block 範囲のため**未実行**

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 app-concierge 本番Next.js 16 routes clean build (exit 0) 検証完了
- [ ] 🟡 T-04: moterist 側 gtag.js 初期化順序の修復（async解除およびlinkerParamタイムアウトの解決、子テーマ検証経由限定）
- [ ] 🔵 **【優先度:低・クリーンアップ】** BRIEF_030_AMEND: AI SDK 警告および環境変数のマイナーリファクタ
  - [ ] scripts/generate-work-reviews.ts 冒頭への import 'dotenv/config' 追加による --env-file フラグ不要化
  - [ ] プロンプトインジェクション対策としての system message の system option 移行
  - [ ] gpt-5.5 reasoning model における temperature 設定の削除

## [Backlog] 🛡️ ガバナンス・アフィリエイトID抽象化タスク (2026-06-02 確定)
- [x] 🟢 T-20260602-03-STEP1: **[Superseded by Option-A, 2026-06-02]** — 当初案は `NEXT_PUBLIC_FANZA_AFFILIATE_ID=moterist-001` での env 配線設計だったが、3-ID 並列識別仕様確定により app-concierge 側 env は **`moterist-004`** が正。site-moterist 側は副サイトID 直書き許容のため env 化不要。代替は T-20260602-04-ENV に集約
- [x] 🟢 T-20260602-04: **[Superseded by Option-A, 2026-06-02]** — 記事 Markdown 内 16 箇所の env プレースホルダー一括置換は不要化（副サイトID 仕様により直書き許容）
- [ ] ⚙️ T-20260602-04-ENV (CTO): `app-concierge/.env` および `.env.example` に `NEXT_PUBLIC_FANZA_AFFILIATE_ID=moterist-004` を定義し、`src/lib/concierge/url-builder.ts:68` の env 解決経路が確実に `moterist-004` を返すことを `tsc --noEmit` + ローカルブラウザ実機で物理確認。Vercel 本番 env への反映は HUMAN 手動アクション
- [ ] 🌑 T-20260602-05: 旧 `vodnavi.jp` のSEO外部被リンク資産（DR 73等）保護のための URL居ぬき Next.js Dynamicローダー移行（方針A）に伴う、旧記事URL（`/wordpress-sango-review/`等）のモノレポ内マッピング定義

## [Landed] 🚀 戦略ルート1点火セクション: 集客分母最大化 (2026-06-02 確定)
- [x] 🟢 T-20260602-06: GA4 クリックハンドラ条件 (`outline_1__9`) 緩和 — **物理 verify: 既に 2026-05-20 (Day 10) に解消済**。実コードは Next.js ではなく **WordPress THE THOR child theme の `functions.php`**。994/954/1018/1106 を post_id ベース config に統合、`closest('.content')` && `closest('li')` && al.dmm affiliate URL 形のみで発火に緩和、`outline_1__9` 位置関係 + 厳密 text 一致は廃止。backup: `functions.php.bak_day10_20260520_221713`。証跡: `packages/seo-motelab/analytics-issues-3sites.md:43-47`。1095 は entry CTA 構造が異なるため別ハンドラ据置中。**本タスクの「Next.js コード層改修設計」は前提誤認、新規改修不要**
- [x] 🟢 T-20260602-07:         CCO量産指示書の物理落成 (✅ 4箇所のMarkdown構造汚染およびアフィURL不整合をEditで完全調律・落成完了)


### CSO-Log 2026-06-02 06:45 JST
- [Active] T-20260602-04-ENV を正式に CTO (Claude Opus) へアサイン。指示書を `management/_tasks/T-20260602-04-ENV_INSTRUCTION.md` へ landed 完了。
