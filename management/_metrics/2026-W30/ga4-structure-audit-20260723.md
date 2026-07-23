# GA4計測構成の実態調査(2026-07-23 07:35-07:55 JST・調査のみ/設定変更ゼロ)

- 実施: CTO (Claude)。手段: GA4管理画面+標準レポート一時フィルタ(Chrome・authuser=2=moterist.com@gmail.com物理確認)/本番HTML curl/コードgrep。**保存・承認・作成・変更操作は一切なし**(ドメイン候補の「提案を承認」も非接触)
- 結論先出し: **「app.vodnavi.jpのストリームが見当たらない」のは異常ではなく設計どおり**。1ストリーム(登録URL=vodnavi.jp)を両ドメインが共有する統合構成で、計測は健全。二重計上なし・Organicへのスパム混入なし。**推奨=現状維持(7/28評価の数字連続性は完全維持)**

## 1. 現構成の図解(プロパティ→ストリーム→ドメイン対応)

```
[moterist.com@gmail.com 権限のアカウント5個]
├ kit-planning.NET(274943249) / KiT情報企画(401456781) / motelab(357180180) …他案件
├ モテリスト(275986901) └ trendnet.biz(546019847)   ※旧moterist p393864941はピッカー不在=アクセス不能(既知)
└ アカウント: VODまとめ研究所(355462253)
   └ プロパティ: vodnavi.jp(489519780) ←──これまでの全分析(569等)で使用してきた唯一のプロパティ
      └ webストリーム【1本のみ】: 11225897844「VODまとめ研究所」
         登録URL: https://vodnavi.jp/ ・測定ID: G-GG7JV9MJRW(Googleタグ=G-GG7JV9MJRW+GT-PZQ74Z7D・リンク先1・接続済みサイトタグ0件)
         ├← app.vodnavi.jp(gtag G-GG7JV9MJRW+GTM-TKDHM348) … 28日 2,413sess(Organic 2,254)
         ├← www.vodnavi.jp(同一タグ実装)                    … 28日 32sess(Direct 28/Organic 3)
         ├← moterist.com(デュアルタグ経由)                  … 28日 10sess(全Direct・エンゲージ0)
         ├← site-brand-vodnavi.vercel.app(localhost盾の対象外) … 28日 3sess(Direct・検証アクセス様)
         └← 【スパム】hostname「vodnavi.jp」偽装のghost送信   … 28日 500sess(7/19単日・全Referral=trafficheap.cc)
```
- ストリーム作成日: GA4 UIに非表示のため**未確認**(必要ならAdmin APIで取得可)
- 実装側突合(②): 本番HTML curlで **app.vodnavi.jp / www.vodnavi.jp とも G-GG7JV9MJRW×4 + GTM-TKDHM348×2 を配信**。コードコメントにも「vodnavi.jpも同G-GG7JV9MJRWに送信(app.vodnavi.jpと同一プロパティで統合)」と設計意図が明文化(site-brand/google-analytics.tsx・app-concierge/google-analytics.tsx)。localhost遮断盾(`ga-disable`)は両アプリにあり(vercel.appドメインは対象外=3sessの混入経路)

## 2. hostname内訳(直近28日=6/25-7/22・標準レポート一時フィルタで実測)

| hostname | セッション | 主チャネル | 判定 |
|---|---|---|---|
| app.vodnavi.jp | **2,413** (81.6%) | Organic 2,254(93.4%)/Direct 122/Social 30/Referral **2** | 本体・健全 |
| vodnavi.jp(apex) | 500 (16.9%) | **Referral 500(100%)・7/19単日** | **スパム(hostname偽装)**。apexは308リダイレクトのため実訪問は発生し得ない |
| www.vodnavi.jp | 32 (1.1%) | Direct 28/Organic 3/Social 1 | LP面・立ち上げ期 |
| moterist.com | 10 (0.3%) | Direct 10(エンゲージ0) | デュアルタグの残響 |
| site-brand-vodnavi.vercel.app | 3 (0.1%) | Direct 3 | プレビュー面の混入(軽微) |
| 合計 | 2,958 | | 観測hostname は上記5種で全量 |

