export interface Neuron {
  id: number
  preferredDirection: number // radians, evenly spaced on [0, 2π)
  baselineRate: number       // Hz, ~5-10
  maxRate: number            // Hz, ~40-80
}

export interface Population {
  neurons: Neuron[]
  size: number
}

export interface Trial {
  direction: number                    // user-selected, radians
  duration: number                     // seconds
  spikeTimes: Map<number, number[]>    // neuronId → sorted spike times (seconds)
  noiseLevel: number                   // 0-1 scale
}

export interface DecodedResult {
  angle: number
  magnitude: number
  contributions: NeuronContribution[]
}

export interface NeuronContribution {
  neuronId: number
  vector: [number, number] // [x, y] contribution
  rate: number
}
