import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react'
import type { Population, Trial, DecodedResult } from '../model/types'
import { createPopulation } from '../model/population'
import { generateTrial } from '../model/spikeGenerator'
import { populationVectorDecode } from '../model/decoder'

interface SimulationState {
  population: Population
  direction: number | null // null = no direction selected yet
  noiseLevel: number
  highlightedNeuron: number | null
  seed: number
}

type Action =
  | { type: 'SET_DIRECTION'; direction: number }
  | { type: 'SET_NOISE'; noiseLevel: number }
  | { type: 'HIGHLIGHT_NEURON'; neuronId: number | null }

const initialState: SimulationState = {
  population: createPopulation(),
  direction: null,
  noiseLevel: 0,
  highlightedNeuron: null,
  seed: 123,
}

function reducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case 'SET_DIRECTION':
      return { ...state, direction: action.direction }
    case 'SET_NOISE':
      return { ...state, noiseLevel: action.noiseLevel }
    case 'HIGHLIGHT_NEURON':
      return { ...state, highlightedNeuron: action.neuronId }
  }
}

interface SimulationContextValue {
  state: SimulationState
  dispatch: React.Dispatch<Action>
  trial: Trial | null
  decoded: DecodedResult | null
}

const SimulationContext = createContext<SimulationContextValue | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const trial = useMemo(() => {
    if (state.direction === null) return null
    return generateTrial(
      state.population,
      state.direction,
      state.noiseLevel,
      1.0,
      state.seed,
    )
  }, [state.population, state.direction, state.noiseLevel, state.seed])

  const decoded = useMemo(() => {
    if (!trial) return null
    return populationVectorDecode(state.population, trial)
  }, [state.population, trial])

  const value = useMemo(
    () => ({ state, dispatch, trial, decoded }),
    [state, dispatch, trial, decoded],
  )

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
