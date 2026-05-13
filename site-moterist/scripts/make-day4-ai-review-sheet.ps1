param(
    [string]$TargetCsv = "02_site-audit/day4-review-target-30.csv",
    [string]$OutPath = "02_site-audit/day4-ai-review-sheet.csv"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $TargetCsv)) {
    throw "Target CSV not found: $TargetCsv"
}

$rows = Import-Csv $TargetCsv

$out = foreach ($row in $rows) {
    $suggestedIssue = @()

    $contentLength = 0
    $affiliateCount = 0

    [int]::TryParse($row.content_length, [ref]$contentLength) | Out-Null
    [int]::TryParse($row.affiliate_link_count, [ref]$affiliateCount) | Out-Null

    if ($row.risk_words) {
        $suggestedIssue += "タイトルに注意ワード候補あり"
    }

    if ($contentLength -lt 800) {
        $suggestedIssue += "本文が短く薄い可能性"
    }
    elseif ($contentLength -lt 1500) {
        $suggestedIssue += "本文の情報量がやや少ない可能性"
    }

    if ($affiliateCount -eq 0) {
        $suggestedIssue += "アフィリエイト導線が弱い可能性"
    }
    elseif ($affiliateCount -gt 50) {
        $suggestedIssue += "アフィリエイトリンクまたは関連文字列が非常に多い可能性"
    }
    elseif ($affiliateCount -gt 10) {
        $suggestedIssue += "アフィリエイトリンクまたは関連文字列が多い可能性"
    }

    if ($suggestedIssue.Count -eq 0) {
        $suggestedIssue += "要目視確認"
    }

    [PSCustomObject]@{
        post_id = $row.post_id
        url = $row.url
        title = $row.title
        category = $row.category
        tags = $row.tags
        content_length = $row.content_length
        affiliate_link_count = $row.affiliate_link_count
        risk_words = $row.risk_words
        issue_guess = ($suggestedIssue -join " / ")
        ai_recommended_action = ""
        ai_reason = ""
        revised_title_direction = ""
        rewrite_priority = ""
        final_human_decision = ""
        memo = ""
    }
}

$out | Export-Csv -Path $OutPath -NoTypeInformation -Encoding UTF8

Write-Host "Saved: $OutPath"
Write-Host "Rows: $($out.Count)"

$out |
    Select-Object post_id, issue_guess, title |
    Format-Table -AutoSize
