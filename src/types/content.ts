import type {
  Project,
  Post,
  Skill,
  SkillCategory,
  Experience,
  Testimonial,
  ContactSubmission,
} from "@prisma/client";
import { decodeProjectImages } from "@/features/projects/media";

/**
 * Serializable view DTOs for content rendered by public Server Components.
 *
 * Prisma row types carry `Date` and nullable fields that are awkward to pass
 * across the RSC/client boundary or to assert against in tests. These DTOs
 * expose the presentational subset with ISO date strings and normalized
 * optionals, keeping client islands lightweight and typed (Requirement 17.2).
 */

/** A featured project card as rendered on the homepage. */
export interface ProjectView {
  id: string;
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  impact: string;
  technologies: string[];
  /** Ordered project gallery; the first image is used as the card cover. */
  imageUrls?: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
}

/** A published blog post as rendered in previews, listings, and articles. */
export interface PostView {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  /** ISO-8601 string; null when not yet published. */
  publishedAt: string | null;
}

/**
 * A single skill as rendered in the Skills section, with its 0–100 proficiency.
 * `category` is re-exported from Prisma so callers group/label by the same enum.
 */
export interface SkillView {
  id: string;
  name: string;
  category: SkillCategory;
  /** Proficiency level, 0–100. */
  proficiency: number;
  order: number;
}

/**
 * A single career-history entry as rendered in the Experience timeline
 * (Requirement 5.1). `Date` columns are serialized to ISO-8601 strings and the
 * nullable `endDate` is preserved as `null` to signal an ongoing ("Present")
 * role — the "Present" wording is a view-layer concern (Requirement 17.2).
 */
export interface ExperienceView {
  id: string;
  company: string;
  position: string;
  /** ISO-8601 string for the role's start date. */
  startDate: string;
  /** ISO-8601 string, or `null` when the role is current ("Present"). */
  endDate: string | null;
  impact: string;
  achievements: string[];
  order: number;
}

/**
 * A single testimonial as rendered in the Testimonials section
 * (Requirement 6.1). The quote, author, and role are always present; the
 * `company` attribution and the optional `avatarUrl`/`logoUrl` media are
 * nullable in Prisma and normalized to `undefined` here so the card can render
 * gracefully when they are absent (Requirement 6.2 / Requirement 17.2).
 */
export interface TestimonialView {
  id: string;
  quote: string;
  author: string;
  role: string;
  /** Author's company/affiliation; omitted when not provided. */
  company?: string;
  /** Author profile photo URL; omitted when not provided. */
  avatarUrl?: string;
  /** Company logo URL; omitted when not provided. */
  logoUrl?: string;
  order: number;
}

/**
 * A contact form submission as rendered in the admin contacts view
 * (Requirement 12.1). The `Date` column is serialized to an ISO-8601 string and
 * the nullable `company` is normalized to `undefined`, so the admin Server
 * Component stays free of `Date`/nullable Prisma types (Requirement 17.2). The
 * `createdAt` timestamp is preserved (as `submittedAt`) because the view needs
 * to display and order by it most-recent-first (Requirement 12.3 / Property 10).
 */
export interface ContactSubmissionView {
  id: string;
  name: string;
  email: string;
  /** Submitter's company/affiliation; omitted when not provided. */
  company?: string;
  message: string;
  /** Public URLs for idea files uploaded with the inquiry. */
  attachmentUrls: string[];
  /** Whether the owner has opened this inquiry. */
  read: boolean;
  /** ISO-8601 string for when the inquiry was first opened; omitted while unread. */
  readAt?: string;
  /** ISO-8601 string for when the submission was received. */
  submittedAt: string;
}

/** Map a Prisma `Skill` row to its serializable view DTO. */
export function toSkillView(skill: Skill): SkillView {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
    order: skill.order,
  };
}

/** Map a Prisma `Project` row to its serializable view DTO. */
export function toProjectView(project: Project): ProjectView {
  const imageUrls = decodeProjectImages(project.thumbnailUrl);

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    impact: project.impact,
    technologies: project.technologies,
    imageUrls,
    thumbnailUrl: imageUrls[0],
    githubUrl: project.githubUrl ?? undefined,
    liveUrl: project.liveUrl ?? undefined,
    featured: project.featured,
    order: project.order,
  };
}

/** Map a Prisma `Post` row to its serializable view DTO. */
export function toPostView(post: Post): PostView {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverUrl: post.coverUrl ?? undefined,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  };
}

/** Map a Prisma `Experience` row to its serializable view DTO. */
export function toExperienceView(experience: Experience): ExperienceView {
  return {
    id: experience.id,
    company: experience.company,
    position: experience.position,
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate ? experience.endDate.toISOString() : null,
    impact: experience.impact,
    achievements: experience.achievements,
    order: experience.order,
  };
}

/** Map a Prisma `Testimonial` row to its serializable view DTO. */
export function toTestimonialView(testimonial: Testimonial): TestimonialView {
  return {
    id: testimonial.id,
    quote: testimonial.quote,
    author: testimonial.author,
    role: testimonial.role,
    company: testimonial.company ?? undefined,
    avatarUrl: testimonial.avatarUrl ?? undefined,
    logoUrl: testimonial.logoUrl ?? undefined,
    order: testimonial.order,
  };
}

/** Map a Prisma `ContactSubmission` row to its serializable view DTO. */
export function toContactSubmissionView(
  submission: ContactSubmission,
): ContactSubmissionView {
  return {
    id: submission.id,
    name: submission.name,
    email: submission.email,
    company: submission.company ?? undefined,
    message: submission.message,
    attachmentUrls: submission.attachmentUrls ?? [],
    read: Boolean(submission.readAt),
    readAt: submission.readAt ? submission.readAt.toISOString() : undefined,
    submittedAt: submission.createdAt.toISOString(),
  };
}
