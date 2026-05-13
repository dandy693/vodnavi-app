param(
    [string]$XmlPath = "07_wp/export/moterist-wp-export-20260502-clean.xml",
    [string]$OutPath = "02_site-audit/article-inventory-from-xml.csv"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $XmlPath)) {
    throw "XML file not found: $XmlPath"
}

Write-Host "Loading XML: $XmlPath"

[xml]$xml = Get-Content -Path $XmlPath -Raw -Encoding UTF8

$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("wp", "http://wordpress.org/export/1.2/")
$ns.AddNamespace("content", "http://purl.org/rss/1.0/modules/content/")
$ns.AddNamespace("excerpt", "http://wordpress.org/export/1.2/excerpt/")
$ns.AddNamespace("dc", "http://purl.org/dc/elements/1.1/")

$items = $xml.SelectNodes("//channel/item")
$rows = @()

foreach ($item in $items) {
    $postTypeNode = $item.SelectSingleNode("wp:post_type", $ns)
    $statusNode = $item.SelectSingleNode("wp:status", $ns)
    $postIdNode = $item.SelectSingleNode("wp:post_id", $ns)
    $postDateNode = $item.SelectSingleNode("wp:post_date", $ns)
    $postModifiedNode = $item.SelectSingleNode("wp:post_modified", $ns)
    $creatorNode = $item.SelectSingleNode("dc:creator", $ns)
    $contentNode = $item.SelectSingleNode("content:encoded", $ns)

    $postType = if ($postTypeNode) { $postTypeNode.InnerText } else { "" }

    if ($postType -notin @("post", "page")) {
        continue
    }

    $title = if ($item.SelectSingleNode("title")) { $item.SelectSingleNode("title").InnerText.Trim() } else { "" }
    $url = if ($item.SelectSingleNode("link")) { $item.SelectSingleNode("link").InnerText.Trim() } else { "" }
    $content = if ($contentNode) { $contentNode.InnerText } else { "" }

    $plain = $content -replace "<[^>]+>", " "
    $plain = $plain -replace "\s+", " "
    $contentLength = $plain.Trim().Length

    $affiliateCount = 0
    if ($content) {
        $patterns = @(
            "fanza",
            "dmm",
            "affiliate",
            "al\.dmm",
            "ad\.dmm",
            "actress\.dmm",
            "video\.dmm"
        )

        foreach ($pattern in $patterns) {
            $matches = [regex]::Matches($content, $pattern, "IgnoreCase")
            $affiliateCount += $matches.Count
        }
    }

    $categories = @()
    $tags = @()

    foreach ($cat in $item.SelectNodes("category")) {
        $domain = $cat.GetAttribute("domain")
        $value = $cat.InnerText

        if ($domain -eq "category") {
            if ($value) { $categories += $value }
        }
        elseif ($domain -eq "post_tag") {
            if ($value) { $tags += $value }
        }
    }

    $rows += [PSCustomObject]@{
        post_id = if ($postIdNode) { $postIdNode.InnerText } else { "" }
        url = $url
        title = $title
        status = if ($statusNode) { $statusNode.InnerText } else { "" }
        post_type = $postType
        author = if ($creatorNode) { $creatorNode.InnerText } else { "" }
        category = ($categories -join " / ")
        tags = ($tags -join " / ")
        published_date = if ($postDateNode) { $postDateNode.InnerText } else { "" }
        updated_date = if ($postModifiedNode) { $postModifiedNode.InnerText } else { "" }
        content_length = $contentLength
        affiliate_link_count = $affiliateCount
        adult_risk = ""
        minor_risk = ""
        seo_value = ""
        click_value = ""
        action = ""
        priority = ""
        memo = ""
    }
}

$rows |
    Sort-Object @{Expression="post_type";Descending=$false}, @{Expression="published_date";Descending=$true} |
    Export-Csv -Path $OutPath -NoTypeInformation -Encoding UTF8

Write-Host "Saved: $OutPath"
Write-Host "Total rows: $($rows.Count)"

$summary = $rows | Group-Object post_type, status | Select-Object Name, Count
Write-Host ""
Write-Host "Summary:"
$summary | Format-Table -AutoSize
