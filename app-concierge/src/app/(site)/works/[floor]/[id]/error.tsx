"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function WorksDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[works/[floor]/[id]] runtime error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <article className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
      <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        作品情報を一時的に取得できませんでした
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        サーバー側でこの作品の詳細を組み立てる途中で問題が発生しました。
        <br />
        FANZA カタログの一時的な応答遅延の可能性が高く、しばらく時間をおいて再度お試しください。
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
