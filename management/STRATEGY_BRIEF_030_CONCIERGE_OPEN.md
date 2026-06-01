# STRATEGY BRIEF 030 — Concierge App の OpenAI スタブコード解除と真の『ビブリア・エロティカ』接客パイプライン全面開通

## 1. 目的
Moteristの5大資産解放によって流入する送客トラフィック（上流目標 CTR_app: 6.0%）を完璧な成約率で刈り取るため、`app-concierge` 内に眠っている OpenAI 呼び出し（`@ai-sdk/openai`）のスタブ（TODO uncomment）を安全に解除し、コンシェルジュチャットの知性的成約エンジン（下流目標 CVR: 11.1%）を100%の出力で実稼働（全面開通）させる。

## 2. コア不変条件（CTOへの絶対要求）
- **ID分離の盾の維持**:
  スタブ解除に際し、環境変数 `NEXT_PUBLIC_FANZA_AFFILIATE_ID` が、本番用のマスターID（`moterist-990`）からローカル開発用テストIDへ先祖返り・汚染されることを永久に禁止する。すべてのリンク生成は必ず `buildAffiliateURL` 抽象ビルダ層を経由させよ。
- **年齢確認の盾の強制**:
  OpenAIのエンジンが実稼働して成人向け作品の動的カード提案（`product_click`）を行う前に、サーバーサイド（middleware）およびブラウザ側のクッキー（`vodnavi_age_verified=1`）による18禁年齢確認ゲートが完全遮断状態で機能しているかを再検証せよ。
- **異常検知のSOS動線**:
  実稼働テスト中にAPIが500エラーを継続、あるいはGA4の `product_click` が沈黙するなどの高severityな異常を検知した場合は、ただちに `management/ALERTS.md` にサマリを追記し、自動修復を試みずに判断を保留して HUMAN にエスカレーションせよ。
