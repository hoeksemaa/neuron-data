import { useSimulation } from '../context/SimulationContext'
import { firingRate } from '../model/spikeGenerator'
import { directionToColor } from '../utils/colors'
import StepSection from './StepSection'

const WIDTH = 600
const HEIGHT = 320
const MARGIN = { top: 20, right: 20, bottom: 45, left: 55 }
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom

const DIRECTION_STEPS = 100 // points along the x-axis

export default function TuningCurves() {
  const { state } = useSimulation()
  const { population, highlightedNeuron, direction } = state

  // Compute max rate across all neurons for y-scale
  const maxY = Math.max(...population.neurons.map((n) => n.maxRate)) * 1.1

  // Generate curve paths
  const curves = population.neurons.map((neuron) => {
    const points: string[] = []
    for (let i = 0; i <= DIRECTION_STEPS; i++) {
      const theta = (i / DIRECTION_STEPS) * 2 * Math.PI
      const rate = firingRate(neuron, theta)
      const x = MARGIN.left + (i / DIRECTION_STEPS) * PLOT_W
      const y = MARGIN.top + PLOT_H - (rate / maxY) * PLOT_H
      points.push(`${i === 0 ? 'M' : 'L'}${x},${y}`)
    }
    return { neuronId: neuron.id, pd: neuron.preferredDirection, d: points.join(' ') }
  })

  // Y-axis ticks
  const yTicks = [0, Math.round(maxY / 3), Math.round((maxY * 2) / 3), Math.round(maxY)]

  return (
    <StepSection
      step={3}
      title="Tuning Curves"
      instruction="Each curve shows how a neuron's firing rate changes with direction. Click a neuron to highlight its curve. The vertical line marks your chosen direction."
    >
      <svg width={WIDTH} height={HEIGHT} style={{ display: 'block' }}>
        {/* Background */}
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={PLOT_W}
          height={PLOT_H}
          fill="rgba(0,0,0,0.2)"
          rx={4}
        />

        {/* Direction vertical line */}
        {direction !== null && (
          <line
            x1={MARGIN.left + (direction / (2 * Math.PI)) * PLOT_W}
            y1={MARGIN.top}
            x2={MARGIN.left + (direction / (2 * Math.PI)) * PLOT_W}
            y2={MARGIN.top + PLOT_H}
            stroke="#48cfcb"
            strokeWidth={1.5}
            strokeDasharray="4,3"
            opacity={0.7}
          />
        )}

        {/* All curves (low opacity) */}
        {curves.map(({ neuronId, pd, d }) => (
          <path
            key={neuronId}
            d={d}
            fill="none"
            stroke={directionToColor(pd)}
            strokeWidth={neuronId === highlightedNeuron ? 2.5 : 1}
            opacity={
              highlightedNeuron === null
                ? 0.15
                : neuronId === highlightedNeuron
                  ? 1
                  : 0.06
            }
            style={{ transition: 'opacity 0.2s ease' }}
          />
        ))}

        {/* Y-axis ticks and labels */}
        {yTicks.map((val) => {
          const y = MARGIN.top + PLOT_H - (val / maxY) * PLOT_H
          return (
            <g key={val}>
              <line
                x1={MARGIN.left - 4}
                y1={y}
                x2={MARGIN.left}
                y2={y}
                stroke="rgba(255,255,255,0.3)"
              />
              <text
                x={MARGIN.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.4)"
                fontSize={10}
                fontFamily="monospace"
              >
                {val}
              </text>
            </g>
          )
        })}

        {/* X-axis ticks */}
        {[0, 90, 180, 270, 360].map((deg) => {
          const x = MARGIN.left + (deg / 360) * PLOT_W
          return (
            <g key={deg}>
              <line
                x1={x}
                y1={MARGIN.top + PLOT_H}
                x2={x}
                y2={MARGIN.top + PLOT_H + 4}
                stroke="rgba(255,255,255,0.3)"
              />
              <text
                x={x}
                y={MARGIN.top + PLOT_H + 16}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize={10}
                fontFamily="monospace"
              >
                {deg}°
              </text>
            </g>
          )
        })}

        {/* Axis labels */}
        <text
          x={MARGIN.left + PLOT_W / 2}
          y={HEIGHT - 5}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={11}
        >
          Direction (°)
        </text>
        <text
          x={14}
          y={MARGIN.top + PLOT_H / 2}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={11}
          transform={`rotate(-90, 14, ${MARGIN.top + PLOT_H / 2})`}
        >
          Firing Rate (Hz)
        </text>
      </svg>
    </StepSection>
  )
}
