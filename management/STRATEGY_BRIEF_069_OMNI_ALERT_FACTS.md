---
title: "STRATEGY BRIEF 069 — GSC一斉アラート：対象URL物理特定および影響度監査報告"
date: "2026-06-15"
author: "CTO (Claude Code via claude-in-chrome MCP, GSC u/2 moterist.com@gmail.com)"
status: "alerts_audited_with_premise_corrections"
target_property: "sc-domain:vodnavi.jp（単一ドメインプロパティ。app.vodnavi.jp と www.vodnavi.jp の両ホストを内包）"
supersedes: "なし（BRIEF_068 を継承・拡張）"
---

# STRATEGY BRIEF 069 — GSC一斉アラート 物理監査

> 実測ソース: GSC「ページのインデックス登録」レポート / `sc-domain:vodnavi.jp` / ログインアカウント **モテリスト (moterist.com@gmail.com)** u/2 を [ref_9] で再確認。全URLは GSC drilldown 画面から直接採取。捏造・推測なし。

## 0. 先に：CSO 指示書（T-20260615-OMNI-ALERT-AUDIT）の前提と実測のズレ
指示書の前提を物理反証・補正する（[[feedback_verify_before_resolving_alerts]] / [[feedback_push_back_on_contradictions]]）。

1. **「app.vodnavi.jp プロパティ」と「vodnavi.jp プロパティ」は別物ではない。** GSC 登録は `sc-domain:vodnavi.jp` の**単一ドメインプロパティ**で、app/www 両ホストのURLが同一レポート内に混在する。「2プロパティを横断スキャン」という前提は不成立。
2. **「本日(06-15)11時台に4通の重複・クロール済み未登録アラートが届いた」は不正確。** メッセージパネル(全44件)実読の結果、直近は —
   - 2026/06/15「サイトマップ内のページがインデックスに登録されない**新しい要因**」
   - 2026/06/15「ページのインデックス登録エラーを**完全に修正できませんでした**」（＝下記クロール済み-未登録 bucket の検証失敗通知）
   - 2026/06/14「ページがインデックスに登録されない新しい要因」
   - 2026/06/14「過去28日間でクリック数が**4Kクリックに到達**」（＝エラーではなく**好調を示すポジティブ通知**）
   - 2026/06/11「エラーの修正を検証しています」
   → 本日分は**2通**で、いずれも「インデックス未登録／検証失敗」系。**「重複」を表題にした本日アラートは存在しない**。パネルは日付のみ表示で「11時台」の時刻確証は取れない。
3. **「vodnavi.jp のエラー＝旧WordPress残骸」は誤り。** 404(280)の実URLは後述の通り**全て app.vodnavi.jp 自身の `/works/videoc/*`**。`/archives/` や `/?s=` 等のWP痕跡はゼロ（[[project_gsc_not_indexed_breakdown]] / BRIEF_060 を再確認）。

## 1. 全 bucket 実測マトリクス（未登録 計2,297 / 登録済 3,290）
| 理由 | ソース | 確認状態 | 件数 | BRIEF_068(06-14)比 |
|---|---|---|---|---|
| クロール済み - インデックス未登録 | Google | **失敗しました** | **553** | 459 ↑ |
| 代替ページ（適切なcanonical） | サイト | 開始前 | 670 | 666 |
| 見つかりませんでした(404) | サイト | 開始前 | **280** | 269 ↑ |
| noindex 除外 | サイト | 開始前 | 6 | 6 |
| robots.txt ブロック | サイト | 開始前 | 5 | — |
| ソフト404 | サイト | 開始前 | 2 | 2 |
| リダイレクト | サイト | 開始前 | 1 | 1 |
| **重複（Googleが別ページを正規選択）** | Google | 開始前 | **43** | **2 ↑↑** |
| 重複（ユーザー正規未選択） | サイト | 該当なし | 0 | — |
| 検出 - インデックス未登録 | Google | 合格 | 737 | — |

## 2. 指示書が指名した2アラートの対象実URL

### ① 重複（Googleが別ページを正規選択）= 43件　[item_key=CAMYECAC / 初検出 2024/03/07]
**該当実URL（drilldown 先頭10件）— 全て `app.vodnavi.jp/works/amateur/*`:**
`mmmb00184`, `59hez00904`, `tnjs00006`, `apak00333`, `mlmm00093`, `fffb00022`, `usba00090`, `nbes00114`, `aed00262`, `jur00765`（前回クロール 2026/06/11）。**www.vodnavi.jp 由来は0件。**

→ **真因は BRIEF_068 と同一の「works フロア重複」**：同一 content_id が `/works/amateur/{id}` と `/works/videoa/{id}`（amateur の apiFloor=videoa）の2パスで自己参照canonical配信され、Google が videoa を正規統合。**新規の構造障害ではなく、同クラスが 2→43 にクロール拡大しただけ**。Google は videoa 正規版をインデックス済＝**正常な重複統合**。[[project_gsc_duplicate_alert_works_floor_dup]]

