"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/lib/inquiries";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type FieldErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;

type Status = "idle" | "loading" | "success";

const MAX = { name: 100, email: 200, subject: 200, message: 5000 } as const;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    const fd = new FormData(e.currentTarget);

    // Honeypot — bots tend to fill every field
    if (String(fd.get("website") ?? "").trim()) {
      setStatus("success");
      return;
    }

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const subject = String(fd.get("subject") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    const errs: FieldErrors = {};
    if (!name) errs.name = "お名前を入力してください";
    else if (name.length > MAX.name)
      errs.name = `お名前は ${MAX.name} 文字以内で入力してください`;

    if (!email) errs.email = "メールアドレスを入力してください";
    else if (email.length > MAX.email)
      errs.email = `メールアドレスは ${MAX.email} 文字以内で入力してください`;
    else if (!EMAIL_RE.test(email))
      errs.email = "メールアドレスの形式が正しくありません";

    if (!subject) errs.subject = "件名を入力してください";
    else if (subject.length > MAX.subject)
      errs.subject = `件名は ${MAX.subject} 文字以内で入力してください`;

    if (!message) errs.message = "お問い合わせ内容を入力してください";
    else if (message.length > MAX.message)
      errs.message = `お問い合わせ内容は ${MAX.message} 文字以内で入力してください`;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus("loading");
    setErrors({});
    setSubmitError(null);

    try {
      await submitInquiry({ name, email, subject, message });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setSubmitError(
        err instanceof Error
          ? err.message
          : "送信に失敗しました。時間を置いてもう一度お試しください。",
      );
    }
  }

  function reset() {
    setStatus("idle");
    setErrors({});
    setSubmitError(null);
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-8 text-center"
      >
        <CheckCircle2
          className="mx-auto mb-3 size-12 text-amber-300"
          aria-hidden
        />
        <h2 className="font-heading text-xl font-semibold text-foreground">
          送信完了
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          お問い合わせを受け付けました。
          <br />
          通常 3 営業日以内にご返信いたします。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 text-xs text-amber-300 underline-offset-4 hover:underline"
        >
          別の内容を送る
        </button>
      </div>
    );
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot — kept off-screen for humans, visible to bots */}
      <div
        aria-hidden
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <label>
          このフィールドは空のままにしてください
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <FormField id="name" label="お名前" error={errors.name} required>
        <Input
          id="name"
          name="name"
          placeholder="山田 太郎"
          autoComplete="name"
          maxLength={MAX.name}
          disabled={isLoading}
          aria-invalid={!!errors.name}
        />
      </FormField>

      <FormField
        id="email"
        label="メールアドレス"
        error={errors.email}
        required
      >
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          inputMode="email"
          autoComplete="email"
          maxLength={MAX.email}
          disabled={isLoading}
          aria-invalid={!!errors.email}
        />
      </FormField>

      <FormField id="subject" label="件名" error={errors.subject} required>
        <Input
          id="subject"
          name="subject"
          placeholder="作品情報について 等"
          maxLength={MAX.subject}
          disabled={isLoading}
          aria-invalid={!!errors.subject}
        />
      </FormField>

      <FormField
        id="message"
        label="お問い合わせ内容"
        error={errors.message}
        required
      >
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="お問い合わせ内容をご記入ください"
          maxLength={MAX.message}
          disabled={isLoading}
          aria-invalid={!!errors.message}
        />
      </FormField>

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-2 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{submitError}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className={cn(
          "h-12 w-full rounded-xl text-base font-semibold",
          "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black",
          "hover:from-amber-400 hover:via-yellow-200 hover:to-amber-400",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
      >
        {isLoading ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              aria-hidden
              data-icon="inline-start"
            />
            送信中…
          </>
        ) : (
          "送信する"
        )}
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground/70">
        ※ 送信いただいた個人情報は、ご返答およびサービス改善以外の目的では使用しません。詳しくは
        <a href="/privacy" className="text-amber-300 hover:underline">
          プライバシーポリシー
        </a>
        をご確認ください。
      </p>
    </form>
  );
}

function FormField({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-1 text-amber-400" aria-label="必須">
            *
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
