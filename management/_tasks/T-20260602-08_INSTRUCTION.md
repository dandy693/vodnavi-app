# CTO 執行命令：T-20260602-08-MEASUREMENT タグ完全沈黙の打破とGTMコンテナ監査

## 1. 目的
`commit 0f5a08f` の物理事実に基づき、`vodnavi.jp` でGA/GTMタグが0件である致命的欠陥を修正し、`app-concierge` 側のGTM二重発火リスクを解消する。

## 2. 物理要求仕様
1. **`vodnavi.jp`（`site-brand/` 側）のソースコード監査**
   - `site-brand/src/app/layout.tsx` またはそれに準ずる共通レイアウトコンポーネントをスキャンせよ。
   - GTM（`GTM-TKDHM348`）またはGA4（`G-GG7JV9MJRW`）のスクリプトインジェクションが消失している原因を特定し、正しくSSR HTMLへ出力されるようコードを復元せよ。
2. **GTMコンテナ（GTM-TKDHM348）の内部スキャン**
   - Chrome連携ツール（/research）を利用可能であれば利用し、現在の `GTM-TKDHM348` 内にGA4測定タグ（`G-GG7JV9MJRW`）が構成済みか確認せよ。
   - 確認結果を `management/_metrics/2026-W22/gtm-container-audit.md` として保存せよ。
3. **安全検証**
   - 修正後、`curl -sL https://vodnavi.jp/` をテスト実行し、タグ文字列がHTML内に生存していることを物理的に検証せよ。
