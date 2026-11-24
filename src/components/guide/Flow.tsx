import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "primary" | "good" | "warn" | "bad" | "neutral";

export interface FlowStep {
  title: string;
  text?: string;
  icon?: LucideIcon;
  tone?: Tone;
}

const TONE: Record<Tone, { card: string; chip: string }> = {
  primary: { card: "border-primary/25 bg-primary/[0.04]", chip: "bg-primary text-white" },
  good: { card: "border-emerald-300 bg-emerald-50", chip: "bg-emerald-600 text-white" },
  warn: { card: "border-amber-300 bg-amber-50", chip: "bg-amber-500 text-white" },
  bad: { card: "border-red-300 bg-red-50", chip: "bg-red-600 text-white" },
  neutral: { card: "border-foreground/10 bg-white", chip: "bg-foreground/80 text-white" },
};

function StepCard({ step, index, numbered }: { step: FlowStep; index: number; numbered: boolean }) {
  const tone = TONE[step.tone || "neutral"];
  const Icon = step.icon;
  return (
    <div className={cn("flex h-full min-w-0 flex-1 flex-col rounded-2xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]", tone.card)}>
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold", tone.chip)}>
          {Icon ? <Icon className="h-4 w-4" /> : numbered ? index + 1 : null}
        </span>
        <p className="font-heading text-[15px] leading-snug font-bold text-foreground">{step.title}</p>
      </div>
      {step.text && <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{step.text}</p>}
    </div>
  );
}

// A straight run of steps: a row of cards joined by arrows on wide screens,
// a top-to-bottom column joined by down arrows on phones.
export function FlowChart({ steps, numbered = true, className }: { steps: FlowStep[]; numbered?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch", className)}>
      {steps.map((s, i) => (
        <div key={s.title} className="contents">
          <StepCard step={s} index={i} numbered={numbered} />
          {i < steps.length - 1 && (
            <div className="flex shrink-0 items-center justify-center text-primary/60" aria-hidden>
              <ArrowDown className="h-5 w-5 lg:hidden" />
              <ArrowRight className="hidden h-5 w-5 lg:block" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VerticalFlow({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((s, i) => (
        <div key={s.title} className="contents">
          <StepCard step={s} index={i} numbered={false} />
          {i < steps.length - 1 && (
            <div className="flex justify-center text-primary/60" aria-hidden>
              <ArrowDown className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Steps that lead to a yes/no question, then split into two outcomes.
export function DecisionFlow({
  before,
  question,
  yesLabel = "Yes",
  noLabel = "No",
  yes,
  no,
  footnote,
}: {
  before?: FlowStep[];
  question: string;
  yesLabel?: string;
  noLabel?: string;
  yes: FlowStep[];
  no: FlowStep[];
  footnote?: string;
}) {
  return (
    <div>
      {before && before.length > 0 && (
        <>
          <FlowChart steps={before} />
          <div className="flex justify-center py-2 text-primary/60" aria-hidden>
            <ArrowDown className="h-5 w-5" />
          </div>
        </>
      )}
      <div className="flex justify-center">
        <div className="flex max-w-md items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.06] px-5 py-3.5">
          <HelpCircle className="h-5 w-5 shrink-0 text-primary" />
          <p className="font-heading text-[15px] font-bold text-foreground">{question}</p>
        </div>
      </div>
      <div className="flex justify-center py-2 text-primary/60" aria-hidden>
        <ArrowDown className="h-5 w-5" />
      </div>
      {/* Each outcome sits in its own labelled panel, so when the two stack on
          a phone they still read as alternatives, not one long chain. */}
      <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-6">
        <Branch label={`If ${yesLabel.toLowerCase()}`} pillClass="bg-emerald-600" panelClass="bg-emerald-500/[0.04] ring-emerald-300/70" steps={yes} />
        <Branch label={`If ${noLabel.toLowerCase()}`} pillClass="bg-red-600" panelClass="bg-red-500/[0.04] ring-red-300/70" steps={no} />
      </div>
      {footnote && <p className="mt-4 text-center text-[13px] text-muted-foreground">{footnote}</p>}
    </div>
  );
}

function Branch({ label, pillClass, panelClass, steps }: { label: string; pillClass: string; panelClass: string; steps: FlowStep[] }) {
  return (
    <div className={cn("rounded-2xl p-3 ring-1 sm:p-4", panelClass)}>
      <div className="mb-3 flex justify-center">
        <span className={cn("rounded-full px-3 py-1 text-[12px] font-bold text-white", pillClass)}>{label}</span>
      </div>
      <VerticalFlow steps={steps} />
    </div>
  );
}
