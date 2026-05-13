[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$XmlPath,

    [Parameter(Mandatory = $true)]
    [int]$PostId,

    [Parameter(Mandatory = $true)]
    [string]$OutPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $XmlPath)) {
    throw "XML file not found: $XmlPath"
}

[xml]$xml = Get-Content -LiteralPath $XmlPath -Raw
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("content", "http://purl.org/rss/1.0/modules/content/")
$ns.AddNamespace("excerpt", "http://wordpress.org/export/1.2/excerpt/")
$ns.AddNamespace("dc", "http://purl.org/dc/elements/1.1/")
$ns.AddNamespace("wp", "http://wordpress.org/export/1.2/")

$item = $xml.SelectSingleNode("//item[wp:post_id='$PostId']", $ns)
if ($null -eq $item) {
    throw "post_id $PostId was not found in $XmlPath"
}

function Get-NodeText {
    param(
        [System.Xml.XmlNode]$Parent,
        [string]$XPath
    )

    $node = $Parent.SelectSingleNode($XPath, $ns)
    if ($null -eq $node) {
        return ""
    }

    return [string]$node.InnerText
}

$title = Get-NodeText -Parent $item -XPath "title"
$link = Get-NodeText -Parent $item -XPath "link"
$status = Get-NodeText -Parent $item -XPath "wp:status"
$postType = Get-NodeText -Parent $item -XPath "wp:post_type"
$postDate = Get-NodeText -Parent $item -XPath "wp:post_date"
$postModified = Get-NodeText -Parent $item -XPath "wp:post_modified"
$creator = Get-NodeText -Parent $item -XPath "dc:creator"
$excerpt = Get-NodeText -Parent $item -XPath "excerpt:encoded"
$content = Get-NodeText -Parent $item -XPath "content:encoded"

$categories = @()
$tags = @()
foreach ($cat in $item.SelectNodes("category", $ns)) {
    $domain = [string]$cat.Attributes["domain"].Value
    $text = [string]$cat.InnerText
    if ([string]::IsNullOrWhiteSpace($text)) {
        continue
    }

    if ($domain -eq "category") {
        $categories += $text
    } elseif ($domain -eq "post_tag") {
        $tags += $text
    }
}

$riskWords = @(
    "女子高生",
    "JK",
    "ロリ",
    "未成年",
    "学生",
    "高校",
    "中学生",
    "小学生",
    "少女",
    "美少女"
)

$affiliatePatterns = @(
    "FANZA",
    "fanza",
    "DMM",
    "dmm",
    "affiliate",
    "al.dmm",
    "ad.dmm"
)

$combinedText = @(
    $title,
    $content,
    ($categories -join " "),
    ($tags -join " ")
) -join "`n"

$titleRiskHits = @()
$allRiskHits = @()
foreach ($word in $riskWords) {
    $titleCount = ([regex]::Matches($title, [regex]::Escape($word), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    $allCount = ([regex]::Matches($combinedText, [regex]::Escape($word), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    if ($titleCount -gt 0) {
        $titleRiskHits += "${word}:${titleCount}"
    }
    if ($allCount -gt 0) {
        $allRiskHits += "${word}:${allCount}"
    }
}

$affiliateHits = @()
foreach ($pattern in $affiliatePatterns) {
    $count = ([regex]::Matches($content, [regex]::Escape($pattern), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    if ($count -gt 0) {
        $affiliateHits += "${pattern}:${count}"
    }
}

$sourceName = Split-Path -Leaf $XmlPath
$dateStamp = Get-Date -Format "yyyy-MM-dd"
$categoryText = $categories -join ", "
$tagText = $tags -join ", "

$builder = New-Object System.Text.StringBuilder
[void]$builder.AppendLine("# post_id " + $PostId + " 現本文バックアップ")
[void]$builder.AppendLine()
[void]$builder.AppendLine("本ファイルは、WordPressエクスポートXMLから抽出したローカルバックアップです。")
[void]$builder.AppendLine()
[void]$builder.AppendLine("- 対象記事ID: " + $PostId)
[void]$builder.AppendLine("- 取得日: " + $dateStamp)
[void]$builder.AppendLine("- 取得元: " + $sourceName)
[void]$builder.AppendLine("- 状態: バックアップ保存済み")
[void]$builder.AppendLine()
[void]$builder.AppendLine("## 基本情報")
[void]$builder.AppendLine()
[void]$builder.AppendLine("- タイトル: " + $title)
[void]$builder.AppendLine("- URL: " + $link)
[void]$builder.AppendLine("- ステータス: " + $status)
[void]$builder.AppendLine("- 投稿タイプ: " + $postType)
[void]$builder.AppendLine("- 公開日時: " + $postDate)
[void]$builder.AppendLine("- 更新日時: " + $postModified)
[void]$builder.AppendLine("- 作成者: " + $creator)
[void]$builder.AppendLine("- カテゴリー: " + $categoryText)
[void]$builder.AppendLine("- タグ: " + $tagText)
[void]$builder.AppendLine("- 抜粋: " + $excerpt)
[void]$builder.AppendLine("- メタディスクリプション: XML内で未確認")
[void]$builder.AppendLine("- noindex状態: XML内で未確認")
[void]$builder.AppendLine("- アイキャッチ画像: XML内の本文外メタからは未確認")
[void]$builder.AppendLine("- 画像alt: XML内で未確認")
[void]$builder.AppendLine()
[void]$builder.AppendLine("## 本文バックアップ")
[void]$builder.AppendLine()
[void]$builder.AppendLine("以下に、XMLから抽出した本文を改変せず保存する。")
[void]$builder.AppendLine()
[void]$builder.AppendLine('```html')
[void]$builder.AppendLine($content)
[void]$builder.AppendLine('```')

$outDir = Split-Path -Parent $OutPath
if (-not [string]::IsNullOrWhiteSpace($outDir) -and -not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$builder.ToString() | Set-Content -LiteralPath $OutPath -Encoding UTF8

[pscustomobject]@{
    post_id = $PostId
    title = $title
    url = $link
    status = $status
    post_type = $postType
    post_date = $postDate
    post_modified = $postModified
    creator = $creator
    excerpt = $excerpt
    content_length = $content.Length
    category_count = $categories.Count
    tag_count = $tags.Count
    categories = $categories
    tags = $tags
    title_risk_word_hits = $titleRiskHits
    risk_word_hits = $allRiskHits
    affiliate_pattern_hits = $affiliateHits
    current_backup_saved = 'yes'
    source_xml = $sourceName
} | ConvertTo-Json -Depth 4



