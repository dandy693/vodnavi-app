# 束2 段階② 2026-09-22 夜（21:00 枠）— 抽出 → リプ案 → Q（0 件）／E28 効果測定 初回記録

**5軸ラベル**: ①対象範囲＝`x_targets` の稼働 34 件（Airtable から毎回組み立て・`active-targets.mjs`）②期間＝**窓＝2026-09-22 08:45 JST 以降**（今朝の抽出以降）・走査 **2026-09-22 21:26〜22:5x JST**・生成 23:0x JST ③計測系＝X の読み取り（Chrome 連携・CSO ログイン済み `@vodnavi_jp`）＋ Supabase MCP（read-only）＋ Airtable MCP ④出典＝自アカウント／自サイトの実測 ⑤機会の数＝**34/34 アカウントを悉皆走査**（サンプリングではない）。

**閾値**: 窓の下限 snowflake = `2102182335083446272`（2026-09-22 08:45:00 JST）。snowflake→JST は `(id >> 22) + 1288834974657` ms。

---

## 1. 対象の組み立て（Airtable → active-targets）

| 項目 | 実測 |
|---|---|
| 読み取り | `list_records_for_table`（x_targets `tblStC3L57aJh22sD`）**42 件**・2026-09-22 21:25 JST |
| 抽出対象 | `status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり` ＝ **34 件** |
| priority | 1: 26 / 2: 4 / 3: 4 |
| type | 女優本人 15 / メーカー公式 14 / セール告知系 3 / レビュー系 2 |
| 対照（priority 3） | `mayukiito` / `S1_No1_Style` / `shinnakanodream` / `umi_sea_0v0` |

ファイル: `targets.json`（fields 形へ転記）／`active-targets.txt`／`active-targets-urls.txt`

---

## 2. 抽出（読み取りのみ・34/34）

**窓内 18 アカウント・35 投稿。窓外 16 アカウント。**

### 2-1. 窓外（16）— 最新投稿が 08:45 JST より前

`attackers_av`(9/21) / `5may_itsukaichi`(9/20) / `azusa_hikari_`(9/14) / `FalenoEvent`(9/20) / `fanza_meireview`(5/25) / `honnaka_NN`(01:00・朝の Q 対象) / `karin_kitaoka_`(9/21) / `kawaii_pr`(9/21・固定 5/17 を除く) / `Kizukiamane`(9/18) / `Madonna_AVinfo`(9/18) / `PRESTIGE_PR2020`(9/18) / `sakuramio_X`(9/21) / `sodstarofficial`(9/21) / `wanz_official`(9/18) / `mayukiito`(9/16) / `shinnakanodream`(9/21)

### 2-2. 窓内だが提示対象外（本文未取得のものを含む）

| ハンドル | 件数 | 扱い |
|---|---|---|
| `iyo_shinohara` | 1（08:2x） | **停止**（女優本人 3 日・本日 00:11Z に返信済み）。本文未取得 |
| `shiromine_miu` | 4 | **停止**（同上・本日 00:12Z）。本文未取得 |
| `Aizawa_miyu03` | 1 | **停止**（女優本人 3 日・9/20 12:38Z）。本文未取得 |
| `IDEAPOCKETTER` | 2 | **停止**（1 日間隔・本日 00:14Z＝09:14 JST）。本文未取得 |
| `MOODYZ_official` | 3 | **停止**（同上・本日 00:13Z）。本文未取得 |
| `shirot_AV_chosa` | 4 | **停止**（同上・本日 00:15Z）。本文未取得 |
| `S1_No1_Style` | 2 | **priority 3・週 2/2 で上限**（提示しない）。本文未取得 |
| `umi_sea_0v0` | 1 | 同上。本文未取得 |
| **`PREMIUM_AV`** | **2** | **取得不能**——プロフィールの a11y ツリーに投稿が出ず、3 回の試行（センシティブ interstitial のクリック含む）でも URL・本文とも取れなかった。**「取得できなかった」であって「該当なし」ではない** |

### 2-3. 窓内・本文取得済みで**除外**（9 件）

| ハンドル | 時刻 | 本文の要旨 | 除外理由 |
|---|---|---|---|
| `DMM10sale` | 19:28 | MGS動画 300円切り替わりの引用 | **FANZA 外（MGS）** |
| `FANZAdougaX` | 19:00 | 作品名らしき 1 文のみ | 19:01 と同一作品の連投・情報は 19:01 側にある |
| `mio_sakai_` | 20:15 | 「チームy's 上げ直し」 | 交流（作品に触れない） |
| `mio_sakai_` | 20:10 | 関西プールフェス御礼 | **店舗イベント**（作品名なし） |
| `nao_satsuki` | 20:33 / 19:58 / 19:55 | 関西プールフェス関連・交流 | 同上 |
| `saki_seino` | 19:08 | 「作中ではおじさんにやられてばかりの女優です」 | 作品名・発売・配信いずれもなし（雑談） |
| `waka_misono` | 09:57 | 「飼う？飼われる？」 | 同上 |
| `ran_tpowers` | 14:55 / 15:09 | イベント御礼・チェキ | **店舗イベント** |
| `fanza_sns` | 09:00 | ライブチャットの女優イベント告知 | **動画フロア外（ライブチャット）** |

**除外 = 12 件**（上表 9 行・`nao_satsuki` 3 件と `ran_tpowers` 2 件・`mio_sakai_` 2 件を件数で数える）。`nao_satsuki` の 14:2x 1 件は本文未取得。

### 2-4. 入力（4 行）

