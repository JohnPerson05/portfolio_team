import type {
  ContactSubmission,
  Experience,
  Post,
  Testimonial,
} from "@prisma/client";
import { PostStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  toContactSubmissionView,
  toExperienceView,
  toPostView,
  toTestimonialView,
} from "./content";

const basePost: Post = {
  id: "post1",
  title: "Post One",
  slug: "post-one",
  excerpt: "excerpt",
  content: "content",
  coverUrl: null,
  status: PostStatus.PUBLISHED,
  publishedAt: new Date("2024-03-01T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("toPostView", () => {
  it("serializes publishedAt to an ISO string", () => {
    const view = toPostView(basePost);
    expect(view.publishedAt).toBe("2024-03-01T00:00:00.000Z");
  });

  it("keeps publishedAt null when unset", () => {
    const view = toPostView({ ...basePost, publishedAt: null });
    expect(view.publishedAt).toBeNull();
  });

  it("maps a null coverUrl to undefined", () => {
    const view = toPostView(basePost);
    expect(view.coverUrl).toBeUndefined();
  });
});

const baseExperience: Experience = {
  id: "exp1",
  company: "Vertex Labs",
  position: "Principal Software Engineer",
  startDate: new Date("2022-03-01T00:00:00.000Z"),
  endDate: null,
  impact: "Set technical direction for the platform org.",
  achievements: ["Architected a streaming platform.", "Mentored 12 engineers."],
  order: 1,
};

describe("toExperienceView", () => {
  it("serializes startDate to an ISO string", () => {
    const view = toExperienceView(baseExperience);
    expect(view.startDate).toBe("2022-03-01T00:00:00.000Z");
  });

  it("keeps endDate null for a current role", () => {
    const view = toExperienceView(baseExperience);
    expect(view.endDate).toBeNull();
  });

  it("serializes a present endDate to an ISO string", () => {
    const view = toExperienceView({
      ...baseExperience,
      endDate: new Date("2024-06-01T00:00:00.000Z"),
    });
    expect(view.endDate).toBe("2024-06-01T00:00:00.000Z");
  });

  it("preserves company, position, impact, achievements, and order", () => {
    const view = toExperienceView(baseExperience);
    expect(view.company).toBe("Vertex Labs");
    expect(view.position).toBe("Principal Software Engineer");
    expect(view.impact).toBe("Set technical direction for the platform org.");
    expect(view.achievements).toEqual([
      "Architected a streaming platform.",
      "Mentored 12 engineers.",
    ]);
    expect(view.order).toBe(1);
  });
});

const baseTestimonial: Testimonial = {
  id: "t1",
  quote: "One of the most thoughtful engineers I've worked with.",
  name: "Dana Whitfield",
  role: "VP of Engineering",
  company: "Vertex Labs",
  avatar: "/images/testimonials/dana.jpg",
  logoUrl: "/images/logos/vertex.svg",
  projectId: null,
  displayOrder: 1,
  isFeatured: false,
  isPublished: true,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("toTestimonialView", () => {
  it("preserves the always-present quote, author, role, and order", () => {
    const view = toTestimonialView(baseTestimonial);
    expect(view.quote).toBe(
      "One of the most thoughtful engineers I've worked with.",
    );
    expect(view.author).toBe("Dana Whitfield");
    expect(view.role).toBe("VP of Engineering");
    expect(view.order).toBe(1);
  });

  it("preserves present optional company/avatar/logo fields", () => {
    const view = toTestimonialView(baseTestimonial);
    expect(view.company).toBe("Vertex Labs");
    expect(view.avatarUrl).toBe("/images/testimonials/dana.jpg");
    expect(view.logoUrl).toBe("/images/logos/vertex.svg");
  });

  it("maps nullable company/avatar/logo fields to undefined when absent", () => {
    const view = toTestimonialView({
      ...baseTestimonial,
      company: null,
      avatar: null,
      logoUrl: null,
    });
    expect(view.company).toBeUndefined();
    expect(view.avatarUrl).toBeUndefined();
    expect(view.logoUrl).toBeUndefined();
  });

  it("includes a linked project only when one is given", () => {
    expect(toTestimonialView(baseTestimonial).project).toBeUndefined();
    expect(
      toTestimonialView({ ...baseTestimonial, project: { title: "PetCury", slug: "petcury" } }).project,
    ).toEqual({ title: "PetCury", slug: "petcury" });
  });

  it("does not carry the Prisma-only createdAt field", () => {
    const view = toTestimonialView(baseTestimonial);
    expect(view).not.toHaveProperty("createdAt");
  });
});

const baseContactSubmission: ContactSubmission = {
  id: "c1",
  name: "Jordan Lee",
  email: "jordan@example.com",
  company: "Acme Corp",
    message: "I'd love to talk about a role on your team.",
    attachmentUrls: [],
    createdAt: new Date("2025-02-20T09:15:00.000Z"),
    readAt: null,
};

describe("toContactSubmissionView", () => {
  it("preserves name, email, and message", () => {
    const view = toContactSubmissionView(baseContactSubmission);
    expect(view.name).toBe("Jordan Lee");
    expect(view.email).toBe("jordan@example.com");
    expect(view.message).toBe("I'd love to talk about a role on your team.");
  });

  it("serializes createdAt to an ISO submittedAt string", () => {
    const view = toContactSubmissionView(baseContactSubmission);
    expect(view.submittedAt).toBe("2025-02-20T09:15:00.000Z");
  });

  it("preserves a present company", () => {
    const view = toContactSubmissionView(baseContactSubmission);
    expect(view.company).toBe("Acme Corp");
  });

  it("maps a null company to undefined", () => {
    const view = toContactSubmissionView({
      ...baseContactSubmission,
      company: null,
    });
    expect(view.company).toBeUndefined();
  });

  it("includes a linked project only when one is given", () => {
    expect(toTestimonialView(baseTestimonial).project).toBeUndefined();
    expect(
      toTestimonialView({ ...baseTestimonial, project: { title: "PetCury", slug: "petcury" } }).project,
    ).toEqual({ title: "PetCury", slug: "petcury" });
  });

  it("does not carry the Prisma-only createdAt field", () => {
    const view = toContactSubmissionView(baseContactSubmission);
    expect(view).not.toHaveProperty("createdAt");
  });

  it("preserves attachment URLs", () => {
    const view = toContactSubmissionView({
      ...baseContactSubmission,
      attachmentUrls: [
        "https://example.blob.vercel-storage.com/contact-ideas/brief.pdf",
      ],
    });
    expect(view.attachmentUrls).toEqual([
      "https://example.blob.vercel-storage.com/contact-ideas/brief.pdf",
    ]);
  });

  it("maps a null readAt to unread", () => {
    const view = toContactSubmissionView(baseContactSubmission);
    expect(view.read).toBe(false);
    expect(view.readAt).toBeUndefined();
  });

  it("maps a present readAt to read", () => {
    const view = toContactSubmissionView({
      ...baseContactSubmission,
      readAt: new Date("2025-02-20T10:00:00.000Z"),
    });
    expect(view.read).toBe(true);
    expect(view.readAt).toBe("2025-02-20T10:00:00.000Z");
  });
});
