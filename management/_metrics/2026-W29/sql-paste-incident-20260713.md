# sql-paste-incident-20260713 — stash@{0} 証跡保全

- 保全日時: 2026-07-14 16:3x JST（CSO裁定④=証跡保全→docsコミット→drop 一括実行承認・7/14チェックポイント）
- 対象: `app-concierge/supabase/patch_add_public_read_policy.sql` のワーキングツリー変更（未コミット・2026-07-13棚卸しで発見、stash@{0}に隔離）
- 事案: 2026-07-02頃のCSOスクリプト断片（`management/X_WARMUP_STRATEGY.md` を作成するheredoc + `git add`/`git commit`連鎖を含む）がSQLコメント行の途中（「anon クライアント」の語中）に誤ペースト混入。HEAD版のsqlは無傷
- 影響: なし（未コミットのまま隔離・本番/履歴への流出なし）。再発防止関連: 貼り付け起点の混入はエディタ操作由来のため恒久対策は運用注意のみ
- 処置: 本ファイルへ全文保全 → docsコミット → コミット到達確認後に `git stash drop stash@{0}`（CSO承認済・議題⑥クローズ）

## stash@{0} パッチ全文（`git stash show -p stash@{0}` 原文）

```diff
diff --git a/app-concierge/supabase/patch_add_public_read_policy.sql b/app-concierge/supabase/patch_add_public_read_policy.sql
index 975c05f..4f62d3a 100644
--- a/app-concierge/supabase/patch_add_public_read_policy.sql
+++ b/app-concierge/supabase/patch_add_public_read_policy.sql
@@ -3,7 +3,47 @@
 -- 対象: 本番 vodnavi-production (ref xflqxxyvphqqmnzscpxr)
 -- 作成: 2026-06-30 / status: DRAFT（**未実行**・HUMAN attended SQL Editor で執行）
 -- =====================================================================
--- 目的: site-brand（メディア側 / 将来の anon クライアント）および検索クローラーが
+-- 目的: site-brand（メディア側 / 将来の anon クcat << 'EOF' > management/X_WARMUP_STRATEGY.md
+# Xアカウント初期ウォームアップ運用戦略 (2026-07-02策定)
+
+## 1. 物理アセット現状 (事実確認)
+- `@vodnavi_jp` (vodナビ): 運用履歴なし・新規状態
+- `@moterist69` (モテリスト): 運用履歴なし・新規状態
+
+## 2. アカウント凍結・シャドウバン回避規約
+- 新規アカウントによる初期のURL連投はスパム判定の閾値に即座に抵触するため、運用開始から14日間は「URL投下」に厳格な制限を課す。
+- 計測パラメータ（?utm_*）付きURLはアカウントの信頼スコア（Trust Score）が確立されるPhase 3まで投入を延期する。
+
+## 3. タイムライン・運用ルール
+### Phase 1: 生存証明 (Day 1 - Day 7)
+- 目的: Xアルゴリズムに対する健全な人間運用の証明、インプレッションの母盤構築。
+- 発信内容: 『ビブリア・エロティカ』の世界観（高級・知性・ダーク×ゴールド）を体現する文学的・教養的テキストポスト。アフィリエイト臭を100%排除。
+- URL制約: ポスト内へのURL記述は一律禁止。プロフィール欄への `https://www.vodnavi.jp/`（メインドメイン）の静的設置のみを許可。
+
+### Phase 2: 導線検証 (Day 8 - Day 14)
+- 目的: 検索トラフィックとSNSトラフィックの融合、正規インデックスURLの認知。
+- 発信内容: パブリッシュされた2大教養記事（`/biblia-erotica-foundation` / `/biblia-literature-eroticism`）の要約やインサイト抽出。
+- URL制約: ポストの「リプライツリー（2枚目のツリー）」の末尾にのみ、パラメータなしの正規URLを配置。
+
+### Phase 3: 本格配線 (Day 15以降)
+- 目的: 送客・コンバージョン動線の確率。
+- 発信内容: `PROMOTION_ASSETS_077.md`（訴求C/D）を用いた本格的な訴求とGSC/GA4を用いたデータ駆動型運用。
+- URL制約: 計測用パラメータ付きURLの全面解禁。
+EOF
+
+# TASK_BOARD.md の物理同期 (履歴なし事実に伴うSNSタスクの初期化・再編成)
+# (※TASK_BOARD.md の実ファイル構造を読み替えて自動上書きまたは追記)
+if [ -f TASK_BOARD.md ]; then
+    # 既存のタスクボードにX運用の生存証明フェーズの管理行を安全に挿入・追記
+    echo "- [ ] Xアカウント(@vodnavi_jp) Phase 1 生存証明テキスト運用 (Day1-7) :: 2026-07-02" >> TASK_BOARD.md
+    echo "- [ ] Xアカウント(@moterist69) 完全凍結・待機ステータス維持の物理監視 :: 2026-07-02" >> TASK_BOARD.md
+fi
+
+# Git自動 landed シーケンスの実行
+git add management/X_WARMUP_STRATEGY.md TASK_BOARD.md
+git commit -m "feat: X資産の運用履歴ゼロに伴う初期ウォームアップ戦略(Phase 1-3)の策定およびTASK_BOARDの同期"
+echo ">> [SUCCESS] すべてのアセットがローカルディスクへ物理保存され、Gitコミットまで完全自動で landed しました。"
+EOFライアント）および検索クローラーが
 --       `public.editorial_articles` の **published 記事のみ** を読めるようにする。
 --       draft / review は anon に物理露出させない（USING 句で 100% 遮断）。
 --
```
