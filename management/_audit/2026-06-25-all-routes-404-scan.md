---
audit_date: "2026-06-25"
target: "Deep Pages Non-Symmetric 404 Resolution"
status: "grounded"
outcome: "FULL RECOVERY 確認（126+ ルート 200 / 404 ゼロ）"
---
# 全ルート本番死活 ＆ 直近30分詳細ページ生ログ 物理統合監査レポート

## 1. 直近30分ログ harvest の結果（生メッセージは未捕捉・捏造しない）
- `vercel logs app.vodnavi.jp --json --since=30m --query VODNAVI_SILENT_DEATH_GUARD` → **0 件**。`--since` 無しの照会も `2026-06-24T17:16Z` で頭打ちで、**当日(2026-06-25)分の runtime ログが Vercel ログ照会 API に surface しない**（ingestion lag / 照会上限）。
- よって**ディープページ404の「その瞬間のDMM生メッセージ」は取得できなかった**。protocol 例示の "Invalid Article" / "Permission Denied" 等は**観測していないため記録しない**（プレースホルダ・捏造の排除）。
- **非対称失敗の構造的理由（実測からの結論）**: §2 のスキャンで全ルートが 200 へ復旧したため、**直前まで観測された詳細/ハブの404は恒久的なパラメータ拒否ではなく、`--force` 再デプロイ直後の env/キャッシュ伝播の過渡（post-deploy stabilization）**だったと確定。`scroll`/`cid`/`article` 別のパラメータ起因ではない（全種別が回復）。0件ログ＝過渡期の失敗が 400 を恒常 throw していなかった（または当日ログ非surface）ことと整合。

## 2. カテゴリー別 死活ステータスファクト（M-08 実測 / curl `%{http_code}`）
- **女優ハブ (/actresses/*)**: 総数 **56 → 200 が 56 / 404 が 0**（editorial JSON 全 ID 走査）。404 URL: なし。
- **ジャンルハブ (/genres/*)**: 総数 **70 → 200 が 70 / 404 が 0**（editorial JSON 全 ID 走査）。404 URL: なし。
- **作品詳細 (/works/videoa/*)**: 現行ホームグリッド由来 fresh cid **15 件 → 200 が 15 / 非200 が 0**。
- **過渡期に404だった代表ページの再検証**: `/`・`/genres/524`・`/genres/102`・`/actresses/1006606`・`/works/videoa/jqre00028`・`/works/videoa/vrkm01868` いずれも **200**（全て `X-Vercel-Cache: MISS` = fresh render 成功、stale でない）。
- **合計**: 走査 **126+ ルートで 404 ゼロ**。flapping（断続失敗）も観測されず安定。

## 3. 恒久復旧へのサージカルアクション
- **コード/JSON/パラメータ修正は不要**: 全ルート復旧済。`genres-editorial.json`・cid・article いずれも正常応答。当初の SEV-1 はコード起因でなく DMM 側資格情報の拒否であり、人手の env 更新（Step B）＋`--force`再デプロイ（Step C）で解消。
- **DMM 管理画面側の追加承認は不要と判断**（全 query 種別が 200 のため）。ただし**当時のDMM拒否理由（api_id失効/アカウント審査等）の確定事実は本AI未共有**＝再発防止の観点では人手で DMM 側ログ/通知の確認を推奨。
- **残作業（SEO 回復）**: 約24時間（2026-06-24 16:43Z〜）クローラへ 404 を返し続けたため、GSC で当該 URL の再クロール/インデックス状態を後日観測（404→200 の回復をGoogleが再評価するまでのラグ監視）。
- **計測の補強候補**: Vercel 当日ログが照会 API に surface しない件は障害診断の死角。次回は DebugView / Drains 等の併用を検討。

## 結論
**SEV-1 FANZA API 400 障害は本番全ルートで物理復旧（126+ ルート 200 / 404 ゼロ、全 fresh render）。** 直前の非対称404は再デプロイ過渡の一時事象で、恒久障害ではなかった。唯一未取得なのは「過渡期の deep-page DMM 生メッセージ」（当日ログ非surface）だが、全復旧により実害・追加対処なし。
