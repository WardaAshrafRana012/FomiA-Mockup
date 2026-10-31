import { test, expect } from "@playwright/test";
test("uploaded video playback, mute, download and reference image", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const bytes = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 100;
    const ctx = c.getContext("2d");
    const stream = c.captureStream(15);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    const done = new Promise((resolve) => {
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () =>
        resolve(
          Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())),
        );
    });
    recorder.start();
    let frame = 0;
    const interval = setInterval(() => {
      ctx.fillStyle = frame++ % 2 ? "#ddba98" : "#fae9d8";
      ctx.fillRect(0, 0, 160, 100);
    }, 60);
    await new Promise((r) => setTimeout(r, 1800));
    clearInterval(interval);
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    return done;
  });
  await page
    .locator("nav")
    .getByRole("button", { name: "Video", exact: true })
    .click();
  await page.locator('input[type=file][accept="video/*"]').setInputFiles({
    name: "test-clip.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(bytes),
  });
  await expect(page.locator("video")).toBeVisible();
  await page.getByRole("button", { name: "Play video", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause video", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause video", exact: true }).click();
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.paused))
    .toBeTruthy();
  await page.getByRole("button", { name: "Unmute", exact: true }).click();
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.muted))
    .toBe(false);
  const d = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download uploaded video" }).click();
  expect((await d).suggestedFilename()).toContain("fomi-local-video");
  await page
    .locator('input[type=file][accept="image/*"]')
    .setInputFiles("public/assets/image-01.png");
  await expect(page.getByAltText("Uploaded reference")).toBeVisible();
});

test("mock video API returns playable local asset and validates input", async ({
  request,
}) => {
  const response = await request.post("/api/video/generate", {
    data: {
      prompt: "Warm editorial motion",
      duration: 5,
      ratio: "9:16",
      hasReference: true,
    },
  });
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.simulated).toBe(true);
  expect(data.settings.ratio).toBe("9:16");
  expect(data.video.ratio).toBe("16:9");
  expect(data.video.source).toBe("procedural-local-sample");
  expect((await request.get(data.video.src)).status()).toBe(200);
  for (const body of [
    { prompt: "", duration: 5, ratio: "16:9" },
    { prompt: "x", duration: 99, ratio: "bad" },
  ])
    expect(
      (await request.post("/api/video/generate", { data: body })).status(),
    ).toBe(400);
});
