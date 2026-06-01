# CTO 執行命令：T-20260602-04-ENV 環境変数配線および型防護の実装

## 1. 目的
`commit 5156207` で確定した「案A（3-ID識別運用）」に基づき、成約アプリ（app-concierge）のUIリンクが動的に `moterist-004` を出力するよう、インフラ環境変数層とURLビルダ層を完全に結合・抽象化する。

## 2. 物理要求仕様
1. **環境変数の定義**
   - `app-concierge/.env.example` の末尾に以下を追記：
     `NEXT_PUBLIC_FANZA_AFFILIATE_ID=moterist-004`
   - ローカル開発環境、および本番環境（Vercel側設定を想定）でこの変数が正常にインジェクションされる構造を確保すること。

2. **URLビルダのリファクタリング（型安全の死守）**
   - 対象ファイル：`app-concierge/src/lib/concierge/url-builder.ts`（またはアフィリンクURLを組み立てている核心部コード）。
   - 変更内容：文字列リテラルとしてハードコードされている箇所を全摘出し、`process.env.NEXT_PUBLIC_FANZA_AFFILIATE_ID` を参照する構造に抽象化。未定義時のフォールバックとして安全なエラーハンドリング、またはデフォルト挙動を実装すること。

3. **コンパイル検証**
   - `app-concierge/` ディレクトリ内にて `npx tsc --noEmit` を実行し、型エラーが 0 件であることを物理的に検証せよ。
