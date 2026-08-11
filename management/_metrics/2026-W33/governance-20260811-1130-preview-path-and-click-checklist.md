# 第8便 — draft プレビュー経路の確認 / 実クリック検証手順書 / 8/13 準備状況

- 実施: **2026-08-11 11:20 〜 11:35 JST**
- **記事A の publish（一時 publish を含む）は実施していない**
- 遮断ドメイン（`premium` / `video` / `tv`.dmm.co.jp）へは**一切アクセスしていない**（`al.dmm.co.jp` も踏んでいない＝DMM のクリック数を汚染していない。URL は自サイト HTML から抽出）

---

# タスクA draft 記事のプレビュー経路

## (1) プレビュー経路は**実装上存在しない** — 4系統すべてを実測

| 経路 | 実測 | 結果 |
|---|---|---|
| **記事取得関数** | `src/lib/editorial-articles.ts:59` `.eq("publish_status", "published")` がハードコード。引数でも env でも外せない | **バイパス不可** |
| **Next.js Draft Mode** | `draftMode` / `next/headers` の使用 = **grep 0件** | **未実装** |
| **searchParams によるトークン解除** | `articles/[slug]/page.tsx` に `searchParams` = **0件** | **未実装** |
| **API 経路** | API ルートは `api/age-gate` と `api/concierge` の2本のみ。`editorial_articles` を読む API = **0件** | **存在しない** |

`getPublishedArticleSlugs()`（内部リンクのホワイトリスト・sitemap 用）にも同じ `published` フィルタが掛かっている（L88）。

**補足**: Vercel の Preview デプロイでも解決しない。フィルタは**コード側**にあり、Preview も**同じ本番 Supabase**（`SERVICE_ROLE_KEY`）を読むため、Preview URL でも 404 になる。

## (2) → 該当なし（経路が存在しないため）

## (3) 代替手段の選択肢 — **提示のみ。実行していない**

### 【重要】まず、CTA 4本は **publish なしで今日検証できる**

記事A の CTA は、**既に公開中のページと同一の URL ビルダを同一引数で**呼ぶ。

| 記事A の CTA | 関数と引数 | 同一出力の公開ページ |
|---|---|---|
| `[[CTA:tv_signup]]` | `buildTvSignupURL()`（引数なし） | `/articles/fanza-first-guide` |
| works CTA 3本 | `buildAffiliateURL({ contentId })`（`page.tsx:274`・**contentId のみ**） | `/works/videoa/{content_id}` |

works 詳細も同じ `buildAffiliateURL({contentId})` を使うため、**生成 URL はバイト一致**する。実測（2026-08-11 11:24 JST・自サイト HTML から抽出）:

```
tv_signup : https://al.dmm.co.jp/?lurl=https%3A%2F%2Fpremium.dmm.co.jp%2F&af_id=moterist-004&ch=link_tool&ch_id=link
works CTA : https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D{cid}&af_id=moterist-004&ch=link_tool&ch_id=link
```

| 公開ページ | HTTP | `moterist-004` | **`moterist-99[0-9]`** |
|---|---|---|---|
| `/articles/fanza-first-guide` | 200 | あり（`guide_tv_signup_cta` ×1） | — |
| `/works/videoa/ebwh00155` | 200 | 34 | **0** |
| `/works/videoa/miab00373` | 200 | 34 | **0** |
| `/works/videoa/dass00333` | 200 | 30 | **0** |

**したがって publish が必要なのは「記事A 本体の描画」（見出し10本 / 生マーカー / 内部リンクのアンカー化 / 末尾セクション3本）だけである。**

### 選択肢

| 案 | 内容 | 所要 | 公開露出 | 備考 |
|---|---|---|---|---|
| **案1** | **検証を分割**。CTA 4本を今日 PART 1 で検証 → 描画確認は**本 publish 後の「公開後チェック」に統合** | 追加ゼロ | なし | 一時 publish を一切行わない。描画は CTO の機械照合（4カテゴリ全合格）で既に担保されている |
| **案2** | **一時 publish → 検証 → draft 復帰** | 下記(4) | **あり**（下記(4)） | 本番 URL で描画を実見できる。露出時間の管理が必要 |
| **案3** | **プレビュー経路を実装**（`draftMode()` またはトークン付きルート） | 実装+デプロイ 1サイクル | なし | 恒久的に使える。ただし**新規経路の追加**であり、今回のためだけには重い |
| 案4 | 別 slug の複製行を published で投入して検証 | 案2と同等 | あり | 検証対象が本番 slug と別物になり、片付け漏れリスクが増える。**推奨しない** |

