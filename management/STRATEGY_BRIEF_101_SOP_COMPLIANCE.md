# STRATEGY BRIEF 101 — 4大業務SOPに基づくドメインインデックス統制（正規化統合）

## 1. 背景および目的
`app.vodnavi.jp` および `vodnavi.jp` におけるインデックス汚染および評価分散を防ぐため、e82a670にて確定した最高法律（self-canonical consolidation）の運用を徹底する。

## 2. インデックス方針の絶対不変条件（最高法律）
- **成約拠点（app-concierge）**:
  - `?sort=` などの動的パラメータクエリを含むURLに対し、安易な `noindex` は採用しない。
  - すべての動的クエリURLは、対応する固有の slug 付き正規絶対URL（例: `/works/[floor]/[id]` または `/genres/[id]`）へと向く `rel="canonical"` を厳格にバインドし、Google側のシグナルを1箇所に集約（Consolidation）せよ。
- **データ駆動型のドメイン識別**:
  - 凍結資産である `moterist.com` （?source=moterist）からのセッションおよびコンバージョンは、GA4のホスト名およびカスタムディメンションを用いて冷徹に識別し、vodnavi.jp / app.vodnavi.jp の純粋なSEOインパクトと混同せよ。
