# work-reviews/ — CCO 自動生成レビュー配置先

`/works/[floor]/[id]` の作品詳細ページに、検索直撃層 (96.99% of GA4 hostname
= app.vodnavi.jp) 向けの Information Gain 段落として SSR で焼き込まれる
レビュー本文を、`{content_id}.md` 単位で配置するディレクトリ。

## 生成パイプライン

```
scripts/cco-target-cids.ts          物理監査 TOP10 品番リスト (SC clicks 降順)
        │
        ▼
scripts/cco-review-prompt.ts        BRAND_DESIGN_GUIDE 準拠の system + user
        │                            プロンプト + dry-run fixture フォールバック
        ▼
scripts/generate-work-reviews.ts    FANZA Webservice からメタ取得
        │                            → CCO 呼出 (or fixture)
        │                            → frontmatter + 本文を md に書き出し
        ▼
src/data/work-reviews/{cid}.md      ← ここ。1 品番 = 1 ファイル
        │
        ▼
src/lib/work-review.ts              server-only ローダ
        │
        ▼
(site)/works/[floor]/[id]/page.tsx  「VODNAVI Review」セクションを SSR
```

## ファイル契約 (frontmatter)

| key | 必須 | 例 | 役割 |
|---|---|---|---|
| `content_id` | ✅ | `gkok00002` | ファイル名と一致する FANZA cid |
| `title` | ✅ | `"制服マ○コ拡張少女 鳥羽みもり"` | 作品タイトルのスナップショット |
| `actresses` | optional | `["鳥羽みもり"]` | 取得時点のキャスト |
| `source` | ✅ | `live` / `fixture` | CCO 実コール由来 or モックアップ fixture |
| `prompt_version` | ✅ | `cco-review-v1.0.0` | プロンプト改版時の追跡 |
| `generated_at` | ✅ | `2026-05-28T...Z` | 生成時刻 ISO8601 |
| `body_chars` | optional | `412` | 本文文字数 (300-500 を期待) |

frontmatter の後ろに本文。空行で段落区切り。

## 走らせ方

```bash
cd app-concierge

# 全 TOP10 を dry-run で配置（既存ファイルはスキップ）:
node --experimental-strip-types scripts/generate-work-reviews.ts --dry-run

# 単一品番のみ強制再生成:
node --experimental-strip-types scripts/generate-work-reviews.ts \
  --dry-run --target=gkok00002 --force
```

## 実コール (live モード) 解放手順

モックアップ段階では OpenAI 呼出はスタブ化されている (`callCcoForReview` が
`--mode=live` で throw する)。本番運用に切替えるとき:

1. `pnpm add @ai-sdk/openai`（または `npm i`）で provider 追加
2. `scripts/generate-work-reviews.ts` の `callCcoForReview` 内 TODO ブロックを
   有効化（`openai("gpt-5")` + `generateText`）
3. `app-concierge/.env.local` に `OPENAI_API_KEY` を投入
4. `--mode=live --force` で再実行

## 命名規約

- `content_id` は **小文字 + 数字 + `_`** のみ。FANZA cid 仕様に従う。
- 1 ファイル = 1 cid。複数 cid の合成は禁止。
- 削除する場合は git で削除 → 次回ビルドで `getWorkReview` が undefined を返し
  作品詳細ページは「VODNAVI Review」セクションを描画しない (黙って消える)。
