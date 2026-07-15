/**
 * D1: 旧作 works アーカイブサイトマップ（設計書 d1-d2-design-20260714.md /
 * CSO承認 2026-07-15・実装ゴーはR1-b①48h判定成立後）。
 *
 * 目的: sitemap.ts の回転式収録（フロア×4ページ×100件・sort=date）から押し出された
 * 旧作 works を Supabase 累積テーブルに永続記録し、`/sitemap-archive.xml` で
 * 恒久的にクロール対象として提示する（waaa00663 型の未再クロール孤立の解消）。
 *
 * 原則（stale-cache.ts と同型の fail-safe）:
 *   - 書込みは fire-and-forget（失敗無視）＝本体 sitemap 生成へ遅延/障害を波及させない
 *   - 読出しはエラー/env 未配線で空配列 → アーカイブ sitemap は空の整形式 XML
 *   - 追加の FANZA API コールは一切発生させない（R1 と衝突しない）
 */
import { getServiceRoleClient } from "@/lib/supabase/server";

const TABLE = "sitemap_works_archive";

/** last_seen_at がこれより古い行は出力しない（廃売404の蓄積防止・設計値180日） */
export const ARCHIVE_MAX_AGE_DAYS = 180;

/** PostgREST の1リクエスト上限(既定1,000行)を回避するためのページサイズ/上限 */
const PAGE_SIZE = 1000;
const MAX_PAGES = 50;

export interface ArchiveEntry {
  content_id: string;
  floor_code: string;
  released_at: string | null;
}

export interface ArchiveRow extends ArchiveEntry {
  last_seen_at: string;
}

/**
 * sitemap 生成時に観測した works を累積記録する。呼び出し側は await しないこと。
 * 既存行は floor_code / released_at / last_seen_at を更新（first_seen_at は初回のみ）。
 */
export function persistSitemapWorksArchive(entries: ArchiveEntry[]): void {
  const supabase = getServiceRoleClient();
  if (!supabase || entries.length === 0) return;
  const now = new Date().toISOString();
  const rows = entries.map((e) => ({
    content_id: e.content_id,
    floor_code: e.floor_code,
    released_at: e.released_at,
    last_seen_at: now,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    void supabase
      .from(TABLE)
      .upsert(rows.slice(i, i + 500), { onConflict: "content_id" })
      .then(() => undefined);
  }
}

/**
 * アーカイブ行の読出し（鮮度キャップ内・last_seen_at 降順）。
 * 失敗・未配線時は空配列（呼び出し側は空の urlset を返す）。
 */
export async function fetchSitemapArchiveRows(): Promise<ArchiveRow[]> {
  const supabase = getServiceRoleClient();
  if (!supabase) return [];
  const cutoff = new Date(
    Date.now() - ARCHIVE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const rows: ArchiveRow[] = [];
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase
        .from(TABLE)
        .select("content_id, floor_code, released_at, last_seen_at")
        .gte("last_seen_at", cutoff)
        .order("last_seen_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error || !data) break;
      rows.push(...(data as ArchiveRow[]));
      if (data.length < PAGE_SIZE) break;
    }
  } catch {
    /* fail-safe: 取得できた分のみ返す */
  }
  return rows;
}
