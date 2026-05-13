param(
    [string]$TargetCsv = "02_site-audit/day4-review-target-30.csv",
    [string]$AiCsv = "02_site-audit/day4-ai-review-sheet.csv",
    [string]$OutPath = "02_site-audit/day4-classification-summary.md"
)

$ErrorActionPreference = "Stop"

$targets = Import-Csv $TargetCsv
$aiRows = Import-Csv $AiCsv

$riskCount = ($targets | Where-Object { $_.risk_words -ne "" }).Count
$shortCount = ($targets | Where-Object { [int]($_.content_length) -lt 800 }).Count
$manyAffiliateCount = ($targets | Where-Object { [int]($_.affiliate_link_count) -gt 10 }).Count
$veryManyAffiliateCount = ($targets | Where-Object { [int]($_.affiliate_link_count) -gt 50 }).Count
$noAffiliateCount = ($targets | Where-Object { [int]($_.affiliate_link_count) -eq 0 }).Count

$md = @"
# Day 4 Classification Preparation Summary

## Overview

- Review target articles: $($targets.Count)
- Risk word candidates: $riskCount
- Short content candidates under 800 chars: $shortCount
- Articles with more than 10 affiliate-link-pattern hits: $manyAffiliateCount
- Articles with more than 50 affiliate-link-pattern hits: $veryManyAffiliateCount
- Articles with zero affiliate-link-pattern hits: $noAffiliateCount

## Created Files

- 02_site-audit/day4-review-target-30.csv
- 02_site-audit/day4-ai-review-sheet.csv
- 02_site-audit/day4-ai-review-sheet.md
- 06_prompts/day4-claude-classification-prompt.md
- 06_prompts/day4-chatgpt-classification-check-prompt.md

## Policy

No article deletion, no noindex setting, no title change, and no content rewrite have been performed.

## Initial Finding

The first review target set contains several articles with:
- Short content
- Many affiliate-link-pattern hits
- Risk-word candidates in titles

These should be reviewed as candidates for rewrite, merge, or noindex before any deletion is considered.

## Next Step

1. Paste day4-ai-review-sheet.md into Claude with the Day 4 Claude prompt.
2. Save Claude output as 02_site-audit/day4-claude-classification-result.md.
3. Review Claude output with ChatGPT.
4. Create final decision sheet.
"@

$md | Out-File -Encoding UTF8 $OutPath

Write-Host "Saved: $OutPath"
