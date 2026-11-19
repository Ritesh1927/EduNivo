import type { Metadata } from "next";
import Link from "next/link";
import "@/components/marketing/marketing.css";
import { Mail, MapPin, Phone, CalendarCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/CtaAndFooter";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Eyebrow, GradientText } from "@/components/marketing/ui";
import { CARD, BTN_SECONDARY } from "@/components/marketing/styles";
import { Reveal } from "@/components/marketing/motion";
import { BRAND } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: `Contact Us · ${BRAND.name}`,
  description: `Get in touch with the ${BRAND.name} team.`,
};

export default function ContactPage() {
  return (
    <div className="ms-landing min-h-screen bg-[#F8F8FE] font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow className="mx-auto">Get in touch</Eyebrow>
            <h1 className="mt-4 font-heading text-[32px] leading-[1.15] font-extrabold tracking-tight text-foreground sm:text-[40px]">
              We&apos;d love to <GradientText>hear from you</GradientText>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              Questions about {BRAND.name}, pricing, or an existing school account — send us a message and we&apos;ll respond
              shortly.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            <Reveal delay={60} className="space-y-5">
              <ContactInfoCard icon={Mail} label="Email" value={BRAND.email} href={`mailto:${BRAND.email}`} />
              <ContactInfoCard icon={Phone} label="Phone" value={BRAND.phone} href={`tel:${BRAND.phone.replace(/\s/g, "")}`} />
              <ContactInfoCard icon={MapPin} label="Address" value={BRAND.address} />
              <Link href="/#contact" className={`${BTN_SECONDARY} w-full justify-center gap-2`}>
                <CalendarCheck className="h-4.5 w-4.5" /> Or book a free demo instead
              </Link>
            </Reveal>

            <Reveal delay={120} className={`${CARD} p-6 sm:p-8`}>
              <h2 className="font-heading text-[18px] font-bold text-foreground">Send a message</h2>
              <p className="mt-1 text-[14px] text-muted-foreground">We typically reply within one business day.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ContactInfoCard({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const body = (
    <div className={`${CARD} flex items-center gap-4 p-5`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-muted-foreground">{label}</p>
        <p className="truncate text-[15px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block transition-opacity hover:opacity-80">{body}</a> : body;
}
