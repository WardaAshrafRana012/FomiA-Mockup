import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:3012");
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(24);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 1200000,
    });
    const parts = [];
    const result = new Promise((resolve) => {
      recorder.ondataavailable = (e) => parts.push(e.data);
      recorder.onstop = async () =>
        resolve(
          Array.from(
            new Uint8Array(
              await new Blob(parts, { type: "video/webm" }).arrayBuffer(),
            ),
          ),
        );
    });
    let frame = 0;
    function draw() {
      frame++;
      ctx.fillStyle = "#f8eee7";
      ctx.fillRect(0, 0, 960, 540);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.fillStyle = ["#e4baa4", "#d89376", "#efe0d0"][i];
        ctx.ellipse(
          200 + i * 270 + Math.sin(frame / 24 + i) * 35,
          240 + Math.cos(frame / 30 + i) * 45,
          95,
          135,
          Math.sin(frame / 30 + i) * 0.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#292724";
      ctx.font = "500 32px Arial";
      ctx.fillText("A little motion. A new direction.", 52, 72);
      ctx.font = "18px Arial";
      ctx.fillText("FOMI / LOCAL MOTION SAMPLE", 52, 475);
      ctx.font = "14px Arial";
      ctx.fillText("Procedural animation. Not AI-generated.", 52, 503);
    }
    draw();
    recorder.start();
    const clock = setInterval(draw, 1000 / 24);
    await new Promise((r) => setTimeout(r, 3000));
    clearInterval(clock);
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    return result;
  });
  await writeFile("public/assets/video/demo-motion.webm", Buffer.from(bytes));
  console.log("Created labeled procedural motion sample.");
} finally {
  await browser.close();
}
