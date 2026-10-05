import { describe, expect, it } from "vitest";
import type { ExperienceView } from "@/types";
import {
  PRESENT_LABEL,
  formatDateRange,
  formatMonthYear,
  orderExperiences,
} from "./config";

/** Build an ExperienceView with overridable fields. */
function makeExperience(
  overrides: Partial<ExperienceView> = {},
): ExperienceView {
  return {
    id: overrides.id ?? "exp",
    company: overrides.company ?? "Acme",
    position: overrides.position ?? "Engineer",
    startDate: overrides.startDate ?? "2020-01-01T00:00:00.000Z",
    endDate: overrides.endDate ?? null,
    impact: overrides.impact ?? "Did impactful work.",
    achievements: overrides.achievements ?? ["Shipped a thing."],
    order: overrides.order ?? 0,
  };
}

describe("orderExperiences (Req 5.1 — chronological, most-recent-first)", () => {
  it("orders entries by startDate descending", () => {
    const ordered = orderExperiences([
      makeExperience({ id: "old", startDate: "2017-07-01T00:00:00.000Z" }),
      makeExperience({ id: "current", startDate: "2022-03-01T00:00:00.000Z" }),
      makeExperience({ id: "mid", startDate: "2019-06-01T00:00:00.000Z" }),
    ]);
    expect(ordered.map((e) => e.id)).toEqual(["current", "mid", "old"]);
  });

  it("places a current role (null endDate) first when it has the latest start", () => {
    const ordered = orderExperiences([
      makeExperience({
        id: "past",
        startDate: "2019-01-01T00:00:00.000Z",
        endDate: "2021-01-01T00:00:00.000Z",
      }),
      makeExperience({
        id: "present",
        startDate: "2022-03-01T00:00:00.000Z",
        endDate: null,
      }),
    ]);
    expect(ordered[0]?.id).toBe("present");
  });

  it("breaks startDate ties with the explicit order field ascending", () => {
    const ordered = orderExperiences([
      makeExperience({ id: "b", startDate: "2020-01-01T00:00:00.000Z", order: 2 }),
      makeExperience({ id: "a", startDate: "2020-01-01T00:00:00.000Z", order: 1 }),
    ]);
    expect(ordered.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("does not mutate the input array", () => {
    const input = [
      makeExperience({ id: "old", startDate: "2017-07-01T00:00:00.000Z" }),
      makeExperience({ id: "new", startDate: "2022-03-01T00:00:00.000Z" }),
    ];
    const snapshot = input.map((e) => e.id);
    orderExperiences(input);
    expect(input.map((e) => e.id)).toEqual(snapshot);
  });

  it("is idempotent — re-ordering already ordered entries is stable", () => {
    const first = orderExperiences([
      makeExperience({ id: "old", startDate: "2017-07-01T00:00:00.000Z" }),
      makeExperience({ id: "current", startDate: "2022-03-01T00:00:00.000Z" }),
      makeExperience({ id: "mid", startDate: "2019-06-01T00:00:00.000Z" }),
    ]);
    const second = orderExperiences(first);
    expect(second.map((e) => e.id)).toEqual(first.map((e) => e.id));
  });
});

describe("formatMonthYear", () => {
  it("formats an ISO date as a short Mon YYYY label in UTC", () => {
    expect(formatMonthYear("2022-03-01T00:00:00.000Z")).toBe("Mar 2022");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatMonthYear("not-a-date")).toBe("");
  });
});

describe("formatDateRange (Present handling)", () => {
  it("renders the Present label when endDate is null", () => {
    const range = formatDateRange("2022-03-01T00:00:00.000Z", null);
    expect(range).toBe(`Mar 2022 — ${PRESENT_LABEL}`);
  });

  it("renders the formatted end date when present", () => {
    const range = formatDateRange(
      "2019-06-01T00:00:00.000Z",
      "2022-02-01T00:00:00.000Z",
    );
    expect(range).toBe("Jun 2019 — Feb 2022");
  });
});
