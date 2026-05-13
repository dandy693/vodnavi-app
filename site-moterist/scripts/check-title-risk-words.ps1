param(
    [string]$CsvPath = "02_site-audit/article-inventory-from-xml.csv",
    [string]$OutPath = "02_site-audit/article-risk-title-check.csv"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $CsvPath)) {
    throw "CSV file not found: $CsvPath"
}

$rows = Import-Csv $CsvPath

$riskWords = @(
    "女子高生",
    "JK",
    "ロリ",
    "未成年",
    "学生",
    "高校",
    "中学生",
    "小学生",
    "少女"
)

$result = foreach ($row in $rows) {
    $hits = @()

    foreach ($word in $riskWords) {
        if ($row.title -match [regex]::Escape($word)) {
            $hits += $word
        }
    }

    if ($hits.Count -gt 0) {
        [PSCustomObject]@{
            post_id = $row.post_id
            post_type = $row.post_type
            status = $row.status
            title = $row.title
            url = $row.url
            hit_words = ($hits -join " / ")
            recommended_action = "review"
            memo = "タイトルに注意ワード候補あり。削除ではなく、まず表現修正またはnoindex候補として確認。"
        }
    }
}

$result | Export-Csv -Path $OutPath -NoTypeInformation -Encoding UTF8

Write-Host "Saved: $OutPath"
Write-Host "Risk title rows: $($result.Count)"

if ($result.Count -gt 0) {
    $result | Select-Object -First 20 | Format-Table post_id,status,hit_words,title -AutoSize
}
