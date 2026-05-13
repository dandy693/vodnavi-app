param(
    [string]$CsvPath = "02_site-audit/article-inventory-from-xml.csv",
    [string]$RiskCsvPath = "02_site-audit/article-risk-title-check.csv",
    [string]$OutPath = "02_site-audit/day3-inventory-summary.md"
)

$ErrorActionPreference = "Stop"

$rows = Import-Csv $CsvPath
$riskRows = @()
if (Test-Path $RiskCsvPath) {
    $riskRows = Import-Csv $RiskCsvPath
}

$total = $rows.Count
$postCount = ($rows | Where-Object { $_.post_type -eq "post" }).Count
$pageCount = ($rows | Where-Object { $_.post_type -eq "page" }).Count
$publishCount = ($rows | Where-Object { $_.status -eq "publish" }).Count
$draftCount = ($rows | Where-Object { $_.status -eq "draft" }).Count
$riskCount = $riskRows.Count

$topAffiliate = $rows |
    Sort-Object {[int]($_.affiliate_link_count)} -Descending |
    Select-Object -First 10 post_id, post_type, status, affiliate_link_count, title, url

$shortContents = $rows |
    Where-Object { $_.post_type -eq "post" -and [int]($_.content_length) -lt 800 } |
    Sort-Object {[int]($_.content_length)} |
    Select-Object -First 20 post_id, status, content_length, title, url

$md = @"
# Day 3 Inventory Summary

## Overview

- Total rows: $total
- Posts: $postCount
- Pages: $pageCount
- Publish: $publishCount
- Draft: $draftCount
- Risk title candidates: $riskCount

## Policy

This summary is for inventory only.
No article deletion, no noindex setting, and no title changes have been performed.

## Top affiliate-link-count candidates

"@

foreach ($row in $topAffiliate) {
    $md += "`n- [$($row.post_id)] $($row.title) / affiliate_link_count: $($row.affiliate_link_count)"
}

$md += @"

## Short content candidates

"@

foreach ($row in $shortContents) {
    $md += "`n- [$($row.post_id)] $($row.title) / content_length: $($row.content_length)"
}

$md += @"

## Next Actions

1. Review risk title candidates.
2. Select first 30 articles for manual/AI audit.
3. Classify each as keep / rewrite / noindex / merge / delete.
4. Do not delete articles until redirect/internal-link strategy is decided.
"@

$md | Out-File -Encoding UTF8 $OutPath

Write-Host "Saved: $OutPath"