`input.txt`:

1. `@FANZAdougaX` 19:01 — こだわりのフェラ％OFF作品リスト＋BEAUTY VENUS VI（アイポケ・240分・プレミアムエディション）／**cid なし**（`rcv.ixd.dmm.com` 短縮のため content_id を確定できず＝知識なしモード）
2. `@Fitch_official` 20:15 — #肉欲の秋 50%OFF ／ `fpre00094`
3. `@Fitch_official` 10:15 — #肉欲の秋 50%OFF ／ `juny00099`
4. `@waka_misono` 09:43 — 「ももさりさんと共演しました」＋［引用元 ダスッ！公式 …］／ `dsod00068`

---

## 3. 知識（Supabase・read-only）

`parsed.json` → `knowledge_plan.json` → `knowledge_union.sql` → MCP `execute_sql` → `rows.json` → `knowledge.json`。

**PK ヒット 3/3**（line 2 `fpre00094` / line 3 `juny00099` / line 4 `dsod00068`）。line 1 は cid なしのため照会せず。

| line | 収録 | 配信日 | campaign |
|---|---|---|---|
| 2 | 147 分 | 2024-08-16 | こだわりのフェラ50％OFF（2026-09-21 10:00 〜 09-23 09:59:59） |
| 3 | 159 分 | 2023-07-14 | 同上 |
| 4 | 120 分 | **2026-10-23** | なし |

---

## 4. 生成（リプ案）

`generate.mjs --today 2026-09-22`（model `claude-opus-5`・prompt_sha `bf23d27971ce`）。**API 3 回 / in 2,623 / out 1,438（累計）**。

| line | 結果 |
|---|---|
| 1 `@FANZAdougaX` | 生成（A・C の 2 案。**知識なしモードのため B は生成しない**） |
| 2 `@Fitch_official` 20:15 | 生成（A・B・C） |
| 3 `@Fitch_official` 10:15 | **停止**（同日同ハンドル 2 件目・本バッチ内） |
| 4 `@waka_misono` | 生成（A・B・C） |

**8 案すべてガード通過**（`ok=true`）。ファイル: `drafts.json` / `drafts.txt` / `generate.log.txt`。

---

## 5. Q（引用ポスト）— **候補 0 件**

`quote.mjs --max 2`。**4 行すべて対象外**。

| line | 対象外の理由（ツール出力） |
|---|---|
| 1 `@FANZAdougaX` | 知識なし（cache MISS）／type 対象外（セール告知系）／発売・配信・予約の語なし／**セール（OFF作品）** |
| 2 `@Fitch_official` | 発売・配信・予約の語なし／**セール（`\d+\s*[%％]\s*OFF`）** |
| 3 `@Fitch_official` | 同上 |
| 4 `@waka_misono` | type 対象外（女優本人・引用元はメーカー公式のみ）／発売・配信・予約の語なし |

**本日の Q は 1/2 のまま**（朝の `20260922-Q-honnaka_NN` のみ）。**works リンク投稿も 1 日 3 件の枠を追加消費しない。**

---

## 6. E28 効果測定 — Firewall Allowed（Past Day）**初回記録**

**取得 2026-09-22 23:1x JST**（Chrome 連携・Vercel Firewall 画面・読み取りのみ）。**窓はグラフ軸で 2026-09-21 23:00 → 2026-09-22 22:45 JST の 24 時間。**

| 項目 | 実測 |
|---|---|
| **Allowed** | **62.0k** |
| **Denied** | **9.6k** |
| Challenged | 6 |
| Logged / Rate Limited | **-**（表示なし） |
| Firewall | active / System Mitigations Active / **Custom Rules 2 active** / **Bot Protection Inactive** |
| Rules（マッチ数） | **E28-2 concierge non-browser deny 9.0k** / DDoS Mitigation 656 |
| Denied IP 上位 | 34.146.215.182 (277) / 35.240.137.66 (263) / 45.138.12.52 (92) / 85.208.96.195 (6) / 85.208.96.194 (2) |

**【厳守・併記】**

- **この 24 時間窓は E28 適用（2026-09-22 朝・v6）を跨いでいる。** 適用前後が混ざった値であり、後窓（9/22〜9/28）の定常値ではない。
- **前窓の対照値**＝2026-09-21 08:47 JST 取得の Allowed **151.8k**（§29-2）。**窓の起点が異なる**ため差分をそのまま効果と読まない。
- **E28-1（PerplexityBot の rate_limit）は Rules のマッチ一覧に現れず、Rate Limited も「-」である。** **解釈しない**——rate_limit は閾値（30/分）超過時にのみ計上されるため、「効いていない」とも「超過がなかった」とも本記録からは言えない。
- **`served:500` の行数（代理指標）は本記録では未取得。** 日次記録で併記する。

---

## 7. 不変・逸脱

- **読み取りのみ**。投稿・返信・フォロー・いいね・ブックマークはしていない。クリックは「プロフィールを表示する」（センシティブ interstitial）のみ。
- `x_targets.status` は触っていない（HUMAN 専権）。`posts`・Make・本番コードは不触。
- **逸脱 1 件（自己申告）**: 停止判定に確実に当たる 6 アカウント＋priority 3 の 2 件については、**本文を取得せずに URL と時刻のみ記録した**（所要時間の都合）。従来の運用では全行を `input.txt` に入れて `checkStop` に通していた。**本件では停止判定を CTO が手で確認しており、ツールの機械判定を通していない。** 要否は CSO。
- **取得不能 1 件**: `PREMIUM_AV`（§2-2）。
