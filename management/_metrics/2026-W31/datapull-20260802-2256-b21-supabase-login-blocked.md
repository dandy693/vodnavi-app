# B2①投入のChrome連携実行 — **前提条件（Supabase未ログイン）で停止・HUMAN枠へ振替**

- 実施: **2026-08-02 22:53:59 〜 22:56:41 JST**(PowerShell 実測)
- **SQL は1文も実行していない**。STEP 0 を含め、**editorial_articles には一切アクセスしていない**
- Phase 1 で停止

---

## 1. 前提条件の確認結果 → **未ログイン**

指示の前提「Supabase Dashboard へのログイン状態を最初に確認すること。未ログインならHUMAN枠へ振替。CTOはログイン操作を行わない。」に従い、最初にログイン状態を確認した。

| 手順 | 実測 |
|---|---|
| 1. `https://supabase.com/dashboard/projects` へ遷移（22:54:2x） | 一旦 `/dashboard/organizations` へ遷移し「Your Organizations」の骨組みが描画された |
| 2. 描画完了を待って再取得（22:54:5x） | **`/dashboard/sign-in?returnTo=%2Forganizations` へリダイレクト**され、サインイン画面が表示された |
| 3. 画面内容（原文） | 「**Welcome back / Sign in to your account**」「Continue with GitHub（LAST USED）」「Continue with ChatGPT」「Continue with SSO」「Email」「Password」「Sign in」 |

→ **Supabase Dashboard は未ログイン状態**（初期表示は認証前のシェルで、セッション判定後にサインイン画面へリダイレクトされた）

### 補足（実施しなかった操作と、その理由）

- サインイン画面には**ブラウザのオートフィルにより Email / Password が入力済み**の状態だった
- しかし「Sign in」ボタンの押下は**ログイン操作そのもの**であり、
  - 本指示の前提「**CTOはログイン操作を行わない**」に反する
  - 認証情報を用いた認証行為は CTO の運用制約上も実施しない
  → **クリックしていない**
- **認証情報（メールアドレス・パスワード）は記録していない**

---

## 2. 実行状況（指示の各STEPに対して）

| STEP | 内容 | 状態 |
|---|---|---|
| 前提 | Supabase ログイン状態の確認 | **完了 → 未ログイン** |
| STEP 0 | 事前カウント SQL の実行 | **未実行**（前提未達のため） |
| STEP 1 | `begin;` + 12件の UPDATE | **未実行** |
| STEP 2 | 検算クエリ | **未実行** |
| STEP 3 | commit / rollback | **未実行** |
| STEP 4 | commit 完了時刻の記録 | **未実行** |
| 投入後の検証1〜5 | 本番7記事の再取得・13本照合 等 | **未実行**（投入していないため） |

**editorial_articles テーブルは読み取りも含め一切アクセスしていない。データベースの状態は投入前のまま変化していない。**

---

## 3. 【技術的な注意事項】投入実行時に必ず考慮が必要な点（HUMAN実行者向け）

指示は「STEP 1 で `begin;` を実行し、この時点では commit しない」→「別途 STEP 2 の検算」→「別途 STEP 3 で commit/rollback」という**3回に分けた実行**を前提としている。しかし **Supabase SQL Editor は「Run」ごとに独立したリクエストとして実行される**ため、**`begin;` だけを実行しても次の「Run」までトランザクションは維持されない**（各実行が個別にコミットされる）。

この構成のまま3分割で実行すると、**検算前に12件の UPDATE が確定してしまう**危険がある。

### 推奨する実行形態（安全性は指示の意図どおり、むしろ強化される）

- **STEP 0（読み取り専用）は単独で実行**し、合計13を確認する
- **STEP 1 + STEP 2 + commit判定を「1回の Run」で実行**し、検算の不一致時は**データベース側で例外を発生させて自動ロールバック**させる:

```sql
begin;
  -- （APPLY_b21_links.sql の 12本の UPDATE をそのまま）
do $$
declare v_total int;
begin
  select coalesce(sum((length(body) - length(replace(body, '](/articles/', ''))) / length('](/articles/')), 0)
    into v_total
  from editorial_articles where publish_status = 'published';
  if v_total <> 13 then
    raise exception 'B2-1 link_count mismatch: expected 13, got %', v_total;
  end if;
end $$;
commit;
```

- これにより「**13でなければ絶対に commit されない**」が DB レベルで保証される（指示の STEP 3「不一致なら rollback」と同一の効果で、人的判断ミスの余地がない）
- **本改訂は CSO 承認事項**として起案する。承認なしに `APPLY_b21_links.sql` を書き換えることはしない（現ファイルは指示どおりの3分割構成のまま未変更）

---

## 4. HUMAN枠として起案（実行手順）

### 案A: HUMAN がログインし、CTO が続きを実行
1. HUMAN が Supabase Dashboard にログイン（同一ブラウザ・同一タブ группы）
2. ログイン完了を CTO へ連絡
3. CTO が STEP 0 → 検算付き一括実行 → 時刻記録 → 5分後の公開面検証 を実施

### 案B: HUMAN が SQL Editor で完結
1. HUMAN が Supabase Dashboard → vodnavi-production → SQL Editor を開く
2. `management/_metrics/2026-W31/backup-20260802-b21/APPLY_b21_links.sql` の **STEP 0** を実行 → **合計13** を確認
3. §3 の推奨形態（例外による自動ロールバック付き）で **STEP 1+2+commit** を1回で実行
4. **commit 完了時刻（JST秒単位）を CTO へ共有**
5. CTO が5分後に公開面の検証（13本の個別照合・文字数比較・HTTP 200）を実施

いずれの案でも、**異常検出時の ROLLBACK は CTO 判断では実行せず、`ROLLBACK_b21_links.sql` の実行を起案して CSO 承認を待つ**（指示どおり）。

---

## 5. 既に完了している準備物（変更なし）

| 成果物 | 状態 |
|---|---|
| 投入前確認①（7 slug の公開） | 完了（200 / 自己canonical / sitemap収録） |
| 投入前確認②（h1一致・誤参照0件） | 完了 |
| 対象13件の機械的確定 | 完了（kaiyaku 4 / free-trial 3 / review 3 / payment-methods 2 / tv-guide 1） |
| 投入前バックアップ | 完了（`backup-20260802-b21/*.rendered.html` 7件・22:39:58 JST） |
| `APPLY_b21_links.sql` | 作成済み・**未実行** |
| `ROLLBACK_b21_links.sql` | 作成済み・**未発動** |
| §6 事前登録 | 完了（`datapull-20260802-2244-b21-injection-blocked.md` §5） |

---

## 6. 遵守事項の確認

| 制約 | 遵守状況 |
|---|---|
| APPLY_b21_links.sql 以外のSQLを実行しない | **遵守**（SQLは1文も実行していない） |
| 第2階層7件の投入をしない | **遵守**（未着手） |
| テーブル定義の変更・DDL をしない | **遵守** |
| Supabase の設定変更をしない | **遵守** |
| CTOはログイン操作を行わない | **遵守**（Sign in を押していない） |
| classifier 遮断時は即停止・迂回なし | 遮断は発生していない（停止理由は未ログイン） |

> 本記録は事実の転記と、指示に基づく HUMAN 枠起案のみ。データベースは一切変更していない。
