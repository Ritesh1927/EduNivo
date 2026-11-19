import type { Metadata } from "next";
import "@/components/marketing/marketing.css";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/CtaAndFooter";
import { SectionHeading, GradientIcon, GradientText, Eyebrow } from "@/components/marketing/ui";
import { CARD, TONES, BTN_PRIMARY } from "@/components/marketing/styles";
import { Reveal } from "@/components/marketing/motion";
import { BRAND, BENEFITS } from "@/components/marketing/content";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: `About Us · ${BRAND.name}`,
  description: `About ${BRAND.name}, a smart, all-in-one school ERP for Indian schools.`,
};

export default function AboutPage() {
  return (
    <div className="ms-landing min-h-screen bg-[#F8F8FE] font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="pt-28 pb-10 sm:pt-32">
        <section className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <Reveal>
            <Eyebrow className="mx-auto">About {BRAND.name}</Eyebrow>
            <h1 className="mt-4 font-heading text-[32px] leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-[44px]">
              Helping schools run on <GradientText>one connected platform</GradientText>, not a dozen spreadsheets
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground sm:text-[18px]">
              {BRAND.name} brings admissions, attendance, academics, fees, examinations and parent communication into a single,
              secure system — so school staff spend less time on paperwork and reconciliation, and more time on students.
            </p>
          </Reveal>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="What we believe"
            title="Why we build it this way"
            description="A few principles shape every part of the Platform."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.slice(0, 6).map((b, i) => (
              <Reveal key={b.title} delay={(i % 3) * 90}>
                <article className={`${CARD} group relative h-full overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1.5`}>
                  <div className={`pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gradient-to-br to-transparent opacity-70 blur-2xl ${TONES[b.tone].soft}`} aria-hidden />
                  <GradientIcon tone={b.tone} size="lg">
                    <b.icon className="h-6 w-6" />
                  </GradientIcon>
                  <h3 className="mt-5 font-heading text-[17px] font-bold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{b.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-4xl px-5 lg:px-8">
          <Reveal className={`${CARD} p-8 text-center sm:p-12`}>
            <h2 className="font-heading text-[24px] font-extrabold tracking-tight text-foreground sm:text-[28px]">
              Want to see it on your own school&apos;s data?
            </h2>
            <p className="mt-3 text-[15.5px] text-muted-foreground">
              Book a free demo and we&apos;ll walk you through the Platform with your school&apos;s own classes and fee structure.
            </p>
            <a href="/contact" className={`${BTN_PRIMARY} mt-6 inline-flex`}>
              Get in touch <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
