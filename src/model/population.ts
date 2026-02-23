import type { Neuron, Population } from './types'
import { mulberry32 } from '../utils/prng'

const DEFAULT_SIZE = 50
const POPULATION_SEED = 42

export function createPopulation(size: number = DEFAULT_SIZE): Population {
  const rng = mulberry32(POPULATION_SEED)
  const neurons: Neuron[] = []

  for (let i = 0; i < size; i++) {
    neurons.push({
      id: i,
      preferredDirection: (2 * Math.PI * i) / size,
      baselineRate: 5 + rng() * 5,   // 5-10 Hz
      maxRate: 40 + rng() * 40,       // 40-80 Hz
    })
  }

  return { neurons, size }
}
