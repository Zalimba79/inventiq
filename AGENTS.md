# Repository Guidelines

## Project Structure & Module Organization
Source is in `src/`, with Next.js routes under `src/app` (capture, products/draft|validation|confirmed, API routes). `src/components` holds shared UI (`camera`, `products`, `layout`, `ui`, `debug`), domain helpers in `src/lib` (`ai/` and `image-processing/`), client state in `src/store` (Zustand), and integrations in `src/services`. Prisma schema/migrations reside in `prisma/`, scripts in `scripts/`, and public assets in `public/`. Coverage output goes to `coverage/`; keep untracked.

## Build, Test, and Development Commands
Run `npm run dev` for the dev server and `npm run build` + `npm run start` for production checks. Quality gates: `npm run lint`, `npm run typecheck`, and `npm run format`/`npm run format:check`. Execute `npm test`, `npm run test:watch`, or `npm run test:coverage` for Jest suites. Refresh `CLAUDE.md` with `npm run update-docs` before committing.

## Coding Style & Naming Conventions
TypeScript runs in `strict` mode; prefer explicit types on exports. Prettier enforces 2-space indentation, single quotes, and trailing commas—never bypass it. Components, stores, and services use PascalCase filenames (`CameraView.tsx`), hooks use `useCamelCase` (`useCaptureSession.ts`), and utilities stick to kebab-case modules. Apply Tailwind classes in layout → spacing → color → state order and fix ESLint findings before committing; security and accessibility rules are enforced.

## Testing Guidelines
Jest + Testing Library power unit tests. Colocate specs as `ComponentName.test.tsx` inside a nearby `__tests__` directory (`src/store/__tests__/capture-store.test.ts`). Keep coverage at the 70% minimum noted in `TEST_REPORT.md`; highlight gaps in PRs. Use fake timers or async helpers when exercising queue/upload flows, and refresh snapshots with `npm test -- -u`.

## Commit & Pull Request Guidelines
Branch off `develop` with prefixes like `feature/ai-analysis`, `bugfix/camera-permission`, or `hotfix/...` when patching `main`. Follow Conventional Commits (`feat(camera): support multi-shot capture`). Every PR should link its issue, summarize changes, list verification steps (`npm run lint`, `npm test`, etc.), and add UI screenshots or recordings when relevant. If you adjust workflows or architecture, update `README.md` and regenerate `CLAUDE.md` before requesting review.

## Workflow & Environment Notes
Capture → Draft → Validation → Confirmed mirrors the product status enum (`DRAFT`, `ANALYZED`, `VALIDATED`, `CONFIRMED`); keep transitions explicit in new features. Runtime data currently persists to localStorage—clear via the dashboard tools when testing. Store secrets in `.env.local` (e.g., `OPENAI_API_KEY`, `GOOGLE_CLOUD_PROJECT_ID`, `AI_CACHE_TTL`, `NEXT_PUBLIC_APP_URL`) and use placeholders in shared configs. Enable debug monitors only while `NODE_ENV=development` to avoid leaking metrics in production. Consult `.claude/PROJECT_INFO.md` and `.claude/WORKFLOWS.md` for repo-specific automation flags and session history before large changes. See `.claude/commands/` (e.g., `npm-scripts.md`, `test.md`) for automation prompts.
