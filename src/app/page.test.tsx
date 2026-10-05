import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * Homepage composition tests (Task 20).
 *
 * The homepage composes the studio feature sections, some of which are async
 * Server Components that fetch their own data via Prisma. To keep this test focused on
 * the *composition* (presence + business-first ordering) rather than each
 * section's internals (covered by their own suites), every section is mocked
 * with a lightweight stand-in that renders a labelled landmark. The analytics
 * island is mocked so we can assert the non-blocking page-view recording
 * (Property 6) without a database.
 */

vi.mock("@/components/analytics", () => ({
  __esModule: true,
  PageViewTracker: vi.fn(() => null),
}));

vi.mock("@/features/hero", () => ({
  __esModule: true,
  Hero: () => <section aria-label="Hero section">Hero</section>,
  CapabilityTicker: () => <div aria-hidden="true">Capabilities</div>,
}));
vi.mock("@/features/studio", () => ({
  __esModule: true,
  Team: () => <section aria-label="Team section">Team</section>,
  Services: () => <section aria-label="Services section">Services</section>,
  WhyUs: () => <section aria-label="Why us section">Why us</section>,
}));
vi.mock("@/features/scroll-scene", () => ({
  __esModule: true,
  ScrollScene: () => (
    <section aria-label="Process section">Process</section>
  ),
}));
vi.mock("@/features/trust", () => ({
  __esModule: true,
  TrustStats: () => <section aria-label="Trust section">Trust</section>,
}));
vi.mock("@/features/projects", () => ({
  __esModule: true,
  FeaturedProjects: () => (
    <section aria-label="Projects section">Projects</section>
  ),
}));
vi.mock("@/features/testimonials", () => ({
  __esModule: true,
  Testimonials: () => (
    <section aria-label="Testimonials section">Testimonials</section>
  ),
}));
vi.mock("@/features/contact", () => ({
  __esModule: true,
  ContactForm: () => <section aria-label="Contact section">Contact</section>,
}));

import Home from "./page";
import { PageViewTracker } from "@/components/analytics";

const mockedPageViewTracker = PageViewTracker as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** The business-first section order the homepage must compose. */
const SECTION_ORDER = [
  "Hero section",
  "Team section",
  "Services section",
  "Process section",
  "Projects section",
  "Trust section",
  "Why us section",
  "Testimonials section",
  "Contact section",
] as const;

describe("Home page — composition (Requirement 1.5)", () => {
  it("renders all feature sections", () => {
    render(<Home />);
    for (const label of SECTION_ORDER) {
      expect(screen.getByRole("region", { name: label })).toBeInTheDocument();
    }
  });

  it("renders the sections in business-first order", () => {
    render(<Home />);
    const rendered = screen
      .getAllByRole("region")
      .map((node) => node.getAttribute("aria-label"));
    expect(rendered).toEqual([...SECTION_ORDER]);
  });
});

describe("Home page — non-blocking page-view analytics (Requirement 13.1; Property 6)", () => {
  it("mounts the PageViewTracker island for the homepage path", () => {
    render(<Home />);
    // The tracker is rendered (records PORTFOLIO_VIEW from a mount effect, off
    // the render path) and is given the homepage path.
    expect(mockedPageViewTracker).toHaveBeenCalledTimes(1);
    expect(mockedPageViewTracker.mock.calls[0]?.[0]).toMatchObject({
      path: "/",
    });
  });
});
