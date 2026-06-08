# STRATEGY_BRIEF_005: 1106調律完了と「5つの盾」物理インジェクションへの移行（改訂版）

## 1. 目的とKPIターゲット
1106記事（fanza20250331）のSurgical Fix、および994記事（fanza_otoku250114）の完全落成により、集客ドメイン（moterist.com）の既存SEO資産URLの安全防衛を完了。次期マイルストーンである「送客率（CTR_app）6.0%の達成」に向け、残る過去資産（954、1018）の無人リライト・注入ループの自動化を加速させる。

## 2. 複数ドメイン識別および物理データ監査規約 (Hostname Audit)
- GA4統合プロパティ（G-GG7JV9MJRW）でのデータ監査時、必ず「ホスト名（Hostname）」ディメンションを適用し、moterist.comからの送客ファネルとapp.vodnavi.jp内の会話インテント（&intent=discount / beginner）の相関を個別かつ厳格に追跡すること。
- 年齢確認モーダル未通過時の403遮断ログの実数値を、サーバー側（middleware）から直接スキャンして生存計測を行うこと（ハルシネーションの永久排除）。

## 3. 確定合意（Option-A）に基づく調律維持
- **収益IDガバナンス**: 集客サイト側の副サイトID（moterist-001）は、commit 5156207 / 3d26570 の確定合意に基づき、リテラル文字列としての直書き配置（Option-A）を正典として永久に維持する。
- **成約アプリ側URLビルダ**: `app-concierge` のコード上（T-20260602-04-ENV）にデプロイ済みの抽象化URLビルダ関数（buildAffiliateURL）およびVercel env環境変数の配線状態を週次監査し、ID汚染を100%防御せよ。

## 4. CCO / CTO への次期執行命令
- **CCO (ライター宛)**: 次なる優先SEO資産である `954_fanzaotoku.md`（常緑セールハブ：『Evergreen Sale Hub』）について、DB上の post_name との物理一致確認を行い、THE_THOR_DICTIONARY.mdの装飾HTMLを完全適用したリライトドラフトの作成に着手せよ。
- **CTO (技術実装宛)**: mixhost側の `wp-config.php` または管理画面にて、WordPressコア・テーマ・プラグインの「自動更新」が完全に停止（手動制御化）されているか、サーバーの物理設定状態を確認・報告せよ。
