---
title: "feat: Interactive Neural Decoding Walkthrough"
type: feat
status: active
date: 2026-02-23
brainstorm: docs/brainstorms/2026-02-23-neural-decoding-walkthrough-brainstorm.md
---

# feat: Interactive Neural Decoding Walkthrough

## Overview

Single-page educational React/TS app that teaches neuro/BCI students how population vector decoding works — from individual neuron tuning to cursor control. Five vertically-stacked interactive sections, each building on the last. Synthetic data, no backend.

## Problem Statement / Motivation

"How does a BCI decode movement from neural activity?" is the central question for anyone entering the BCI field. Existing resources are either static textbook figures or research papers with no interactivity. This walkthrough lets students *do* the decoding pipeline, building intuition through manipulation rather than passive reading.

## Proposed Solution

A vertically-scrollable single page with 5 interactive visualization sections. A shared state model (selected direction, generated spikes, noise level) flows top-down so changes in early sections propagate to later ones. Each section has a brief instructional prompt and optional "why" tooltip explaining the neuroscience.

### Data Model (Critical — build first)

```typescript
// src/model/types.ts

interface Neuron {
  id: number;
  preferredDirection: number;  // radians, evenly spaced on [0, 2π)
  baselineRate: number;        // Hz, ~5-10
  maxRate: number;             // Hz, ~40-80
  tuningWidth: number;         // cosine tuning (κ parameter), uniform for MVP
}

interface Population {
  neurons: Neuron[];
  size: number;                // default 50
}

interface Trial {
  direction: number;           // user-selected, radians
  duration: number;            // seconds, default 1.0
  spikeTimes: Map<number, number[]>;  // neuronId → sorted spike times
  noiseLevel: number;          // 0-1 scale, default 0
}

interface DecodedResult {
  populationVector: { angle: number; magnitude: number };
  contributions: { neuronId: number; vector: [number, number] }[];
  cursorPosition: { x: number; y: number };
}
```

**Key decision**: `direction` in Step 2 is **shared global state** consumed by Steps 3–5. Use React context or a simple zustand store. Do NOT let each step own its own copy.

### Pipeline Steps

#### Step 1: Meet the Population

**What**: 50 neurons arranged on a unit circle at their preferred directions. Each neuron is a dot; hovering shows its properties.

**Viz**: SVG circle with 50 dots. Hover tooltip shows PD, max rate.

**Interaction**: Hover only. No state mutation.

**Instruction copy**: *"Each dot is a neuron in motor cortex. Its position on the ring shows which movement direction makes it fire the most — its preferred direction."*

**Implementation**:
- `src/components/PopulationRing.tsx` — SVG circle + positioned dots
- Visx `@visx/tooltip` for hover
- Neurons evenly spaced (pedagogical clarity > realism)

---

#### Step 2: Fire the Neurons

**What**: User clicks a direction on the ring. Neurons generate spikes via Poisson process, rates modulated by cosine tuning. Raster plot appears.

