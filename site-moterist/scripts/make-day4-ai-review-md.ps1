param(
    [string]$CsvPath = "02_site-audit/day4-ai-review-sheet.csv",
    [string]$OutPath = "02_site-audit/day4-ai-review-sheet.md"
)

$ErrorActionPreference = "Stop"

$rows = Import-Csv $CsvPath

$md = @"
# Day 4 AI Review Sheet

| post_id | title | content_length | affiliate_link_count | risk_words | issue_guess | url |
|---|---|---:|---:|---|---|---|
"@

foreach ($r in $rows) {
    $title = ($r.title -replace "\|", "｜")
    $issue = ($r.issue_guess -replace "\|", "｜")
    $risk = ($r.risk_words -replace "\|", "｜")
    $url = ($r.url -replace "\|", "｜")

    $md += "`n| $($r.post_id) | $title | $($r.content_length) | $($r.affiliate_link_count) | $risk | $issue | $url |"
}

$md | Out-File -Encoding UTF8 $OutPath

Write-Host "Saved: $OutPath"
