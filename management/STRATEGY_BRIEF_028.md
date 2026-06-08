---
title: "STRATEGY_BRIEF_028：cPanel物理境界ロールバック、および土曜定期監査最終突入命令"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_028

## 1. 目的と防衛ライン
`moterist.com` の全停止（HTTP 500）を爆破し、2026年06月06日 10:00 JSTに迫る「土曜定期監査」の測定ライン（1.4%のクロスドメインインフロー）を無事開通させる。

## 2. HUMAN 物理復旧ランブック（cPanel 最短一撃ルート）
1. cPanel ファイルマネージャーより `public_html/moterist.com/wp-content/themes/the-thor-child/` へ潜入。
2. 現在の `functions.php` を `functions.php.broken_20260603` へリネーム。
3. 同ディレクトリ内の `functions.php.bak_linker_20260516_073641` (3,549 B) または `functions.php.bak_20260524_073732` (17,069 B) をコピーし、`functions.php` へリネーム配置。
4. ブラウザ再読込で HTTP 200 回帰を確認。
