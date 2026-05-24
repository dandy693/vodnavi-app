"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(params.get("keyword") ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    const trimmed = keyword.trim();
    if (trimmed) next.set("keyword", trimmed);
    else next.delete("keyword");
    // 検索キーワード変更時は結果集合が変わるため、page=N は無効化して 1 ページ目へ。
    next.delete("page");
    startTransition(() => {
      router.push(`/?${next.toString()}`);
    });
  }

  function handleClear() {
    setKeyword("");
    const next = new URLSearchParams(params);
    next.delete("keyword");
    // キーワードクリア時も安全に 1 ページ目へフォールバック。
    next.delete("page");
    startTransition(() => {
      router.push(`/?${next.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full items-center">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
      />
      <Input
        name="keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="作品名・女優・ジャンルで検索"
        inputMode="search"
        className="h-11 w-full rounded-full border-white/10 bg-white/5 pl-10 pr-24 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/20"
        aria-label="検索"
      />
      {keyword && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="検索ワードをクリア"
          className="absolute right-20 flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
      <Button
        type="submit"
        disabled={isPending}
        className="absolute right-1.5 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-4 text-xs font-semibold text-black hover:from-amber-400 hover:to-yellow-300 disabled:opacity-60"
      >
        {isPending ? "検索中…" : "検索"}
      </Button>
    </form>
  );
}
