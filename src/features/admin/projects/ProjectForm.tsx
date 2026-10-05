"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

import {
  Button,
  Field,
  Input,
  SectionHeading,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ActionResult, FieldErrors, ProjectView } from "@/types";
import { createProject, updateProject } from "@/actions/projects";
import {
  ADMIN_PROJECTS_HREF,
  PROJECT_CREATE_SUBMIT,
  PROJECT_EDIT_HEADING,
  PROJECT_FORM_EYEBROW,
  PROJECT_GENERIC_ERROR,
  PROJECT_NEW_HEADING,
  PROJECT_SUBMITTING_LABEL,
  PROJECT_UPDATE_SUBMIT,
} from "./config";

/** The editable fields, all held as strings for controlled inputs. */
interface ProjectFormValues {
  title: string;
  slug: string;
  summary: string;
  problem: string;
  solution: string;
  impact: string;
  /** Comma-separated technologies; split into an array on submit. */
  technologies: string;
  imageUrls: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  order: string;
}

/** Per-field error text keyed by field name (first message wins). */
type ProjectFieldErrors = Partial<Record<keyof ProjectFormValues, string>>;

const EMPTY_VALUES: ProjectFormValues = {
  title: "",
  slug: "",
  summary: "",
  problem: "",
  solution: "",
  impact: "",
  technologies: "",
  imageUrls: [""],
  githubUrl: "",
  liveUrl: "",
  featured: false,
  order: "0",
};

/** Build initial form values from an existing project (edit mode). */
function valuesFromProject(project: ProjectView): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    impact: project.impact,
    technologies: project.technologies.join(", "),
    imageUrls:
      project.imageUrls && project.imageUrls.length > 0
        ? project.imageUrls
        : project.thumbnailUrl
          ? [project.thumbnailUrl]
          : [""],
    githubUrl: project.githubUrl ?? "",
    liveUrl: project.liveUrl ?? "",
    featured: project.featured,
    order: String(project.order),
  };
}

/** Collapse Zod's `flatten().fieldErrors` into one message per visible field. */
function toFieldErrors(source: FieldErrors | undefined): ProjectFieldErrors {
  if (!source) return {};
  const next: ProjectFieldErrors = {};
  for (const key of [
    "title",
    "slug",
    "summary",
    "problem",
    "solution",
    "impact",
    "technologies",
    "imageUrls",
    "githubUrl",
    "liveUrl",
    "order",
  ] as const) {
    const message = source[key]?.[0];
    if (message) next[key] = message;
  }
  return next;
}

