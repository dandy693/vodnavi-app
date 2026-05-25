<?php
/**
 * Disable WordPress core users sitemap.
 *
 * 配置先候補:
 *   1) wp-content/mu-plugins/disable-user-sitemap.php
 *      （MU プラグイン: 自動有効化、テーマ変更で消えない最堅牢ルート）
 *   2) the-thor-child/functions.php 末尾に追記
 *      （MU プラグイン化が難しい場合のフォールバック）
 *
 * 目的:
 *   WordPress 5.5+ のコア sitemap (`wp-sitemap.xml`) には users provider が
 *   含まれており、`wp-sitemap-users-1.xml` に著者アーカイブ URL
 *   (例: /author/admin/) が積極的に列挙される。
 *
 *   moterist.com の本番は単一著者運用のため、users sitemap は:
 *     - クロールバジェットを浪費し（noindex でも fetch は発生）
 *     - 著者スラッグ列挙によるユーザー名漏洩のセキュリティリスクを増やし
 *     - author archive の duplicate-content/thin-content 判定を招く
 *
 *   `wp_sitemaps_add_provider` フィルタで users provider を null 化することで:
 *     - wp-sitemap-index.xml から users エントリが消える
 *     - 既存の `/wp-sitemap-users-1.xml` 直接 fetch は 404 を返す
 *     - posts / pages / taxonomies の他 provider は無傷
 *
 * 検証:
 *   curl -sSL https://moterist.com/wp-sitemap.xml | grep users   # → 0 件
 *   curl -sSLI https://moterist.com/wp-sitemap-users-1.xml       # → HTTP/1.1 404
 *
 * 関連:
 *   - site-moterist/scripts/generate-seo-robots.mjs (robots.txt 物理配置)
 *   - management/ALERTS.md 2026-05-25 「moterist テクニカル SEO 脆弱性 FAIL 4 箇所」
 */

if (!defined('ABSPATH')) {
    exit;
}

add_filter(
    'wp_sitemaps_add_provider',
    /**
     * @param WP_Sitemaps_Provider|false $provider
     * @param string $name 'posts' | 'taxonomies' | 'users' 等
     * @return WP_Sitemaps_Provider|false
     */
    function ($provider, $name) {
        if ($name === 'users') {
            return false;
        }
        return $provider;
    },
    10,
    2
);
