# B2①(PR #62)デプロイ後チェック【CSO指示・8/2】

- 実施: **2026-08-02 22:20:30 〜 22:24:21 JST**(PowerShell 実測)
- 取得元: git(ローカル `main`)/ Vercel API(deployment の epoch を秒単位で取得するため。Chrome連携ではms精度の取得ができないため代替手段を使用)/ 本番HTML=PowerShell `Invoke-WebRequest`
- 事実の転記のみ。Phase 1 で停止

---

## 0. マージ時刻に関する実測（CSO申告値との差）

| 項目 | 実測値 |
|---|---|
| マージコミット | `98b6389b40e27838cbf8a7985f00517db944a980`（Squash・`… (#62)`） |
| **git author date / committer date** | **2026-08-02 22:17:48 JST**（両方同一） |
| Vercel `repoPushedAt` | **2026-08-02 22:17:48 JST** |
| CSO申告のマージ時刻 | 2026-08-02 22:19:07 JST |

- **実測は 22:17:48 JST**で、申告値 22:19:07 とは **79秒の差**がある
- 後述のとおり**デプロイは 22:18:52 に READY 済み**であり、申告時刻(22:19:07)より前に完了している
- ※どちらが正しいかの判断は行わない。以降の時系列はすべて**実測値**を用いる

---

## 1. Vercel 本番デプロイの完了確認

| 項目 | 値 |
|---|---|
| デプロイID | **`dpl_DNxphC9J8ffBgrV6QRBrdbNtCZWt`** |
| プロジェクト | `vodnavi-app`（`prj_42GkXv2njAJTxYbmDoLdP8JoZbkx` / team `team_xZz5NtMS95tDQ2Vde65faOzc`） |
| コミットSHA | `98b6389b40e27838cbf8a7985f00517db944a980`（PR #62） |
| ブランチ | `main` |
| target | **production** |
| **state / readyState** | **READY** |
| リージョン | `hnd1` |
| bundler | turbopack |
| 署名検証 | `githubCommitVerification: verified` |

**時系列（すべてJST秒単位・Vercel epoch から換算）**

| イベント | 時刻(JST) | 経過 |
|---|---|---|
| repoPushedAt（マージのpush） | **2026-08-02 22:17:48** | — |
| deployment created | **2026-08-02 22:17:51** | +3秒 |
| buildingAt（ビルド開始） | **2026-08-02 22:17:52** | +4秒 |
| **ready（デプロイ完了）** | **2026-08-02 22:18:52** | **+64秒**（ビルド所要 **60秒**） |

**エイリアス（本番反映先）**: `app.vodnavi.jp` / `vodnavi-app.vercel.app` / `vodnavi-app-hdktchkw33-gmailcoms-projects.vercel.app` / `vodnavi-app-git-main-…`
→ **`app.vodnavi.jp` に割り当て済み**（`aliasError: null`）

---

## 2. 公開後チェック 第4項（Canceled 確認）

| 項目 | 結果 |
|---|---|
| **本デプロイ（PR #62 / `98b6389`）の state** | **READY（Canceled ではない）** |
| 直近のCANCELEDデプロイ | 4件（`cbdc3a7` 22:02:37 / `645d5aa` 07:54:44 / `4e397bd` 07:29:55 / `8fdd300` 06:32:24 ※すべて 8/2） |
| CANCELED 4件のコミット内容 | **すべて `management/_metrics/` 配下のドキュメントのみ**（`metrics:` 接頭辞） |

- CANCELED は `app-concierge/vercel.json` の `ignoreCommand` によるビルドスキップ（docs のみのコミットで意図的に発生する既知の最適化）であり、**障害ではない**
- **今回のコード変更コミットは正しくビルドされ READY に到達している** → 第4項 **合格**

---

## 3. 公開後チェック 第5項（sitemap 生成時刻）

| 項目 | 実測値 |
|---|---|
| URL | `https://app.vodnavi.jp/sitemap.xml` |
| HTTP status | **200** |
| **`<lastmod>`（先頭・生成時刻）** | `2026-08-02T13:18:10.844Z` → **JST 2026-08-02 22:18:10** |
| 収録URL数 | **3,012** |
| `x-vercel-cache` | **MISS** |
| `age` | **0** |
| `cache-control` | `public, must-revalidate, max-age=0` |
| 取得時刻 | 2026-08-02 22:24:21 JST |

- 生成時刻 **22:18:10** は、ビルド開始(22:17:52)と READY(22:18:52) の**間**に位置する → **今回のビルド時に再生成されている**
- デプロイREADYの **42秒前**に生成 → 第5項 **合格**

---

## 4. 公開済み7記事の出力確認

### 4-1. 実測結果（デプロイ後・2026-08-02 22:24 JST）

| # | パス | status | 配信dpl | `[text](/articles/slug)` パターン | `<a href="/articles/…">` | 本文文字数 |
|---|---|---|---|---|---|---|
| 1 | `/articles/fanza-first-guide` | 200 | `dpl_DNxph…` | **0** | **0** | 2,319 |
| 2 | `/articles/fanza-tv-free-trial` | 200 | `dpl_DNxph…` | **0** | **0** | 3,242 |
| 3 | `/articles/fanza-kaiyaku` | 200 | `dpl_DNxph…` | **0** | **0** | 3,644 |
| 4 | `/articles/fanza-tv-guide` | 200 | `dpl_DNxph…` | **0** | **0** | 3,056 |
| 5 | `/articles/fanza-tv-review` | 200 | `dpl_DNxph…` | **0** | **0** | 3,634 |
| 6 | `/articles/fanza-payment-statement` | 200 | `dpl_DNxph…` | **0** | **0** | 2,911 |
| 7 | `/articles/fanza-payment-methods` | 200 | `dpl_DNxph…` | **0** | **0** | 3,104 |

