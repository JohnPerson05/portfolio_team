import { Suspense, type ReactNode } from "react";
import { MotionProvider } from "@/components/motion";
import { ToastProvider } from "@/components/ui";
import {
  BackToTop,
  Footer,
  NavigationLoader,
  Navbar,
  RouteTransition,
  SiteChromeProvider,
  ThemeBackground,
} from "@/components/layout";
import {
  getNavigation,
  getSiteSettings,
  socialLinks,
} from "@/server/public/queries";

/** Regenerate public pages at least hourly; CMS saves revalidate instantly. */
export const revalidate = 3600;

/**
 * Public website shell. Navigation, the studio name, CTA, and footer copy all
 * come from the CMS (Settings + Navigation).
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [settings, navigation] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
  ]);
  const cta = { label: settings["cta.text"], href: settings["cta.url"] };

  return (
    <MotionProvider>
      <ToastProvider>
        <SiteChromeProvider
          value={{
            studioName: settings["studio.name"],
            headerLinks: navigation.header,
            cta,
          }}
        >
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          <ThemeBackground />

          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-card px-space-2 py-space-1 text-body text-text focus:not-sr-only focus:fixed focus:left-space-2 focus:top-space-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          >
            Skip to content
          </a>

          <Navbar />

          <main id="main-content">
            <RouteTransition>{children}</RouteTransition>
          </main>

          <Footer
            studioName={settings["studio.name"]}
            text={settings["footer.text"]}
            exploreLinks={navigation.header}
            secondaryLinks={navigation.footer}
            socialLinks={socialLinks(settings)}
            contactEmail={settings["contact.email"] || undefined}
            cta={cta}
          />
          <BackToTop />
        </SiteChromeProvider>
      </ToastProvider>
    </MotionProvider>
  );
}
