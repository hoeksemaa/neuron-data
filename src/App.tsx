import { SimulationProvider } from './context/SimulationContext'
import Header from './components/Header'
import PopulationStep from './components/PopulationStep'
import DirectionPicker from './components/DirectionPicker'
import TuningCurves from './components/TuningCurves'
import PopulationVector from './components/PopulationVector'
import DecoderDemo from './components/DecoderDemo'

export default function App() {
  return (
    <SimulationProvider>
      <Header />
      <main>
        <PopulationStep />
        <DirectionPicker />
        <TuningCurves />
        <PopulationVector />
        <DecoderDemo />
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#555',
        fontSize: '0.8rem',
      }}>
        Based on the Population Vector Algorithm (Georgopoulos et al., 1986)
      </footer>
    </SimulationProvider>
  )
}