/** Parse the comma-separated technologies string into a trimmed array. */
function parseTechnologies(input: string): string[] {
  return input
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export interface ProjectFormProps {
  /** When provided, the form edits this project; otherwise it creates one. */
  project?: ProjectView;
  className?: string;
}

/**
 * `ProjectForm` — create/edit a project in the admin CMS (Requirement 10.1,
 * 10.2, 10.4).
 *
 * A client island that calls {@link createProject} or {@link updateProject}.
 * The server action re-validates with `projectSchema` and re-checks the session
 * (Property 7), so this form mirrors the contact/login pattern: it surfaces the
 * action's structured `fieldErrors` inline (Req 10.4) and a `formError` at the
 * form level, and navigates back to the list on success.
 */
export function ProjectForm({ project, className }: ProjectFormProps) {
  const router = useRouter();
  const headingId = useId();
  const statusId = useId();
  const isEdit = project != null;

  const [values, setValues] = useState<ProjectFormValues>(
    isEdit ? valuesFromProject(project) : EMPTY_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<string | undefined>();

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    const nextValue =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    if (formError) setFormError(undefined);
    setFieldErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name as keyof ProjectFormValues];
      return next;
    });
  };

  const updateImageUrl = (index: number, value: string) => {
    setValues((current) => ({
      ...current,
      imageUrls: current.imageUrls.map((url, imageIndex) =>
        imageIndex === index ? value : url,
      ),
    }));
    setFieldErrors((current) => {
      if (!current.imageUrls) return current;
      const next = { ...current };
      delete next.imageUrls;
      return next;
    });
  };

  const addImageUrl = () => {
    setValues((current) => ({
      ...current,
      imageUrls:
        current.imageUrls.length < 12
          ? [...current.imageUrls, ""]
          : current.imageUrls,
    }));
  };

  const removeImageUrl = (index: number) => {
    setValues((current) => {
      const next = current.imageUrls.filter(
        (_url, imageIndex) => imageIndex !== index,
      );
      return { ...current, imageUrls: next.length > 0 ? next : [""] };
    });
  };

  const moveImageUrl = (index: number, direction: -1 | 1) => {
    setValues((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.imageUrls.length) {
        return current;
      }
      const next = [...current.imageUrls];
      const currentUrl = next[index];
      const destinationUrl = next[destination];
      if (currentUrl === undefined || destinationUrl === undefined) {
        return current;
      }
      next[index] = destinationUrl;
      next[destination] = currentUrl;
      return { ...current, imageUrls: next };
    });
  };

  const uploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const existingCount = values.imageUrls.filter(
      (url) => url.trim().length > 0,
    ).length;
    const availableSlots = 12 - existingCount;
    const files = selectedFiles.slice(0, availableSlots);

    if (availableSlots === 0) {
      setUploadMessage("Remove an image before uploading another.");
      return;
    }
    if (selectedFiles.length > availableSlots) {
      setUploadMessage(
        `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added.`,
      );
    } else {
      setUploadMessage(undefined);
    }

    setUploading(true);
    setUploadProgress(0);

    let uploadedCount = 0;
    for (const [index, file] of files.entries()) {
      if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
        setUploadMessage(`${file.name} must be an image no larger than 10 MB.`);
        continue;
      }

      const folder =
        values.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-+|-+$/g, "") || "draft";
      const filename =
        file.name.replace(/[^a-zA-Z0-9._-]+/g, "-") || "project-image";

      try {
        const blob = await upload(
          `projects/${folder}/${Date.now()}-${index}-${filename}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/admin/project-images",
            multipart: file.size > 4 * 1024 * 1024,
            onUploadProgress: ({ percentage }) =>
              setUploadProgress(
                Math.round(
                  ((uploadedCount + percentage / 100) / files.length) * 100,
                ),
              ),
          },
        );

        setValues((current) => {
          const populated = current.imageUrls.filter(
            (url) => url.trim().length > 0,
          );
          return {
            ...current,
            imageUrls: [...populated, blob.url].slice(0, 12),
          };
        });
        uploadedCount += 1;
      } catch {
        setUploadMessage(`Upload failed for ${file.name}. Please try again.`);
      }
    }

    setUploadProgress(100);
    setUploading(false);
    if (uploadedCount > 0) {
      setUploadMessage(
        `${uploadedCount} image${uploadedCount === 1 ? "" : "s"} uploaded. Save the project to publish the gallery.`,
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setFieldErrors({});

    const parsedOrder = Number.parseInt(values.order, 10);
    const input = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      problem: values.problem,
      solution: values.solution,
      impact: values.impact,
      technologies: parseTechnologies(values.technologies),
      imageUrls: values.imageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0),
      githubUrl: values.githubUrl,
      liveUrl: values.liveUrl,
      featured: values.featured,
      order: Number.isNaN(parsedOrder) ? values.order : parsedOrder,
    } as Parameters<typeof createProject>[0];

    setSubmitting(true);
    try {
      const result: ActionResult<{ id: string }> = isEdit
        ? await updateProject(project.id, input)
        : await createProject(input);

      if (result.success) {
        router.push(ADMIN_PROJECTS_HREF);
        router.refresh();
        return;
      }

      if (result.fieldErrors) {
        setFieldErrors(toFieldErrors(result.fieldErrors));
      }
      if (result.formError || !result.fieldErrors) {
        setFormError(result.formError ?? PROJECT_GENERIC_ERROR);
      }
      setSubmitting(false);
    } catch {
      setFormError(PROJECT_GENERIC_ERROR);
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex w-full flex-col gap-space-6", className)}
    >
      <SectionHeading
        id={headingId}
        level={1}
        eyebrow={PROJECT_FORM_EYEBROW}
        heading={isEdit ? PROJECT_EDIT_HEADING : PROJECT_NEW_HEADING}
      />

      <form
        noValidate
        aria-describedby={statusId}
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-space-4"
      >
        <Field label="Title" required error={fieldErrors.title}>
          {(control) => (
            <Input
              {...control}
              name="title"
              type="text"
              value={values.title}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field
          label="Slug"
          required
          error={fieldErrors.slug}
          description="URL-safe identifier (lowercase, hyphens)."
        >
          {(control) => (
            <Input
              {...control}
              name="slug"
              type="text"
              placeholder="my-project"
              value={values.slug}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Summary" required error={fieldErrors.summary}>
          {(control) => (
            <Textarea
              {...control}
              name="summary"
              rows={2}
              value={values.summary}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Problem" required error={fieldErrors.problem}>
          {(control) => (
            <Textarea
              {...control}
              name="problem"
              rows={3}
              value={values.problem}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Solution" required error={fieldErrors.solution}>
          {(control) => (
            <Textarea
              {...control}
              name="solution"
              rows={3}
              value={values.solution}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Impact" required error={fieldErrors.impact}>
          {(control) => (
            <Textarea
              {...control}
              name="impact"
              rows={2}
              value={values.impact}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field
          label="Technologies"
          required
          error={fieldErrors.technologies}
          description="Comma-separated (e.g. Next.js, PostgreSQL, AWS)."
        >
          {(control) => (
            <Input
              {...control}
              name="technologies"
              type="text"
              placeholder="Next.js, PostgreSQL"
              value={values.technologies}
              onChange={handleChange}
            />
          )}
        </Field>

        <fieldset className="bg-card/40 rounded-xl border border-hairline p-space-3">
          <legend className="px-space-1 font-sans text-body font-medium text-text">
            Project images
          </legend>
          <p className="mb-space-3 text-caption leading-relaxed text-muted">
            Upload up to 12 images or add existing URLs manually. The first
            image becomes the project-card cover.
          </p>

          <div className="border-accent/40 bg-accent/[0.04] mb-space-3 rounded-lg border border-dashed p-space-3">
            <label className="hover:bg-accent/90 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-accent px-space-3 font-sans text-body font-medium text-bg transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                multiple
                disabled={uploading || values.imageUrls.length >= 12}
                onChange={(event) => void uploadImages(event)}
                className="sr-only"
              />
              {uploading
                ? `Uploading… ${uploadProgress}%`
                : "Upload project images"}
            </label>
            <span className="ml-space-2 text-caption text-muted">
              JPG, PNG, WebP, GIF, or AVIF · 10 MB each
            </span>

            {uploading ? (
              <div
                role="progressbar"
                aria-label="Project image upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
                className="mt-space-2 h-1.5 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full rounded-full bg-accent transition-[width]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : null}

            {uploadMessage ? (
              <p
                role="status"
                className="mt-space-2 text-caption leading-relaxed text-muted"
              >
                {uploadMessage}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-space-3">
            {values.imageUrls.map((url, index) => (
              <div
                key={`${index}-${values.imageUrls.length}`}
                className="grid gap-space-2 rounded-lg border border-hairline p-space-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <Field
                  label={`Image ${index + 1}${index === 0 ? " — cover" : ""}`}
                  error={index === 0 ? fieldErrors.imageUrls : undefined}
                >
                  {(control) => (
                    <Input
                      {...control}
                      type="text"
                      inputMode="url"
                      placeholder="https://… or /images/project.webp"
                      value={url}
                      onChange={(event) =>
                        updateImageUrl(index, event.target.value)
                      }
                    />
                  )}
                </Field>

                <div className="flex items-end gap-space-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveImageUrl(index, -1)}
                    aria-label={`Move image ${index + 1} up`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === values.imageUrls.length - 1}
                    onClick={() => moveImageUrl(index, 1)}
                    aria-label={`Move image ${index + 1} down`}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-space-3"
            disabled={values.imageUrls.length >= 12}
            onClick={addImageUrl}
          >
            + Add another image
          </Button>
        </fieldset>

        <Field label="GitHub URL" error={fieldErrors.githubUrl}>
          {(control) => (
            <Input
              {...control}
              name="githubUrl"
              type="url"
              placeholder="https://github.com/…"
              value={values.githubUrl}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Live demo URL" error={fieldErrors.liveUrl}>
          {(control) => (
            <Input
              {...control}
              name="liveUrl"
              type="url"
              placeholder="https://…"
              value={values.liveUrl}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field
          label="Order"
          error={fieldErrors.order}
          description="Lower numbers appear first among featured projects."
        >
          {(control) => (
            <Input
              {...control}
              name="order"
              type="number"
              min={0}
              value={values.order}
              onChange={handleChange}
            />
          )}
        </Field>

        <label className="flex items-center gap-space-2 font-sans text-body text-text">
          <input
            type="checkbox"
            name="featured"
            checked={values.featured}
            onChange={handleChange}
            className="h-5 w-5 rounded border-hairline bg-bg-secondary accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          Featured on homepage
        </label>

        <div id={statusId} className="min-h-[1.5rem]">
          {formError ? (
            <p
              role="alert"
              className="font-sans text-body font-medium text-red-400"
            >
              {formError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-space-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting || uploading}
          >
            {submitting
              ? PROJECT_SUBMITTING_LABEL
              : isEdit
                ? PROJECT_UPDATE_SUBMIT
                : PROJECT_CREATE_SUBMIT}
          </Button>
          <Button href={ADMIN_PROJECTS_HREF} variant="ghost" size="lg">
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
