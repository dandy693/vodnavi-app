# sticky-cta-text

## 採用案
### Main Button
今宵ひらく

### Sub Button
コンシェルジュに相談

---

## 変更履歴

### 2026-09-05（第120便 補遺1 B・CSO裁定）
- **Sub Button: 「司書に相談」→「コンシェルジュに相談」**
  遷移先は `/concierge?source=app_direct&intent=actress&seed_cid=…` の内部遷移で、パス名と自己一致する。
  §25 の文言原則「世界観表現は moterist、機能表記は app」に従う。
  **幅の実測: 13px で 130.0px。375px 端末では収まるが、320px 端末では 10px 超過する。**
  320px を捨てない場合の短縮案は「コンシェルジュ」(91.0px)。**採否は CSO 裁定。**
- **Main Button: 未改名（据え置き）。**
  裁定の例示（作品詳細→「作品を見る」／おすすめ提示→「今夜の1本を探す」）は**実体と一致しない**。
  このボタンは `FanzaAffiliateLink`（`placement="detail_sticky_cta"`）で **外部の FANZA 公式作品ページ**へ出る。
  「遷移先の実体を報告してから最終文言を確定する」という手順に従い据え置いた。
  参考の幅実測: 「FANZAで見る」80.2px ／「FANZA公式で見る」106.2px ／「作品を見る」65.0px ／「今夜の1本を探す」95.3px。
