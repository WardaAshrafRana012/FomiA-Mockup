# FomiA-Mockup

A responsive Next.js App Router application built in JavaScript/JSX, with React, Tailwind CSS 4, Lucide icons, Motion, and a local mock generation route. No keys or paid services are needed.

## Run locally

Use Node.js 20.9+ (Node 24 was used during development).

```sh
npm install
npm run dev
```

Open the URL printed by Next.js. On Windows PowerShell, use `npm.cmd` if execution policy prevents `npm.ps1` from running.

```sh
npm run build
npm start
```

## What works

- Responsive cream/peach creation workspace with original SVG Fomi mark and favicon, history strip, four-column desktop portrait gallery, theme switching, accessible native dialogs and keyboard focus.
- Prompt validation, image count, five aspect ratios, six model choices, eight style previews, advanced settings and an asynchronous mock API with loading/error states.
- Search, favorites, previews, previous/next image navigation, local downloads, clipboard actions and collection removal.
- Locally persisted generation history, favorites, theme, and projects. Create, rename, open, collect generations inside, and delete projects.
- Browser canvas editor: image upload, center crop, rotation, horizontal flip, zoom, brightness, contrast, saturation, reset and PNG export with changes applied to actual pixels.
- Mock video requests, duration/ratio settings, reference upload, persistent history, a labeled procedural motion sample, local video upload, play/pause, mute, fullscreen and download.

## Data and integration

`src/data/assets.json` maps every supplied image to a safe local URL. `ASSET-INVENTORY.md` records original names and dimensions. Originals remain untouched in `asset  for  images/`.

`POST /api/generate` accepts `{prompt, count, ratio, model, style, advanced}` and returns `{id, createdAt, simulated, settings, images}`. It validates prompt/count/ratio and selects existing local images. Connect a real provider behind this route while preserving the response shape. The frontend already handles failure responses.

Gallery aspect ratios change the display crop; downloads retain original image pixels. Model, style, seed, guidance, quality, creativity, negative prompt, and requested file format are demo settings, not inference. Mock downloads are PNG regardless of the requested format. Export from the real canvas editor is PNG.

## Verification

With the local server running on port 3012:

```sh
npm run dev -- --port 3012
npx playwright test
```

The test configuration uses locally installed Google Chrome. Change `channel: 'chrome'` in `playwright.config.mjs` or install Playwright Chromium if needed. Tests cover generation requests, validation, local persistence, favorites, previews/downloads, projects, pixel-changing editor transformations, video concept history, keyboard dismissal, assets and responsive overflow. Screenshots are saved in `artifacts/`; the HTML test report is written to `playwright-report/`.

## Known limitations

The supplied 904 × 440 reference screenshot guided the revised compact desktop layout, icon-only header, floating history strip, peach sidebar, prompt rail, and portrait crops. Missing portrait subjects (including the blonde portrait) use the supplied auburn images; the eighth demo entry is explicitly named as reused. No video samples were supplied. A small procedural motion sample was created locally for POST /api/video/generate. It is explicitly labeled as prebuilt and not AI-generated. Requested duration and aspect ratio remain simulated; the real sample is 3 seconds at 16:9. Uploaded media is session-only and is never sent to a service. Local browser storage has finite capacity and does not synchronize across devices. Some style/model previews approximate the category using supplied imagery. No authentication, real credits, paid AI, or cloud storage is connected.

## Deploy to Vercel yourself

1. Push this directory to your own Git repository, excluding `node_modules`, `.next`, `.npm-cache`, and generated test reports.
2. Import the repository in Vercel and select the Next.js preset.
3. Keep the root directory at this project, install command `npm install`, build command `npm run build`, and default output settings.
4. Select a supported Node.js version (24 or 22). No environment variables are required.
5. Deploy. The generation endpoint runs as a Next.js route handler; browser storage remains local to each visitor.

No deployment was performed.

## Assessment submission

See PART-A-REVIEW.md for the readiness checklist and optional Part B explanation. The fillable Part A submission document is output/pdf/Fomi-Part-A-Submission.pdf. Add your actual name, Vercel URL and GitHub URL before submitting. scripts/create-submission-pdf.py can regenerate the PDF with clickable links. scripts/create-motion-sample.mjs recreates the procedural video sample with local Chrome; it is not required to run the app.


