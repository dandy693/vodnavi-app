"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FANZA_FLOORS,
  FANZA_SORT_OPTIONS,
} from "@/lib/fanza/types";

const DEFAULT_FLOOR = "videoa";
const DEFAULT_SORT = "date";

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFloor = params.get("floor") ?? DEFAULT_FLOOR;
  const currentSort = params.get("sort") ?? DEFAULT_SORT;

  // 現在の floor / sort に対応する日本語ラベルをマスターから確実に逆引きする。
  // Radix の <SelectValue> の自動テキスト推定に頼らず、明示的に正典値を描画。
  const currentFloorLabel =
    FANZA_FLOORS.find((f) => f.code === currentFloor)?.label || "動画";
  const currentSortLabel =
    FANZA_SORT_OPTIONS.find((s) => s.value === currentSort)?.label || "新着順";

  function update(key: string, value: string | null, defaultValue: string) {
    const next = new URLSearchParams(params);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    // floor / sort 切替時は結果集合そのものが変わるため、page=N の文脈は無効。
    // 物理的にパージして先頭ページ (page=1 ≡ 省略) に強制リセット。
    next.delete("page");
    startTransition(() => {
      router.push(`/?${next.toString()}`);
    });
  }

  // ブラウザ翻訳 (Google Translate 等) が Radix Select の表示テキストを書き換え、
  // 内部 state と乖離して "videoa" / "date" のような raw code が露出する事故を
  // 防止する。`translate="no"` と Google Translate 固有の `notranslate` クラスを
  // 二重で配線して翻訳対象から完全除外する。
  return (
    <div
      data-pending={isPending ? "" : undefined}
      className="flex flex-wrap items-center gap-2 notranslate"
      translate="no"
    >
      <Select
        value={currentFloor}
        onValueChange={(v) => update("floor", v, DEFAULT_FLOOR)}
      >
        <SelectTrigger
          className="h-9 min-w-[120px] rounded-full border-white/10 bg-white/5 text-xs notranslate"
          translate="no"
        >
          <SelectValue placeholder="ジャンル">{currentFloorLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FANZA_FLOORS.map((floor) => (
            <SelectItem key={floor.code} value={floor.code}>
              {floor.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(v) => update("sort", v, DEFAULT_SORT)}
      >
        <SelectTrigger
          className="h-9 min-w-[120px] rounded-full border-white/10 bg-white/5 text-xs notranslate"
          translate="no"
        >
          <SelectValue placeholder="並び替え">{currentSortLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FANZA_SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
