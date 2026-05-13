import { KeyRound } from "lucide-react";

export function ConfigErrorPanel({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 sm:p-8">
      <div className="mb-3 inline-flex items-center gap-2 text-amber-300">
        <KeyRound className="size-4" aria-hidden />
        <span className="text-xs font-semibold tracking-[0.2em]">
          API SETUP REQUIRED
        </span>
      </div>
      <h2 className="mb-2 font-heading text-xl font-semibold text-foreground">
        FANZA API の認証情報が未設定です
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      <div className="rounded-lg bg-black/40 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
        <div className="mb-2 text-amber-300/80"># .env.local</div>
        <div>DMM_API_ID=&quot;your_api_id&quot;</div>
        <div>DMM_AFFILIATE_ID=&quot;your_affiliate_id-990&quot;</div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground/70">
        DMM アフィリエイトの管理画面（API 設定）から発行できます。
        設定後は dev サーバーを再起動してください。
      </p>
    </div>
  );
}
