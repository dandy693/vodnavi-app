import sys
F = sys.argv[1]
with open(F, 'r', encoding='utf-8') as f:
    src = f.read()

if 'vodnavi_noindex_archive' in src:
    print('already patched')
    sys.exit()

snippet = '''
//////////////////////////////////////////////////
// Archive noindex — タグ/カテゴリ/著者/日付アーカイブを noindex, follow
// 重複コンテンツ判定回避とクロールバジェット集中のため。
//////////////////////////////////////////////////
if ( ! function_exists( 'vodnavi_noindex_archive' ) ) {
    function vodnavi_noindex_archive( $robots ) {
        if ( is_tag() || is_category() || is_tax() || is_author() || is_date() ) {
            $robots['noindex']  = true;
            $robots['follow']   = true;
            unset( $robots['index'] );
        }
        return $robots;
    }
}
add_filter( 'wp_robots', 'vodnavi_noindex_archive', 99 );
'''

if not src.endswith('\n'):
    src += '\n'
src += '\n' + snippet
with open(F, 'w', encoding='utf-8') as f:
    f.write(src)
print('PATCHED')
