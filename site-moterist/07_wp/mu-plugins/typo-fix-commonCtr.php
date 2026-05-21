<?php
/*
Plugin Name: Typo Fix — commonCtr Heading & Phrase
Description: ヒーローバナー（.commonCtr__contents 内の .heading-commonCtr / .phrase-bottom）の Japanese 一文字落ち（orphan character）防止。THE THOR の本体 CSS を変更せず wp_head に最小限の <style> を挿入。
Version: 1.0.0
Author: VODNAVI-GROUP / Claude Code (CTO)
*/

if (!defined('ABSPATH')) {
    exit;
}

/**
 * commonCtr の h2 / p に対する Japanese 向けタイポグラフィ修正。
 *
 * 採用した CSS：
 *   - text-wrap: balance         …… 行ごとの文字数を均等化し「最終行に 1 文字だけ落ちる」現象を構造的に解消（CSS Text Module Level 4、Chrome 114+ / Safari 17.5+ / Firefox 121+）
 *   - word-break: keep-all       …… CJK の単語内分割を抑止（漢字熟語が行末で割れない）
 *   - line-break: strict         …… 日本語の禁則処理（句読点・小書き仮名）を厳格化
 *   - padding-inline: clamp(...) …… 横方向の breathing room を確保し短い viewport でも 1〜2 文字落ちを軽減
 *
 * 採用しなかった案：
 *   - white-space: nowrap …… この見出しは 40 字超なのでモバイルで横スクロールが発生するため不採用。
 *
 * priority 9999 で wp_head 末尾に挿入し、テーマ CSS を確実に上書きする。
 */
add_action('wp_head', function () {
    ?>
<style id="typo-fix-commonCtr">
.commonCtr__contents .heading-commonCtr,
.commonCtr__contents .phrase-bottom {
  text-wrap: balance;
  word-break: keep-all;
  line-break: strict;
  overflow-wrap: anywhere;
}
.commonCtr__contents {
  padding-inline: clamp(16px, 4vw, 32px);
}
</style>
    <?php
}, 9999);