### ② クロール済み - インデックス未登録 = 553件　[item_key=CAMYFyAC]
**検証履歴: 開始 2026/06/11 → 不合格 2026/06/13**（指示書がいう「修正できませんでした」通知の実体）。
**該当実URL（drilldown 先頭10件）— ホスト混在:**
- `https://www.vodnavi.jp/`（**ルートホームページ自身**・前回クロール 2026/06/13）
- `app.vodnavi.jp/works/videoa/mdbk00399`, `/works/videoa/mdbk00393`, `/works/videoa/1dldss00520`
- **`app.vodnavi.jp/actresses/1081914`, `/1027558`, `/1076425`, `/1095801`, `/1040008`, `/1059940`**（女優ハブ・柱①）

→ **本ブリーフ最大の実所見**：**新設の女優ハブ（柱①）が「クロール済みだがインデックス未登録」に多数滞留**。これは [[project_actress_hub_first_measurement]] の「17名インデックス済だがGSC表示≈0」を機序面から裏づける——**クロールは到達しているが Google が"配信に値しない薄さ/立ち上げ初期"と判断**してインデックス保留している。CTRやリンクの問題ではなく**コンテンツ厚み（Information Gain）と滞留時間の問題**。

## 3. vodnavi.jp(www) 側の実態：旧WP残骸ではない
- **404(280)= 全て `app.vodnavi.jp/works/videoc/*`**（`smjs252`,`oremo551`,`instc708`,`nost233`,`peep182`,`orecz524`,`pai374`,`smub107`,`smgd018`,`zarj070`／初検出 2023/07/22）。`videoc` は FANZA_FLOORS 非実在フロアで、旧 sitemap の `floor_code` 直埋め残骸を Google が再クロール中（BRIEF_060 真因A）。**現 sitemap は videoc 非出力＝新規汚染源は停止済**だが、キャッシュ済URLの自然消滅は遅延中。
- **代替canonical(670)= `/concierge?source=...&intent=...&seed_cid=` と `/?floor=...` のパラメータURL**＝base へ正しく canonical 統合される**健全な挙動**。エラーではない。
- www.vodnavi.jp ルートで唯一のシグナルは上記①②の `https://www.vodnavi.jp/`（ルートが crawled-not-indexed）。**旧WordPress（`/archives/`,`/?s=`）痕跡は全bucketでゼロ。**

## 4. 結論：要塞における本当の重大度（100%実測ベース）
**A. 完全放置で良いもの（正常 or 自然減）:**
- **重複 Googleが別ページ選択(43)**：正常な重複統合。canonical追加では解消不能・**B-0放置**が正。任意で sitemap を content_id あたり1フロアに正規化すれば件数は逓減（[[project_gsc_duplicate_alert_works_floor_dup]] B-1、要承認・低優先）。
- **代替canonical(670)**：設計どおりの正規統合。対応不要。
- **404 の `/works/videoc/*`(280)**：発生源は停止済。Google 再クロールでの自然消滅待ち（任意で sitemap からの明示除去 or 410 で加速可だが低優先）。

**B. 次フェーズで Information Gain を足すべき"薄いページ":**
- **クロール済み-未登録(553)、特に女優ハブ `/actresses/*`**：これが唯一の能動的課題。クロールは来ているのにインデックスされない＝**editorialLead 等の独自テキスト拡充が直接効く層**。現状 editorial 投入済は数名（七沢みあ/河北彩伽/鳥羽みもり）のみで大半が空。

## 5. 次期カウンター戦術（静観期=コードフリーズ明け後）
1. **女優エディトリアル横展開を最優先**（T-20260610-15 の継続）。total作品数の多い女優から `actresses-editorial.json` に 300〜500字の独自リードを順次投入。**コード変更不要・薄ページ回避の Information Gain** で crawled-not-indexed からの引き上げを狙う。
2. **クロール済み-未登録の検証(検証失敗06/13)は、母数を増やしてから再申請**。薄いまま「修正を検証」を押しても再失敗する（既に06/13実証）。コンテンツ拡充→自然再クロール→GSCモニタの順。
3. **videoc 残骸(404)**は sitemap 明示除去 or 410 で再クロール負荷を軽減（任意・低優先、要 HUMAN 承認）。
4. moterist 凍結・5記事SEO保護は不変。本ブリーフは**読み取り監査のみ**でコード変更・本番 deploy は伴わない。

---
**監査メタ**: 全データは 2026-06-15 に claude-in-chrome MCP 拡張機能経由（Playwright/headless ではない・[[feedback_cso_chrome_mechanism]]）で GSC 実画面から取得。item_key: 重複=CAMYECAC / クロール済み=CAMYFyAC / 404=CAMYDSAC / 代替canonical=CAMYGCAC。
