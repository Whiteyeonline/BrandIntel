import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { BrandDossier } from '../types/brand';

interface BrandState {
  currentDossier: BrandDossier | null;
  history: BrandDossier[];
  isLoading: boolean;
  progress: number;
  status: string;
  error: string | null;
}

type BrandAction =
  | { type: 'START_COLLECTION'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: { progress: number; status: string } }
  | { type: 'COLLECTION_COMPLETE'; payload: BrandDossier }
  | { type: 'COLLECTION_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOAD_DOSSIER'; payload: BrandDossier };

const initialState: BrandState = {
  currentDossier: null,
  history: [],
  isLoading: false,
  progress: 0,
  status: '',
  error: null,
};

function brandReducer(state: BrandState, action: BrandAction): BrandState {
  switch (action.type) {
    case 'START_COLLECTION':
      return {
        ...state,
        isLoading: true,
        progress: 0,
        status: 'Initializing...',
        error: null,
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.payload.progress,
        status: action.payload.status,
      };
    case 'COLLECTION_COMPLETE': {
      const dossier = action.payload;
      return {
        ...state,
        currentDossier: dossier,
        history: [dossier, ...state.history.filter(d => d.id !== dossier.id)].slice(0, 20),
        isLoading: false,
        progress: 100,
        status: 'Complete',
        error: null,
      };
    }
    case 'COLLECTION_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        status: 'Error',
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOAD_DOSSIER':
      return { ...state, currentDossier: action.payload };
    default:
      return state;
  }
}

interface BrandContextType {
  state: BrandState;
  dispatch: React.Dispatch<BrandAction>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(brandReducer, initialState);
  return (
    <BrandContext.Provider value={{ state, dispatch }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
