import { test, expect } from "@playwright/test";
test("reference proportions at supplied screenshot size", async ({ page }) => {
  await page.setViewportSize({ width: 904, height: 440 });
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator(".gallery-grid img")
        .evaluateAll((imgs) =>
          imgs.every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBeTruthy();
  await page.screenshot({ path: "artifacts/reference-904.png" });
  const sidebar = await page.locator(".sidebar").boundingBox();
  expect(sidebar.x).toBeGreaterThan(24);
  expect(sidebar.width).toBeLessThan(180);
  const first = await page.locator(".image-card").first().boundingBox();
  expect(first.x).toBeGreaterThan(365);
  expect(first.x).toBeLessThan(385);
  expect(first.y).toBeLessThan(65);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
