import { useState, useEffect, useCallback } from 'react'
import { useSimulation } from '../context/SimulationContext'
import { directionToColor } from '../utils/colors'
import StepSection from './StepSection'

const SIZE = 400
const CENTER = SIZE / 2
const SCALE_FACTOR = 0.15 // scale vectors to fit in the viz

export default function PopulationVector() {
  const { state, decoded } = useSimulation()
  const { population, direction } = state
  const [animStep, setAnimStep] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const contributions = decoded?.contributions ?? []
  const totalSteps = contributions.length

  const startAnimation = useCallback(() => {
    setAnimStep(0)
    setIsAnimating(true)
  }, [])

  useEffect(() => {
    if (animStep === null || !isAnimating) return
    if (animStep >= totalSteps) {
      setIsAnimating(false)
      return
    }
    const timer = setTimeout(() => setAnimStep((s) => (s ?? 0) + 1), 40)
    return () => clearTimeout(timer)
  }, [animStep, isAnimating, totalSteps])

  // Reset animation when direction changes
  useEffect(() => {
    setAnimStep(null)
    setIsAnimating(false)
  }, [direction])

  if (!decoded || direction === null) {
    return (
      <StepSection
        step={4}
        title="Population Vector"
        instruction="Each neuron 'votes' for its preferred direction, weighted by how fast it fired. The thick arrow is the sum of all votes — the brain's best guess at intended direction."
      >
        <div style={{
          width: SIZE,
          height: SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: '#555',
          fontSize: '0.9rem',
        }}>
          Select a direction in Step 2 first
        </div>
      </StepSection>
    )
  }

  // Determine which contributions to show
  const visibleContribs = animStep !== null
    ? contributions.slice(0, animStep)
    : contributions

  // Compute cumulative PV for visible contributions
  let cumX = 0
  let cumY = 0
  for (const c of visibleContribs) {
    cumX += c.vector[0]
    cumY += c.vector[1]
  }

  const pvMag = Math.sqrt(cumX * cumX + cumY * cumY)
  const isLowConfidence = pvMag * SCALE_FACTOR < 5

  return (
    <StepSection
      step={4}
      title="Population Vector"
      instruction="Each neuron 'votes' for its preferred direction, weighted by how fast it fired. The thick arrow is the sum of all votes — the brain's best guess at intended direction."
    >
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg width={SIZE} height={SIZE}>
          {/* Background circle */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER - 20}
            fill="rgba(0,0,0,0.2)"
            stroke="rgba(255,255,255,0.06)"
          />

          {/* Ground truth direction */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER + (CENTER - 40) * Math.cos(direction)}
            y2={CENTER + (CENTER - 40) * Math.sin(direction)}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
            strokeDasharray="6,4"
          />
          <text
            x={CENTER + (CENTER - 30) * Math.cos(direction)}
            y={CENTER + (CENTER - 30) * Math.sin(direction)}
            fill="rgba(255,255,255,0.25)"
            fontSize={9}
            fontFamily="monospace"
          >
            true
          </text>

          {/* Individual neuron contribution arrows */}
          {visibleContribs.map((c) => {
            const neuron = population.neurons.find((n) => n.id === c.neuronId)
            if (!neuron) return null
            const dx = c.vector[0] * SCALE_FACTOR
            const dy = c.vector[1] * SCALE_FACTOR
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return null

            return (
              <line
                key={c.neuronId}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + dx}
                y2={CENTER + dy}
                stroke={directionToColor(neuron.preferredDirection)}
                strokeWidth={1.5}
                opacity={0.35}
              />
            )
          })}

          {/* Resultant PV arrow */}
          {!isLowConfidence ? (
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER + cumX * SCALE_FACTOR}
              y2={CENTER + cumY * SCALE_FACTOR}
              stroke="#48cfcb"
              strokeWidth={3}
              strokeLinecap="round"
              markerEnd="url(#pv-arrow)"
            />
          ) : (
            <>
              <circle
                cx={CENTER}
                cy={CENTER}
                r={8}
                fill="none"
                stroke="#48cfcb"
                strokeWidth={1.5}
                strokeDasharray="3,3"
                opacity={0.5}
              />
              <text
                x={CENTER}
                y={CENTER + 22}
                textAnchor="middle"
                fill="#48cfcb"
                fontSize={9}
                opacity={0.6}
              >
                low confidence
              </text>
            </>
          )}

          <defs>
            <marker
              id="pv-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#48cfcb" />
            </marker>
          </defs>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            style={{
              padding: '0.5rem 1rem',
              background: isAnimating ? '#333' : '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: isAnimating ? 'default' : 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {isAnimating ? 'Animating...' : 'Replay Summation'}
          </button>
          <div style={{ fontSize: '0.8rem', color: '#a0a0b0', fontFamily: 'monospace' }}>
            <div>Decoded: {Math.round(decoded.angle * 180 / Math.PI)}°</div>
            <div>Truth: {Math.round(direction * 180 / Math.PI)}°</div>
            <div>Magnitude: {Math.round(decoded.magnitude)}</div>
          </div>
        </div>
      </div>
    </StepSection>
  )
}
