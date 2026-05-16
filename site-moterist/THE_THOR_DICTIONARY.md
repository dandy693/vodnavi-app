# THE_THOR_DICTIONARY — 装飾ショートコード / HTML 構文辞書

> moterist.com（および vodnavi.jp 再構築時）で使用する **THE THOR テーマの装飾構文を CCO（ChatGPT）が即引用できる辞書**。
> 本辞書に存在しない装飾は記事に混入させないこと。世界観（`BRAND_DESIGN_GUIDE.md` ダーク × ゴールド）の崩壊と、エディタの自動整形による HTML 破壊を同時に防ぐ。
> CCO が生成した記事は、Claude Code が **WP-CLI 経由で DB に直接注入**（`management/OPERATION_MANUAL.md` 参照）するため、 HTML はクラシックエディタ形式の **生 HTML** で出力すること（Gutenberg ブロックコメント `<!-- wp:... -->` は禁止）。

---

## 0. 出力 3 原則

1. **生 HTML 形式で出力**：Gutenberg ブロック構文（`<!-- wp:paragraph -->` 等）は付与しない。クラシックエディタ互換の素の HTML のみ。
2. **改行は `\n` で意味段落のみ**：`<br>` 連打や空 `<p></p>` を入れない（WordPress の `wpautop` が崩す）。
3. **インラインスタイル直書きは原則禁止**：色は `BRAND_DESIGN_GUIDE.md` のクラス・既存ショートコードを経由する。理由：ブランド色変更時に全記事を一括差し替えできる状態を保つ。

---

## 1. 注目ボックス（情報強調枠）

### 1.1 標準注目ボックス（タイトル + 本文）
```html
<div class="sttitlebox is-style-st-default-ttlbox">
  <p class="st-mybox-title">タイトル</p>
  <p>本文。1〜3 行程度で要点を凝縮する。</p>
</div>
```
- 用途：記事冒頭の TL;DR、章末まとめ、定義の明示。
- 注意：`<p class="st-mybox-title">` を必ず先頭に置く。タイトル無しの場合は `<div class="sttitlebox">` を省略してもよいが、装飾意図のない素のテキストの方が読みやすい。

### 1.2 注意喚起（黄）
```html
<div class="sttitlebox is-style-st-default-ttlbox st-mybox-yellow">
  <p class="st-mybox-title">注意</p>
  <p>注意事項を 1〜2 行で。</p>
</div>
```
- 用途：契約解除・課金タイミング・法務上の留意点。

### 1.3 危険喚起（赤）
```html
<div class="sttitlebox is-style-st-default-ttlbox st-mybox-red">
  <p class="st-mybox-title">重要</p>
  <p>守らないと損する内容のみ。多用禁止。</p>
</div>
```

### 1.4 補足（青）
```html
<div class="sttitlebox is-style-st-default-ttlbox st-mybox-blue">
  <p class="st-mybox-title">補足</p>
  <p>本文の流れを乱さない参考情報。</p>
</div>
```

### 1.5 引用 / 出典（金）
```html
<blockquote class="st-cite">
  <p>引用本文。「  」は付けず、blockquote タグで囲うだけ。</p>
  <cite>出典：書籍名 著者名（出版社, 西暦）</cite>
</blockquote>
```
- 用途：心理学・哲学の概念引用（E-E-A-T の Expertise 強化）。1 記事に最低 1 つ。

---

## 2. マーカー / 強調

### 2.1 ゴールド・マーカー（ブランド色）
```html
<span class="st-mymarker">強調したい一文。</span>
```
- 1 記事につき 3 箇所まで。乱用すると視線誘導の効果が落ちる。

### 2.2 太字 / 強い強調
```html
<strong>結論や数値などの最重要部分。</strong>
```
- `<b>` ではなく必ず `<strong>`。SEO とアクセシビリティ双方の理由。

### 2.3 控えめ強調
```html
<em>固有名詞や作品タイトル。</em>
```

---

## 3. 口コミ / 体験談（吹き出し）

### 3.1 標準吹き出し（左）
```html
<div class="st-kaiwa-l">
  <div class="st-kaiwa-img-l">
    <img src="/wp-content/uploads/avatars/persona-01.png" alt="">
  </div>
  <div class="st-kaiwa-text">
    実体験ベースのコメント。です・ます調。
  </div>
</div>
```

