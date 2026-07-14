# Rishabh Chaturvedi Portfolio

An interactive case-study portfolio for Rishabh Chaturvedi, focused on backend systems, cloud infrastructure, search performance, distributed platforms, and AI-assisted product work.

Live site: [rishabhchaturvedi.dev](https://rishabhchaturvedi.dev)

## Highlights

- A responsive portfolio shell with project, experience, skills, education, and contact views.
- Detailed engineering case studies grounded in verified project data and measurable outcomes.
- RC.AI, a Groq-powered assistant that answers through constrained tools backed by portfolio facts.
- A deterministic local NLP fallback that keeps the assistant useful when the cloud route is unavailable.

## Architecture

- React 19, TypeScript, Vite, and React Router for the application.
- Motion and Three.js for interaction and visual depth.
- `src/data/resumeData.ts` as the source of truth for public portfolio facts and case studies.
- `api/chat.ts` as the server-side Groq route; the browser never receives the provider key.
- `src/lib/nlp` for local retrieval, grounding, privacy controls, and UI actions.
- `src/lib/cloudAI.ts` for cloud response validation and automatic local fallback.
- The 17 featured technology SVGs are vendored from Devicon 2.17.0 under its MIT license, so the skill globe has no icon CDN dependency.
- Vercel for SPA hosting, security headers, the chat function, and production WAF rate limiting.

## Assistant Behavior

The chat route requires Groq to call portfolio tools before answering and returns the fact identifiers used to ground the response. The client accepts a cloud answer only when it passes that grounding contract.

Timeouts, unavailable API routes, provider failures, and invalid cloud responses fall back to the local responder. This makes `npm run dev` useful without cloud credentials while keeping production answers grounded in the same portfolio data.

Production traffic to `/api/chat` is rate-limited with a Vercel WAF rule. Keep that rule enabled for production deployments; the Vite development server does not emulate Vercel WAF.

## Local Setup

Use Node.js 20.19 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

`GROQ_API_KEY` enables the external assistant. `GROQ_MODEL` is optional because the server route has a default model. Leave both unset to exercise the local fallback. Never expose the provider key through a `VITE_` environment variable.

The Vite server runs the frontend and local fallback. To run the Vercel function locally as well, use:

```bash
npx vercel dev
```

## Quality And Release

Run the full release gate before deploying:

```bash
npm run release:check
```

It runs linting, the API TypeScript check, unit tests, the production build, and Playwright end-to-end tests. Configure `GROQ_API_KEY` and the optional `GROQ_MODEL` in Vercel, verify the `/api/chat` WAF rate-limit rule, and deploy only after the gate passes.
