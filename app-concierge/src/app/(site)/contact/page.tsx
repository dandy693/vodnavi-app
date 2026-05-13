import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "VODNAVI へのお問い合わせ。サイトに関するご質問・ご要望は本フォームよりお送りください。",
  alternates: { canonical: absoluteUrl("/contact") },
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8">
        <p className="mb-2 text-[11px] font-medium tracking-[0.25em] text-amber-300">
          CONTACT
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          お問い合わせ
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          サイトに関するご質問・ご要望、提携・取材のご相談などは、下記フォームよりお送りください。
          通常 3 営業日以内に担当者よりご返信いたします。
        </p>
      </header>

      <ContactForm />
    </div>
  );
}
