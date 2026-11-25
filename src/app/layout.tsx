import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { PWAProvider } from "@/pwa/installContext";
import { InstallModal } from "@/components/pwa/InstallModal";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";
import { APP_NAME } from "@/pwa/config";
import { HOME_REDIRECT_SCRIPT } from "@/components/marketing/homeRedirectScript";

// Self-hosted (latin subset, variable woff2 files in ./fonts) rather than
// next/font/google: fetching from Google Fonts at build time failed
// intermittently and broke builds on Vercel and on the VPS alike. Plus
// Jakarta Sans for headings, DM Sans for body text.
const dmSans = localFont({
  variable: "--font-dm-sans",
  src: [{ path: "./fonts/dm-sans.woff2", weight: "400 600", style: "normal" }],
  display: "swap",
});

const plusJakartaSans = localFont({
  variable: "--font-plus-jakarta",
  src: [{ path: "./fonts/plus-jakarta-sans.woff2", weight: "400 800", style: "normal" }],
  display: "swap",
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [{ path: "./fonts/geist-mono.woff2", weight: "100 900", style: "normal" }],
  display: "swap",
});

// Elegant serif for the dashboard hero's rotating quote -- gives it a
// distinct "pull-quote" character instead of reading as more body text.
const lora = localFont({
  variable: "--font-lora",
  src: [{ path: "./fonts/lora-italic.woff2", weight: "500 600", style: "italic" }],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduNivo",
  description: "School Management System",
  applicationName: APP_NAME,
  // iOS ignores the web manifest for home-screen apps' look; these meta
  // tags give it the full-screen launch, title and icon instead.
  // "default" status bar keeps iOS's own bar above the app rather than
  // drawing content underneath it.
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  // Favicon / SVG icon / apple-touch-icon come from the app/favicon.ico,
  // app/icon.svg and app/apple-icon.png file conventions.
};

// viewportFit: "cover" lets the mobile dashboard chrome (sticky top bar,
// fixed bottom nav) paint under the iOS notch/home-indicator safe areas
// and use env(safe-area-inset-*) padding to stay clear of them, instead of
// leaving a plain white bar there. No visible effect on desktop or on
// devices without a safe-area inset.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${plusJakartaSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
    >
      <head>
        {/* Homepage pre-paint redirect (no-op on every other path). Runs while
            the HTML is parsed, before the landing page paints. */}
        <script dangerouslySetInnerHTML={{ __html: HOME_REDIRECT_SCRIPT }} />
      </head>
      {/* suppressHydrationWarning: some browser extensions (e.g. ColorZilla)
          inject attributes like cz-shortcut-listen onto <body> before React
          hydrates. That's a real DOM mismatch but not a bug in our markup --
          without this, React logs a scary (and misleading) hydration error
          for an attribute we never rendered and don't control. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          {/* PWA install + update layer. Purely additive: renders nothing
              until the install dialog is opened or an update is waiting. */}
          <PWAProvider>
            {children}
            <InstallModal />
            <UpdateBanner />
          </PWAProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
