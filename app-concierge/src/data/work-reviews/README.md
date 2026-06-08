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

## 実コール (live モード) 状態

**2026-06-01 時点で本セクションは履歴記録**。下記 1-3 はすべて配備済で、batch script
は `--mode=live` 起動時に本物の OpenAI コールを実行する。current state:

1. ✅ `@ai-sdk/openai` (^3.0.65) は `app-concierge/package.json` に投入済
2. ✅ `scripts/generate-work-reviews.ts` の `callCcoForReview` 内 OpenAI 呼出は
   uncomment 済（lines 384-390 で `openai(modelName)` + `generateText` を実行）
3. ✅ `OPENAI_API_KEY` は `app-concierge/.env.local` に投入済（2026-06-01 rotation 後）

### 実 batch 起動方法（注意：本物の OpenAI コール = 課金発生）

```bash
cd app-concierge
node --experimental-strip-types scripts/generate-work-reviews.ts --mode=live --force
# 単一 cid のみ live 検証する場合:
node --experimental-strip-types scripts/generate-work-reviews.ts --mode=live --target=gkok00002 --force
```

### 安全弁

- `parseCli` の default は `mode=dry`（line 153）。誤って money-burning な live モード
  が走らないようガード。`--mode=live` または `--no-dry-run` 系の明示フラグが必要。
- すべての既存 27 cid review は **2026-05-27 時点で `source: live` 生成済**
  （prompt_version `cco-review-v1.1.1`）。再生成は新 key 鮮度確認 / プロンプト改版時のみ。

## 命名規約

- `content_id` は **小文字 + 数字 + `_`** のみ。FANZA cid 仕様に従う。
- 1 ファイル = 1 cid。複数 cid の合成は禁止。
- 削除する場合は git で削除 → 次回ビルドで `getWorkReview` が undefined を返し
  作品詳細ページは「VODNAVI Review」セクションを描画しない (黙って消える)。
