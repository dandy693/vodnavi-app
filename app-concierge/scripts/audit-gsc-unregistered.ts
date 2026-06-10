/**
 * VODNAVI-GROUP GSC Unregistered URL Auditor
 * 目的: 「インデックス未登録」URL バケットを works / genres / 旧WP残骸(/archives/) に機械仕分けする。
 * 運用方法: GSC からエクスポートした CSV、または API 経由で取得した URL 一覧を auditUrls() に渡す。
 *
 * 注 (CTO 2026-06-10): CSO 原案の `import * as fs` は未使用で tsc(noUnusedLocals) を割るため除去。
 * CSV/stdin ローダーは GSC エクスポート形式確定後に追加する（現状は純粋関数のみで単体テスト可能）。
 */

export interface UnregisteredAuditSummary {
  works: number;
  genres: number;
  legacyWp: number;
  others: number;
}

export function auditUrls(urls: string[]): UnregisteredAuditSummary {
  const summary: UnregisteredAuditSummary = {
    works: 0,
    genres: 0,
    legacyWp: 0,
    others: 0,
  };

  urls.forEach((url) => {
    if (url.includes('/works/')) summary.works++;
    else if (url.includes('/genres/')) summary.genres++;
    else if (url.includes('/archives/') || url.includes('/?s=')) summary.legacyWp++;
    else summary.others++;
  });

  console.log('=== GSC UNREGISTERED AUDIT RESULT ===');
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}
