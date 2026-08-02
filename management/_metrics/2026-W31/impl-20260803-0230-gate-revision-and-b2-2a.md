# ゲート指標①の改訂 / B2②-a 実装 — **デプロイ前の差分報告**

- 実施: **2026-08-03 02:20 〜 02:30 JST**
- **本番へのデプロイは未実施**（指示「実装後、デプロイ前に CSO へ差分を報告すること」に従う）
- Phase 1 で停止

---

## 1. GATE_20260930.md の改訂（最優先・完了）

### 指標① の差し替え

| | 旧 | 新 |
|---|---|---|
| 測定 | articles 面のクリック**構成比** | **articles 面のクリック実数** |
| 基準線 | 2.7%（2件 / 73件） | **2件**（層B・8日間／**月換算 約8件**） |
| 目標 | 15% 以上 | **2026年9月単月で 30件以上** |
| 構成比 | 判定に使用 | **参考値として併記。判定には使用しない** |

### 改訂理由（正典に明記した原文）

> **構成比は works 面の成長により分母が膨張し、成功が指標を悪化させる設計欠陥があった。戦略顧問側の設計ミスとして訂正。2026-08-03 CSO承認。観測前の変更であり §6 違反ではない。**

あわせて「**本改訂以降の再変更は禁止**（§6 は引き続き有効）」を追記した。

### 分子に含めない placement を明記

`works_to_articles_cta` / `actresses_to_articles_cta` は **works / actresses 面から articles への内部遷移**を測る導線計装であり、**articles 面でのアフィリエイトクリックではない**。
**指標①の分子には含めない**（送客量の観測用として別枠集計）。

### 反映先

| ファイル | 内容 |
|---|---|
| `management/_metrics/GATE_20260930.md` | 指標①本体 + 改訂ブロック + 分子除外の明記 |
| `management/TASK_BOARD.md`（`T-20260930-GATE`） | 同内容を追記 |
| `CLAUDE.md` | 1行参照を「実数 30件以上（2026-08-03 に構成比15%から改訂）」へ更新 |

---

## 2. B2②-a の実装（デプロイ前）

### 新規コンポーネント `src/components/article-guide-links.tsx`

- **`<details>` を使わない＝常時可視**（CSO 指示の【重要】）
- リンク先は `/articles/<slug>` の**内部URLのみ**。af_id を含む URL は一切扱わない
- `rel` に nofollow を付けない＝**内部リンクとしてエクイティを流す**
- GA4: イベント名 **`article_guide_click`**、`placement` を面ごとに分岐
  （`works` → `works_to_articles_cta` / `actresses` → `actresses_to_articles_cta`）
  `transport_type: "beacon"`（`ConciergeCtaLink` と同方針）
- `links.length === 0` なら `null` を返す＝**定数を空にするだけで描画が消える**（ロールバック用）

### works 詳細（`(site)/works/[floor]/[id]/page.tsx`）

- **金 CTA（`detail_main_cta`）の直下**、注意書き `<p>` の直後に配置（`mt-3`）
- リンクは定数 `WORKS_GUIDE_LINKS`（**1本**）
  - `fanza-first-guide` — 「はじめてのFANZA — 登録3分の手順と、支払い・解約の不安への答え」
- **U1（`NewUserFvModule`）は現状維持**。撤収していない（CSO 裁定）
- **既存 CTA は1つも削除・移動していない**（指標③の毀損回避）
- **ページ内で1回だけ描画**（mobile FV 側には置かない＝同一 slug へのリンクをこれ以上増やさない）

### actresses 詳細（`(site)/actresses/[id]/page.tsx`）— **実装した**

- 実装コストは共通コンポーネントの再利用のみで低いため実施
- 作品グリッドの**直上**に配置（`mb-8`）
- **全女優ページ一律・段階導入なし**（CSO 裁定）
- リンク: `fanza-tv-free-trial` — 「`{displayName}`の作品を14日間無料で見る方法」

### genres・トップ

- **対象外**（CSO 裁定③）。変更していない

### 差分サマリ

```
 app-concierge/src/components/article-guide-links.tsx          | 新規 108行
 app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx      | +33 / -1
 app-concierge/src/app/(site)/actresses/[id]/page.tsx          | +18 / -0
```

### 検証（デプロイ前）

| 項目 | 結果 |
|---|---|
| `npx tsc --noEmit` | **exit 0** |
| `npx eslint`（変更3ファイル） | **exit 0** |
| af_id 静的ガード | **合格**（走査 87 ファイル・違反 0） |

---

## 3. §6 事前登録（**実装前に確定・観測後の変更禁止**）

1. **投入時刻を JST 秒単位で記録し、前後を分離して集計する。** S4（2026-08-03 00:59:37）・B2①（2026-08-02 23:19:32）の効果と混同しない
2. **GSC インデックスレポートが 2026-07-24 で凍結中のため、SEO 効果（インデックス・順位）の測定は不能。** 8/8 に再判定
3. **内部リンクは権威の再配分であり、新規獲得ではない。** 新規獲得は優先2（F案）の役割
4. **外部被リンクは `japanero.jp` の1本のみ**（works 詳細に着地）。**移転できる権威の量は小さい**
5. **効果が出なくても「期間内に効果が確認できなかった」と記録する。** 施策の失敗とは記録しない
6. **actresses 面は現状クリック 0 件**。指標①への寄与は**期待しない**（送客の受け皿を用意する意味で実装した）
7. `works_to_articles_cta` / `actresses_to_articles_cta` は **指標①の分子に含めない**（§1 のとおり）

### デプロイ後に測定する項目（事前登録）

| 項目 | 期待値 |
|---|---|
| works 詳細の `/articles/` リンク数 | **3本**（既存の U1 由来 2本 + 新規 1本）。現状は 2本 |
| actresses 詳細の `/articles/` リンク数 | **1本**。現状は 0本 |
| genres・トップの `/articles/` リンク数 | **0本のまま**（対象外） |
| 各面 HTTP | **200** |
| af_id ライブガード | **exit 0**（`href` 内 99x が 0件のまま） |
| GA4 | `article_guide_click` の `placement` が 2値で分離されること（受信確認は翌日以降） |

---

## 4. 実施していないこと

- **デプロイ（main へのマージ／push）**
- U1（`NewUserFvModule`）の撤収・変更
- genres / トップへの導線追加
- 既存 CTA の削除・移動・文言変更
- `internal_links` の DDL 適用（**HUMAN 枠**。B2②-b の前提であり、B2②-a は依存しない）

> 本記録は事実の転記と、CSO 承認範囲内での実装内容。デプロイは CSO 承認後に実施する。