### 3.2 標準吹き出し（右）
```html
<div class="st-kaiwa-r">
  <div class="st-kaiwa-img-r">
    <img src="/wp-content/uploads/avatars/persona-02.png" alt="">
  </div>
  <div class="st-kaiwa-text">
    返答や別視点のコメント。
  </div>
</div>
```
- 用途：E-E-A-T の Experience を補強する複数視点。**架空の口コミは禁止**（景表法）。

---

## 4. CTA ボタン（最重要）

### 4.1 公式 CTA（金 Pill・中央）— **moterist.com で現用中の正典**
```html
<div class="btn btn-center">
  <a class="btn__link btn__link-primary"
     href="https://al.dmm.co.jp/?lurl=…&af_id=moterist-001&ch=link_tool&ch_id=link"
     target="_blank"
     rel="noopener sponsored">
    FANZA公式ページで利用前の案内を確認する
  </a>
</div>
```
- 文言：「確認する」志向で統一（`BRAND_DESIGN_GUIDE.md` §1.4 トーン規約）。
- `rel="noopener sponsored"` は必須（コンプラ）。`nofollow` は付けない（FANZA 規約と整合）。
- `af_id`・`ch`・`ch_id` は必ず保持（成果トラッキング）。

### 4.2 内部リンク CTA（コンシェルジュ送客）
```html
<div class="btn btn-center">
  <a class="btn__link btn__link-secondary"
     href="https://app.vodnavi.jp/concierge?source=moterist&intent=beginner">
    迷ったら AI コンシェルジュに相談する（無料）
  </a>
</div>
```
- `?source=moterist` + `&intent=<beginner|actress|discount>` を必ず付ける（`STRATEGY_BRIEF_000_CONTEXT.md` §4b.2）。
- intent 未指定は CCO レビューで差し戻し対象。

### 4.3 アフィリエイト・ダブルリンク（404 フォールバック対応）
```html
<div class="btn btn-center btn-double">
  <a class="btn__link btn__link-primary"
     href="https://al.dmm.co.jp/…/{CONTENT_ID}/…?af_id=moterist-001&ch=link_tool&ch_id=link"
     target="_blank" rel="noopener sponsored">
    作品ページで詳細を確認する
  </a>
  <a class="btn__link btn__link-tertiary"
     href="https://al.dmm.co.jp/…/-/list/=/?searchstr={ACTRESS_OR_SKU}&af_id=moterist-001&ch=link_tool&ch_id=link"
     target="_blank" rel="noopener sponsored">
    出演女優の他作品を一覧で見る
  </a>
</div>
```
- 用途：作品ページが配信終了で 404 になった場合のセーフティネット。CTO 側で抽象化実装される（TASK_BOARD 参照）。
- `{CONTENT_ID}` / `{ACTRESS_OR_SKU}` はテンプレ変数。記事生成時に展開する。

---

## 5. 比較表

### 5.1 標準比較表（3 列・モバイル横スクロール）
```html
<div class="st-tablebox">
  <table class="st-table">
    <thead>
      <tr><th>項目</th><th>FANZA</th><th>競合</th></tr>
    </thead>
    <tbody>
      <tr><td>月額</td><td>¥1,980〜</td><td>¥2,189〜</td></tr>
      <tr><td>独占配信</td><td>豊富</td><td>限定的</td></tr>
    </tbody>
  </table>
</div>
```
- アンカリング配置（`BRAND_DESIGN_GUIDE.md` §7）：**最高単価を左端**、本命（FANZA）を真ん中または右に置く。
- 5 行以上は分割（情報過多で離脱）。

---

## 6. 目次 / 構造化

### 6.1 自動目次（プラグイン依存）
- THE THOR 内蔵の自動目次が `<h2>` `<h3>` から生成。**手動で `<ul id="toc">` を書かない**。
- `<h2>` は 1 記事 5〜7 個、`<h3>` は各 H2 配下 2〜4 個を推奨。

### 6.2 章末まとめ箱
```html
<div class="sttitlebox is-style-st-default-ttlbox">
  <p class="st-mybox-title">この章のまとめ</p>
  <ul>
    <li>要点 1</li>
    <li>要点 2</li>
    <li>要点 3</li>
  </ul>
</div>
```

---

## 7. アクセント装飾（金箔ライン）

### 7.1 セクション区切り
```html
<hr class="st-hr-gold">
```
- 用途：章と章の間の視覚的呼吸点。本文中で連続使用しない。

