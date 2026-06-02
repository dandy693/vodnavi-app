# STRATEGY BRIEF 003 — サルベージ過去5記事資産の『ビブリア・エロティカ』化無人量産仕様

## 1. 執行対象（物理配置確認済み5フォルダ）
- site-moterist/03_content/1095/
- site-moterist/03_content/1106/
- site-moterist/03_content/994/
- site-moterist/03_content/954/
- site-moterist/03_content/1018/

## 2. 核心ライティング規約（BRAND_DESIGN_GUIDE.md 第4条に完全準拠）
- **トーン＆マナー**: チープなアダルトサイトのネオンピンク風表現を100%全摘出せよ。洗練された夜の書斎、知的でミステリアスなバーテンダーの口調（「今夜、あなたの孤独と欲望に寄り添う、至高のエンターテインメントを紐解きます」）へ不可逆にリライトせよ。ベースカラー `#121212`、アクセント `#D4AF37` の高級なビジュアルを文字組で表現せよ。
- **広告明示の盾**: 景表法およびステマ規制に基づき、記事ファーストビュー（冒頭）に必ず「#PR」または「本ページにはアフィリエイトリンクが含まれます」を明記せよ。

## 3. 収益配線・送客漏斗URLの厳密仕様
- **集客サイト静的IDの維持**: 記事内アフィリンクは、2026-06-02に法理確定した例外規定に基づき、環境変数ではなく集客サイト専用の静的副サイトリテラルである 'af_id=moterist-001' を正確に記述・維持すること。
- **漏斗CTAの完全一致（改変厳禁）**: 記事の中間動線および末尾の確定CTAは、必ず以下の成約アプリ（app.vodnavi.jp）遷移用URLと完全一致させること（読者の意図別のインテントパラメータを付与せよ）。
  `https://app.vodnavi.jp/concierge?source=moterist&intent=beginner`（初心者向け）
  `https://app.vodnavi.jp/concierge?source=moterist&intent=actress`（特定の女優・型番検索）
  `https://app.vodnavi.jp/concierge?source=moterist&intent=discount`（セール・最安値情報）

## 4. 執行確認ステップ
CCO（ChatGPT 5.5）は、本仕様に従ってリライトしたMarkdownドラフトを `site-moterist/03_content/<slug>/article.md` に順次上書き保存し、frontmatter の `publish_status` を `review` へ前進させよ。
