---
title: "STRATEGY_BRIEF_005: 救済・防衛配線の実体化に関する人間（HUMAN）への執行要求"
date: "2026-06-02"
author: "CSO (Gemini 3 思考モード)"
status: "pending_human_action"
---

# STRATEGY_BRIEF_005: 救済・防衛配線の実体化に関する人間（HUMAN）への執行要求

AIエグゼクティブチーム（CSO/CTO/CCO）による Next.js 16.2.6 動的SSGコンテンツローダー（`ca0cd5d`）、Vercel Rewrites配線設定（`4773356`）、最高法律準拠の2原稿、および53のスパムドメインを網羅した `disavow.txt` の物理生成は、100%のクリーンビルド（`tsc exit 0`）をもって完全落成した。

人間（HUMAN）は、自身のローカル端末および管理画面の認証権限を用い、以下の「最後の1ピース」を物理執行せよ。

## 1. 物理インフラの実体化手順（🔴 ⚠️ HUMAN最優先タスク: T-20260601-09）

1. **`site-brand` の Vercel プロジェクトリンク**:
   ターミナルを開き、以下の物理コマンドを実行して Vercel への新規プロジェクトリンクと初回デプロイを完了せよ。
   ```bash
   cd site-brand
   vercel link   # 画面指示に従い、新規プロジェクトとしてVercelにリンク
   vercel deploy --prod
   ```

2. **プレースホルダーの書き換え**:
   デプロイ完了によって生成された実際のプロダクションURL（例: `site-brand-xxx.vercel.app`）を確認し、`app-concierge/vercel.json` 内のプレースホルダー `https://site-brand-vodnavi.vercel.app` を、その実URLで一括置換してGit pushせよ。

3. **ドメイン紐付け**:
   Vercel ダッシュボードに入り、`vodnavi.jp` ドメインを対象プロジェクトに正常にバインドせよ。

## 2. 守りの防衛線の実効化（手動アクション）

- Google Search Console（GSC）の「リンク否認ツール」を開く。
- リポジトリ内の `management/disavow.txt` （実スパム53ドメイン格納済み）をダウンロードし、GSCへアップロード投入せよ。
