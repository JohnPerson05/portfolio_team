/**
 * Contact section content (Task 19, Requirement 8).
 *
 * Centralizes the section copy and the user-facing feedback messages so the
 * {@link ContactForm} stays focused on behavior. The shape mirrors what a
 * future CMS-backed source could provide without changing the component.
 */

/** Eyebrow label shown above the section heading. */
export const CONTACT_EYEBROW = "Get in touch" as const;

/** Section heading text. */
export const CONTACT_HEADING = "Let's build something exceptional" as const;

/** Supporting copy shown beneath the heading. */
export const CONTACT_DESCRIPTION =
  "Have a role, a project, or an idea in mind? Send a message — and attach a brief, mockup, or sketch if you have one." as const;

/** Confirmation shown after a submission succeeds (Req 8.4). */
export const CONTACT_SUCCESS_MESSAGE =
  "Thanks for reaching out — your message has been sent. I'll be in touch soon." as const;

/**
 * Fallback form-level error when the action fails without a specific message
 * (Req 8.5). The action normally returns its own `formError`, but this keeps
 * the UI honest if it ever omits one.
 */
export const CONTACT_GENERIC_ERROR =
  "Something went wrong sending your message. Please try again." as const;

/** Submit button labels for the idle and in-flight states. */
export const CONTACT_SUBMIT_LABEL = "Send message" as const;
export const CONTACT_SUBMITTING_LABEL = "Sending…" as const;
