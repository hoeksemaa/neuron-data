import type { Neuron, Population, Trial } from './types'
import { gaussianRandom, mulberry32 } from '../utils/prng'

/**
 * Cosine tuning: firing rate as a function of movement direction.
 * rate(θ) = baseline + (maxRate - baseline) * max(0, cos(θ - PD))
 */
export function firingRate(neuron: Neuron, direction: number): number {
  const cosine = Math.cos(direction - neuron.preferredDirection)
  return neuron.baselineRate + (neuron.maxRate - neuron.baselineRate) * Math.max(0, cosine)
}

/**
 * Generate Poisson spike times for a single neuron at a given rate.
 * Returns sorted array of spike times in [0, duration].
 */
function poissonSpikes(rate: number, duration: number, rng: () => number): number[] {
  if (rate <= 0) return []
  const spikes: number[] = []
  let t = 0
  while (t < duration) {
    // Exponential inter-spike interval
    const isi = -Math.log(rng() || 1e-10) / rate
    t += isi
    if (t < duration) {
      spikes.push(t)
    }
  }
  return spikes
}

/**
 * Generate a full trial: spike times for every neuron in the population.
 */
export function generateTrial(
  population: Population,
  direction: number,
  noiseLevel: number = 0,
  duration: number = 1.0,
  seed: number = 123,
): Trial {
  const rng = mulberry32(seed)
  const spikeTimes = new Map<number, number[]>()

  for (const neuron of population.neurons) {
    let rate = firingRate(neuron, direction)

    // Add Gaussian noise to rate
    if (noiseLevel > 0) {
      rate = Math.max(0, rate * (1 + noiseLevel * gaussianRandom(rng)))
    }

    spikeTimes.set(neuron.id, poissonSpikes(rate, duration, rng))
  }

  return { direction, duration, spikeTimes, noiseLevel }
}