### 7.2 引用 / 注釈の罫線囲み
```html
<aside class="st-note">
  <p>余談・歴史的経緯など、本筋とは分離したい補足。</p>
</aside>
```

---

## 8. 画像

### 8.1 単独画像（中央）
```html
<figure class="aligncenter size-large">
  <img src="/wp-content/uploads/YYYY/MM/filename.jpg"
       alt="状況を説明する代替テキスト"
       loading="lazy"
       decoding="async">
  <figcaption>キャプション。出典がある場合は明記。</figcaption>
</figure>
```
- `alt` 必須（アクセシビリティ + SEO）。装飾画像なら `alt=""`（空文字）でも可。
- プレースホルダ画像（NOW PRINTING 等）は使わない。

### 8.2 比較画像（2 枚並び）
```html
<div class="st-imgbox st-imgbox-2col">
  <figure><img src="…" alt=""><figcaption>Before</figcaption></figure>
  <figure><img src="…" alt=""><figcaption>After</figcaption></figure>
</div>
```

---

## 9. アンカーリンク / 内部リンク

### 9.1 同一サイト内（フラット）
```html
<a href="https://moterist.com/fanza20250331/">詳しい登録手順はこちら</a>
```
- ピラー間相互リンクは `SITE_MAP.md` §6 のルールに従う。

### 9.2 同記事内のアンカー
```html
<a href="#section-3">セクション 3 へ</a>
…
<h2 id="section-3">セクション 3</h2>
```

### 9.3 外部リンク（信頼担保用、非アフィリエイト）
```html
<a href="https://example.gov.jp/" target="_blank" rel="noopener external">
  公的機関の出典名
</a>
```
- E-E-A-T の Trustworthiness 強化。1 記事に 1〜2 件まで。

---

## 10. SEO / メタ

### 10.1 meta description（記事個別）
- CCO が記事生成時に提示する。実際の埋め込みは THE THOR の記事編集画面または ALL in One SEO 経由（CCO は値だけ提案）。
- 推奨長：90〜120 字。冒頭にキーワードを置き、行動を促す動詞で終える。

### 10.2 サイト内インデックス制御
- `noindex` / `canonical` は **CCO が記事側で設定しない**。THE_THOR_SETTINGS.md の SEO 不変ルールに従い、変更が必要な場合のみ CSO が個別指示を出す。

---

## 11. 禁則 HTML

以下の構文は **絶対に出力しない**。

| 禁則 | 理由 |
|---|---|
| `<!-- wp:paragraph -->` 等 Gutenberg ブロック | クラシックエディタで保存しているため、自動整形と衝突する |
| `<br>` 連打 | `wpautop` が `<p>` で囲い直し、レイアウト崩壊 |
| インラインスタイル `style="color: #ff0000"` | ブランド色変更時の一括差替を阻害（`BRAND_DESIGN_GUIDE.md` §2.1 禁則色） |
| 純白 `#FFFFFF` / 純黒 `#000000` / ネオン系の直書き | 同上 |
| `<iframe src="https://…">`（公的埋込以外） | パフォーマンス低下 / トラッキング混入 |
| `<font>` `<center>` 等の deprecated タグ | HTML5 仕様外 |
| 装飾目的の `&nbsp;` の連続 | レイアウトはクラスで取る |
| `target="_blank"` のみ（`rel` なし） | セキュリティ脆弱性（reverse tabnabbing） |
| 架空の口コミ / 偽セール表記 | 景表法・FANZA 規約違反 |

---

## 12. CCO への運用指示（出力チェックリスト）

CCO は記事原稿を出力する直前に以下をセルフチェックする：

- [ ] §0「出力 3 原則」を全部守っている
- [ ] CTA URL に `source` + `intent` が付いている
- [ ] アフィリリンクに `rel="noopener sponsored"` が付いている
- [ ] §11 の禁則 HTML を 1 つも含んでいない
- [ ] 引用には `<cite>` で出典を併記している
- [ ] Experience を含む段落が 1 つ以上ある
- [ ] Information Gain（独自分析）の段落が 1 つ以上ある
- [ ] 推奨色（`#121212` / `#E0E0E0` / `#D4AF37`）以外を直書きしていない

このチェックリストを通過した記事のみ、`management/OPERATION_MANUAL.md` §3「記事反映自動化（DB 直接注入）」のフローに乗せる。

---

*v1.0 — 2026-05-16 初版。CSO（Gemini 3）/ CCO（ChatGPT 5.5）共有所管。更新時はバージョン番号を上げる。*
