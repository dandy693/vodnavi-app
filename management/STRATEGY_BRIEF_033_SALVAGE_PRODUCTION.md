# STRATEGY_BRIEF_033：サルベージ5資産の本番反映フェーズ（現実整合版）

> 本ブリーフは CSO ドラフト `run_exact_landed.js` 同梱の `STRATEGY_BRIEF_002_PRODUCTION.md` を CTO が現実整合・連番是正して発行したもの。
> 連番: 既存 `002_SALVAGE` / `002_REWRITE` との衝突を避け、正規シーケンス末尾の次番として **033** を採番（board line 650 の 002_30X→032 リネーム先例に準拠）。

## 1. 執行背景と物理ファクト（2026-06-05 時点）
- **5つの盾 = 5 live / 0 open（真実落成、捏造ではない）**:
  - ① 副サイト登録 = DMM 管理画面スクショ物理 verify 済（`vodnavi.jp`=moterist-003 / `app.vodnavi.jp`=moterist-004 共に「承認済み」、申請 26.05.17 / 審査結果 26.05.19）
  - ② サーバー側 age-gate API 遮断 = `app-concierge/src/proxy.ts`（Next.js 16 で middleware→proxy にrename）で `/api/concierge/*` を HTTP 403
  - ③ af_id 動的解決 = `buildAffiliateURL` が env `NEXT_PUBLIC_FANZA_AFFILIATE_ID` から解決（ハードコードなし）
  - ④ 404 ダブルリンク = `product-card.tsx` に作品詳細CTA＋女優/型番検索一覧フォールバックを実装
  - ⑤ 早期クッキー着火 = GA linker early-fire（functions.php / BRIEF_017）
- **サルベージ5記事は既にリライト済・ランド済**（重要な現実整合）: ID 1095/1106/994/954/1018 は『ビブリア・エロティカ』トーンで各 `site-moterist/03_content/<slug>/article.md` に landed 完了（commits `cf8c8b0` / `12b405a` / `dfbe1bf` / `74865c3` / `034c32f`、BRIEF_003 §2/§3 + Option-A 準拠）。
  - **⚠️ from-scratch リライトおよび `article_rewritten.md` 新規生成は不要・禁止**（既存 `article.md` との二重化を招くため）。本フェーズの作業対象は既存 `article.md` の *in-place* 追補のみ。

## 2. 不変条件（既存 article.md 編集時に維持すべき仕様）
- **ホスト名個別識別動線**: 記事末尾CTAは正規URL `https://app.vodnavi.jp/concierge?source=moterist&intent={beginner|actress|discount}` を付与。
- **404 ダブルリンク**: 作品リンクは単独配置せず「作品詳細（env動的af_id）」＋「女優/型番 検索結果一覧」の2段構え（`product-card.tsx` 盾④の思想をHTMLでも踏襲）。
- **トーン＆マナー**: 原色・ネオンピンク永久封印。リッチブラック `#121212` / プラチナホワイト `#E0E0E0` / シャンパンゴールド `#D4AF37` の夜の書斎トーン。
- **コンプラ**: 冒頭 `> 本記事にはアフィリエイトリンクが含まれます（#PR）。` を省略禁止。

## 3. 真の次ステップ（2フェーズ、いずれもHUMANゲート前提）

### Phase A — データ駆動の追補リライト（SATURDAY_REVIEW 後）
- トリガー: 2026-06-06 10:00 JST SATURDAY_REVIEW で取得する GA4 実数値（source×intent×hostName）。
- 内容: 既存 `article.md` を **in-place** で追補調律（CTR/CVR の弱い導線のみ部分最適化）。from-scratch 生成ではない。board line 662 の「GA4 実数値駆動の追補リライト指示」と同義。
- 発行主体: CSO 自律発行（ChatGPT 依存 purge 済、board line 664）。

### Phase B — 本番WordPress反映（SSH認可ゲート）
- 手段: SSH + WP-CLI で `wp_posts` 更新（TinyMCE自動破壊回避のため wp-admin 編集画面は開かない）。
- **⚠️ ゲート**: mixhost 本番SSHは auto-mode classifier block 範囲（`reference_mixhost_ssh_classifier_block`）。**HUMAN 事前認可なしには実行不可**。本ブリーフは認可を前提とせず、認可受領後に別途執行指示を発行する。
- 代替経路: cPanel ファイル編集 / WP admin 経由も選択肢（classifier 制約と TinyMCE リスクのトレードオフを HUMAN 判断）。

## 4. HUMAN監査ゲート
Phase A の追補差分は `site-moterist/03_content/<slug>/article.md` へコミットし、HUMAN による目視コンプラ・トーン監査を受ける。監査通過分のみ Phase B（本番注入、要SSH認可）の対象とする。

## 5. 異常検知とロールバック
本番反映後24時間以内に `ALERTS.md` の異常検知ライン（GA4完全沈黙 / 装飾消失 / API 500継続）を走査。異常検知時は自律修復を停止（Abort）し `ALERTS.md` へ追記、GitHub Issue 起票のうえ判断保留。ロールバックは該当 `article.md` の直前コミットへ git revert。
