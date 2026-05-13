param(
    [string]$InventoryCsv = "02_site-audit/article-inventory-from-xml.csv",
    [string]$RiskCsv = "02_site-audit/article-risk-title-check.csv",
    [string]$OutPath = "02_site-audit/day4-review-target-30.csv"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $InventoryCsv)) {
    throw "Inventory CSV not found: $InventoryCsv"
}

$rows = Import-Csv $InventoryCsv

$riskMap = @{}
if (Test-Path $RiskCsv) {
    $riskRows = Import-Csv $RiskCsv
    foreach ($r in $riskRows) {
        $riskMap[$r.post_id] = $r.hit_words
    }
}

$posts = $rows | Where-Object {
    $_.post_type -eq "post" -and $_.status -eq "publish"
}

$scored = foreach ($row in $posts) {
    $affiliateCount = 0
    $contentLength = 0

    [int]::TryParse($row.affiliate_link_count, [ref]$affiliateCount) | Out-Null
    [int]::TryParse($row.content_length, [ref]$contentLength) | Out-Null

    $riskWords = ""
    if ($riskMap.ContainsKey($row.post_id)) {
        $riskWords = $riskMap[$row.post_id]
    }

    $score = 0

    # 既に送客導線がある記事は優先
    $score += ($affiliateCount * 10)

    # 文字数が少ない記事は改善余地が大きい
    if ($contentLength -lt 800) {
        $score += 20
    }
    elseif ($contentLength -lt 1500) {
        $score += 10
    }

    # リスク表現候補は優先確認
    if ($riskWords) {
        $score += 50
    }

    [PSCustomObject]@{
        review_priority_score = $score
        post_id = $row.post_id
        url = $row.url
        title = $row.title
        status = $row.status
        post_type = $row.post_type
        category = $row.category
        tags = $row.tags
        published_date = $row.published_date
        updated_date = $row.updated_date
        content_length = $contentLength
        affiliate_link_count = $affiliateCount
        risk_words = $riskWords
        current_issue_guess = ""
        recommended_action = ""
        priority = ""
        ai_review_notes = ""
        human_decision = ""
        memo = ""
    }
}

$target = $scored |
    Sort-Object `
        @{ Expression = { [int]$_.review_priority_score }; Descending = $true },
        @{ Expression = { $_.updated_date }; Descending = $true } |
    Select-Object -First 30

$target | Export-Csv -Path $OutPath -NoTypeInformation -Encoding UTF8

Write-Host "Saved: $OutPath"
Write-Host "Target rows: $($target.Count)"

$target |
    Select-Object -First 30 post_id, review_priority_score, affiliate_link_count, content_length, risk_words, title |
    Format-Table -AutoSize
