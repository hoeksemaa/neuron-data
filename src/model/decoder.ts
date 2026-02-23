import type { DecodedResult, NeuronContribution, Population, Trial } from './types'

/**
 * Population Vector Algorithm (Georgopoulos et al., 1986).
 *
 * PV = Σ rate_i * [cos(PD_i), sin(PD_i)]
 * decoded_angle = atan2(PV_y, PV_x)
 */
export function populationVectorDecode(
  population: Population,
  trial: Trial,
): DecodedResult {
  let pvX = 0
  let pvY = 0
  const contributions: NeuronContribution[] = []

  for (const neuron of population.neurons) {
    const spikes = trial.spikeTimes.get(neuron.id) ?? []
    const rate = spikes.length / trial.duration // empirical rate from spike count

    const cx = rate * Math.cos(neuron.preferredDirection)
    const cy = rate * Math.sin(neuron.preferredDirection)
    pvX += cx
    pvY += cy

    contributions.push({
      neuronId: neuron.id,
      vector: [cx, cy],
      rate,
    })
  }

  const angle = Math.atan2(pvY, pvX)
  const magnitude = Math.sqrt(pvX * pvX + pvY * pvY)

  return { angle, magnitude, contributions }
}

/**
 * Angular error in degrees between decoded and true direction.
 * Always returns the shortest arc (0–180°).
 */
export function angularError(decoded: number, truth: number): number {
  let diff = decoded - truth
  // Normalize to [-π, π]
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return Math.abs(diff) * (180 / Math.PI)
}