**CTO の推奨は案1**（露出ゼロで、publish が必要な項目だけを本番公開後チェックに寄せられるため）。**選択は CSO。**

## (4) 一時 publish を選んだ場合の復帰手順と所要時間

### キャッシュ実測（所要時間の根拠）

| 対象 | 設定 | 実測箇所 |
|---|---|---|
| 記事ページ | **`export const revalidate = 300`**（5分） | `articles/[slug]/page.tsx:22` |
| `sitemap.xml` | **`export const revalidate = 3600`**（1時間） | `src/app/sitemap.xml/route.ts:18` |
| robots | `allow: "/"`（`/api/` `/_next/` のみ disallow）＝**articles はクロール許可** | `src/app/robots.ts:16` |

### 手順

| # | 操作 | 所要 |
|---|---|---|
| 1 | Supabase SQL Editor で publish：`update editorial_articles set publish_status='published' where slug='fanza-subscription-vs-single-purchase';` | 即時 |
| 2 | 公開面が 200 になるまで待つ | **最大 5分**（404 も ISR キャッシュされるため） |
| 3 | チェックリスト PART 2 を実施 | CSO 次第 |
| 4 | **draft へ戻す**：`update editorial_articles set publish_status='draft' where slug='fanza-subscription-vs-single-purchase';` | **即時（1分未満）** |
| 5 | 公開面が 404 に戻るまで | **最大 5分**（キャッシュ残） |

### 露出の実態（事実）

- **DB 上は即時**に戻る。**公開面には最大5分の尾**が残る（`revalidate=300`）。
- **`sitemap.xml` は最大1時間の尾**。一時 publish 中にサイトマップの再生成（1時間ごと）が走ると、当該 slug が `sitemap.xml` に載り、**draft へ戻した後も最大1時間そのまま残る**。
- 記事パスは robots で**クロール許可**されている。露出中にクローラが取得する可能性はゼロではない。
- **実務上の最短露出**: publish 反映5分 + 検証時間 + 復帰5分 ＝ **概ね 15〜20分**。**この間に sitemap 再生成が当たらなければ**、尾は5分で終わる。

---

# タスクB 実クリック検証チェックリスト → **作成完了**

**`management/checklists/ARTICLE_A_CLICK_VERIFICATION.md`**

## 構成

| 章 | 内容 | publish 要否 |
|---|---|---|
| **0. 事前準備** | 検証用 Chrome の使用 / **GA4 影響なし**（`/g/collect` 不送信＝クリック実測値を汚染しない）/ **⚠ DMM 側のクリック数には計上される**（`al.dmm.co.jp` を実際に踏むため）/ af_id は**遷移前に**右クリックでリンクアドレスを取得して読む（遷移後はアドレスバーから読めない場合がある） | — |
| **PART 1** | CTA 4本（tv_signup / works 3本）の着地先・`af_id=moterist-004`・`990〜999` 不在・**品番一致** | **不要** |
| **PART 2** | 記事A 本体の描画 10項目（生マーカー / `## ` 見出し10本 / 内部リンク2本のアンカー化と遷移 / 末尾セクション3本と順序 / 広告表記 / 記法崩れ） | **必要** |
| **3. 判定** | NG 時は即 CTO 差し戻し。一時 publish 中なら先に draft へ戻す | — |

## 指示された確認項目の割り当て

| 指示の項目 | 割当 |
|---|---|
| 遷移先が正しく着地するか | PART 1（4本すべて） |
| `af_id=moterist-004` か（990〜999 でないこと） | PART 1（4本すべて・期待 URL を明記） |
| works CTA が該当作品の正しいページへ遷移するか | PART 1 項目4（**着地先の品番一致**を判定基準に明記） |
| 内部リンク2本がアンカーとして機能するか | PART 2-3 / 2-4（遷移先の 200 を CTO が実測済） |
| `[[CTA:tv_signup]]` が生マーカーのまま表示されていないか | PART 2-1 |
| 本文のレンダリング崩れ（`## ` 見出し10本） | PART 2-2 / 2-5 / 2-10 |
| 検証用 Chrome の `/g/collect` 不送信の明記 | **0. 事前準備に明記**（併せて DMM 側には計上される点も明記） |

---

# タスクC 8/13 の準備状況

