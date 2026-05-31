# VODNAVI-GROUP TASK BOARD

## [WIP] 認証情報ローテーション・GA4物理データ連携フェーズ
- [ ] **T-03-SR1**: Anthropic API Key ローテーション検証（HUMANのConsoleステータス確定待ち）
- [/] **T-03-SR2**: GA4スクリプト（scripts/pull-ga4.ts）のスタブモード検証 (`2026-05-31` 執行)
- [ ] **T-03-SR3**: 物理環境変数（GA4_PROPERTY_ID / GA4_ACCESS_TOKEN）配備後の本番通信疎通
- [ ] **T-03-SR4**: _metrics/ への実トラフィックデータ（ホスト名識別）の着弾確認

## [Pending] HUMAN判断・決済待ちセクション
- [ ] Ahrefs 有料プラン契約およびRAWレポートのエクスポート（T-05-AR1）

## [Done] 5月度監査・過去記事サルベージ
- [x] 過去記事資産5本のサルベージおよび構造解析（4cc190e landed）
- [x] リンカー設定の直接注入（moterist.com / functions.php 物理補正完了）
```

#### 3. Git landed シーケンスの実行
上記のスタブ実行結果のJSON（もし生成された場合）および更新した `TASK_BOARD.md` をステージングし、ガバナンス規約に則ったコミットメッセージでコミットしてください。

```bash
git add management/TASK_BOARD.md _metrics/
git commit -m "chore: state sync to TASK_BOARD and pull-ga4 stub verification [skip ci]"
```
執行完了後、物理的な成否（エラーの有無、生成されたファイルの有無）を冷徹に報告してください。