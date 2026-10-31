import { test, expect } from "@playwright/test";
const errors = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.log("CLIENT ERROR", e.message);
  });
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator("h1")).toBeVisible();
});
test("desktop assets, navigation, model, styles and theme", async ({
  page,
}) => {
  await expect
    .poll(() =>
      page
        .locator(".gallery-grid img")
        .evaluateAll((imgs) =>
          imgs.every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBeTruthy();
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
  await expect(page.locator(".gallery-grid .image-card")).toHaveCount(8);
  expect(
    await page
      .locator(".gallery-grid img")
      .evaluateAll((imgs) =>
        imgs.every((i) => i.complete && i.naturalWidth > 0),
      ),
  ).toBeTruthy();
  await page.locator(".compact-model").click();
  await page.getByRole("button", { name: "Cinematic", exact: true }).click();
  await expect(page.locator(".compact-model")).toContainText("Cinematic");
  await page.locator("summary").filter({ hasText: "Styles" }).click();
  await page.locator(".style-card").filter({ hasText: "Editorial" }).click();
  await expect(page.locator(".style-card.selected")).toContainText("Editorial");
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Light theme", exact: true }).click();
  for (const name of ["Gallery", "Video", "Edit", "Projects", "Home"]) {
    await page
      .locator("nav")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.locator("nav .active")).toHaveAttribute(
      "aria-label",
      name,
    );
  }
  expect(errors).toEqual([]);
});
test("generation, validation, favorites, search, preview, download and persistence", async ({
  page,
}) => {
  await page.locator("#prompt").fill("");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.getByRole("status")).toContainText("Write a prompt");
  await page.locator("#prompt").fill("A warm portrait of a woman");
  await page
    .getByRole("combobox", { name: /^Number of images/ })
    .selectOption("2");
  await page
    .getByRole("combobox", { name: "Aspect ratio", exact: true })
    .selectOption("1:1");
  await page.locator("summary").filter({ hasText: "Advance" }).click();
  await page.getByRole("textbox", { name: "Negative prompt" }).fill("blurry");
  await page.getByRole("spinbutton", { name: "Seed" }).fill("42");
  const req = page.waitForRequest(
    (r) => r.url().endsWith("/api/generate") && r.method() === "POST",
  );
  await page.getByRole("button", { name: /^Generate/ }).click();
  const data = (await req).postDataJSON();
  expect(data.advanced.negative).toBe("blurry");
  expect(data.ratio).toBe("1:1");
  expect(data.count).toBe(2);
  await expect(page.locator(".image-card")).toHaveCount(2);
  await expect(page.getByRole("status")).toContainText("Demo ready");
  await page.locator(".image-card").first().hover();
  await page
    .getByRole("button", { name: "Add favorite", exact: true })
    .first()
    .click();
  await page
    .locator("nav")
    .getByRole("button", { name: "Gallery", exact: true })
    .click();
  await page
    .locator(".gallery-tabs")
    .getByRole("button", { name: /Favorites/ })
    .click();
  await expect(page.locator(".image-card")).toHaveCount(1);
  await page.locator(".image-open").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Download", exact: true })
    .click();
  expect((await download).suggestedFilename()).toContain(".png");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".image-card")).toHaveCount(2);
  await expect(page.locator(".history-thumb")).toHaveCount(1);
  await page
    .locator("nav")
    .getByRole("button", { name: "Gallery", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search images" }).fill("zzzzzz");
  await expect(page.getByText("Room for something new")).toBeVisible();
  expect(errors).toEqual([]);
});
test("project create rename open and generation collection", async ({
  page,
}) => {
  await page
    .locator("nav")
    .getByRole("button", { name: "Projects", exact: true })
    .click();
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Project name" })
    .fill("Portrait study");
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page.locator(".project-grid")).toContainText("Portrait study");
  await page.getByRole("button", { name: "Rename Portrait study" }).click();
  await page.getByRole("textbox", { name: "Project name" }).fill("Warm light");
  await page.getByRole("button", { name: "Save project" }).click();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Warm light");
  await page
    .getByRole("combobox", { name: /^Number of images/ })
    .selectOption("1");
  await page.locator("#prompt").fill("A warm portrait study");
  await page.getByRole("button", { name: /^Generate/ }).click();
  await expect(page.locator(".image-card")).toHaveCount(1);
  await page
    .locator("nav")
    .getByRole("button", { name: "Projects", exact: true })
    .click();
  await expect(page.locator(".project-grid")).toContainText("1 images");
  await page.reload();
  await page
    .locator("nav")
    .getByRole("button", { name: "Projects", exact: true })
    .click();
  await expect(page.locator(".project-grid")).toContainText("Warm light");
});
test("canvas transformations change pixels and export", async ({ page }) => {
  await page
    .locator("nav")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  const c = page.locator("canvas");
  await expect.poll(() => c.evaluate((c) => c.width)).toBeGreaterThan(500);
  const before = await c.evaluate((c) => c.toDataURL());
  await page.getByRole("slider", { name: /Brightness/ }).fill("60");
  await expect.poll(() => c.evaluate((c) => c.toDataURL())).not.toBe(before);
  await page.getByRole("button", { name: "Rotate 90 degrees" }).click();
  await expect.poll(() => c.evaluate((c) => c.width > c.height)).toBeTruthy();
  await page.getByRole("button", { name: "Flip horizontally" }).click();
  await page
    .getByRole("combobox", { name: "Center crop" })
    .selectOption("Square");
  await expect
    .poll(() => c.evaluate((c) => Math.abs(c.width - c.height)))
    .toBeLessThan(2);
  const d = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  expect((await d).suggestedFilename()).toContain("fomi-edited");
  await page.getByRole("button", { name: "Reset adjustments" }).click();
  await expect(page.getByRole("slider", { name: /Brightness/ })).toHaveValue(
    "100",
  );
  await page.screenshot({ path: "artifacts/editor.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("video honest demo, concept history", async ({ page }) => {
  await page
    .locator("nav")
    .getByRole("button", { name: "Video", exact: true })
    .click();
  await expect(
    page.getByText("No video model is connected.", { exact: false }),
  ).toBeVisible();
  await page
    .locator(".video-settings textarea")
    .fill("Warm light moving across a portrait");
  await page.getByRole("button", { name: "Prepare video demo" }).click();
  await expect(
    page.getByText("Local motion sample - not AI-generated.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".video-history button")).toHaveCount(1);
  await page.reload();
  await page
    .locator("nav")
    .getByRole("button", { name: "Video", exact: true })
    .click();
  await expect(page.locator(".video-history button")).toHaveCount(1);
});
test("responsive layouts, controls and keyboard modal", async ({ page }) => {
  for (const width of [1920, 1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page.getByRole("button", { name: /^Generate/ })).toBeVisible();
    if (width === 390)
      await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
  }
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await page.getByRole("button", { name: "Open creation controls" }).click();
  await expect(page.locator("#prompt")).toBeVisible();
  await page.getByRole("button", { name: "Open profile" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("mock API valid requests, invalid input and all asset paths", async ({
  request,
}) => {
  for (const count of [1, 2, 4, 8]) {
    const r = await request.post("/api/generate", {
      data: {
        prompt: "portrait",
        count,
        ratio: "3:4",
        model: "Realistic",
        style: "Editorial",
        advanced: { seed: 5 },
      },
    });
    expect(r.status()).toBe(200);
    const data = await r.json();
    expect(data.simulated).toBe(true);
    expect(data.images).toHaveLength(count);
    for (const a of data.images)
      expect((await request.get(a.src)).status()).toBe(200);
  }
  for (const data of [
    { prompt: "", count: 4, ratio: "3:4" },
    { prompt: "x", count: 90, ratio: "bad" },
  ])
    expect((await request.post("/api/generate", { data })).status()).toBe(400);
});
