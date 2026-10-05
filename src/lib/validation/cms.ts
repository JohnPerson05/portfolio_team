import { z } from "zod";

import { slugSchema } from "./shared";

/**
 * Validation for every CMS mutation. These schemas are the server-side trust
 * boundary: Server Actions parse their input with them before touching the
 * database, regardless of what the admin UI already checked.
 *
 * "Sanitization" here means: trim, bound lengths, and only accept safe URL
 * schemes (no `javascript:`/`data:` links). Rendering escapes text via React;
 * CMS text is never injected as raw HTML.
 */

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export function text(max: number, label: string) {
  return z
    .string({ invalid_type_error: `${label} must be text` })
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`);
}

export function requiredString(max: number, label: string) {
  return text(max, label).min(1, `${label} is required`);
}

export function optionalString(max: number, label: string) {
  return z.preprocess(emptyToUndefined, text(max, label).optional());
}

function isSafeHref(value: string): boolean {
  if (value.startsWith("/")) return !value.startsWith("//");
  if (value.startsWith("#")) return true;
  if (value.startsWith("mailto:")) return /^mailto:[^\s@]+@[^\s@]+$/.test(value);
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeAsset(value: string): boolean {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** A link: https/http URL, site path ("/contact"), anchor, or mailto. */
export const linkSchema = z
  .string()
  .trim()
  .max(2048, "Link is too long")
  .refine(isSafeHref, "Use a full https:// URL or a path starting with /");

export const optionalLink = z.preprocess(emptyToUndefined, linkSchema.optional());

/** An image/media URL: https URL or site path. */
export const assetSchema = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .refine(isSafeAsset, "Use an uploaded file, an https:// URL, or a path starting with /");

export const optionalAsset = z.preprocess(emptyToUndefined, assetSchema.optional());

export const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(254).email("Enter a valid email").optional(),
);

export const displayOrderSchema = z.coerce
  .number({ invalid_type_error: "Order must be a number" })
  .int("Order must be a whole number")
  .min(0, "Order must be 0 or greater")
  .max(100_000)
  .default(0);

export const idSchema = z.string().trim().min(1, "Missing id").max(64);

/** An ordered list of ids from a drag-and-drop reorder. */
export const reorderSchema = z
  .array(idSchema)
  .max(500)
  .refine((ids) => new Set(ids).size === ids.length, "Duplicate ids");

const stringList = (maxItems: number, maxLength: number, label: string) =>
  z
    .array(z.string().trim().max(maxLength, `${label} entries must be ${maxLength} characters or fewer`))
    .max(maxItems, `No more than ${maxItems} ${label.toLowerCase()}`)
    .transform((items) => items.filter(Boolean))
    .default([]);

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projectMediaSchema = z.object({
  id: z.string().max(64).optional(),
  mediaType: z.enum(["IMAGE", "VIDEO", "GIF", "EMBED"]).default("IMAGE"),
  url: assetSchema,
  thumbnailUrl: optionalAsset,
  title: optionalString(160, "Media title"),
  caption: optionalString(500, "Caption"),
  altText: optionalString(300, "Alt text"),
});

export const projectSchema = z.object({
  title: requiredString(140, "Project name"),
  slug: slugSchema.max(120, "Slug must be 120 characters or fewer"),
  category: optionalString(60, "Category"),
  tagline: optionalString(200, "Tagline"),
  shortDescription: text(400, "Short description").default(""),
  description: optionalString(10_000, "Description"),
  problem: text(5_000, "Problem").default(""),
  solution: text(5_000, "Solution").default(""),
  result: text(5_000, "Result").default(""),
  coverImage: optionalAsset,
  heroImage: optionalAsset,
  projectUrl: optionalLink,
  githubUrl: optionalLink,
  otherUrl: optionalLink,
  otherUrlLabel: optionalString(60, "Link label"),
  clientName: optionalString(120, "Client"),
  year: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce
      .number({ invalid_type_error: "Year must be a number" })
      .int()
      .min(1990, "Year looks too early")
      .max(2100, "Year looks too far ahead")
      .optional(),
  ),
  featured: z.boolean().default(false),
  displayOrder: displayOrderSchema,
  seoTitle: optionalString(120, "SEO title"),
  seoDescription: optionalString(320, "SEO description"),
  ogImage: optionalAsset,
  technologyIds: z.array(idSchema).max(60).default([]),
  media: z.array(projectMediaSchema).max(60, "No more than 60 media items").default([]),
});

export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectData = z.output<typeof projectSchema>;

/**
 * Drafts may be incomplete; publishing requires the full story. Returns field
 * errors for anything missing, or `null` when the project can go live.
 */
export function publishBlockers(
  data: Pick<ProjectData, "shortDescription" | "problem" | "solution" | "result">,
): Record<string, string[]> | null {
  const errors: Record<string, string[]> = {};
  const required: [keyof typeof data, string][] = [
    ["shortDescription", "Short description"],
    ["problem", "Problem"],
    ["solution", "Solution"],
    ["result", "Result"],
  ];
  for (const [key, label] of required) {
    if (!data[key]?.trim()) errors[key] = [`${label} is required to publish`];
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

export const teamMemberSchema = z.object({
  name: requiredString(120, "Name"),
  slug: slugSchema.max(120),
  role: requiredString(120, "Role"),
  shortBio: optionalString(300, "Short bio"),
  bio: optionalString(5_000, "Bio"),
  profileImage: optionalAsset,
  location: optionalString(120, "Location"),
  email: optionalEmail,
  website: optionalLink,
  linkedin: optionalLink,
  github: optionalLink,
  responsibilities: stringList(12, 200, "Responsibilities"),
  skills: stringList(40, 80, "Skills"),
  experience: optionalString(200, "Experience"),
  displayOrder: displayOrderSchema,
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type TeamMemberInput = z.input<typeof teamMemberSchema>;

/* -------------------------------------------------------------------------- */
/* Services / process / testimonials / technologies                           */
/* -------------------------------------------------------------------------- */

export const serviceSchema = z.object({
  title: requiredString(120, "Title"),
  slug: slugSchema.max(120),
  shortDescription: requiredString(400, "Short description"),
  description: optionalString(5_000, "Description"),
  icon: optionalString(400, "Icon"),
  image: optionalAsset,
  leadLabel: optionalString(80, "Lead label"),
  displayOrder: displayOrderSchema,
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type ServiceInput = z.input<typeof serviceSchema>;

export const processStepSchema = z.object({
  title: requiredString(80, "Title"),
  headline: optionalString(200, "Headline"),
  description: requiredString(2_000, "Description"),
  visual: optionalString(2048, "Visual"),
  isPublished: z.boolean().default(true),
});

export type ProcessStepInput = z.input<typeof processStepSchema>;

export const testimonialSchema = z.object({
  name: requiredString(120, "Name"),
  role: requiredString(120, "Role"),
  company: optionalString(120, "Company"),
  avatar: optionalAsset,
  logoUrl: optionalAsset,
  quote: requiredString(2_000, "Quote"),
  projectId: z.preprocess(emptyToUndefined, idSchema.optional()),
  displayOrder: displayOrderSchema,
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export type TestimonialInput = z.input<typeof testimonialSchema>;

export const technologySchema = z.object({
  name: requiredString(80, "Name"),
  slug: slugSchema.max(80),
  icon: optionalAsset,
  category: optionalString(60, "Category"),
  isActive: z.boolean().default(true),
});

export type TechnologyInput = z.input<typeof technologySchema>;

/* -------------------------------------------------------------------------- */
/* Site structure                                                             */
/* -------------------------------------------------------------------------- */

export const homepageSectionSchema = z.object({
  key: z.string().trim().min(1).max(40),
  label: requiredString(60, "Label"),
  eyebrow: optionalString(80, "Eyebrow"),
  title: optionalString(200, "Title"),
  description: optionalString(1_000, "Description"),
  isEnabled: z.boolean(),
});

export const homepageSectionsSchema = z.array(homepageSectionSchema).max(40);

export const navigationItemSchema = z.object({
  label: requiredString(40, "Label"),
  href: linkSchema,
  location: z.enum(["HEADER", "FOOTER"]),
  isVisible: z.boolean().default(true),
});

export const navigationSchema = z.array(navigationItemSchema).max(40);

/* -------------------------------------------------------------------------- */
/* Admin users                                                                */
/* -------------------------------------------------------------------------- */

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(256, "Password is too long");

export const adminUserCreateSchema = z.object({
  name: requiredString(80, "Name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  role: z.enum(["SUPER_ADMIN", "EDITOR"]),
  password: passwordSchema,
});

export const adminUserUpdateSchema = z.object({
  name: requiredString(80, "Name"),
  role: z.enum(["SUPER_ADMIN", "EDITOR"]),
  isActive: z.boolean(),
});

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const mediaAssetSchema = z.object({
  url: assetSchema,
  pathname: z.string().trim().min(1).max(512),
  filename: requiredString(255, "Filename"),
  contentType: z.enum(ALLOWED_UPLOAD_TYPES),
  size: z.number().int().min(0).max(MAX_VIDEO_BYTES),
  width: z.number().int().positive().max(20_000).optional(),
  height: z.number().int().positive().max(20_000).optional(),
});
