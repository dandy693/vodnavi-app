"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { track } from "@/lib/analytics";
import {
  buildConciergeHref,
  type TapAesthetic,
  type TapTime,
  type TapDepth,
  type TapPath,
} from "@/lib/concierge/three-tap-map";

/**
 * BRIEF_074/075 — 3タップ直感 UX 診断。
 *
 * 俗悪表現ゼロ（BRIEF_072 §2）の「プレミアムだが具体的」な 3 問で、美意識 →
 * 時間の濃度 → 深淵を選ばせ、3 タップ目で `buildConciergeHref()` が算出した
 * 既存 /concierge?cids= シード URL へ遷移する。新規データ層は持たない。
 *
 * 意匠は凍結ブランドトークンのみ（bg-brand-dark / text-brand-gold /
 * .btn-luxury-outline / font-luxury-heading）。生 Tailwind カラー禁止。
 */

type StepOption = { value: string; label: string };
type Step = {
  eyebrow: string;
  question: string;
  options: StepOption[];
};

const STEPS: readonly Step[] = [
  {
    eyebrow: "STEP 1 / 3 · 美意識",
    question: "求めている美意識は？",
    options: [
      { value: "lyrical", label: "叙情的な物語と、演者の美しさに深く浸りたい" },
      { value: "visceral", label: "圧倒的な熱量と臨場感、生々しい鼓動を感じたい" },
    ],
  },
  {
    eyebrow: "STEP 2 / 3 · 時間の濃度",
    question: "許された時間の濃度は？",
    options: [
      { value: "moment", label: "限られた時間で、もっとも濃密な一瞬に邂逅したい" },
      { value: "longform", label: "今夜は贅沢に夜更かしし、深く長い余韻に溺れたい" },
    ],
  },
  {
    eyebrow: "STEP 3 / 3 · 深淵",
    question: "到達したい深淵は？",
    options: [
      { value: "classic", label: "多くの蒐集家が絶賛した、外れのない不朽の名作" },
      { value: "niche", label: "独自の美学が貫かれた、知る人ぞ知る耽美な意欲作" },
    ],
  },
];

export function ConciergeQuiz({
  source = "app_3tap",
}: {
  /** 流入元の温存（例: SNS 着地の sns_x）。無ければ診断由来の app_3tap。 */
  source?: string;
} = {}) {
  const router = useRouter();
  const [aesthetic, setAesthetic] = useState<TapAesthetic | null>(null);
  const [time, setTime] = useState<TapTime | null>(null);

  const stepIndex = aesthetic === null ? 0 : time === null ? 1 : 2;
  const step = STEPS[stepIndex];

  function choose(value: string): void {
    if (aesthetic === null) {
      setAesthetic(value as TapAesthetic);
      return;
    }
    if (time === null) {
      setTime(value as TapTime);
      return;
    }
    // ここでは aesthetic / time は narrowing 済（非 null）。
    const path = `${aesthetic}-${time}-${value as TapDepth}` as TapPath;
    track("concierge_quiz_complete", { path, source });
    router.push(buildConciergeHref(path, source));
  }

  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-brand-dark px-6 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent"
      />

      <div className="w-full max-w-xl">
        <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
          {step.eyebrow}
        </p>
        <h2 className="mt-4 font-luxury-heading text-2xl leading-tight text-brand-text-primary sm:text-3xl">
          {step.question}
        </h2>

        <div className="mt-10 flex flex-col items-stretch gap-4">
          {step.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              className="btn-luxury-outline w-full px-6 py-5 text-left text-sm leading-relaxed sm:text-base"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 進捗インジケータ（金の点 3 つ） */}
        <div className="mt-10 flex items-center justify-center gap-2" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                i <= stepIndex
                  ? "h-1.5 w-1.5 rounded-full bg-brand-gold"
                  : "h-1.5 w-1.5 rounded-full bg-brand-gold/25"
              }
            />
          ))}
        </div>

        <p className="mt-10 text-xs leading-relaxed text-brand-text-secondary/70">
          18 歳以上対象 · 広告（FANZA 等）を含みます（#PR）
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent"
      />
    </section>
  );
}
