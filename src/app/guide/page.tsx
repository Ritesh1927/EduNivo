import type { Metadata } from "next";
import "@/components/marketing/marketing.css";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/CtaAndFooter";
import { BRAND } from "@/components/marketing/content";
import { GuideContent } from "@/components/guide/GuideContent";

export const metadata: Metadata = {
  title: `User Guide · ${BRAND.name}`,
  description: `How ${BRAND.name} works, step by step, for super admins, school admins, teachers and parents.`,
};

// Public copy of the guide, linked from the website footer. Signed-in users
// reach the same content inside the app at /dashboard/guide.
export default function PublicGuidePage() {
  return (
    <div className="ms-landing min-h-screen bg-[#F8F8FE] font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <GuideContent />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
