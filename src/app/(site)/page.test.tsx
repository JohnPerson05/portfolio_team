import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * Homepage composition. Sections are mocked with labelled stand-ins and the
 * public read model is mocked, so this verifies the CMS contract: sections
 * render in the configured order, disabled sections are absent, and sections
 * without published content disappear.
 */

vi.mock("@/components/analytics", () => ({ __esModule: true, PageViewTracker: vi.fn(() => null) }));
vi.mock("@/features/hero", () => ({
  __esModule: true,
  Hero: () => <section aria-label="Hero section">Hero</section>,
  CapabilityTicker: () => <div aria-label="Ticker">Ticker</div>,
}));
vi.mock("@/features/studio", () => ({
  __esModule: true,
  Team: () => <section aria-label="Team section">Team</section>,
  Services: () => <section aria-label="Services section">Services</section>,
  WhyUs: () => <section aria-label="Why us section">Why us</section>,
}));
vi.mock("@/features/scroll-scene", () => ({
  __esModule: true,
  ScrollScene: () => <section aria-label="Process section">Process</section>,
}));
vi.mock("@/features/trust", () => ({
  __esModule: true,
  TrustStats: () => <section aria-label="Trust section">Trust</section>,
  toTrustStats: (s: unknown[]) => s,
}));
vi.mock("@/features/projects", () => ({
  __esModule: true,
  FeaturedProjects: () => <section aria-label="Projects section">Projects</section>,
}));
vi.mock("@/features/testimonials", () => ({
  __esModule: true,
  Testimonials: () => <section aria-label="Testimonials section">Testimonials</section>,
}));
vi.mock("@/features/contact", () => ({
  __esModule: true,
  ContactForm: () => <section aria-label="Contact section">Contact</section>,
}));

const state = {
  sections: [] as { key: string; label: string }[],
  testimonials: [] as unknown[],
};
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
    getTestimonials: vi.fn(async () => state.testimonials),
    socialLinks: () => [],
  };
});

import Home from "./page";
import { PageViewTracker } from "@/components/analytics";

const section = (key: string) => ({ key, label: key });

async function renderHome() {
  render(await Home());
}

beforeEach(() => {
  vi.clearAllMocks();
  state.testimonials = [];
});

describe("Home page", () => {
  it("renders sections in the order configured in the CMS", async () => {
    state.sections = ["contact", "work", "hero", "services", "process", "team", "stats", "why-us"].map(section);
    await renderHome();
    const labels = screen.getAllByRole("region").map((el) => el.getAttribute("aria-label"));
    expect(labels).toEqual([
      "Contact section",
      "Projects section",
      "Hero section",
      "Services section",
      "Process section",
      "Team section",
      "Trust section",
      "Why us section",
    ]);
  });

  it("omits sections that are disabled (not returned)", async () => {
    state.sections = ["hero", "contact"].map(section);
    await renderHome();
    expect(screen.queryByRole("region", { name: "Team section" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Hero section" })).toBeInTheDocument();
  });

  it("hides testimonials until at least one is published", async () => {
    state.sections = [section("testimonials")];
    await renderHome();
    expect(screen.queryByRole("region", { name: "Testimonials section" })).not.toBeInTheDocument();

    state.testimonials = [{ id: "t1" }];
    await renderHome();
    expect(screen.getByRole("region", { name: "Testimonials section" })).toBeInTheDocument();
  });

  it("ignores unknown section keys", async () => {
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
