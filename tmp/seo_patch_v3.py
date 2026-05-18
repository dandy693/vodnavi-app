import sys
F = sys.argv[1]
with open(F, 'r', encoding='utf-8') as f:
    src = f.read()

if 'vodnavi_thumbnail_alt_fallback' in src:
    print('already v3 patched')
    sys.exit()

snippet = '''
//////////////////////////////////////////////////
// SEO Fallback v3 — post_thumbnail_html での alt 補完
// THE THOR がカスタムレンダリングする wp-post-image にも対応。
//////////////////////////////////////////////////
if ( ! function_exists( 'vodnavi_thumbnail_alt_fallback' ) ) {
    function vodnavi_thumbnail_alt_fallback( $html, $post_id, $post_thumbnail_id ) {
        if ( ! $html || strpos( $html, 'alt=""' ) === false ) {
            return $html;
        }
        $alt = '';
        $post = get_post( $post_id );
        if ( $post ) {
            $alt = (string) $post->post_title;
        }
        if ( $alt === '' && $post_thumbnail_id ) {
            $att = get_post( $post_thumbnail_id );
            if ( $att ) {
                $alt = (string) $att->post_title;
            }
        }
        if ( $alt !== '' ) {
            $html = str_replace( 'alt=""', 'alt="' . esc_attr( $alt ) . '"', $html );
        }
        return $html;
    }
}
add_filter( 'post_thumbnail_html', 'vodnavi_thumbnail_alt_fallback', 99, 3 );
'''

if not src.endswith('\n'):
    src += '\n'
src += '\n' + snippet

with open(F, 'w', encoding='utf-8') as f:
    f.write(src)
print('PATCHED v3')
