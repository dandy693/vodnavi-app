# Credential Rotation Runbook — 2026-W22 (T-03-SR1)

**起点**: 2026-05-31 セッション内で `.env.local` を `Read` した際、3 件の secret が会話 transcript に露出した。
**範囲**: ANTHROPIC_API_KEY / VERCEL_OIDC_TOKEN / DMM_API_ID
**TASK_BOARD**: T-03-SR1
**Owner**: HUMAN (Claude は credential 入力 / 生成 Prohibited)

---

## 1. リスク評価

| Secret | 露出形態 | 寿命 | 残存リスク | 緊急度 |
|---|---|---|---|---|
| `ANTHROPIC_API_KEY` | 完全平文 | 長寿命 (revoke するまで生存) | **高** — 第三者がそのまま API 利用可、課金被害 | **即時** |
| `VERCEL_OIDC_TOKEN` | 完全平文 (JWT) | JWT `exp` claim 12h TTL、JWT iat ≈ 2026-05-14 21:13 UTC → exp ≈ 2026-05-15 09:13 UTC | **低** (token 自体は既に 16 日前に失効) | 中 (project link 再検証は推奨) |
| `DMM_API_ID` | 完全平文 | 長寿命 | 低 (partner ID 相当、`DMM_AFFILIATE_ID=moterist-990` と組で識別される程度) | 低 |

VERCEL_OIDC_TOKEN の expiry 検算: token 内 `"exp":1778825512` → Date 換算 ≈ 2026-05-15 09:13 UTC。本日 (2026-05-31) は 16 日経過済で既に dead。**token 自体の rotate は不要**。ただし leak 経路が `.env.local` の生 Read であり、Vercel project link / OIDC 発行元の見直しは別途実施。

---

## 2. ANTHROPIC_API_KEY ローテーション手順 (HUMAN 専用)

### 2.1 Revoke + 再発行
1. Anthropic Console にログイン: <https://console.anthropic.com/settings/keys>
2. 露出した key を識別 (prefix `sk-ant-api03-tqqf5...`、本 runbook に key 全文は記載しない)
3. 該当 key の `Revoke` を実行
4. 同画面で `Create Key` → 新規 key を発行、用途タグ `vodnavi-app-prod` 等を付与
5. **新 key は console から直接 `.env.local` に貼付**。本 runbook や git 履歴、chat にはコピーしない

### 2.2 .env.local 更新 (HUMAN 専用)
```dotenv
ANTHROPIC_API_KEY="sk-ant-api03-XXXX..."   # 新 key (HUMAN が貼付)
```
Claude による `Edit` / `Read` での更新は禁止 (Read 出力が transcript に流れて再露出するリスク)。

### 2.3 ローテ完了後の検証
- `app-concierge/` のローカル dev でストリーミングチャットが 200 系応答を返すか
- Anthropic Console > Activity で旧 key の Last used が rotate 前で停止しているか
- もし課金分のフォレンジックが必要なら Console > Usage で当該 key の Date 別 token 消費を確認 (露出時刻 = 2026-05-31 22:09 JST 以降の異常スパイクの有無)

---

## 3. VERCEL_OIDC_TOKEN 取り扱い (HUMAN 専用)

### 3.1 Token rotate 自体は不要 (期限切れ)
JWT `exp` claim より既に失効済 (2026-05-15 09:13 UTC)。新規 attacker が利用しても拒否される。

### 3.2 ただし発行元の Vercel link は再検証推奨
1. `vercel whoami` (ローカル) で現セッションのアカウントを確認 — `hdktchkw33` であることを目視
2. <https://vercel.com/account/tokens> で **全 long-lived token を棚卸し**、不要分を `Revoke`
3. プロジェクト `vodnavi-app` の Settings > Git で誰が deploy 権限を持っているか確認、不要メンバを除去
4. `vercel link` を再実行 → `.env.local` の `VERCEL_OIDC_TOKEN` 行を最新発行値で上書き (短期 token なので 12h 後に自動失効するが、明示再リンクで attacker 経路を切断)

### 3.3 .env.local の token 行を完全削除する選択肢
VERCEL_OIDC_TOKEN は Vercel CLI が build/deploy 時に自動注入する。`.env.local` に書き残す必要は通常ない。**Claude を含む third-party agent に Read される経路を断つため、削除を推奨**。

---

## 4. DMM_API_ID 取り扱い

### 4.1 Rotate 必要性
低。FANZA Affiliate の partner ID 相当で、単独では不正アクセス困難。`DMM_AFFILIATE_ID=moterist-990` と組で露出してもユーザ追跡程度のリスク。

### 4.2 推奨アクション
- DMM Affiliate 管理画面 > 設定 で API ID の rotate オプションがあるか確認
- ある場合は念のため再発行 (no-op に近い)
- ない場合は無視可

---

## 5. 構造的再発防止策 (Claude 側)

本セッション内で確立した方針:

- `.env*` ファイルの直接 `Read` は禁止。存在確認のみ `Test-Path` + キー名 `Grep` で実施
- `.env*` 内容を確認したい場合は HUMAN に「キー X が存在するか」と問い合わせ、HUMAN が値なしの yes/no で返す
- credential を含むかもしれない API レスポンス / cookie / token を `get_page_text` / `read_page` 経由で transcript に landed する前に、可視範囲を制限する

これは memory の構造的 feedback として別途 `feedback_no_env_read.md` 起票要検討。

---

## 6. 完了条件 (T-03-SR1 を `[x]` にできる基準)

すべて satisfy で T-03-SR1 → Done に landed 可:

- [ ] Anthropic Console で旧 ANTHROPIC_API_KEY が `Revoked` 状態
- [ ] 新 ANTHROPIC_API_KEY が `.env.local` に貼付済、dev で動作確認済
- [ ] Vercel `account/tokens` で全 long-lived token を棚卸し、不要分 revoke 済
- [ ] (Optional) `.env.local` から `VERCEL_OIDC_TOKEN` 行削除済 (今後の transcript 露出経路を断つ)
- [ ] Anthropic Console > Usage で 5/31 22:09 JST 以降の異常スパイク無しを確認

---

*作成: 2026-05-31 23:00 JST / Claude Opus 4.7 / commit pending*
*Note: 本ファイルは手順書であり、credential 値は一切記載しない*
