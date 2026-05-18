import sys
F = sys.argv[1]
with open(F, 'r', encoding='utf-8') as f:
    src = f.read()

# Check if already patched (v2 markers)
if 'html_entity_decode' in src and 'trim( $desc ) === ' in src:
    print('already v2 patched')
    sys.exit()

# Improve meta description: decode entities so &nbsp; becomes nbsp, trim properly
old1 = "$content = strip_shortcodes( (string) $post->post_content );"
new1 = '$content = strip_shortcodes( (string) $post->post_content );\n                    $content = html_entity_decode( $content, ENT_QUOTES | ENT_HTML5, \'UTF-8\' );'
if old1 in src:
    src = src.replace(old1, new1, 1)
    print('meta desc decode: patched')

# Add bloginfo ultimate fallback for whitespace-only desc
old2 = "if ( $desc !== '' ) {"
new2 = "if ( trim( $desc ) === '' || trim( $desc ) === chr(160) ) { $desc = (string) get_bloginfo( 'description' ); }\n        if ( trim( $desc ) !== '' ) {"
if old2 in src:
    src = src.replace(old2, new2, 1)
    print('bloginfo fallback: patched')

with open(F, 'w', encoding='utf-8') as f:
    f.write(src)
print('DONE')
