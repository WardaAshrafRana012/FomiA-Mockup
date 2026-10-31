import { test, expect } from "@playwright/test";

const live = process.env.LIVE_URL;
test("deployed Next.js page and both mock APIs work publicly", async ({
  page,
  request,
}) => {
  test.skip(!live, "Set LIVE_URL to run against a deployed site.");
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 904, height: 440 });
  const response = await page.goto(live);
  expect(response.status()).toBe(200);
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".image-card")).toHaveCount(8);
  await expect
    .poll(
      () =>
        page
          .locator(".gallery-grid img")
          .evaluateAll((images) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
      { timeout: 20000 },
    )
    .toBeTruthy();
  await page.screenshot({
    path: "artifacts/deployed-desktop.png",
    fullPage: true,
  });
  await page.locator("#prompt").fill("A warm portrait in a cream sweater");
  await page
    .getByRole("combobox", { name: /^Number of images/ })
    .selectOption("2");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.locator(".image-card")).toHaveCount(2, { timeout: 20000 });
  await page
    .locator("nav")
    .getByRole("button", { name: "Video", exact: true })
    .click();
  await page.locator(".video-settings textarea").fill("Warm studio motion");
  await page.getByRole("button", { name: "Prepare video demo" }).click();
  await expect(
    page.getByText("Local motion sample - not AI-generated.", { exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await expect(page.locator("video")).toBeVisible();
  await page.getByRole("button", { name: "Play video", exact: true }).click();
  await expect
    .poll(() => page.locator("video").evaluate((video) => !video.paused))
    .toBeTruthy();
  await page.getByRole("button", { name: "Pause video", exact: true }).click();
  const invalid = await request.post(new URL("/api/generate", live).href, {
    data: { prompt: "", count: 2, ratio: "1:1" },
  });
  expect(invalid.status()).toBe(400);
  await page
    .locator("nav")
    .getByRole("button", { name: "Home", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/deployed-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
