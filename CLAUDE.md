# Project: Drug Interactions

---

# GENERAL PROJECT BEHAVIOR

Guidelines that apply to any greenfield React/TS + serverless + LLM project. Reusable across templates.

## Workflow

- Always start with `/workflows:brainstorm` before planning or building
- Architecture decisions come AFTER brainstorm, not before

## Architecture

- [TBD AFTER BRAINSTORM]

## Runtime

- Node: use LTS; pin in `.node-version`. Avoid bleeding-edge (e.g., Netlify CLI chokes on v24)
- .env loading: `tsx` does NOT load .env files. Scripts needing env vars must use `node --env-file=.env --import tsx`
- `.env.example` committed with placeholder keys, `.env` gitignored
- Never send API keys to remote providers (Netlify, Vercel, etc.) unless explicitly told to

## LLM Integration

- Never call `JSON.parse` directly on model output. Always strip markdown fences first — models have a strong RLHF prior toward wrapping JSON in ```json blocks regardless of prompt instructions
- System prompts should request JSON but code must never assume compliance
- Use a shared fence-stripping parsing util; no per-callsite ad-hoc stripping

## Testing

- vitest + @testing-library/react
- MUST have `vitest.setup.ts` with explicit `afterEach(() => cleanup())` — auto-cleanup silently fails without vitest globals enabled
- Import `@testing-library/jest-dom` matchers in setup file, not per-test

## Deploy (Netlify)

- All CLI commands use non-interactive flags (`--yes`, `--prod`, `--json`). Never rely on interactive prompts in automation
- SPA routing: configure `/* -> /index.html 200` redirect rule
- When finished: push to remote github, then deploy and verify it works

## Constraints

- $0 budget other than LLM API calls (proof of concept default)
- Data downloads fine from trusted sources but respect storage caps (default 20GB)
- Full access to git, github commands, hosting account assumed

## Commands

- `npm run dev`
- `npm run build`

## Misc

- Don't rely on implicit behavior across tool boundaries. If you need something to happen, make it explicit in code you control
- Point out to me if anything I'm asking you to do seems wrong/strange
- Spin up sub-agents as necessary

---

# SPECIFIC PROJECT IMPLEMENTATION

Details unique to this project. Replace when templating for a new project.

## Goal

THIS IS A PROOF OF CONCEPT. MAKE AN MVP TO SEE IF IT WORKS; NOT FULL FEATURE.

Build a website that uses neuron data in an interesting, visual way. I'm an aspiring BCI engineer; brainstorm with me for a compelling visual representation.

## Definition of Done

- deployed website that meets goals
- report the website name to me at the end

## Tech Stack

- React/TS
- Netlify for deploy (unless another free hoster is more compelling)
- no database (proof of concept)

## Data Sources

Use these data sources as primary material unless 1. you find better data sources or 2. these databases are a nightmare for you to work with. No clue on database access/feasibility; you'll have to explore.
- BrainGate datasets
- Neuralink's compression challenge dataset
- International Brain Laboratory
- dandiarchive.org
- OpenNeuro
