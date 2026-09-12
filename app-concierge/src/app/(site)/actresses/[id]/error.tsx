"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ActressPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[actresses/[id]] runtime error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <article className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
      {/* 文言は第124便 裁定5(b)（2026-09-12）で固定。時点注記・noindex の明示は不要（5xx はインデックス対象外）。 */}
      <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        一時的に作品情報を取得できません
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        しばらくして再読み込みしてください。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={reset}
          variant="default"
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          もう一度試す
        </Button>
        <Link
          href="/"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          ホームへ戻る
        </Link>
      </div>
    </article>
  );
}
