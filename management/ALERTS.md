# ALERTS — 異常検知の自動エスカレーション・ボード

> Claude Code が自動検証で異常を発見した場合、本ファイル末尾に **新しいエントリを追記** する。
> HUMAN が帰宅後に一瞬で検知できるよう、フォーマットを固定する。
> 解決済みのアラートは消さず `status: resolved` に更新し、対応内容と解決日を併記する（履歴を残す）。
> 詳細スタックトレースや HTTP ペイロード等の機微情報は `_metrics/<YYYY-WW>/post-injection-anomalies.md` に分離し、本ファイルはサマリのみとする。

## フォーマット規約

各アラートは独立した H3 ブロックとして追記する：

```markdown
### YYYY-MM-DD HH:MM JST — [severity] 症状サマリ

| 項目 | 値 |
|---|---|
| status | open / acknowledged / resolved |
| severity | low / mid / high |
| target | 対象（例：moterist.com 1095 / app.vodnavi.jp / GA4 G-GG7JV9MJRW） |
| symptom | 観測された症状（1〜2 行） |
| suspected_cause | 推定原因 |
| recommended_action | 推奨アクション |
| backup_path | 関連バックアップ（差し戻し可能なファイルがあれば） |
| anomaly_log | 詳細ログのパス（`_metrics/<YYYY-WW>/post-injection-anomalies.md` 等） |
| github_issue | 自動起票した Issue URL（あれば） |

**メモ**：自由記述で対応中の判断や追加情報を残す。
```

## severity 判定基準

| severity | 例 |
|---|---|
| **high** | 本番 HTML から装飾要素が消失 / API が 500 を継続 / GA4 が完全沈黙 / SSH 接続不能 |
| **mid** | 一部の `ai_affiliate_click` が記録されない / Search Console のクエリ順位が 10 位以上下落 / `_gl` パラメータ継承失敗 |
| **low** | タグ品質「要確認」issue 増加 / 警告レベルのコンプラ表記揺らぎ |

## 通知後のフロー

1. HUMAN が ALERTS.md を確認（手動 or GitHub Issue 通知経由）。
2. 状況に応じて自分で対処、または Claude Code に「ALERTS.md の YYYY-MM-DD HH:MM のエントリに対処して」と指示。
3. 対処完了後、エントリの `status` を `resolved` に更新し、対応内容と解決日を末尾メモに追記。

---

<!-- 自動アラートはこの行より下に追記される。手動でエントリを書く場合も同フォーマットに従うこと。 -->
