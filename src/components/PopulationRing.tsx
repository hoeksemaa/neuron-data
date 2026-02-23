import { useSimulation } from '../context/SimulationContext'
import { directionToColor } from '../utils/colors'

const SIZE = 350
const CENTER = SIZE / 2
const RING_RADIUS = 130
const DOT_RADIUS = 6

interface Props {
  interactive?: boolean
  onDirectionClick?: (angle: number) => void
  showDirectionArrow?: boolean
}

export default function PopulationRing({
  interactive = false,
  onDirectionClick,
  showDirectionArrow = false,
}: Props) {
  const { state, dispatch } = useSimulation()
  const { population, direction, highlightedNeuron } = state

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!interactive) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left - CENTER
    const y = e.clientY - rect.top - CENTER
    const angle = Math.atan2(y, x)
    const normalized = angle < 0 ? angle + 2 * Math.PI : angle
    if (onDirectionClick) {
      onDirectionClick(normalized)
    } else {
      dispatch({ type: 'SET_DIRECTION', direction: normalized })
    }
  }

  return (
    <svg
      width={SIZE}
      height={SIZE}
      style={{ cursor: interactive ? 'crosshair' : 'default' }}
      onClick={handleClick}
    >
      {/* Ring outline */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />

      {/* Direction arrow */}
      {showDirectionArrow && direction !== null && (
        <line
          x1={CENTER}
          y1={CENTER}
          x2={CENTER + RING_RADIUS * 0.9 * Math.cos(direction)}
          y2={CENTER + RING_RADIUS * 0.9 * Math.sin(direction)}
          stroke="#48cfcb"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.8}
          markerEnd="url(#arrowhead)"
        />
      )}

      {/* Neuron dots */}
      {population.neurons.map((neuron) => {
        const x = CENTER + RING_RADIUS * Math.cos(neuron.preferredDirection)
        const y = CENTER + RING_RADIUS * Math.sin(neuron.preferredDirection)
        const isHighlighted = highlightedNeuron === neuron.id
        const color = directionToColor(neuron.preferredDirection)

        return (
          <g key={neuron.id}>
            <circle
              cx={x}
              cy={y}
              r={isHighlighted ? DOT_RADIUS + 2 : DOT_RADIUS}
              fill={color}
              opacity={isHighlighted ? 1 : 0.7}
              stroke={isHighlighted ? '#fff' : 'none'}
              strokeWidth={isHighlighted ? 2 : 0}
              style={{ transition: 'all 0.15s ease' }}
              onMouseEnter={() => dispatch({ type: 'HIGHLIGHT_NEURON', neuronId: neuron.id })}
              onMouseLeave={() => dispatch({ type: 'HIGHLIGHT_NEURON', neuronId: null })}
            />
            {/* Tooltip on hover */}
            {isHighlighted && (
              <text
                x={x}
                y={y - DOT_RADIUS - 8}
                textAnchor="middle"
                fill="#e0e0e0"
                fontSize={11}
                fontFamily="monospace"
              >
                PD: {Math.round(neuron.preferredDirection * 180 / Math.PI)}°
                | Max: {Math.round(neuron.maxRate)}Hz
              </text>
            )}
          </g>
        )
      })}

      {/* Arrow marker def */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#48cfcb" />
        </marker>
      </defs>

      {/* Direction labels */}
      {[
        { label: '0°', x: CENTER + RING_RADIUS + 18, y: CENTER + 4 },
        { label: '90°', x: CENTER - 4, y: CENTER + RING_RADIUS + 20 },
        { label: '180°', x: CENTER - RING_RADIUS - 30, y: CENTER + 4 },
        { label: '270°', x: CENTER - 8, y: CENTER - RING_RADIUS - 10 },
      ].map(({ label, x, y }) => (
        <text
          key={label}
          x={x}
          y={y}
          fill="rgba(255,255,255,0.3)"
          fontSize={10}
          fontFamily="monospace"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}
