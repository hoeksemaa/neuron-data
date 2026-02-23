# Brainstorm: Interactive Neural Decoding Walkthrough

**Date**: 2026-02-23
**Status**: Draft

---

## What We're Building

An interactive, step-by-step educational walkthrough that teaches neuro/BCI students how neural decoding works — from raw spikes to cursor control. Explorable Explanations style (Nicky Case / Bret Victor lineage).

**Target audience**: Neuro/BCI students and early researchers who know what a spike is but want to understand the full decoding pipeline hands-on.

**Core flow** (each step builds on the last):

1. **Motor cortex population** — Meet ~50 synthetic neurons with cosine tuning to movement direction. Show preferred directions on a unit circle.
2. **Spike generation** — User picks an intended movement direction. Watch neurons fire (Poisson process, rates modulated by cosine tuning). Raster plot appears in real-time.
3. **Tuning curves** — Reveal each neuron's tuning curve. Show how firing rate varies with direction. Interactive: click a neuron to highlight its curve.
4. **Population vector** — Aggregate the population response into a weighted vector sum. Animated vector diagram showing contribution from each neuron.
5. **Decode & move** — The population vector drives a cursor. User sees the full loop: intent → spikes → decode → movement. Add noise slider to show decode degradation.

## Why This Approach

- **Pipeline walkthrough** beats a sandbox-only approach bc it provides scaffolding — each step contextualizes the next
- **Synthetic data** keeps the MVP tractable; real data can be swapped in later without changing the viz layer
- **Interactive elements** at each step keep it from being a glorified blog post
- Neuro/BCI students are the sweet spot: enough background to appreciate the detail, enough gaps to learn from the walkthrough

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Purpose | Educational tool | Not portfolio or art — teaching is the goal |
| Audience | Neuro/BCI students | Know basics, want depth |
| Core concept | Neural decoding pipeline | Most compelling "how BCI works" story |
| Data strategy | Synthetic w/ realistic properties | MVP tractability; real data later |
| Approach | Guided pipeline walkthrough | Strongest pedagogical arc |
| Hosting | Netlify | Free, SPA-friendly |
| Stack | React/TS, no database | Per project constraints |
| Viz library | HTML/SVG + React charting lib (Visx/Recharts) | Dev speed over max customization |
| Navigation | Single page, vertically stacked | Simplest, lets users jump around |
| Style | Dealer's choice (likely dark) | Ship fast, looks good with neural data |

## Resolved Questions

1. **Visualization library** — HTML/SVG with a React charting lib (Recharts or Visx). Prioritize dev speed over max customization. Can drop to Canvas for the real-time spike animation if needed.
2. **Visual style** — Dealer's choice. Will pick something that looks good and ships fast (likely dark mode bc neuroscience data looks better on dark backgrounds, but not locked in).
3. **Step navigation** — Single page, all steps visible, vertically stacked. User scrolls freely. Simplest to build and lets users jump around.
