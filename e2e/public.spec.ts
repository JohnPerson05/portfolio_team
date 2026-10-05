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

test("work archive and case studies are database-driven", async ({ page, request }) => {
  await page.goto("/work");
  const firstCase = page.locator("a[href^='/work/']").first();
  const href = await firstCase.getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("What got better")).toBeVisible();

  expect((await request.get("/work/this-project-does-not-exist")).status()).toBe(404);
  expect((await request.get("/projects", { maxRedirects: 0 })).status()).toBe(308);
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
