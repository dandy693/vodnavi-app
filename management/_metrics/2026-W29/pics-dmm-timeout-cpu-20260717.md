# pics.dmm.co.jp タイムアウト起因 Function CPU急増 調査記録

- 実施: CTO (Claude) 2026-07-17 06:10-06:20 JST。異常検知: CPU 0.02h/5分(=72 CPU秒/5分・絶対量微小)・開始 7/17 03:40 JST

## 1. 発生箇所の特定(コード全数調査)

| 箇所 | 用途 | タイムアウト | 評価 |
|---|---|---|---|
| **`client.ts probeImageUrls`** | 一覧系fetch後の画像生存HEAD検証(最大100件並列・home/genres/actresses/concierge tools) | **2,000ms/URL**・AbortController・失敗はhead_failで除外 | **本件の発生箇所(確定)** |
| `/api/og/route.tsx fetchImageOutcome` | 合成OGカード用のpics.dmm本体取得 | 6,000ms・多段フォールバック(必ず200) | スパイク帯リクエスト**ゼロ**=無関係 |
| next/image(remotePatterns) | pics.dmm/pics.dmm.com許可 | — | `FanzaImage`がFANZA系ホストを**`unoptimized`で素通し**=Vercel Image Optimizationはpics.dmmを取得しない構成(取得元遅延を被らない)。remotePatternsは保険 |

## 2. 実害の計測(ログ実測)

- **メカニズム**: 正規クローラー波(7/16 20:00〜継続)によるISR MISS連発で works/actresses/genres の再生成が毎分走行 × pics.dmm の**一部URLがHEAD無応答**(散発) → 該当probeが2,000msフルに待つ → Function duration/CPUが微増。`[fanza-filter]` ログで物理確認: 健全時 took_ms=50〜300ms・タイムアウト時 **took_ms=2,002〜2,037(2,000ms張り付き)・head_fail=1〜3**
- **頻度**: スパイク帯(03:40〜04:20 JST)で数分に1回程度の散発(全体の1割未満)。pics.dmm CDN自体は生存(同時間帯にプレースホルダ3〜4KBの正常応答も多数=特定URLの無応答)
- **ユーザー影響: なし** — 全リクエスト**200維持**・エラー0件(該当窓のランタイムエラーはGUARD/400/500ゼロ)。head_failしたアイテムは一覧から防御的に除外されるのみ(NOW PRINTING露出防止と同じ挙動)。ページ生成は完了している
- **現況(06:10 JST)**: 同パターンが低頻度で残存(took_ms≈2,035が散発)だが大勢は健全(head_fail=0・~100ms)。**収束傾向**

## 3. 防御案(実装はCSO承認後)

1. **probeタイムアウト短縮 2,000→1,200ms**(`imageValidationTimeoutMs`既定値の変更・1行)。健全時実測50〜300msに対し十分なマージンを残しつつ、無応答時の保持時間を40%削減。誤除外リスク: P99でも数百ms実測のため小
2. 失敗時フォールバックは**現行維持を推奨**(head_fail=除外)。「検証スキップで通す」への変更はNOW PRINTING露出のregression(BRIEF_057系の防御を弱める)ため非推奨
3. **R1-b②スコープへの追加所見: 含めるべき**。ただしAPI系の「同時実行上限+バックオフ」より、画像probeには「**pics.dmm連続タイムアウトN回で60秒間probeを回路遮断(circuit breaker)し無検証通過ではなく“検証保留=除外なし側に倒さず、直近probe結果を再利用”**」が適合。R1-b②設計時に1項目として起票
4. **緊急度判定: 恒久対応は不要・頻度監視で足りる**。根拠: (a)200維持・エラー0=ユーザー実害なし (b)CPU絶対量が微小(72秒/5分) (c)既存2,000msタイムアウト+除外フォールバックが設計どおり機能(7/6型と違い「防御がない」のではなく「防御が働いた形跡がメトリクスに出た」事案) (d)増幅要因のボットクロール波は一過性。**定常監視に「[fanza-filter] took_ms=2000張り付きの頻度」を追加**し、日次で1時間あたり数十件超が継続する場合に上記1を発動
