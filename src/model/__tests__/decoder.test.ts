import { describe, it, expect } from 'vitest'
import { createPopulation } from '../population'
import { generateTrial } from '../spikeGenerator'
import { populationVectorDecode, angularError } from '../decoder'

describe('populationVectorDecode', () => {
  const population = createPopulation(50)

  it('decodes direction near ground truth with no noise', () => {
    const direction = Math.PI / 4 // 45 degrees
    const trial = generateTrial(population, direction, 0, 1.0, 42)
    const result = populationVectorDecode(population, trial)

    // With 50 neurons and no noise, PV should be within ~15° of truth
    const error = angularError(result.angle, direction)
    expect(error).toBeLessThan(15)
  })

  it('returns contributions for all neurons', () => {
    const trial = generateTrial(population, 0, 0, 1.0, 42)
    const result = populationVectorDecode(population, trial)
    expect(result.contributions).toHaveLength(50)
  })

  it('has positive magnitude', () => {
    const trial = generateTrial(population, 0, 0, 1.0, 42)
    const result = populationVectorDecode(population, trial)
    expect(result.magnitude).toBeGreaterThan(0)
  })

  it('degrades with noise', () => {
    const direction = 0
    // Run multiple seeds and check average error increases with noise
    let cleanErrors = 0
    let noisyErrors = 0
    const trials = 20

    for (let seed = 0; seed < trials; seed++) {
      const cleanTrial = generateTrial(population, direction, 0, 1.0, seed)
      const noisyTrial = generateTrial(population, direction, 0.8, 1.0, seed)

      cleanErrors += angularError(populationVectorDecode(population, cleanTrial).angle, direction)
      noisyErrors += angularError(populationVectorDecode(population, noisyTrial).angle, direction)
    }

    expect(noisyErrors / trials).toBeGreaterThan(cleanErrors / trials)
  })
})

describe('angularError', () => {
  it('returns 0 for identical angles', () => {
    expect(angularError(0, 0)).toBeCloseTo(0)
  })

  it('returns 180 for opposite angles', () => {
    expect(angularError(0, Math.PI)).toBeCloseTo(180)
  })

  it('handles wraparound correctly', () => {
    // -10° and 350° should be 0° apart
    const a = -10 * (Math.PI / 180)
    const b = 350 * (Math.PI / 180)
    expect(angularError(a, b)).toBeCloseTo(0, 0)
  })

  it('returns degrees', () => {
    expect(angularError(0, Math.PI / 2)).toBeCloseTo(90)
  })
})
