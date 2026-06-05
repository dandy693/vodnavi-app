/**
 * お問い合わせを Make の Webhook に POST する。
 *
 * 環境変数 NEXT_PUBLIC_MAKE_WEBHOOK_URL が未設定の場合は、コンソールに記録するだけのモードに
 * 自動で切り替わる（dev 環境や Make 接続前の状態でもフォーム動作確認が可能）。
 *
 * Make 側の想定スキーマ:
 *   { name: string, email: string, subject: string, message: string,
 *     receivedAt: ISO8601, source: "vodnavi.app" }
 */

export interface InquiryInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class InquirySubmitError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "InquirySubmitError";
  }
}

export async function submitInquiry(input: InquiryInput): Promise<void> {
  const payload = {
    ...input,
    receivedAt: new Date().toISOString(),
    source: "vodnavi.app",
  };

  const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "[inquiry] NEXT_PUBLIC_MAKE_WEBHOOK_URL is not set — logging only.",
    );
    console.log("[inquiry]", payload);
    return;
  }

  let res: Response;
  try {
    res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new InquirySubmitError(
      "ネットワークエラーが発生しました。通信環境をご確認のうえ、再度お試しください。",
    );
  }

  if (!res.ok) {
    throw new InquirySubmitError(
      `送信に失敗しました (HTTP ${res.status})。時間を置いてもう一度お試しください。`,
      res.status,
    );
  }
}
