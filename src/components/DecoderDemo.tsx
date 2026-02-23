import { useSimulation } from '../context/SimulationContext'
import { angularError } from '../model/decoder'
import StepSection from './StepSection'

const SIZE = 350
const CENTER = SIZE / 2
const ARROW_LEN = 120

export default function DecoderDemo() {
  const { state, dispatch, decoded } = useSimulation()
  const { direction, noiseLevel } = state

  if (direction === null || !decoded) {
    return (
      <StepSection
        step={5}
        title="Decode & Move"
        instruction="The decoded direction moves a cursor toward your intended target. Use the noise slider to simulate real-world signal degradation — watch how the decoder's accuracy falls."
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

  const error = angularError(decoded.angle, direction)

  // Cursor position based on decoded angle
  const cursorX = CENTER + ARROW_LEN * Math.cos(decoded.angle)
  const cursorY = CENTER + ARROW_LEN * Math.sin(decoded.angle)

  return (
    <StepSection
      step={5}
      title="Decode & Move"
      instruction="The decoded direction moves a cursor toward your intended target. Use the noise slider to simulate real-world signal degradation — watch how the decoder's accuracy falls."
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <svg width={SIZE} height={SIZE}>
          {/* Background */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={CENTER - 15}
            fill="rgba(0,0,0,0.2)"
            stroke="rgba(255,255,255,0.06)"
          />

          {/* Crosshair */}
          <line x1={CENTER - 8} y1={CENTER} x2={CENTER + 8} y2={CENTER}
            stroke="rgba(255,255,255,0.15)" />
          <line x1={CENTER} y1={CENTER - 8} x2={CENTER} y2={CENTER + 8}
            stroke="rgba(255,255,255,0.15)" />

          {/* Ground truth arrow (thin, gray) */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER + ARROW_LEN * Math.cos(direction)}
            y2={CENTER + ARROW_LEN * Math.sin(direction)}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.5}
            strokeDasharray="6,4"
          />
          <text
            x={CENTER + (ARROW_LEN + 12) * Math.cos(direction)}
            y={CENTER + (ARROW_LEN + 12) * Math.sin(direction)}
            fill="rgba(255,255,255,0.3)"
            fontSize={9}
            fontFamily="monospace"
            textAnchor="middle"
          >
            true
          </text>

          {/* Decoded arrow (bold, cyan) */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={cursorX}
            y2={cursorY}
            stroke="#48cfcb"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Cursor dot */}
          <circle
            cx={cursorX}
            cy={cursorY}
            r={8}
            fill="#48cfcb"
            opacity={0.9}
          />
          <circle
            cx={cursorX}
            cy={cursorY}
            r={3}
            fill="#1a1a2e"
          />

          {/* Error arc */}
          {error > 1 && (
            <text
              x={CENTER}
              y={SIZE - 10}
              textAnchor="middle"
              fill={error < 10 ? '#4ade80' : error < 30 ? '#fbbf24' : '#f87171'}
              fontSize={12}
              fontFamily="monospace"
            >
              Error: {error.toFixed(1)}°
            </text>
          )}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 200 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              color: '#a0a0b0',
              marginBottom: '0.5rem',
              fontFamily: 'monospace',
            }}>
              Noise Level: {(noiseLevel * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={noiseLevel}
              onChange={(e) => dispatch({
                type: 'SET_NOISE',
                noiseLevel: parseFloat(e.target.value),
              })}
              style={{ width: '100%', accentColor: '#6c63ff' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#666',
              marginTop: '0.25rem',
            }}>
              <span>Clean</span>
              <span>Noisy</span>
            </div>
          </div>

          <div style={{
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#a0a0b0',
          }}>
            <div>True direction: {Math.round(direction * 180 / Math.PI)}°</div>
            <div>Decoded direction: {Math.round(decoded.angle * 180 / Math.PI)}°</div>
            <div style={{
              color: error < 10 ? '#4ade80' : error < 30 ? '#fbbf24' : '#f87171',
              fontWeight: 600,
            }}>
              Angular error: {error.toFixed(1)}°
            </div>
          </div>
        </div>
      </div>
    </StepSection>
  )
}
