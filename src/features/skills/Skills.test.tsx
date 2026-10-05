import { SkillCategory } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import type { SkillView } from "@/types";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ORDER } from "./config";
import { Skills } from "./Skills";

/** Build a SkillView with overridable fields. */
function makeSkill(
  category: SkillCategory,
  overrides: Partial<SkillView> = {},
): SkillView {
  const name = overrides.name ?? `${category} skill`;
  return {
    id: overrides.id ?? `${category}-${name}`,
    name,
    category,
    proficiency: overrides.proficiency ?? 80,
    order: overrides.order ?? 0,
  };
}

/** One skill in each of the four categories. */
function oneSkillPerCategory(): SkillView[] {
  return [
    makeSkill(SkillCategory.FRONTEND, {
      id: "fe",
      name: "React",
      proficiency: 95,
    }),
    makeSkill(SkillCategory.BACKEND, {
      id: "be",
      name: "Node.js",
      proficiency: 88,
    }),
    makeSkill(SkillCategory.CLOUD, { id: "cl", name: "AWS", proficiency: 70 }),
    makeSkill(SkillCategory.AI, { id: "ai", name: "OpenAI", proficiency: 60 }),
  ];
}

/**
 * `Skills` is an async Server Component. Awaiting it yields a plain React
 * element we can render with Testing Library.
 */
async function renderSkills(skills: readonly SkillView[]) {
  const ui = await Skills({ skills });
  return render(ui);
}

describe("Skills — four-category grouping (Req 4.1)", () => {
  it("renders all four categories as labelled group regions", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());

    for (const category of SKILL_CATEGORY_ORDER) {
      const label = SKILL_CATEGORY_LABELS[category];
      expect(
        screen.getByRole("region", { name: new RegExp(label, "i") }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: label }),
      ).toBeInTheDocument();
    }
  });

  it("renders all four category groups even when some have no skills", async () => {
    mockMatchMedia(reducedMotionMatcher);
    // Only Frontend has a skill; the other three categories must still render.
    await renderSkills([makeSkill(SkillCategory.FRONTEND, { name: "React" })]);

    for (const category of SKILL_CATEGORY_ORDER) {
      const label = SKILL_CATEGORY_LABELS[category];
      expect(
        screen.getByRole("heading", { level: 3, name: label }),
      ).toBeInTheDocument();
    }
  });

  it("renders category groups in the backend-first canonical order", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual([
      "Backend Engineering",
      "Cloud & DevOps",
      "Frontend Development",
      "AI-Assisted Development & Delivery",
    ]);
  });

  it("places each skill under its own category group", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());

    const frontend = screen.getByRole("region", { name: /frontend/i });
    expect(within(frontend).getByText("React")).toBeInTheDocument();
    const tools = screen.getByRole("region", {
      name: /ai-assisted development & delivery/i,
    });
    expect(within(tools).getByText("OpenAI")).toBeInTheDocument();
  });

  it("exposes an accessible skills section landmark labelled by its heading", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());
    expect(
      screen.getByRole("region", { name: /skills & expertise/i }),
    ).toBeInTheDocument();
  });

  it("renders an empty state when there are no skills", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills([]);
    expect(screen.getByText(/skills coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

describe("Skills — proficiency bars under reduced motion (Req 4.2, 4.4 / Property 9)", () => {
  it("shows each bar's target value immediately under reduced motion", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());

    // No fill animation — the final percentage is shown right away.
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("sets the progressbar fill width to the target proficiency under reduced motion", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills([
      makeSkill(SkillCategory.FRONTEND, {
        id: "fe",
        name: "React",
        proficiency: 95,
      }),
    ]);

    const bar = screen.getByRole("progressbar", { name: /react proficiency/i });
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("95%");
  });

  it("exposes the true target proficiency via aria-valuenow/min/max", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());

    const bar = screen.getByRole("progressbar", { name: /aws proficiency/i });
    expect(bar).toHaveAttribute("aria-valuenow", "70");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders one progressbar per skill", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderSkills(oneSkillPerCategory());
    expect(screen.getAllByRole("progressbar")).toHaveLength(4);
  });
});

describe("Skills — proficiency bars when motion is allowed (Req 4.2, 4.3)", () => {
  it("fills each bar up to its target value once in view", async () => {
    mockMatchMedia(false);
    await renderSkills(oneSkillPerCategory());

    // The in-view counters (IntersectionObserver mock intersects synchronously)
    // settle on their exact target percentages once the count-up completes.
    await waitFor(
      () => {
        expect(screen.getByText("95%")).toBeInTheDocument();
        expect(screen.getByText("88%")).toBeInTheDocument();
        expect(screen.getByText("70%")).toBeInTheDocument();
        expect(screen.getByText("60%")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});

describe("Skills — compact homepage summary", () => {
  it("shows only key skills and links visitors to the full matrix", async () => {
    mockMatchMedia(reducedMotionMatcher);
    const backendSkills = Array.from({ length: 7 }, (_value, index) =>
      makeSkill(SkillCategory.BACKEND, {
        id: `backend-${index}`,
        name: `Backend ${index + 1}`,
        order: index,
      }),
    );
    const ui = await Skills({
      skills: [
        ...backendSkills,
        ...oneSkillPerCategory().filter(
          (skill) => skill.category !== SkillCategory.BACKEND,
        ),
      ],
      compact: true,
    });
    render(ui);

    expect(screen.getByText("Backend 1")).toBeInTheDocument();
    expect(screen.getByText("Backend 5")).toBeInTheDocument();
    expect(screen.queryByText("Backend 6")).not.toBeInTheDocument();
    expect(screen.getByText("+2 more in full matrix")).toBeInTheDocument();
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(
      screen.getByRole("link", { name: /view the capability matrix/i }),
    ).toHaveAttribute("href", "/skills");
  });
});
