# Test report

Verified on 30 October 2026 using Node.js 24, Next.js 15.5.28, and local Google Chrome via Playwright.

## Results

- `npm run build`: PASS. App page pre-rendered successfully; `/api/generate` is a dynamic route handler. First load JavaScript approximately 165 kB.
- `npx playwright test`: PASS, 10 tests, against the final production server.
- `node tests/check-assets.mjs`: PASS, all 24 supplied local asset URLs return HTTP 200.
- Dependency installation audit after PostCSS override: 0 known vulnerabilities.
- Desktop, mobile, and editor screenshots captured in `artifacts/` and visually reviewed. Four columns on desktop and two columns on mobile; overflow checks passed at 1920, 1280, 768, 390 and 320 pixels.

## Browser coverage

1. Supplied image loading, navigation through all five main views, model picker, style selection, light/dark theme and theme persistence.
2. Empty prompt validation, mock generation, request settings, image count and aspect ratio, negative prompt and seed, favorites, preview dialog, PNG download, history persistence and empty search results.
3. Project creation, rename, open, generation collection and reload persistence.
4. Editor brightness changes actual pixel data; rotation changes canvas dimensions; flip and square crop work; reset restores settings; edited PNG download succeeds.
5. Mock video preparation, explicitly labeled procedural sample, API validation, video history and reload persistence.
6. Collapsible mobile controls, responsive overflow and keyboard Escape dismissal of accessible modal.
7. API counts 1/2/4/8, supplied image responses, simulation flag, invalid prompt/count/ratio errors.
8. A temporary browser-recorded video fixture verifies uploaded-video playback, pause, unmute and download; image-reference upload preview is verified. This fixture is test data only, not presented as generated application content.

No client exceptions were observed in the final tested flows. Early test failures exposed initial hidden image cards, a no-results-state exception and ambiguous model labels; these were corrected before the final run. The final run used a production server to avoid dev-server/build output contention.

## Verification limits

The supplied 904 × 440 reference was visually compared with artifacts/reference-904.png. The layout is closely approximated; some portrait subjects are unavailable among supplied assets. Native fullscreen, operating-system clipboard permissions, every possible uploaded codec, and every permutation of settings were not exhaustively automated. Project deletion is implemented with a confirmation dialog but was not part of the automated suite. Uploaded images/videos stay in the current session. AI inference, cloud sync, and authentication are intentionally absent. See README.md for feature behavior and deployment instructions.

## Reproduce

```sh
npm install
npm run build
npm start -- --port 3012
# In another terminal:
npm test
node tests/check-assets.mjs
```

Google Chrome must be installed for the provided Playwright configuration. Generated HTML test reports are in `playwright-report/` and are excluded from source control.

## Reference screenshot refinement

The compact layout was rebuilt against the supplied reference. A new browser test verifies geometry at 904 × 440, including the sidebar width, portrait start position and overflow. Desktop screenshots are in artifacts/reference-904.png. The eight-card initial collection uses seven distinct supplied portraits plus one explicitly named reused demo. The reordered collection uses unique React keys; first-row favorite actions sit below the floating history overlay. All existing workflows were rerun against the production build.


The follow-up refinement also matches the compact # Images / 1:1 / Model: Name selectors, Advance and Styles pill buttons, original solid navigation SVGs, and functional History View all link. The sidebar aligns to x=27, y=125 with a 305px height at the reference viewport. The production build was rerun successfully.


## Final Part A assessment review

Added POST /api/video/generate with request validation and a prebuilt 3-second 16:9 WebM sample (about 156 kB). The UI clearly labels it as procedural and not AI-generated; requested duration and ratio are simulated. Video API errors, valid responses and media URLs are now covered. The final suite passes 10 tests against the production build. Prettier formats the source. GitHub publication and Vercel deployment remain pending and are documented in PART-A-REVIEW.md. No Lighthouse or full WCAG certification is claimed.


## Live Vercel verification - 1 November 2026

The initial deployment compiled but used the Other framework preset, publishing static public files and returning a 404 for the application root. The fix explicitly selects Next.js in vercel.json and the Vercel project settings, resets the output directory to the framework default, and pins Node.js 24 to match the tested runtime.

Verified against https://fomia-mockup.vercel.app/ after redeployment:

- GET /: HTTP 200, Next.js application HTML.
- POST /api/generate: HTTP 200, simulated image JSON.
- POST /api/video/generate: HTTP 200, simulated video JSON.
- Live Chrome smoke test: PASS (14 seconds including setup). Checks client hydration, all initial gallery images, image generation, sample video generation and playback, invalid-prompt error response, mobile overflow, and no client exceptions.

Reproduce with LIVE_URL=https://fomia-mockup.vercel.app/ and run npx playwright test tests/deployment-smoke.spec.js. The test skips automatically when LIVE_URL is absent. Live captures are artifacts/deployed-desktop.png and artifacts/deployed-mobile.png.