- **全7記事が新デプロイ（`dpl_DNxphC9J8ffBgrV6QRBrdbNtCZWt`）から配信されている**
- **マークダウン内部リンクパターン = 全記事 0**（プリフライト時の実測値と同一）
- **記事本文に描画された `/articles/` 向けアンカー = 全記事 0**
- → **新規リンクは1本も描画されていない＝公開面は無変更**（期待値どおり）

### 4-2. 検証手法の限界（明記）

- **デプロイ前後のバイト単位の差分は取得できていない**。理由: 直前の本番デプロイURL（`vodnavi-7npu4zch5-…vercel.app`）にアクセスすると **302 リダイレクト（Deployment Protection）** となり、旧出力を取得できなかった
- 代替として検証したのは以下の**不変条件**:
  1. レンダラの入力となるマークダウンリンクパターンが **0（デプロイ前後とも実測）**
  2. 出力側の `/articles/` アンカーが **0**
  3. 全記事 HTTP 200・新デプロイから配信
- 上表の本文文字数は、**今後の比較用の post-deploy ベースライン**として記録する

---

## 5. ホワイトリスト取得失敗時のフェイルセーフ（コード再確認）

### 5-1. データ取得層（`src/lib/editorial-articles.ts` L74-86・原文）

```ts
export async function getPublishedArticleSlugs(limit = 1000): Promise<string[]> {
  const supabase = getServiceRoleClient();
  if (!supabase) return [];                 // ① クライアント未生成(env欠落等) → 空配列

  const { data, error } = await supabase
    .from("editorial_articles")
    .select("slug")
    .eq("publish_status", "published")
    .limit(limit);

  if (error || !data) return [];            // ② クエリ失敗 / データなし → 空配列
  return (data as { slug: string }[]).map((r) => r.slug);
}
```

→ **throw する経路が存在しない**。失敗時は必ず `[]` を返す

### 5-2. 呼び出し層（`articles/[slug]/page.tsx` L129-130）

```ts
const publishedSlugs = new Set(await getPublishedArticleSlugs());
```
→ 取得失敗時は**空の Set**

### 5-3. 描画層（`renderBodyText`）

```ts
for (const m of text.matchAll(ARTICLE_LINK_RE)) {
  const [whole, label, slug] = m;
  const at = m.index ?? 0;
  if (!publishedSlugs.has(slug)) continue;      // ③ 非公開/未取得 → cursor を進めずスキップ
  if (at > cursor) nodes.push(text.slice(cursor, at));
  nodes.push(<Link … />);
  cursor = at + whole.length;
}
if (nodes.length === 0) return [text];          // ④ 1件もリンク化されなければ原文をそのまま返す
if (cursor < text.length) nodes.push(text.slice(cursor));
```

**構造の確認結果**

| ケース | 挙動 |
|---|---|
| ホワイトリスト取得失敗（空 Set） | 全候補が③でスキップ → ④で **`[text]`（原文そのまま）** を返す |
| 一部が非公開slug | ③でスキップし **cursor を進めない**ため、当該箇所は次の `text.slice(cursor, at)` に含まれ**原文のまま残る**（欠落しない） |
| 末尾に残余テキストあり | ⑤ `cursor < text.length` で末尾を push（切り捨てなし） |
| 例外送出 | **なし**（データ層が throw しない） |

→ **フェイルセーフは構造として機能する**。取得失敗時の最悪ケースは「全リンクがプレーンテキストのまま」であり、**本文の欠落・描画破壊・500 は発生しない**

---

## 6. §6 事前登録（数値を見る前の取り決め）

登録日時: **2026-08-02 22:24:21 JST**

1. **B2①デプロイ後に順位が動かなくても想定どおり**とする。順位の不動をもって B2① を失敗と判定しない
2. **公開面は無変更が期待値**。**変化があれば異常として報告する**
   - 本日の実測(§4-1)は「新規アンカー0・mdパターン0・全記事200」で**期待値どおり**
   - 監視対象の不変条件: `[text](/articles/slug)` パターン数 / `<a href="/articles/…">` 数 / HTTPステータス / 本文文字数(§4-1 の値をベースラインとする)
3. **権威施策の本体は B2②**（内部リンク3層）であり、B2①は**その基盤（レンダラ対応）**である
4. 本デプロイに `internal_links` テーブルは関与しない（PR #62 は当該テーブルを参照しない実装であることを確認済み）。DDL 適用は **HUMAN 枠のまま未実施**

---

## 7. 結果サマリ

| チェック項目 | 結果 |
|---|---|
| 1. Vercel 本番デプロイ完了 | **READY / 2026-08-02 22:18:52 JST**（ビルド60秒） |
| 2. 第4項 Canceled 確認 | **合格**（本デプロイは READY。CANCELED 4件は docs のみコミットの既知の意図的スキップ） |
| 3. 第5項 sitemap 生成時刻 | **合格**（`2026-08-02 22:18:10 JST` 生成・3,012 URL・cache MISS） |
| 4. 公開済み7記事の出力 | **無変更（期待値どおり）**。全記事で新規アンカー0・mdパターン0・200 |
| 5. フェイルセーフ構造 | **機能する構造であることをコードで再確認**（throw なし・原文フォールバック・欠落なし） |

**異常は検出されなかった。**

> 本記録は実測値の転記のみ。施策提案は記載していない。
