# DATAPULL_SPEC v1.2(2026-07-28 CSO C3裁定反映)

> 週次評価用データ取得の項目定義。層別スペックv1.1(集計=前日確定値のみ・層B=7/24〜・境界2026-07-24 00:00:54 JST)を継承。取得は閲覧のみ・判定は書かない。時刻=JST明記+PowerShell実測。

## 標準項目(v1.1から継承)
- A1 GA4 Organic日次(標準フィルタ: hostname=app.vodnavi.jp+参照元除外)
- A2 ai_affiliate_click 日次placement別(層A/B区分・guide_tv_signup_cta明示)
- A3 特殊placement観測(現行なし=U1撤収済み扱い・新設時に追加)
- A4 新規記事のLPセッション/PV初動
- B5 GSC 検索パフォーマンス7日+/articles/クエリ一覧(クエリ数・impr・順位)
- B6 sitemap収録確認+sitemap-archive DB/配信突合
- B7 直近変更記事のpageフィルタ経過
- C8 DMMレポート: 期間×ID別(004/006)日次+報酬明細(商品別)+EPC分母(7/16起点累計)
- C9 セルフクリック台帳との控除照合
- D10 X: 投稿imp終値・フォロワー・通知・Airtable予約状態(CANCELED有無)

## v1.2追加(C3裁定・次回から)
1. **990系残差週次**: DMM全ID合計クリック−(004+006)=990系推定値の週次推移
2. **GA4-DMM差分レンジ**: 層B日次差分の一覧と±3/日基準の超過日明記(超過日は翌々日に再確認して確定=7/27差4の7/29再確認をここに組込)
3. **actresses順位・vol推移**: 河北彩花(/actresses/1044864)ほか上位ページのGSC順位+ahrefs推定vol(ログイン済み時)
4. **articlesクエリ数の週次推移**: クエリ種数・impr計・クリック計の週次時系列(4→5→8種の系列を継続)

## 取得手法(確立済み)
- GA4: フィルタURL方式+JS(innerText)抽出。2条件目は`sessionDefaultChannelGrouping`
- DMM: 期間=テキストフィールド直接入力(triple-click→type)+「この条件でレポートを表示」・ID切替=JS `select[name="affiliate-id"]`+changeイベント。**適用確認は「現在の設定」ヘッダ必須**・al系リンクはクリック厳禁
- X: プロフィールTLのanalytics aria-labelをJS抽出・snowflake復号で定刻確認(PowerShellでJST変換)
