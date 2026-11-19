import "./marketing.css";
import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./CtaAndFooter";

// Shared shell for Terms, Privacy and Refund Policy -- same header/footer
// and visual language as the rest of the marketing site (see LandingPage),
// just a simple centered document instead of landing-page sections.
export function LegalPage({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: ReactNode }) {
  return (
    <div className="ms-landing min-h-screen bg-[#F8F8FE] font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h1 className="font-heading text-[32px] font-extrabold tracking-tight text-foreground sm:text-[40px]">{title}</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">Last updated: {lastUpdated}</p>
          <div className="prose-legal mt-10 space-y-8 rounded-[22px] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_40px_-24px_rgba(80,72,229,0.28)] ring-1 ring-foreground/[0.06] sm:p-10">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// One numbered clause -- consistent heading/body styling across all three
// legal pages.
export function LegalSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-[18px] font-bold text-foreground">{number}. {title}</h2>
      <div className="mt-2.5 space-y-3 text-[15px] leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

// Visibly flags a fact that must be replaced with the real one before this
// page can go in front of Razorpay or any real visitor -- deliberately
// loud so a placeholder is never mistaken for a real legal statement. Same
// spirit as the "SAMPLE CONTENT" comment at the top of content.ts.
export function LegalPlaceholder({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-amber-200/70 px-1 font-semibold text-amber-900">[PLACEHOLDER: {children}]</mark>;
}
