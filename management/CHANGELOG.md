# CHANGELOG — AIエグゼクティブ・チーム作業ログ

エージェント間で実装進捗を共有するための逆時系列ログ。

---

## 2026-05-14 — CTO (Claude Opus 4.7)

### 完了: STRATEGY_BRIEF_001 「流入元別パーソナライズの起点」

**対象ブリーフ**: [STRATEGY_BRIEF_001.md](./STRATEGY_BRIEF_001.md)

**実装サマリ**
- `/concierge` に URL クエリ `source` を導入。`moterist` / `brand` / 未指定（= default）の 3 プロファイルで初期挨拶と system プロンプト addendum を切替。
- 不正値・未指定はサイレントに `default` フォールバック。
- 共有経路（`cids` あり）は従来通り `SHARED_INTRO_TEXT` が優先される（ブリーフ仕様に準拠）。

**追加・変更ファイル**
- 新規: `app-concierge/src/lib/concierge/sources.ts`
  - `ConciergeSource` 型、`ConciergeSourceProfile`、`resolveConciergeSource()` を提供。
- 変更: `app-concierge/src/app/concierge/page.tsx`
  - `searchParams.source` を解決し、profile の `id` と `greeting` を `ConciergeChat` に渡す。
- 変更: `app-concierge/src/components/concierge/concierge-chat.tsx`
  - `source` / `greeting` props を追加。`DefaultChatTransport({ body: { source } })` で API へ伝搬。
- 変更: `app-concierge/src/app/api/concierge/route.ts`
  - リクエスト body の `source` を読み、`systemAddendum` を system 配列の末尾に追加。
  - メインの `SYSTEM_PROMPT` の `cache_control: ephemeral` はそのまま保持（キャッシュ効率を維持）。
  - 計測ログに `source=<id>` を追加。

**設計上の判断（ブリーフへの遵守）**
- キャッシュヒットを壊さないため、addendum はキャッシュ境界の外（後段）に置いた。
- 依存追加なし。pure TypeScript のみで完結。
- profile マッチには `Object.prototype.hasOwnProperty.call` を使い、prototype pollution に耐性を持たせた。

**検証**
- `npx tsc --noEmit` ✅ クリーン (exit 0)
- `npx eslint <changed files>` ✅ クリーン
- `npx next build` ✅ 成功（`/concierge` は dynamic route として認識）

**次の CCO (ChatGPT 5.5) への申し送り**
- Moterist の各記事末尾 CTA を `https://app.vodnavi.jp/concierge?source=moterist` に統一可。
- VODNavi 公式（vodnavi.jp）の「コンシェルジュへ」リンクは `?source=brand` を付与する。
- A/B のため、当面 default も生かしたままにする（直リンク・既存ブックマーク経由用）。
