import type { Metadata } from "next";
import Link from "next/link";
import "@/components/marketing/marketing.css";
import { Check, Users, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Plan, type IPlan } from "@/models/Plan";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/CtaAndFooter";
import { SectionHeading, GradientText } from "@/components/marketing/ui";
import { CARD, BTN_PRIMARY } from "@/components/marketing/styles";
import { Reveal } from "@/components/marketing/motion";
import { BRAND } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: `Pricing · ${BRAND.name}`,
  description: `${BRAND.name} pricing plans for schools of every size.`,
};

// Never statically cached -- plans are managed live by Super Admin and can
// change at any time (see src/app/super-admin/(protected)/plans/page.tsx),
// so this page must always reflect the current database state.
export const revalidate = 0;

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

async function getActivePlans() {
  await connectDB();
  const plans = await Plan.find({ isActive: true }).sort({ pricePerUser: 1 }).lean<IPlan[]>();
  return plans;
}

export default async function PricingPage() {
  const plans = await getActivePlans();

  return (
    <div className="ms-landing min-h-screen bg-[#F8F8FE] font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Simple, transparent pricing"
            title={<>Pricing that scales with <GradientText>your school</GradientText></>}
            description="Every plan includes full onboarding, data import and training. Pay only for the users you actually add beyond each plan's free allowance."
          />

          {plans.length === 0 ? (
            <Reveal className={`${CARD} mx-auto mt-14 max-w-xl p-10 text-center`}>
              <p className="text-[15.5px] text-muted-foreground">
                Our plans are being updated right now. Book a free demo and we&apos;ll share pricing tailored to your school.
              </p>
              <Link href="/#contact" className={`${BTN_PRIMARY} mt-6 inline-flex`}>
                Book a Demo <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </Reveal>
          ) : (
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, i) => (
                <Reveal key={String(plan._id)} delay={i * 90} className={`${CARD} flex h-full flex-col p-7`}>
                  <h3 className="font-heading text-[19px] font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-heading text-[32px] font-extrabold tracking-tight text-foreground">{fmt(plan.pricePerUser)}</span>
                    <span className="text-[14px] text-muted-foreground">/ extra user / month</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[13.5px] font-medium text-primary">
                    <Users className="h-4 w-4" /> {plan.includedUsers} free users included
                  </p>

                  {plan.features.length > 0 && (
                    <ul className="mt-6 flex-1 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[14px] text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link href="/#contact" className={`${BTN_PRIMARY} mt-7 w-full justify-center`}>
                    Book a Demo <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <p className="mx-auto mt-10 max-w-xl text-center text-[13.5px] text-muted-foreground">
            Billed per school on a monthly cycle. Taxes as applicable. Contact us for a custom quote for multi-campus groups.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
