# VODNAVI

FANZA に特化した VOD アフィリエイトサイト。Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui で構築。スマホファースト、ダーク × ゴールドの高級感あるデザイン、CVR を意識したレイアウト。

## Tech stack

- **Framework**: Next.js 16 (App Router, RSC)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (base-nova preset)
- **Fonts**: Noto Sans JP (sans) / Cormorant Garamond (heading)
- **API**: DMM/FANZA 商品情報API v3.0

## Getting started

### 1. 依存関係インストール

```bash
npm install
```

### 2. 環境変数を設定

`.env.local.example` をコピーして `.env.local` を作成し、DMM アフィリエイト管理画面で発行した API ID / アフィリエイト ID を入力します。

```bash
cp .env.local.example .env.local
```

```env
DMM_API_ID="your_api_id_here"
DMM_AFFILIATE_ID="your_affiliate_id-990"
```

### 3. 開発サーバー

```bash
npm run dev
```

`http://localhost:3000` を開きます。

## アーキテクチャ

| 役割 | パス |
| --- | --- |
| FANZA API 型定義 | `src/lib/fanza/types.ts` |
| FANZA API クライアント | `src/lib/fanza/client.ts` |
| トップページ (RSC) | `src/app/page.tsx` |
| ヘッダー / フッター | `src/components/site-{header,footer}.tsx` |
| ヒーロー | `src/components/hero-section.tsx` |
| 商品カード / グリッド | `src/components/product-{card,grid}.tsx` |
| 検索 (CSC) | `src/components/search-form.tsx` |
| 並び替え/絞り込み (CSC) | `src/components/filter-bar.tsx` |

検索・並び替え・絞り込みはすべて URL クエリパラメータ (`?keyword=...&sort=...&floor=...`) で表現され、Server Component が同パラメータを基に FANZA API を叩く構成。クライアント側は `useTransition` で滑らかに遷移します。

## CVR を意識したポイント

- ファーストビュー直下にプレミアム感のあるヒーロー + 検索バー
- カードは画像比 3:4 で女優・ジャンル・価格・評価をワンビューで提示
- 各カード下部にゴールドグラデーションの **「今すぐ視聴 →」** CTA
- カード全体も CTA 含めて `affiliateURL` リンク。`rel="sponsored"` を付与
- 画像は `next/image` で最適化 + LCP 用に上位 4 件に `priority`
- ホバーで微妙な持ち上がり + ゴールドのリングで「触れる」感

## デプロイ

Vercel が最も相性が良い。環境変数 `DMM_API_ID` / `DMM_AFFILIATE_ID` を設定するだけでそのままデプロイ可能。

## 免責

当サイトは FANZA 公式アフィリエイトプログラムに参加し、商品情報を表示するに留まります。閲覧・購入はすべて FANZA 公式上で行われます。
