# STRATEGY_BRIEF_001 — 流入元別パーソナライズの起点を作る

- 発行：CSO (Gemini 3)
- 宛先：CTO (Claude Opus 4.7)
- 日付：2026-05-14

## 戦略的狙い (Why)
- 3サイト連携（Moterist 集客 → VODNavi 信頼 → App 成約）の「接続部」を技術的に明示する必要がある。
- 現状、`app.vodnavi.jp/concierge` はすべての流入を同じ挨拶・同じプロンプトで迎えており、流入元の文脈（読者の温度・期待値・語彙）を捨てている。
- 月商 100 万円への最短ルートは「Moterist で温まった読者」を冷まさずに成約まで運ぶこと。コンシェルジュの最初の一言が流入元に合わせて変わるだけで、初回離脱率と CVR に直接効く。

## 今回のスコープ (What — 最小実装)
`/concierge` に URL パラメータ `source` を導入し、流入元プロファイル単位で以下を切り替える。

| パラメータ | プロファイル | 想定流入元 | 期待される演出 |
| --- | --- | --- | --- |
| (未指定) | `default` | 直リンク・既知ユーザー | 既存の中立的なバーテンダー挨拶 |
| `source=moterist` | `moterist` | moterist.com の心理学・教養記事 | 「記事を読んでくださったお礼」+ 知的トーンの強化 |
| `source=brand` | `brand` | vodnavi.jp 公式ブランドサイト | 「正規ルートからのご案内」+ 信頼性訴求 |

切り替え対象：
1. **初期挨拶（greeting）** — クライアントの最初のアシスタント発話。
2. **システムプロンプト addendum** — API 側でメインプロンプトに追記する短い文脈ブロック（メインの cache_control は維持）。

## 制約と非機能要件 (How — 守ってほしい線)
- **既存のキャッシュ効率を壊さない**：`SYSTEM_PROMPT` 本体は引き続き `cache_control: ephemeral` の対象に。addendum は別の system 要素として末尾に追加する。
- **未知 / 不正な source は default にフォールバック**：URL を直接いじる流入を握り潰さない。
- **`cids` シェアリンクとの両立**：`cids` がある場合は共有経路のメッセージを優先（`source` が moterist でも、シェア由来なら SHARED_INTRO_TEXT が出る）。
- **依存追加なし**：profile 定義は `src/lib/concierge/` 配下に薄いモジュールを 1 本足すだけで完結。
- **計測**：`source` を GA4 の `ai_session_start`（または同等）に渡せるよう、クライアント側で取り回せる形で props として保持しておく。

## CTO への要求成果物
1. `src/lib/concierge/sources.ts`（新規）— `ConciergeSource` 型、3 種のプロファイル、`resolveSource(raw)` 関数。
2. `src/app/concierge/page.tsx` — `searchParams.source` を解決して `ConciergeChat` に渡す。
3. `src/components/concierge/concierge-chat.tsx` — greeting と source を props 受け取り、`DefaultChatTransport({ body: { source } })` で API へ伝搬。
4. `src/app/api/concierge/route.ts` — body から `source` を読み、profile.systemAddendum を system 配列に追加。
5. `management/CHANGELOG.md` への記録。

## 検証ライン
- `/concierge` → 既存挨拶のまま。
- `/concierge?source=moterist` → Moterist 向けの挨拶。API 側のログに `source=moterist` が現れる。
- `/concierge?source=invalid` → default にフォールバック。
- `/concierge?cids=...&source=moterist` → 共有経路（`cids`）のメッセージが優先される。

以上。次の brief は CTO の実装完了報告（CHANGELOG）を受けてから発行する。
