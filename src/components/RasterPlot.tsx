import { useRef, useEffect } from 'react'
import { useSimulation } from '../context/SimulationContext'
import { directionToColor } from '../utils/colors'

const WIDTH = 400
const HEIGHT = 350
const MARGIN = { top: 30, right: 20, bottom: 30, left: 50 }
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom

export default function RasterPlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state, trial } = useSimulation()
  const { population } = state

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !trial) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // HiDPI
    const dpr = window.devicePixelRatio || 1
    canvas.width = WIDTH * dpr
    canvas.height = HEIGHT * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.fillStyle = '#12121e'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const neuronCount = population.size
    const rowH = PLOT_H / neuronCount

    // Sort neurons by preferred direction for visual coherence
    const sorted = [...population.neurons].sort(
      (a, b) => a.preferredDirection - b.preferredDirection,
    )

    // Draw spikes
    for (let i = 0; i < sorted.length; i++) {
      const neuron = sorted[i]!
      const spikes = trial.spikeTimes.get(neuron.id) ?? []
      const y = MARGIN.top + i * rowH
      const color = directionToColor(neuron.preferredDirection, 70, 65)

      ctx.strokeStyle = color
      ctx.lineWidth = 1.2

      for (const t of spikes) {
        const x = MARGIN.left + (t / trial.duration) * PLOT_W
        ctx.beginPath()
        ctx.moveTo(x, y + 1)
        ctx.lineTo(x, y + rowH - 1)
        ctx.stroke()
      }
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1

    // X axis
    ctx.beginPath()
    ctx.moveTo(MARGIN.left, HEIGHT - MARGIN.bottom)
    ctx.lineTo(WIDTH - MARGIN.right, HEIGHT - MARGIN.bottom)
    ctx.stroke()

    // Y axis
    ctx.beginPath()
    ctx.moveTo(MARGIN.left, MARGIN.top)
    ctx.lineTo(MARGIN.left, HEIGHT - MARGIN.bottom)
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('0s', MARGIN.left, HEIGHT - MARGIN.bottom + 15)
    ctx.fillText(`${trial.duration}s`, WIDTH - MARGIN.right, HEIGHT - MARGIN.bottom + 15)
    ctx.fillText('Time', MARGIN.left + PLOT_W / 2, HEIGHT - 5)

    ctx.save()
    ctx.translate(12, MARGIN.top + PLOT_H / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Neurons (sorted by PD)', 0, 0)
    ctx.restore()

    // Title
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Spike Raster', WIDTH / 2, 16)
  }, [trial, population])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    />
  )
}
