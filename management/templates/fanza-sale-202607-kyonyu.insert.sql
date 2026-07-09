-- U3 巨乳キャンペーン30%OFF特集 投入SQL（DRAFT・2026-07-09 CTO起草）
-- 公開フロー: 本SQLは publish_status='draft' で投入 → 7/14 CSOゴーサイン後に
--   UPDATE editorial_articles SET publish_status='published' WHERE slug='fanza-sale-202607';
-- 実行方法: Supabase Studio (vodnavi-production) > SQL Editor に貼り付けて Run
-- 作品リスト出所: HUMAN 保存の特設ページ MHTML（campaign=kyonyucp）から content_id 128件を抽出
-- 注意: コピーは CSO 確定前のドラフト。修正は本ファイル編集→再実行（slug 重複時は既存行を削除してから）
WITH a AS (
  INSERT INTO editorial_articles (slug, title, description, pillar, publish_status, body)
  VALUES (
    'fanza-sale-202607',
    '【FANZA巨乳キャンペーン】対象128作品が30%OFF｜2026年7月31日まで',
    '「巨乳」ジャンルの対象作品が30%OFFになるFANZA巨乳キャンペーンの対象128作品まとめ。初めての方向けの登録手順・無料トライアル併用の最安ルートも解説。期間は2026年7月31日まで。',
    'sale-feature',
    'draft',
    $body$「巨乳」ジャンルの対象作品が30%OFFになる「FANZA巨乳キャンペーン」が開催中です。対象128作品と、初めての方向けの最安ルートをまとめました。期間は2026年7月31日までです。

## 今回のセール概要

・期間: 〜2026年7月31日
・対象: FANZA動画（単品）の巨乳キャンペーン対象作品
・割引: 対象作品 30%OFF

## 対象作品ピックアップ

対象の128作品はページ下部の一覧からどうぞ。気になる作品のタイトルを押すと、FANZA公式の作品ページで詳細とサンプルを確認できます。

## 初めての方は無料トライアル併用で最安

FANZAの購入にはDMMアカウントが必要です（登録は無料・3分）。見放題派なら、DMMプレミアム（FANZA TV）の0円・14日間無料トライアルを併用するとさらにお得です。※プリペイドカードでの登録はトライアル・特典の対象外です。

登録手順や支払い方法の詳細は「はじめてのFANZAガイド」をご覧ください: /articles/fanza-first-guide

## セール会場はこちら

[[CTA:sale]]

[[CTA:first_purchase]]$body$
  )
  RETURNING id
)
INSERT INTO article_products (article_id, content_id, asp_name, display_order)
SELECT a.id, v.cid, 'fanza', v.ord
FROM a, (VALUES
  ('snos00093', 0),
  ('jur00658', 1),
  ('jur00648', 2),
  ('ipok00012', 3),
  ('ebwh00317', 4),
  ('snos00104', 5),
  ('mida00565', 6),
  ('snos00135', 7),
  ('snos00097', 8),
  ('mngs00027', 9),
  ('mida00471', 10),
  ('jur00626', 11),
  ('jur00622', 12),
  ('mida00431', 13),
  ('dass00852', 14),
  ('hndb00278', 15),
  ('mikr00036', 16),
  ('ipzz00841', 17),
  ('mizd00496', 18),
  ('jur00562', 19),
  ('dass00804', 20),
  ('mida00527', 21),
  ('mida00426', 22),
  ('ipzz00582', 23),
  ('mida00193', 24),
  ('ofje00541', 25),
  ('ebvr00114', 26),
  ('pppe00335', 27),
  ('miab00491', 28),
  ('jur00287', 29),
  ('jur00485', 30),
  ('atkd00393', 31),
  ('dass00848', 32),
  ('sone00666', 33),
  ('sivr00447', 34),
  ('sone00754', 35),
  ('jur00483', 36),
  ('miab00634', 37),
  ('mida00165', 38),
  ('jur00309', 39),
  ('miab00623', 40),
  ('cjob00195', 41),
  ('hmn00744', 42),
  ('adn00690', 43),
  ('sone00748', 44),
  ('jufe00583', 45),
  ('jur00272', 46),
  ('miab00494', 47),
  ('sone00621', 48),
  ('mimk00204', 49),
  ('mida00156', 50),
  ('rroy00013', 51),
  ('adn00747', 52),
  ('jfb00475', 53),
  ('rbb00325', 54),
  ('sone00627', 55),
  ('jur00448', 56),
  ('jur00231', 57),
  ('ipvr00351', 58),
  ('midv00949', 59),
  ('achj00057', 60),
  ('ure00128', 61),
  ('roe00349', 62),
  ('ebwh00244', 63),
  ('cawd00799', 64),
  ('sone00934', 65),
  ('jfb00474', 66),
  ('waaa00501', 67),
  ('sone00568', 68),
  ('mida00132', 69),
  ('midv00932', 70),
  ('prst00021', 71),
  ('mfyd00009', 72),
  ('midv00889', 73),
  ('sone00404', 74),
  ('mfyd00043', 75),
  ('sone00504', 76),
  ('sone00353', 77),
  ('achj00051', 78),
  ('cawd00706', 79),
  ('adn00673', 80),
  ('mida00097', 81),
  ('dazd00276', 82),
  ('sone00466', 83),
  ('jums00070', 84),
  ('jufe00601', 85),
  ('sone00279', 86),
  ('ebwh00203', 87),
  ('jur00044', 88),
  ('atid00623', 89),
  ('sone00284', 90),
  ('pppe00234', 91),
  ('bban00565', 92),
  ('juq00890', 93),
  ('sivr00432', 94),
  ('sone00431', 95),
  ('cawd00912', 96),
  ('waaa00608', 97),
  ('rbk00098', 98),
  ('sone00346', 99),
  ('pppe00267', 100),
  ('royd00261', 101),
  ('jufe00575', 102),
  ('juq00829', 103),
  ('miab00342', 104),
  ('miab00015', 105),
  ('juq00566', 106),
  ('sone00131', 107),
  ('blk00667', 108),
  ('juq00451', 109),
  ('dass00720', 110),
  ('hmn00349', 111),
  ('midv00902', 112),
  ('jufe00495', 113),
  ('sone00005', 114),
  ('ssis00605', 115),
  ('royd00149', 116),
  ('ebwh00125', 117),
  ('eyan00200', 118),
  ('fway00043', 119),
  ('bibivr00174', 120),
  ('h_1711ebon00006', 121),
  ('mird00286', 122),
  ('mida00687', 123),
  ('adn00789', 124),
  ('atid00688', 125),
  ('cawb00005', 126),
  ('h_1758jjgg00003', 127)
) AS v(cid, ord)
RETURNING article_id, count(*) OVER () AS inserted_products;
