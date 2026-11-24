import type { Metadata } from "next";
import { BRAND } from "@/components/marketing/content";
import { GuideContent } from "@/components/guide/GuideContent";

export const metadata: Metadata = {
  title: `User Guide · ${BRAND.name}`,
};

// In-app copy of the guide: rendered inside the dashboard layout (sidebar +
// top bar), so opening it never leaves the app.
export default function DashboardGuidePage() {
  return <GuideContent tocTopClass="top-4" />;
}
