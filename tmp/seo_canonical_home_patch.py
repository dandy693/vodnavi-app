"""
seo_canonical_home_patch.py
THE THOR child テーマの functions.php に「ホーム/フロントページ向け canonical タグ」を
冪等に追加するパッチ。

Source of Truth:
  - management/_metrics/CURRENT_AUDIT_REPORT.md §6.2

実行:
  python3 tmp/seo_canonical_home_patch.py <path_to_functions.php>

冪等性: 関数 vodnavi_emit_canonical_home が既に存在する場合は何もしない。
"""
import sys

F = sys.argv[1]
with open(F, 'r', encoding='utf-8') as f:
    src = f.read()

if 'vodnavi_emit_canonical_home' in src:
    print('already patched')
    sys.exit()

snippet = '''
//////////////////////////////////////////////////
// Home/Front canonical fallback —
// THE THOR の親テーマがホーム描画時に canonical を出力しないため、
// is_front_page() / is_home() のときだけ補完する。
// 個別記事ページの canonical は親テーマが既に出力しているので干渉しない。
//////////////////////////////////////////////////
if ( ! function_exists( 'vodnavi_emit_canonical_home' ) ) {
    function vodnavi_emit_canonical_home() {
        if ( is_front_page() || is_home() ) {
            echo "\\n" . '<link rel="canonical" href="' . esc_url( home_url( '/' ) ) . '">' . "\\n";
        }
    }
}
add_action( 'wp_head', 'vodnavi_emit_canonical_home', 1 );
'''

if not src.endswith('\n'):
    src += '\n'
src += '\n' + snippet
with open(F, 'w', encoding='utf-8') as f:
    f.write(src)
print('PATCHED')
