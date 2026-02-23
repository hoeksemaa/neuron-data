import { describe, it, expect } from 'vitest'
import { createPopulation } from '../population'
import { firingRate, generateTrial } from '../spikeGenerator'

describe('firingRate', () => {
  const neuron = {
    id: 0,
    preferredDirection: 0,
    baselineRate: 5,
    maxRate: 60,
  }

  it('returns maxRate when direction matches PD', () => {
    expect(firingRate(neuron, 0)).toBeCloseTo(60)
  })

  it('returns baselineRate when direction is opposite PD', () => {
    expect(firingRate(neuron, Math.PI)).toBeCloseTo(5)
  })

  it('returns intermediate rate at 45 degrees', () => {
    const rate = firingRate(neuron, Math.PI / 4)
    expect(rate).toBeGreaterThan(5)
    expect(rate).toBeLessThan(60)
  })

  it('returns baseline at 90 degrees (cos=0)', () => {
    expect(firingRate(neuron, Math.PI / 2)).toBeCloseTo(5)
  })
})

describe('generateTrial', () => {
  const population = createPopulation(10)

  it('generates spike times for all neurons', () => {
    const trial = generateTrial(population, 0)
    expect(trial.spikeTimes.size).toBe(10)
  })

  it('produces deterministic results with same seed', () => {
    const trial1 = generateTrial(population, 0, 0, 1.0, 42)
    const trial2 = generateTrial(population, 0, 0, 1.0, 42)
    for (const neuron of population.neurons) {
      const s1 = trial1.spikeTimes.get(neuron.id)!
      const s2 = trial2.spikeTimes.get(neuron.id)!
      expect(s1).toEqual(s2)
    }
  })

  it('neurons near direction fire more than distant ones', () => {
    const trial = generateTrial(population, 0, 0, 1.0, 99)
    // Neuron 0 has PD=0, neuron 5 has PD=π — neuron 0 should fire more
    const nearSpikes = trial.spikeTimes.get(0)!.length
    const farSpikes = trial.spikeTimes.get(5)!.length
    expect(nearSpikes).toBeGreaterThan(farSpikes)
  })

  it('spike times are within trial duration', () => {
    const trial = generateTrial(population, 0, 0, 0.5)
    for (const [, spikes] of trial.spikeTimes) {
      for (const t of spikes) {
        expect(t).toBeGreaterThanOrEqual(0)
        expect(t).toBeLessThan(0.5)
      }
    }
  })
})
