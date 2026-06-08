# MIDDLEWARE × CRAWLER 衝突 仮説検証レポート — 2026-W22 (T-05-AR2)

| 項目 | 値 |
|---|---|
| 検証日時 | 2026-05-31 23:40 JST |
| 検証手段 | コード Read + `curl -I` (Read-only HTTP HEAD) + `robots.txt` GET |
| 対象仮説 | BRIEF_023 §2「年齢確認 middleware が AhrefsBot/Googlebot を 403 で一網打尽にブロックしている」 |
| **検証結果** | **完全 falsified (仮説不成立)** |

---

## 1. コード読み — `app-concierge/src/proxy.ts`

Next.js 16 規約により `middleware.ts` → `proxy.ts` 命名 (本ファイル冒頭コメント参照、`deprecation 警告解消`)。

**matcher**:
```ts
export const config = {
  matcher: ["/concierge", "/concierge/:path*", "/api/concierge/:path*"],
};
```

**判定ロジック**:
- `/concierge` 系 page route: `return NextResponse.next()` (常時通過、_gl 計測のみ)
- `/api/concierge/*` API route: `req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE` で判定、未通過なら 403
- **User-Agent ヘッダの参照は 0 箇所** (`req.headers` の usage なし)

### 観測される構造的事実
1. **ルート `/` は matcher 範囲外** — proxy.ts は呼ばれない、age-gate は適用されない
2. **UA-based filtering の存在しない** — cookie のみで判定、UA は無関係
3. 403 が返るのは **`/api/concierge/*` で cookie 未通過時のみ** — クローラーが API を叩かない限り発生しない

---

## 2. 実 HTTP 観測 (curl -I → app.vodnavi.jp)

| UA | 対象 path | HTTP Status | 観測 |
|---|---|---|---|
| `Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)` | `/` | **200 OK** | Server: Vercel, Cache-Control private, X-Matched-Path: / |
| `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` | `/` | **200 OK** | 同上 |
| `Mozilla/5.0` (baseline) | `/` | **200 OK** | 同上 |
| `AhrefsBot/7.0` | `/api/` | 308 Permanent Redirect → `/api` | proxy.ts matcher 範囲外、Next.js standard routing |

3 UA すべて 200 OK。middleware による UA 差異なし。

---

## 3. robots.txt 検証 — `https://app.vodnavi.jp/robots.txt`

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Host: https://app.vodnavi.jp
Sitemap: https://app.vodnavi.jp/sitemap.xml
```

- 全 UA に対し `/` 許可
- AhrefsBot / Googlebot 特別 block 記述なし
- `/api/` と `/_next/` のみ disallow — クローラー側 conventions に従う健全な制限

---

## 4. BRAND_DESIGN_GUIDE.md L100 の読み直し

```
クッキー判定は サーバー側（middleware）でも実施 し、
未通過のリクエストは API ルートで 403 を返す
（クライアント JS の改ざんでバイパスされないようにする）
```

**「API ルートで 403」と明示** — ガイド自体に「ページルートでは 403 にしない」設計意図が記載。proxy.ts 実装はこの仕様に忠実、ルート `/` や `/concierge` 系 page route で 403 を出すコードは存在しない。

---

## 5. Ahrefs "クロールエラー" / "クレジット枯渇" 表示の解釈

| 仮説 | 検証結果 |
|---|---|
| middleware が AhrefsBot を 403 でブロック | ❌ **完全 falsified** (本レポート §1-3) |
| Ahrefs Free Plan のクレジット枯渇でクロール試行自体が止まった | ✅ Ahrefs UI が "クレジットが残っていません" を明示 (b9f8709 で landed 済) |
| 過去の一時的クロールエラー履歴 | ⚠️ 詳細は Site Audit (Free Plan 利用可否不明) で別途確認、本検証スコープ外 |

→ **Ahrefs 上の crawl 状態は Free Plan credit が唯一の visible 原因**。middleware は健全、修正必要なし。

---

## 6. 結論と推奨

### 結論
1. **BRIEF_023 §2 仮説 falsified**: middleware は crawler を block していない
2. **proposed fix (UA 例外解除実装) は不要**: 修正対象が存在しない
3. **本番 middleware は仕様通り健全動作**: ページ 200 OK + API cookie ガード

### 推奨アクション
- BRIEF_023 は **landed しない** (仮説誤、構造矛盾の永続化を回避)
- TASK_BOARD T-05-AR2 → `[x] Done` (middleware 健全性 verified)
- TASK_BOARD T-05 親タスクは引き続き `[In Progress]` (T-05-AR1 = Site Explorer drill-down は残作業)
- Ahrefs 監視復活には **Free → Lite/Standard アップグレード** が必要 (memory 化候補、HUMAN 判断)

### 副次的セキュリティ観察
仮説通りの UA 例外 (Googlebot pass-through) を実装していたら、UA spoofing で age-gate trivially bypass される設計穴を作っていた。仮説検証が実装防衛として機能 — 検証ファースト原則の有効性確認。

---

*検証: Claude Opus 4.7 via Read + Bash(curl) / proxy.ts L1-74 / app.vodnavi.jp 本番 HTTP HEAD 3 件*
*本レポートは実 HTTP 観測 + 実コード読みのみで構成。placeholder なし、仮説と事実の分離を明示*
