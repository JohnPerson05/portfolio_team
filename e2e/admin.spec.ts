import { expect, test } from "@playwright/test";

test("owner can sign in, publish a project, and remove it", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium" ||
      !process.env.E2E_ADMIN_EMAIL ||
      !process.env.E2E_ADMIN_PASSWORD,
    "Requires dedicated E2E owner credentials and database.",
  );

  const slug = `e2e-project-${Date.now()}`;
  const title = `E2E Project ${Date.now()}`;

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/projects/new");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Slug").fill(slug);
  await page
    .getByLabel("Summary")
    .fill("An automated portfolio quality-gate project.");
  await page
    .getByLabel("Problem")
    .fill("Recruiters need evidence that publishing works end to end.");
  await page
    .getByLabel("Solution")
    .fill("Create a temporary featured project through the protected CMS.");
  await page
    .getByLabel("Impact")
    .fill("Confirms the public and admin surfaces stay connected.");
  await page.getByLabel("Technologies").fill("Next.js, Playwright");
  await page
    .getByLabel("Image 1 — cover")
    .fill("/images/enterprise-grid-background.svg");
  await page.getByRole("button", { name: "Add another image" }).click();
  await page.getByLabel("Image 2").fill("/images/john-person-narral.svg");
  await page.getByLabel("Order").fill("0");
  await page.getByLabel("Featured on homepage").check();
  await page.getByRole("button", { name: /create project/i }).click();
  await expect(page).toHaveURL(/\/admin\/projects$/);

  await page.goto("/");
  await expect(page.getByText(title, { exact: true })).toBeVisible();

  await page.goto(`/projects/${slug}`);
  await expect(
    page.getByRole("region", { name: `${title} image gallery` }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Show screenshot 2" }),
  ).toBeVisible();

  await page.goto("/admin/projects");
  const row = page.locator("li").filter({ hasText: title });
  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
});
