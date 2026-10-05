import type {
  Post,
  Skill,
  SkillCategory,
  Experience,
  Testimonial,
  ContactSubmission,
} from "@prisma/client";

/**
 * Serializable view DTOs for content rendered by public Server Components.
 *
 * Prisma row types carry `Date` and nullable fields that are awkward to pass
 * across the RSC/client boundary or to assert against in tests. These DTOs
 * expose the presentational subset with ISO date strings and normalized
 * optionals, keeping client islands lightweight and typed (Requirement 17.2).
 */

/** A gallery item attached to a project. */
export interface ProjectMediaView {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "GIF" | "EMBED";
  url: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  altText?: string;
}

/**
 * A project as rendered by the public site and the admin preview. The core
 * fields keep the original portfolio's names so the original UI renders
 * unchanged; the rest are CMS additions.
 */
export interface ProjectView {
  id: string;
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  impact: string;
  technologies: string[];
  /** Ordered project gallery (images); the first is used as the card cover. */
  imageUrls?: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;

  category?: string;
  tagline?: string;
  description?: string;
  heroImage?: string;
  otherUrl?: string;
  otherUrlLabel?: string;
  clientName?: string;
  year?: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  /** Full gallery including videos/embeds, with captions and alt text. */
  media?: ProjectMediaView[];
  /** ISO-8601, or null while unpublished. */
  publishedAt?: string | null;
  updatedAt?: string;
}

/** A team member as rendered on the public site. */
export interface TeamMemberView {
  id: string;
  name: string;
  slug: string;
  role: string;
  shortBio?: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  email?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  responsibilities: string[];
  skills: string[];
  experience?: string;
  /** Featured members lead the homepage hero. */
  isFeatured: boolean;
  /** Monogram shown when there is no profile image. */
  initials: string;
}

export interface ServiceView {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  icon?: string;
  image?: string;
  leadLabel?: string;
  /** Zero-padded display number, e.g. "01". */
  number: string;
}

export interface ProcessStepView {
  id: string;
  stepNumber: number;
  title: string;
  headline?: string;
  description: string;
  visual?: string;
}

/** Homepage section configuration editable in the CMS. */
export interface HomepageSectionView {
  key: string;
  label: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export interface NavLinkView {
  label: string;
  href: string;
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
  /** The (published) project this testimonial is about, if any. */
  project?: { title: string; slug: string };
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
export function toTestimonialView(
  testimonial: Testimonial & {
    project?: { title: string; slug: string } | null;
  },
): TestimonialView {
  return {
    id: testimonial.id,
    quote: testimonial.quote,
    author: testimonial.name,
    role: testimonial.role,
    company: testimonial.company ?? undefined,
    avatarUrl: testimonial.avatar ?? undefined,
    logoUrl: testimonial.logoUrl ?? undefined,
    project: testimonial.project ?? undefined,
    order: testimonial.displayOrder,
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
