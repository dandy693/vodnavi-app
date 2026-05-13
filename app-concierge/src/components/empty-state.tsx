import { SearchX } from "lucide-react";

export function EmptyState({
  title = "作品が見つかりませんでした",
  description = "検索条件を変えてお試しください。",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-center">
      <SearchX className="size-8 text-muted-foreground/60" aria-hidden />
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
