import { expect, test, type Page } from "@playwright/test";

/**
 * End-to-end CMS workflow. Mutates data, so it only runs against a dedicated
 * test database with E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD set (e.g. the seed
 * admin: ADMIN_EMAIL + ADMIN_SEED_PASSWORD).
 */

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium" || !email || !password,
    "Requires dedicated E2E admin credentials and database.",
  );
});

/** Keyboard reorder: lift the focused grip, move one down, drop. */
async function keyboardDrag(page: Page) {
  await page.keyboard.press("Space");
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  await page.keyboard.press("Space");
}

async function signIn(page: Page, next?: string) {
  await page.goto(next ? `/admin/login?next=${encodeURIComponent(next)}` : "/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password", { exact: true }).fill(password!);
  await page.getByRole("button", { name: /sign in/i }).click();
}

test("unauthenticated visitors are sent to the login page", async ({ page, request }) => {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fprojects/);

  // Upload endpoints refuse anonymous callers.
  expect((await request.get("/api/admin/uploads")).status()).toBe(401);
});

test("wrong credentials show a generic error", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password", { exact: true }).fill("definitely-not-the-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});

test("add → preview → publish → archive → trash a project", async ({ page, request }) => {
  const stamp = Date.now();
  const title = `E2E Clinic Portal ${stamp}`;
  const slug = `e2e-clinic-portal-${stamp}`;

  await signIn(page, "/admin/projects");
  await expect(page).toHaveURL(/\/admin\/projects$/);

  // Create a draft — the slug fills itself from the name.
  await page.getByRole("link", { name: /add project/i }).first().click();
  await page.getByLabel("Project name").fill(title);
  await expect(page.getByLabel("Slug")).toHaveValue(slug);
  await page.getByRole("button", { name: "Save draft" }).click();
  // Wait for the redirect from /new to the saved project's editor.
  await expect(page).toHaveURL(/\/admin\/projects\/(?!new$)[a-z0-9]+$/);
  const editorUrl = page.url();
  const id = editorUrl.split("/").pop()!;

  // Drafts are invisible publicly but previewable by admins.
  expect((await request.get(`/projects/${slug}`)).status()).toBe(404);
  const preview = await page.request.get(`/admin/projects/${id}/preview`);
  expect(preview.status()).toBe(200);
  expect(await preview.text()).toContain(title);

  // Publishing requires the story.
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText(/finish the story before publishing/i)).toBeVisible();

  await page.getByRole("tab", { name: /story/i }).click();
  await page.getByLabel(/^1\s*Problem/).fill("Front desk staff juggled three spreadsheets.");
  await page.getByLabel(/^2\s*Solution/).fill("One booking and records portal.");
  await page.getByLabel(/^3\s*Result/).fill("Check-in time dropped from minutes to seconds.");
  await page.getByRole("tab", { name: /basics/i }).click();
  await page.getByLabel("Short description").fill("A booking and records portal for a multi-branch clinic.");
  

  await page.getByRole("tab", { name: /media/i }).click();
  await page.getByRole("button", { name: "Use a URL" }).first().click();
  await page.getByLabel("Cover image URL").fill("/images/projects/atlas.jpg");

  await page.getByRole("tab", { name: /technologies/i }).click();
  await page.getByRole("button", { name: "Next.js", exact: true }).click();

  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText(/published — it's live/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();

  // Immediately public.
  await page.goto(`/projects/${slug}`);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("Check-in time dropped from minutes to seconds.")).toBeVisible();
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  // Archive → hidden again.
  await page.goto(editorUrl);
  await page.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByText(/archived — hidden/i)).toBeVisible();
  expect((await request.get(`/projects/${slug}`)).status()).toBe(404);

  // Trash → restore → delete forever.
  await page.getByRole("button", { name: "Move to trash" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Move to trash" }).click();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  await page.goto("/admin/projects?view=trash");
  await page.getByRole("button", { name: `Actions for ${title}` }).click();
  await page.getByRole("menuitem", { name: "Delete permanently" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete forever" }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});

test("reordering projects persists", async ({ page }) => {
  await signIn(page, "/admin/projects");
  await expect(page).toHaveURL(/\/admin\/projects$/);
  const rows = page.locator("ul li a[href^='/admin/projects/']");
  await expect(rows.first()).toBeVisible();
  const titles = () => rows.allTextContents();
  const before = await titles();
  test.skip(before.length < 2, "Needs at least two projects.");

  // Keyboard drag: focus the first grip, lift, move down, drop.
  await page.getByRole("button", { name: `Reorder ${before[0]}` }).focus();
  await keyboardDrag(page);
  await expect(page.getByText("Project order saved")).toBeVisible();

  await page.reload();
  const after = await titles();
  expect(after.slice(0, 2)).toEqual([before[1], before[0]]);

  // Put it back.
  await page.getByRole("button", { name: `Reorder ${before[1]}` }).focus();
  await keyboardDrag(page);
  await expect(page.getByText("Project order saved")).toBeVisible();
});

test("settings, team, and homepage changes reach the public site", async ({ page }) => {
  const stamp = Date.now();
  await signIn(page, "/admin/settings");

  // Settings → hero title.
  await page.getByRole("tab", { name: "Hero" }).click();
  const heroTitle = page.getByLabel("Hero name", { exact: true });
  const originalTitle = await heroTitle.inputValue();
  await heroTitle.fill(`Calm Software ${stamp}`);
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText(/settings saved/i)).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(`Calm Software ${stamp}`);

  // Restore.
  await page.goto("/admin/settings");
  await page.getByRole("tab", { name: "Hero" }).click();
  await page.getByLabel("Hero name", { exact: true }).fill(originalTitle);
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText(/settings saved/i)).toBeVisible();

  // Team → add + publish a member; it shows on /about.
  const name = `Test Member ${stamp}`;
  await page.goto("/admin/team");
  await page.getByRole("button", { name: /add member/i }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Name").fill(name);
  await sheet.getByLabel("Role").fill("Quality & Testing");
  await sheet.getByRole("switch", { name: "Published" }).click();
  await sheet.getByRole("button", { name: "Add member" }).click();
  await expect(page.getByText("Team member added")).toBeVisible();
  await page.goto("/about");
  await expect(page.getByRole("heading", { name })).toBeVisible();

  // Remove it again.
  await page.goto("/admin/team");
  await page.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Team member removed")).toBeVisible();
  await page.goto("/about");
  await expect(page.getByRole("heading", { name })).toHaveCount(0);

  // Homepage → hide the skills section, then show it again.
  await page.goto("/admin/homepage");
  await page.locator("#section-skills").click();
  await page.getByRole("button", { name: "Save homepage" }).click();
  await expect(page.getByText("Homepage updated")).toBeVisible();
  await page.goto("/");
  await expect(page.locator("section#skills")).toHaveCount(0);
  await page.goto("/admin/homepage");
  await page.locator("#section-skills").click();
  await page.getByRole("button", { name: "Save homepage" }).click();
  await expect(page.getByText("Homepage updated")).toBeVisible();
});
