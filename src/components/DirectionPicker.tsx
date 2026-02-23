import { useSimulation } from '../context/SimulationContext'
import PopulationRing from './PopulationRing'
import RasterPlot from './RasterPlot'
import StepSection from './StepSection'

export default function DirectionPicker() {
  const { state, trial } = useSimulation()

  return (
    <StepSection
      step={2}
      title="Fire the Neurons"
      instruction="Click anywhere on the ring to choose a movement direction. Watch how neurons near that direction fire rapidly, while distant ones barely respond."
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <PopulationRing interactive showDirectionArrow />
        {state.direction !== null && trial ? (
          <RasterPlot />
        ) : (
          <div style={{
            width: 400,
            height: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: '#555',
            fontSize: '0.9rem',
          }}>
            Click the ring to generate spikes →
          </div>
        )}
      </div>
    </StepSection>
  )
}
