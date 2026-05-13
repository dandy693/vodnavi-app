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

  function update(key: string, value: string | null, defaultValue: string) {
    const next = new URLSearchParams(params);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.push(`/?${next.toString()}`);
    });
  }

  return (
    <div
      data-pending={isPending ? "" : undefined}
      className="flex flex-wrap items-center gap-2"
    >
      <Select
        value={currentFloor}
        onValueChange={(v) => update("floor", v, DEFAULT_FLOOR)}
      >
        <SelectTrigger className="h-9 min-w-[120px] rounded-full border-white/10 bg-white/5 text-xs">
          <SelectValue placeholder="ジャンル" />
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
        <SelectTrigger className="h-9 min-w-[120px] rounded-full border-white/10 bg-white/5 text-xs">
          <SelectValue placeholder="並び替え" />
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
