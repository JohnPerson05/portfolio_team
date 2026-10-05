"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, Input, SectionHeading, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ActionResult, FieldErrors } from "@/types";
import { createPost, updatePost } from "@/actions/posts";
import type { AdminPostView } from "./data";
import {
  ADMIN_BLOG_HREF,
  POST_CREATE_SUBMIT,
  POST_EDIT_HEADING,
  POST_FORM_EYEBROW,
  POST_GENERIC_ERROR,
  POST_NEW_DRAFT_HINT,
  POST_NEW_HEADING,
  POST_SUBMITTING_LABEL,
  POST_UPDATE_SUBMIT,
} from "./config";

/** The editable fields, all held as strings for controlled inputs. */
interface PostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
}

/** Per-field error text keyed by field name (first message wins). */
type PostFieldErrors = Partial<Record<keyof PostFormValues, string>>;

const EMPTY_VALUES: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
};

/** Build initial form values from an existing post (edit mode). */
function valuesFromPost(post: AdminPostView): PostFormValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverUrl: post.coverUrl ?? "",
  };
}

/** Collapse Zod's `flatten().fieldErrors` into one message per visible field. */
function toFieldErrors(source: FieldErrors | undefined): PostFieldErrors {
  if (!source) return {};
  const next: PostFieldErrors = {};
  for (const key of [
    "title",
    "slug",
    "excerpt",
    "content",
    "coverUrl",
  ] as const) {
    const message = source[key]?.[0];
    if (message) next[key] = message;
  }
  return next;
}

export interface PostFormProps {
  /** When provided, the form edits this post; otherwise it creates one. */
  post?: AdminPostView;
  className?: string;
}

/**
 * `PostForm` — create/edit a blog article in the admin CMS (Requirement 11.1,
 * 11.2).
 *
 * A client island that calls {@link createPost} or {@link updatePost}. The
 * server action re-validates with `postSchema` and re-checks the session
 * (Property 7), so this form mirrors the project form: it surfaces the action's
 * structured `fieldErrors` inline and a `formError` at the form level, and
 * navigates back to the list on success.
 *
 * The publish state is NOT edited here — a new article is always created as a
 * draft (Req 11.1), and publishing/unpublishing happens from the article list
 * via the status toggle (Req 11.4/11.5). This keeps content edits from
 * accidentally changing visibility.
 */
export function PostForm({ post, className }: PostFormProps) {
  const router = useRouter();
  const headingId = useId();
  const statusId = useId();
  const isEdit = post != null;

  const [values, setValues] = useState<PostFormValues>(
    isEdit ? valuesFromPost(post) : EMPTY_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<PostFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (formError) setFormError(undefined);
    setFieldErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name as keyof PostFormValues];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setFieldErrors({});

    const input = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      coverUrl: values.coverUrl,
    } as Parameters<typeof createPost>[0];

    setSubmitting(true);
    try {
      const result: ActionResult<{ id: string }> = isEdit
        ? await updatePost(post.id, input)
        : await createPost(input);

      if (result.success) {
        router.push(ADMIN_BLOG_HREF);
        router.refresh();
        return;
      }

      if (result.fieldErrors) {
        setFieldErrors(toFieldErrors(result.fieldErrors));
      }
      if (result.formError || !result.fieldErrors) {
        setFormError(result.formError ?? POST_GENERIC_ERROR);
      }
      setSubmitting(false);
    } catch {
      setFormError(POST_GENERIC_ERROR);
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
        eyebrow={POST_FORM_EYEBROW}
        heading={isEdit ? POST_EDIT_HEADING : POST_NEW_HEADING}
      />

      {!isEdit ? (
        <p className="font-sans text-body text-muted">{POST_NEW_DRAFT_HINT}</p>
      ) : null}

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
              placeholder="my-first-article"
              value={values.slug}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field
          label="Excerpt"
          required
          error={fieldErrors.excerpt}
          description="Short summary shown in previews and listings."
        >
          {(control) => (
            <Textarea
              {...control}
              name="excerpt"
              rows={2}
              value={values.excerpt}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Content" required error={fieldErrors.content}>
          {(control) => (
            <Textarea
              {...control}
              name="content"
              rows={12}
              value={values.content}
              onChange={handleChange}
            />
          )}
        </Field>

        <Field label="Cover image URL" error={fieldErrors.coverUrl}>
          {(control) => (
            <Input
              {...control}
              name="coverUrl"
              type="url"
              placeholder="https://…"
              value={values.coverUrl}
              onChange={handleChange}
            />
          )}
        </Field>

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
          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting
              ? POST_SUBMITTING_LABEL
              : isEdit
                ? POST_UPDATE_SUBMIT
                : POST_CREATE_SUBMIT}
          </Button>
          <Button href={ADMIN_BLOG_HREF} variant="ghost" size="lg">
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
