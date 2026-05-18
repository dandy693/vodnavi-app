import sys
F = sys.argv[1]
with open(F, 'r', encoding='utf-8') as f:
    src = f.read()

if 'vodnavi_filter_robots_txt' in src:
    print('already patched')
    sys.exit()

snippet = '''
//////////////////////////////////////////////////
// robots.txt フィルタ — Google Sitemap Generator が
// HTML サイトマップを `Sitemap:` ヘッダに加えてしまう問題を抑止。
// `Sitemap: ...sitemap.html` 行のみ削除し、XML sitemap は残す。
//////////////////////////////////////////////////
if ( ! function_exists( 'vodnavi_filter_robots_txt' ) ) {
    function vodnavi_filter_robots_txt( $output, $public ) {
        $output = preg_replace( '/^\\s*Sitemap:\\s*\\S*sitemap\\.html\\s*$/mi', '', $output );
        // 余分な空行を 1 行にまとめる
        $output = preg_replace( "/\\n{3,}/", "\\n\\n", $output );
        return $output;
    }
}
add_filter( 'robots_txt', 'vodnavi_filter_robots_txt', 99, 2 );
'''

if not src.endswith('\n'):
    src += '\n'
src += '\n' + snippet
with open(F, 'w', encoding='utf-8') as f:
    f.write(src)
print('PATCHED')
