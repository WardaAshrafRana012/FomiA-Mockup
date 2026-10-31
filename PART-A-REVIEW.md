# Part A readiness review

The reference implementation is complete locally. This is not a claim that deployment or GitHub submission is complete.

| Assessment item | Status | Evidence / qualification |
| --- | --- | --- |
| Next.js + JavaScript | Implemented | App Router, JavaScript/JSX; no TypeScript |
| Tailwind CSS or CSS Modules | Implemented | Tailwind CSS 4 plus application CSS |
| Reference layout | Implemented | Visual comparison and 904 x 440 geometry test |
| Responsive layouts | Verified | Overflow checks at 320, 390, 768, 1280 and 1920 pixels |
| Images and controls | Implemented | Local images, mock generation, settings, previews, favorites and downloads |
| Dummy image API | Implemented | POST /api/generate |
| Dummy video API | Implemented | POST /api/video/generate returns a labeled, procedural local sample |
| Modular frontend | Implemented | Shared UI, branding, icons, editor, video, assets and storage modules; source formatted with Prettier |
| Accessibility | Baseline implemented | Labels, alt text, focus states, keyboard dialogs and reduced motion; no claim of full WCAG certification |
| Performance | Baseline implemented | next/image and lazy loading; production build succeeds; no fabricated Lighthouse score |
| GitHub version control | Pending | The folder is not currently a Git repository; no GitHub URL is available |
| Vercel deployment | Pending | User will deploy; no live URL is available |
| Submission PDF | Prepared with editable fields | Fill candidate name, Vercel URL and GitHub URL before submitting |
| Optional Part B | Not completed | Requires an original workspace plus its own product-thinking rationale |

## Final steps for Part A

1. Create a GitHub repository and push the project. Do not upload node_modules, .next, .npm-cache, .pdf-tools or temporary rendering files.
2. Import the GitHub project into Vercel, using the Next.js preset and npm run build. No environment variables are needed.
3. Check the live deployment on desktop and mobile, including both mock APIs and video playback.
4. Fill the PDF's candidate and URL fields, or regenerate it with actual links:

```sh
python scripts/create-submission-pdf.py --name "Your name" --live "https://your-project.vercel.app" --repo "https://github.com/your-account/your-repository"
```

The PDF helper uses locally installed libraries in .pdf-tools. To reproduce after a fresh checkout, install reportlab, pypdf and pymupdf in that folder first. The application itself does not need Python or those libraries.

## Part B: what to build

Part B is optional and separate from the mockup reproduction. Choose just one workspace. An image-generation workspace is the most natural continuation of this project.

A possible original direction is a Creative Direction Board: returning users open an existing campaign, pin a visual anchor, branch three deliberate directions, compare variations with only one changed setting, annotate decisions and promote an approved result. The point is preserving creative decisions and continuity, rather than adding more model selectors.

A focused implementation would include a project-resume state, pinned reference and constraints, a branch board, side-by-side comparison, decision notes and an approved-output tray. Use mocked data and local persistence. Keep it separate, for example at /concept, so Part A remains faithful to the supplied mockup.

Build and test that original workspace, deploy it, and write short answers to all six questions: user/problem; three UX decisions; omitted features; actual inspiration and critique; next-month improvements; and the single differentiating workflow. Explain the compromises. Do not present the current reference recreation as an original Part B redesign.
