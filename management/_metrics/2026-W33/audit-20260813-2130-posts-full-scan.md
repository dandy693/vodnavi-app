# posts 全件走査レポート

- **検査対象**: 69 件（配信済み 54 / 未配信 15）
- **検査したガード**: 14 件 ＋ 追加検査 2 件
- **違反**: **8 件**（配信済み 8 / 未配信 0）

## 検査しなかったもの（黙って落とさない）

- **g12_actress_not_recent** … 行に女優名フィールドが無く、事後には検査できない（本文からの氏名抽出は誤検出しやすいため採らない）
- **g16_article_interval** … 生成時点のスナップショット TG_LAST_USED に依存し、行のデータだけでは判定できない（自己比較で0日・未来との比較で負の日数になる）
- **g9_utc_iso** … **Z 終端の検査のみに縮退**。`intendedJst` が行に保存されていないため、JST 換算の意図一致は事後検査できない
- **予約日時が未設定のため判定不能**: 8 件
  - W7-03 T1改 純白彩永 MDVR-434 / g6_one_affiliate_per_day
  - W7-03 T1改 純白彩永 MDVR-434 / g8_time_window
  - W7-03 T1改 純白彩永 MDVR-434 / g9_utc_iso
  - W7-03 T1改 純白彩永 MDVR-434 / g11_one_work_intro_per_day
  - W7-04 T1改 月野江すい URVRSP-599 / g6_one_affiliate_per_day
  - W7-04 T1改 月野江すい URVRSP-599 / g8_time_window
  - W7-04 T1改 月野江すい URVRSP-599 / g9_utc_iso
  - W7-04 T1改 月野江すい URVRSP-599 / g11_one_work_intro_per_day

## 違反の種別ごとの件数

| 検査 | 件数 | 配信済み | 未配信 |
|---|---|---|---|
| `g15_utm_format` | 3 | 3 | 0 |
| `p1_postid_missing` | 2 | 2 | 0 |
| `g4_pr_when_affiliate` | 2 | 2 | 0 |
| `g7_length` | 1 | 1 | 0 |

## 配信済み（**遡及修正しない**・記録のみ）

| レコードID | 名称 | ステータス | 予約日時(JST) | 違反 | 実測値 |
|---|---|---|---|---|---|
| `rec3snXeHzkkwXqAZ` | W5-12 T6 TV 見放題の範囲と入れ替わり制 | 投稿済 | 2026-08-08 22:30 | `g7_length` | 重み付き 332 > 上限 280 |
| `rec3snXeHzkkwXqAZ` | W5-12 T6 TV 見放題の範囲と入れ替わり制 | 投稿済 | 2026-08-08 22:30 | `p1_postid_missing` | 投稿済だが ポストID が無い（X 上の実在は目視確認を要する） |
| `rec51WXja3Oxa66wq` | A3 巨乳CPセール速報 | 投稿済 | 2026-07-12 21:05 | `g4_pr_when_affiliate` | アフィリエイト直リンクに #PR がない |
| `recWGDmLVzNDUrbe6` | A1 TV無料トライアル | 投稿済 | 2026-07-11 21:12 | `g4_pr_when_affiliate` | アフィリエイト直リンクに #PR がない |
| `recZAr7vVJP8GabzL` | A14 TG-1 ガイド誘導 無料体験手順 | 投稿済 | 2026-07-15 21:30 | `g15_utm_format` | utm_source が x_vodnavi でない: null |
| `receSrxoAKqTU0xeg` | A19 TG-2 ガイド誘導 つまずき解消 | 投稿済 | 2026-07-19 21:00 | `g15_utm_format` | utm_source が x_vodnavi でない: null |
| `reco9SECUFBLMp0is` | B4 TG-3 ガイド誘導 0円で終えるタイミング | 投稿済 | 2026-07-22 21:30 | `g15_utm_format` | utm_campaign が slug と不一致: fanza_first_guide ≠ fanza_tv_free_trial |
| `recwLC2LAOrKZ2dMm` | W5-13 T1改 尾崎えりか SAVR-1157 8K VR | 投稿済 | 2026-08-09 21:00 | `p1_postid_missing` | 投稿済だが ポストID が無い（X 上の実在は目視確認を要する） |

## 未配信（**差し替えの要否は CSO 判断**）

違反なし。

## 文字数の分布（g7・本文＋リンクURL の実投稿形）

- 上限 280 超過: **1 件**
  - W5-12 T6 TV 見放題の範囲と入れ替わり制 … **332**（投稿済・ポストID なし）