**Viz**: Direction picker (clickable ring reusing Step 1's viz) + raster plot.

**Interaction**: Click ring to set direction. Can re-click to change — raster resets on each pick.

**Instruction copy**: *"Click anywhere on the ring to choose a movement direction. Watch how neurons near that direction fire rapidly, while distant ones barely respond."*

**Spike generation** (cosine tuning model):
```
rate_i(θ) = baseline + (maxRate - baseline) * max(0, cos(θ - PD_i))
```
Then Poisson process with that rate over trial duration. Use seeded PRNG for reproducibility.

**Raster plot rendering**: **Canvas, not SVG**. 50 neurons × ~50 spikes avg = ~2500 tick marks. SVG would work but Canvas is safer for re-renders when user rapidly clicks new directions. Use a `<canvas>` element with a `useEffect` draw loop — Visx isn't needed here.

**Implementation**:
- `src/components/DirectionPicker.tsx` — clickable ring (extends PopulationRing)
- `src/components/RasterPlot.tsx` — Canvas-based raster
- `src/model/spikeGenerator.ts` — cosine tuning + Poisson generation
- `src/utils/prng.ts` — seedable PRNG (simple mulberry32 or similar, ~10 LOC)

---

#### Step 3: Tuning Curves

**What**: Show tuning curves for all 50 neurons. Click a neuron (on raster or ring) to highlight its curve. Show the current direction as a vertical line — the intersection point is "this neuron's firing rate for this direction."

**Viz**: Overlaid tuning curves (SVG paths via Visx). Highlighted neuron in bold color, others in low-opacity gray. Vertical line at selected direction.

**Interaction**: Click neuron to highlight. Only one highlighted at a time (or maybe up to 3 for comparison — start with 1).

**Instruction copy**: *"Each curve shows how a neuron's firing rate changes with direction. Click a neuron to highlight its curve. The vertical line marks your chosen direction."*

**50-curve hairball mitigation**: Default state shows all curves at 10% opacity. Only highlighted neuron(s) at full opacity. This is the key UX insight — don't try to make 50 curves legible simultaneously.

**Implementation**:
- `src/components/TuningCurves.tsx` — Visx `LinePath` × 50, opacity-controlled
- Visx `@visx/axis` for axes (direction on x, firing rate on y)
- Highlight state lifted to shared context

---

#### Step 4: Population Vector

**What**: Show the population vector algorithm. Each neuron contributes a vector in its PD weighted by its firing rate. Sum all vectors → decoded direction.

**Viz**: Vector diagram — 50 small colored arrows (neuron contributions) and one bold resultant arrow (PV). Optionally animate the summation (vectors adding one by one).

**Interaction**: Hover a neuron contribution to highlight it. Toggle animation replay.

**Instruction copy**: *"Each neuron 'votes' for its preferred direction, weighted by how fast it fired. The thick arrow is the sum of all votes — the brain's best guess at intended direction."*

**PV computation**:
```
PV_x = Σ rate_i * cos(PD_i)
PV_y = Σ rate_i * sin(PD_i)
decoded_angle = atan2(PV_y, PV_x)
```

**Near-zero magnitude edge case**: If PV magnitude < threshold, show a "low confidence" indicator (dashed circle, muted arrow) rather than an invisible arrow.

**Implementation**:
- `src/components/PopulationVector.tsx` — SVG arrows via Visx
- `src/model/decoder.ts` — PV computation
- Animation: pre-compute cumulative sums, play back with `requestAnimationFrame` or `setInterval`

---

#### Step 5: Decode & Move

**What**: The decoded direction drives a cursor dot. Ground truth direction shown as a reference arrow. Noise slider lets user degrade the decode.

**Viz**: Target area with ground-truth arrow (thin, gray) + decoded cursor position (bold dot) + decoded direction arrow. Noise slider below.

**Interaction**: Noise slider (0 = perfect, 1 = +100% Gaussian noise on spike rates). Each slider change regenerates spikes and re-decodes. Show angular error numerically.

**Instruction copy**: *"The decoded direction moves a cursor toward your intended target. Use the noise slider to simulate real-world signal degradation — watch how the decoder's accuracy falls."*

**Noise model**: Add Gaussian noise to each neuron's firing rate before PV computation. `noisy_rate = rate * (1 + noiseLevel * N(0, 1))`, clamped ≥ 0.

**Ground truth reference**: Critical UX — without the reference arrow, "degradation" has no anchor. Always show both decoded and true direction.

**Implementation**:
- `src/components/DecoderDemo.tsx` — cursor + reference + slider
- Slider: plain `<input type="range">` — no library needed
- Re-uses `spikeGenerator.ts` and `decoder.ts` with noise parameter

---

### Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Layout shell, context providers
├── model/
│   ├── types.ts                # Shared type definitions
│   ├── population.ts           # Generate neuron population
│   ├── spikeGenerator.ts       # Cosine tuning + Poisson spike gen
│   └── decoder.ts              # Population vector computation
├── utils/
│   └── prng.ts                 # Seedable PRNG
├── context/
│   └── SimulationContext.tsx    # Shared state (direction, spikes, noise)
├── components/
│   ├── PopulationRing.tsx       # Step 1: unit circle with neurons
│   ├── DirectionPicker.tsx      # Step 2: clickable ring
│   ├── RasterPlot.tsx           # Step 2: canvas raster plot
│   ├── TuningCurves.tsx         # Step 3: overlaid tuning curves
│   ├── PopulationVector.tsx     # Step 4: vector diagram
│   ├── DecoderDemo.tsx          # Step 5: cursor + noise slider
│   ├── StepSection.tsx          # Wrapper: title + instruction + viz
│   └── Header.tsx               # Page title + brief intro
└── styles/
    └── index.css                # Global styles (dark theme)
```

### Scaffold & Tooling

```
package.json                    # React 18, visx, vite, vitest
tsconfig.json                   # strict mode
vite.config.ts                  # default React SPA config
vitest.setup.ts                 # cleanup + jest-dom matchers
.node-version                   # LTS (22.x)
.env.example                    # empty for now (no secrets in MVP)
netlify.toml                    # SPA redirect rule
index.html                      # Vite entry
```

## Technical Considerations

**Performance**:
- Raster plot on Canvas (not SVG) — safest for rapid re-render on direction change
- Tuning curves: 50 SVG paths is fine; opacity transitions via CSS `transition` (no JS animation needed)
- PV animation: pre-computed keyframes, not live computation per frame
- All computation is trivial for 50 neurons — no web worker needed

**Seeded PRNG**:
- Implement a simple mulberry32 (32-bit, ~10 LOC)
- Seed from a constant so page refresh produces identical results
- Optional: expose seed as URL param for shareability (defer for MVP)

**State architecture**:
- React Context with `useReducer` for simulation state
- Actions: `SET_DIRECTION`, `SET_NOISE`, `REGENERATE_SPIKES`
- Spikes regenerated whenever direction or noise changes
- PV and cursor derived (computed, not stored)

**Styling**:
- Dark theme (dark gray bg, not pure black)
- Neuron colors: a perceptual colormap (viridis or similar) mapped to preferred direction
- Minimal CSS, no CSS-in-JS library — plain CSS modules or just index.css for MVP

## Acceptance Criteria

### Functional
- [ ] Page loads with 50 neurons displayed on a unit circle
- [ ] Clicking the ring sets a direction and generates a raster plot
- [ ] Raster plot shows spikes for all 50 neurons; neurons near chosen direction visibly fire more
- [ ] Tuning curve panel shows 50 curves; clicking a neuron highlights its curve
- [ ] Population vector diagram shows individual contributions and resultant arrow
- [ ] Decoded direction drives a cursor dot; ground truth shown as reference
- [ ] Noise slider (0–1) degrades decode accuracy; angular error displayed numerically
- [ ] All steps use the same direction/spike data (shared state)
- [ ] Each step has a brief instructional prompt
- [ ] Page is vertically scrollable, all sections visible

### Non-Functional
- [ ] No visible jank when changing direction or noise (< 100ms re-render)
- [ ] Works in Chrome and Firefox (Safari nice-to-have)
- [ ] Deployed to Netlify, SPA routing works
- [ ] Build succeeds with zero TS errors

### Explicitly Deferred
- Mobile/responsive layout
- Real data from DANDI
- Multiple decode algorithms
- Trial averaging / multi-trial analysis
- Export/share functionality
- Accessibility (ARIA on interactive SVG)
- User-configurable neuron count

## Implementation Phases

### Phase 1: Scaffold + Data Model (~foundation)
1. Init Vite + React + TS project
2. Install deps: `@visx/shape`, `@visx/scale`, `@visx/axis`, `@visx/tooltip`, `@visx/group`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
3. Set up vitest.setup.ts with cleanup
4. Pin Node LTS in .node-version
5. Create netlify.toml with SPA redirect
6. Implement `types.ts`, `population.ts`, `prng.ts`
7. Implement `spikeGenerator.ts` + `decoder.ts`
8. Write unit tests for spike generation and PV decoding
9. Create `SimulationContext.tsx`

### Phase 2: Core Visualizations (~the meat)
1. `StepSection.tsx` wrapper component
2. `Header.tsx` with page intro
3. `PopulationRing.tsx` (Step 1)
4. `DirectionPicker.tsx` + `RasterPlot.tsx` (Step 2)
5. `TuningCurves.tsx` (Step 3)
6. `PopulationVector.tsx` (Step 4)
7. `DecoderDemo.tsx` (Step 5)
8. Wire all into `App.tsx`

### Phase 3: Polish + Deploy
1. Dark theme styling
2. Instruction copy for each step
3. Tooltips and hover states
4. PV summation animation
5. Edge case handling (near-zero PV, empty spike rows)
6. Build + deploy to Netlify
7. Smoke test deployed URL

## Dependencies & Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Visx learning curve slows progress | Medium | Visx docs are solid; fallback to raw SVG if a component fights you |
| Canvas raster plot integration with React state | Low | Standard `useEffect` + `useRef` pattern, well-documented |
| 50-neuron tuning curve visual clutter | Medium | Opacity strategy (10% default, full on highlight) already specified |
| Scope creep into real data | Medium | Deferred list is explicit; synthetic data layer is intentionally swappable |

## References

- [Georgopoulos et al., 1986 — Population vector algorithm](https://doi.org/10.1523/JNEUROSCI.06-11-03060.1986)
- [Visx docs](https://airbnb.io/visx/)
- [Explorable Explanations](https://explorabl.es/)
- Brainstorm: `docs/brainstorms/2026-02-23-neural-decoding-walkthrough-brainstorm.md`
