import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getSiteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/server/public/queries";
import "./globals.css";

// Self-hosted via next/font: downloaded at build time, served from the app,
// with size-adjusted fallbacks for zero layout shift.
const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

/** Site-wide defaults; pages override title/description/OG via the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings["studio.name"];
  return {
    metadataBase: getSiteUrl(),
    title: { default: settings["seo.title"], template: `%s | ${name}` },
    description: settings["seo.description"],
    applicationName: name,
    authors: [{ name, url: getSiteUrl() }],
    creator: name,
    referrer: "origin-when-cross-origin",
    category: "business",
    icons: {
      icon: [{ url: "/images/brandlogo.png", type: "image/png" }],
      apple: [{ url: "/images/brandlogo.png", type: "image/png" }],
      shortcut: ["/images/brandlogo.png"],
    },
  };
}

/**
 * Root layout: document shell and fonts only. The public site's chrome lives
 * in `(site)/layout.tsx`; the CMS has its own shell under `admin/`.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontDisplay.variable}`}
    >
      <body className="overflow-x-hidden bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
