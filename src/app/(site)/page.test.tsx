import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * Homepage composition. Sections are mocked with labelled stand-ins and the
 * public read model is mocked, so this verifies the CMS contract: sections
 * render in the configured order and disabled sections are absent.
 */

vi.mock("@/components/analytics", () => ({ __esModule: true, PageViewTracker: vi.fn(() => null) }));
vi.mock("@/features/hero", () => ({
  __esModule: true,
  Hero: () => <section aria-label="Hero section">Hero</section>,
  CapabilityTicker: () => <div aria-label="Ticker">Ticker</div>,
}));
vi.mock("@/features/scroll-scene", () => ({ __esModule: true, ScrollScene: () => <section aria-label="Craft section">Craft</section> }));
vi.mock("@/features/scroll-scene/ProcessScene", () => ({ __esModule: true, ScrollScene: () => <section aria-label="Process section">Process</section> }));
vi.mock("@/features/trust", () => ({
  __esModule: true,
  TrustStats: () => <section aria-label="Trust section">Trust</section>,
  toTrustStats: (s: unknown[]) => s,
}));
vi.mock("@/features/projects", () => ({ __esModule: true, FeaturedProjects: () => <section aria-label="Projects section">Projects</section> }));
vi.mock("@/features/skills", () => ({ __esModule: true, Skills: () => <section aria-label="Skills section">Skills</section> }));
vi.mock("@/features/experience", () => ({ __esModule: true, Timeline: () => <section aria-label="Experience section">Experience</section> }));
vi.mock("@/features/testimonials", () => ({ __esModule: true, Testimonials: () => <section aria-label="Testimonials section">Testimonials</section> }));
vi.mock("@/features/blog", () => ({ __esModule: true, BlogPreview: () => <section aria-label="Blog section">Blog</section> }));
vi.mock("@/features/contact", () => ({ __esModule: true, ContactForm: () => <section aria-label="Contact section">Contact</section> }));
vi.mock("@/features/studio", () => ({
  __esModule: true,
  Team: () => <section aria-label="Team section">Team</section>,
  Services: () => <section aria-label="Services section">Services</section>,
  WhyUs: () => <section aria-label="Why us section">Why us</section>,
}));

const state = { sections: [] as { key: string; label: string }[] };
vi.mock("@/server/public/queries", async () => {
  const { defaultSettings } = await import("@/server/settings/registry");
  return {
    __esModule: true,
    getHomepageSections: vi.fn(async () => state.sections),
    getSiteSettings: vi.fn(async () => defaultSettings()),
    getTeamMembers: vi.fn(async () => []),
    getServices: vi.fn(async () => []),
    getProcessSteps: vi.fn(async () => []),
    getFeaturedProjects: vi.fn(async () => []),
    getTestimonials: vi.fn(async () => []),
    socialLinks: () => [],
  };
});

import Home from "./page";
import { PageViewTracker } from "@/components/analytics";
import { HOMEPAGE_SECTION_DEFAULTS } from "@/server/content/defaults";

const section = (key: string) => ({ key, label: key });

async function renderHome() {
  render(await Home());
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Home page", () => {
  it("renders the original portfolio sections (plus Team) by default", async () => {
    state.sections = HOMEPAGE_SECTION_DEFAULTS.filter((s) => s.enabled !== false).map((s) => section(s.key));
    await renderHome();
    const labels = screen.getAllByRole("region").map((el) => el.getAttribute("aria-label"));
    expect(labels).toEqual([
      "Hero section",
      "Craft section",
      "Craft section", // Leyahn's mirrored scene
      "Trust section",
      "Team section",
      "Projects section",
      "Skills section",
      "Experience section",
      "Testimonials section",
      "Blog section",
      "Contact section",
    ]);
  });

  it("renders sections in the order configured in the CMS", async () => {
    state.sections = ["contact", "work", "hero"].map(section);
    await renderHome();
    const labels = screen.getAllByRole("region").map((el) => el.getAttribute("aria-label"));
    expect(labels).toEqual(["Contact section", "Projects section", "Hero section"]);
  });

  it("omits disabled sections and ignores unknown keys", async () => {
    state.sections = [section("hero"), section("not-a-section")];
    await renderHome();
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });

  it("mounts the page-view tracker for the homepage", async () => {
    state.sections = [section("hero")];
    await renderHome();
    expect((PageViewTracker as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toEqual({ path: "/" });
  });
});
