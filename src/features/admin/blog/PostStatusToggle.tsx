"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PostStatus } from "@prisma/client";

import { Button } from "@/components/ui";
import { setPostStatus } from "@/actions/posts";
import {
  POST_GENERIC_ERROR,
  PUBLISH_ACTION_LABEL,
  STATUS_UPDATING_LABEL,
  UNPUBLISH_ACTION_LABEL,
} from "./config";

export interface PostStatusToggleProps {
  /** Id of the post whose status is being toggled. */
  postId: string;
  /** The post's current status, which determines the toggle's target. */
  status: PostStatus;
}

/**
 * `PostStatusToggle` — flip a post between DRAFT and PUBLISHED
 * (Requirements 11.4, 11.5; Property 3).
 *
 * A small client island that calls {@link setPostStatus} with the *opposite*
 * of the current status: a published article offers "Move to draft" (hide), a
 * draft offers "Publish" (make public). The Server Action re-checks the session
 * (Property 7), stamps/clears `publishedAt`, and revalidates the public + admin
 * surfaces; on success the list is refreshed so the new state shows immediately.
 */
export function PostStatusToggle({ postId, status }: PostStatusToggleProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const isPublished = status === PostStatus.PUBLISHED;
  const target = isPublished ? PostStatus.DRAFT : PostStatus.PUBLISHED;
  const label = isPublished ? UNPUBLISH_ACTION_LABEL : PUBLISH_ACTION_LABEL;

  const handleToggle = async () => {
    setPending(true);
    setError(undefined);
    try {
      const result = await setPostStatus(postId, target);
      if (result.success) {
        router.refresh();
        return;
      }
      setError(result.formError ?? POST_GENERIC_ERROR);
    } catch {
      setError(POST_GENERIC_ERROR);
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="flex flex-col items-end gap-space-1">
      <Button
        type="button"
        variant={isPublished ? "ghost" : "primary"}
        size="sm"
        onClick={handleToggle}
        disabled={pending}
      >
        {pending ? STATUS_UPDATING_LABEL : label}
      </Button>
      {error ? (
        <span
          role="alert"
          className="font-sans text-caption font-medium text-red-400"
        >
          {error}
        </span>
      ) : null}
    </span>
  );
}
