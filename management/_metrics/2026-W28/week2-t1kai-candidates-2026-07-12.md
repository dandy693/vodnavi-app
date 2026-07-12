# week2 T1改 新作候補リスト（CSO発行 2026-07-12・確認/抽出のみ・Airtable未登録）

- 作成: CTO 2026-07-12 JST
- 取得方法の注記（指示との差分）: Chrome拡張のサイト許可制限で dmm.co.jp に接続不可、かつランキングページはSPAで curl 取得不可のため、**DMM Affiliate API `ItemList sort=rank`（floor=videoa、本番アプリと同一データソース）で代替**。API呼び出しは3回のみ（上位240位分・ローカルIPスロットル教訓に留意）。af_id は API専用の990系で、**人間導線のアフィリエイトリンクは不使用**。順位はAPI総合人気順（日次/週次の区別はAPIに存在しない）。
- Supabase収録欄について（前提訂正）: Supabase実テーブルは `editorial_articles`(11行)・`article_products`(10行) のみで、**works テーブルは存在しない**。作品詳細ページは DMM API 直結レンダリングのため「Supabase収録」の概念が適用外＝**HTTP 200 が収録確認そのもの**（API返却なしなら404になる実装）。

## 候補10件（人気順位順・発売日 2026/07/10〜07/19・全件200確認済み）

| # | 品番 | タイトル | 女優名 | 発売日 | 順位 | URL | 200 |
|---|---|---|---|---|---|---|---|
| 1 | ipzz00893 | FIRST IMPRESSION 193 天性の愛らしさと洗練された気品 元芸能人お姉さん AV DEBUT | 白石るな | 7/10 | 9位 | app.vodnavi.jp/works/videoa/ipzz00893 | OK |
| 2 | mdvr00437 | 【VR】超接写ドキドキアングル！…8K高画質VR | 福田ゆあ | 7/11 | 18位 | app.vodnavi.jp/works/videoa/mdvr00437 | OK |
| 3 | snos00258 | 最強ヒロインの 濃厚フェラチオと 大量顔射 | 瀬戸環奈 | 7/10 | 35位 | app.vodnavi.jp/works/videoa/snos00258 | OK |
| 4 | hsoda00124 | 【淫語ASMR】「今日も中に出して」と囁かれ…背徳神乳不倫 | 彩月七緒 | 7/10 | 40位 | app.vodnavi.jp/works/videoa/hsoda00124 | OK |
| 5 | urvrsp00594 | 【VR】【8K】正々、堂々、教え子メス堕とし | 青坂あおい | 7/11 | 50位 | app.vodnavi.jp/works/videoa/urvrsp00594 | OK |
| 6 | snos00252 | 水泳一筋 純情お姉さん…初イキ・初体験3本番 | 園梨音 | 7/10 | 92位 | app.vodnavi.jp/works/videoa/snos00252 | OK |
| 7 | ipzz00870 | ほんわか癒し系の…女上司とオフィスで…熱情ベロキス性交 | 篠崎沙帆 | 7/10 | 95位 | app.vodnavi.jp/works/videoa/ipzz00870 | OK |
| 8 | dass00985 | 私に飼われてみない？実録。レズペットを飼う絶世の美女 | 花宮きょうこ,由良かな,冬愛ことね | 7/10 | 116位 | app.vodnavi.jp/works/videoa/dass00985 | OK |
| 9 | snos00245 | グラビア細胞が記憶していた 新時代エロス爆発 | 博多彩葉 | 7/10 | 117位 | app.vodnavi.jp/works/videoa/snos00245 | OK |
| 10 | snos00269 | 高級デリヘル呼んだら憧れのレジェンドグラドル…奇跡の鉢合わせ | 金松季歩 | 7/10 | 119位 | app.vodnavi.jp/works/videoa/snos00269 | OK |

- 未収録による除外: 0件（該当10件すべて200）
- 次点（11〜15位相当・予備）: dass00999(125位・きのこフェスティバル2026=GSC上位クエリ既出) / snos00276(139位) / ipzz00903(140位) / ipzz00894(145位) / savr01106(238位・女優名なし)
- 参考: rank9 の白石るな（元芸能人AV DEBUT）はデビュー作でT1改の「新規フック」文脈と親和性が高い。上位4件中2件がVR作品。
- Airtable登録は未実施（CSOコピー確定・HUMAN承認後の別途指示待ち）