## (1) 観測窓の満了予定 → **変更なし**

| 項目 | 値 |
|---|---|
| `article_product_cta` 7日観測 開始 | **2026-08-06 00:31:05 JST** |
| 満了 | **2026-08-13 00:31:05 JST** |
| 現在（2026-08-11 11:25:48 JST） | 経過 **5.45日** / 残り **1.55日** |
| 8/13 10:00 のアラート発報時刻まで | **46.6時間** |

`T-20260813-R2-EXEC` の着手条件2件（①APCTA 判定完了 ②アラート実地検証）は**いずれも未充足**。R2 は引き続き**実行不可**。

## (2) アラート実地検証 項目1〜4 の実施手順

対象: Airtable base `app0VKGU2B16qny6c` / automation **`wflfLOp2JJo89imzQ`**
実施時刻: **2026-08-13 10:00 JST 以降**（発報スケジュール後）

| # | 項目 | 手順 | 期待値 |
|---|---|---|---|
| 1 | Run history に実行記録があるか | Automations → 当該オートメーション → **Run history** タブ。8/13 10:00 前後のエントリを確認 | **8/13 のエントリが1件存在** |
| 2 | Find records の件数 | 同エントリを開き、`Find records` ステップの出力件数を読む | **0 件**（判定基準日=8/17以降。8/07 時点で 8/17 以降の承認済は0件） |
| 3 | Conditional action group を通過したか | 同エントリで条件分岐ステップが実行済（skipped でない）かを読む | **通過**（件数 < 6 のため true 分岐） |
| 4 | `Send an email` が実行されたか | 同エントリで `Send an email` ステップのステータスを読む | **実行済（Success）** |

**注意（台帳 L2757 の再掲・厳守）**
- **`Test automation` の `Run automation` は押さない**（ライブ実行＝実メール送信になり、8/13 の実測を汚染する）
- Run history の**保持期間は2週間**。8/13 に確認できなければ 8/27 までに実施すること
- CTO は Airtable MCP で項目1〜4 を読み取り可能。**項目5（受信）のみ CSO 枠**

**発報しなかった場合の調査（台帳 L2756）**: ①`Find records` の結果と条件式を確認 ②**Conditional action group がプラン制限で機能していない可能性**を調査

## (3) 項目5 の扱い → **「事前確認済み」として問題ない。ただし覆う範囲は限定的**

| 7/11 の実受信が**証明していること** | 7/11 の実受信が**証明していないこと** |
|---|---|
| Airtable Automations → `moterist.com@gmail.com` の**配信経路が生きている**（2026-07-11 に「X投稿エラー: VODNAVI」を実受信・2通スレッド） | **本オートメーション（`wflfLOp2JJo89imzQ`）の `Send an email` 宛先設定が正しいか**（7/11 の実受信は**別のオートメーション**によるもの） |
| 迷惑メール・ゴミ箱への誤振り分けが起きていない（`in:anywhere` 検索で確認） | 8/13 の実行が**条件分岐を通過するか**（項目3・プラン制限の懸念が未解消） |

**帰結**: 項目5 を「配信経路の事前確認」として扱うのは妥当。ただし、
- **項目4 が「実行済」なのに CSO の受信が0件**だった場合 → **宛先設定の問題**として切り分けられる（経路は生きていると分かっているため）
- **項目1〜4 がすべて期待どおり**なら、項目5 の受信確認は**確証の追加**であって発報有無の判定条件ではない

→ **項目5 は「CSO が受信を確認できればなお良い」に格下げしてよいが、項目4 と食い違った場合の切り分けに価値があるため、確認自体は残すことを推奨する。**

---

# 禁止事項の遵守状況

| 禁止事項 | 状況 |
|---|---|
| **記事A の publish（一時 publish を含む）** | **していない**（draft のまま。案の提示のみで CSO の選択を待つ） |
| `premium` / `video` / `tv`.dmm.co.jp へのアクセス | **していない**（`al.dmm.co.jp` も踏んでいない。URL は自サイト HTML から抽出） |
| af_id 990〜999 の人間向けCTAへの使用 | **していない**（公開3ページの実測でも `moterist-99[0-9]` = **0**） |
| 本文の書き換え | **していない**（DB への書き込みなし） |
| R2 の先行実行 | **していない**（着手条件2件とも未充足を実測確認） |

---

> 本記録は実測値の転記。DB への書き込みは発生していない。
