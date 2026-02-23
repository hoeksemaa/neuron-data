import PopulationRing from './PopulationRing'
import StepSection from './StepSection'

export default function PopulationStep() {
  return (
    <StepSection
      step={1}
      title="Meet the Population"
      instruction="Each dot is a neuron in motor cortex. Its position on the ring shows which movement direction makes it fire the most — its preferred direction. Hover to see details."
    >
      <PopulationRing />
    </StepSection>
  )
}
