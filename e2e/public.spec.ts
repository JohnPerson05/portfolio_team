import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage renders the complete studio story without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const id of [
    "team",
    "services",
    "process",
    "work",
    "why",
    "testimonials",
    "contact",
  ]) {
    await expect(page.locator(`section#${id}`)).toBeAttached();
  }

  const overflows = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("public pages have no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("contact form exposes inline validation feedback", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByText(/name is required/i)).toBeVisible();
  await expect(page.getByText(/email is required/i)).toBeVisible();
});

test("resume route serves a PDF download", async ({ request }) => {
  const response = await request.get("/resume");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect(response.headers()["content-disposition"]).toContain("attachment");
});