- **「569等がどのhostname集合か」の判定: 実質app.vodnavi.jp単独**。Organic Searchの構成はapp=2,254 vs www=3(28日)で**99.9%がapp**。スパム500はReferralチャネルのみ=Organic系KPI(ゲート判定569・GSC突合)への汚染ゼロを hostname軸でも確証

## 3. クロスドメイン関連(④)

- **ドメインの設定(クロスドメイン)**: 完全一致 vodnavi.jp / 含む app.vodnavi.jp / 含む moterist.com(既知構成と一致・変更なし)。「ドメインの候補」にVercelプレビュー5件の承認提案が出ているが**未承認のまま非接触**(承認すべきでない=プレビューへの_gl付与は不要)
- **除外する参照のリスト**: **「参照ドメインが次を含む trafficheap.cc」の1条件のみ**。vodnavi.jp系は不在
- **self-referralの実測: 0件/28日**。参照元に「vodnavi」を含むsource/mediumは `x_vodnavi/social` 1sess(=B4のutm・self-referralではない)のみ。サブドメイン間(app↔www)は同一eTLD+1で_ga cookieを共有するためreferral化しておらず、**参照元除外へのvodnavi.jp追加は現状不要**
- 補足: 「完全一致 vodnavi.jp」はwww.vodnavi.jpを字義上含まないが、サブドメイン間はリンカー(_gl)自体が不要のため実害なし。クロスドメイン測定が実効要件なのはmoterist.comのみ

## 4. 問題の有無判定

| 観点 | 判定 |
|---|---|
| 二重計上 | **なし**(1ヒット=1ストリーム。両ドメインが同一ストリームへ送るのは意図設計であり、同一ユーザーのapp↔www回遊も_ga共有で1ユーザーに正しく統合される) |
| 欠落 | **なし**(app計測は2,413sess/28日+全イベント受信・収集有効表示) |
| 混在 | **軽微にあり**: ①スパム500(apex偽装・Referral限定・除外設定済=7/20以降新規ヒット0) ②vercel.appプレビュー3sess ③moterist.com 10sess(設計内)。合算指標(総セッション等)を使う際はhostnameフィルタ推奨、Organic系は非汚染 |
| 紛らわしさ | **あり=今回のCSO疑問の根源**。ストリーム名「VODまとめ研究所」/登録URL「vodnavi.jp」が実態(データの8割はapp)と乖離して見える。機能影響はゼロ |

## 5. 推奨構成案と7/28評価への影響

| 案 | 内容 | 7/28評価への影響 | 推奨 |
|---|---|---|---|
| **案1: 現状維持** | 構成・設定とも変更なし。(任意でストリーム名を「vodnavi.jp/app.vodnavi.jp 共有」等へ改名=表示だけの変更でデータ無影響・実施はCSO裁定後) | **数字の連続性は完全維持(切れない)** | ◎ |
| 案2: app専用ストリーム追加 | 新ストリーム=新測定IDへの実装切替が必要。ユーザー/セッションの履歴が断絶し、当日から数字がリセット | **連続性が切れる**(U1比較・ゲート系列・GSC突合すべてに断絶) | ×(少なくとも7/28評価完了まで禁忌) |
| 案3: 参照元除外にvodnavi.jp追加 | self-referral実測0件のため効果なし | 影響なし | 不要(moteristデュアルタグ廃止判断時に再検討) |

- 結論: **案1(現状維持)を推奨**。現構成は「1プロパティ1ストリームに全ドメインを統合し、hostnameで面を切り分ける」設計として一貫しており、切り替える理由がない。唯一の実害(スパム)は対処済み
