---
audit_date: "2026-06-25"
target: "PR #57 True Zero-Coordinate Floating Audit"
target_url: "https://app.vodnavi.jp/works/videoa/lulu00423"
viewport: "390x844 (iPhone 相当, Chrome MCP resize)"
method: "Chrome (claude-in-chrome MCP) 実機幅レンダリング + y=0 目視"
status: "grounded"
note: "MCP screenshot の save_to_disk が取得可能パスを返さないため、バイナリPNGではなく本テキストを物理証跡とする（プレースホルダ画像は作らない）。デプロイ伝播は curl で max-h-[220px] を SSR HTML に検出（attempt 3）して確認済。"
---
# PR #57 追補：モバイルファーストビュー絶対ゼロ座標 物理実測監査ノート

PR #57（`max-h-[220px]` 画像高上限化）マージ・本番デプロイ後、Chrome を 390x844 にリサイズし `app.vodnavi.jp/works/videoa/lulu00423` を **スクロール 0px（絶対ゼロ座標 y=0）** で目視。

## 1. 390px Viewport における絶対ゼロ座標（y=0）の描画ファクト
- **作品メイン画像の描画高さ**: `max-h-[220px]` 追従を確認。3:4 縦長から **~220px のランドスケープ帯へ中央クロップ**（object-cover）。SSR HTML にも `max-h-[220px]` クラスを物理検出。
- **H1（作品タイトル）の露出**: ✅ **y=0 で全文視認可能**（画像直下に表示）。
- **金CTA（detail_fv_cta）の露出**: ✅ **スクロール不要で 100% 視認**。「FANZA公式で今すぐ視聴・サンプルを見る（18禁）」シャンパンゴールド全幅ボタン＋右矢印が画像＋H1 の直下、ファーストビュー内に露出。
- **回遊ハブピル群の露出**: ✅ y=0 で視認。女優 `九井スナオ`（人物アイコン＋金枠）＋ジャンル `ハイビジョン` `4K` `独占配信` `コスプレ` が1行 wrap で収まる。
- **既存 sticky 下部バー**: `今宵ひらく` / `司書に相談` も画面最下部に常時表示（二重動線維持）。

## 2. 監査基準の判定
- **基準①（浮上実測）: ✅ 合格** — 画像高が ~220px に制御された結果、y=0 で H1＋detail_fv_cta 金ボタンが物理露出。PR #56 監査（`2026-06-25-iphone-fv-audit.md`）で「画像 ~480px が FV を占有し CTA は1スクロール下」だった状態が解消。
- **基準②（審美性）: ✅ 合格** — object-cover による中央クロップで、引き伸ばし・画面崩壊・横はみ出しなし。lg 以上は `lg:max-h-none` で本来の 3:4 全体表示を維持（desktop は別途確認、2カラムで既存 main CTA が FV 内）。

## 3. 結論
PR #56 で残存していた「3:4 画像の壁による1スクロール下への埋没」は、PR #57 の `max-h-[220px]`（モバイル限定）緊縮により解消。**流入直後（3秒の視界＝絶対ゼロ座標）に金CTA(detail_fv_cta)＋女優/ジャンル回遊動線が露出する**状態を実測実証した。残る検証は本番 GA4 DebugView での detail_fv_cta 実発火と、クリック率（対 detail_main_cta）の時系列比較。
