# Claude Code リアル執行命令：GTM-TKDHM348 内部タグ構成の物理調査

## 1. コンテキスト
vodnavi.jp のタグ沈黙の真因が Vercel env の未投入（Build-time 消失）と判明。これに伴い、人間が Vercel への変数投入を行う前に、二重発火ポリシー（NEXT_PUBLIC_GA_MEASUREMENT_ID を空で維持するか、G-GG7JV9MJRW を流し込むか）を決定するため、GTMの内部構成を白日の下に晒す必要がある。

## 2. /research を用いた Chrome 連携スキャン要求
- ツール（Chromeブラウザ自動化）を起動し、以下のGTM管理画面URLへ直接アクセスせよ。
  https://tagmanager.google.com/#/container/accounts/6045052955/containers/105439401/workspaces/1
  (※上記アカウント/コンテナIDは GTM-TKDHM348 の物理ダッシュボードを想定)
- ログインアカウントに `moterist.com@gmail.com` (?authuser=2) を選択した状態で、「Tags（タグ一覧）」セクションを目視スキャンせよ。
- **調査要件**: 
  1. コンテナ内に「GA4 設定」または「Google タグ」として **`G-GG7JV9MJRW`** が既に配信登録されているか？
  2. 登録されている場合、そのトリガーは「All Pages（全ページ）」になっているか？
- **アウトプット**: 
  調査結果のテキスト、またはコンテナの「バージョン履歴サマリ」の生テキストをコピーし、`management/_metrics/2026-W22/gtm-container-audit.md` の末尾へ【Chrome実画面監査ファクト】として追記 landed せよ。捏造は最高法律により即差し戻しとなる。
