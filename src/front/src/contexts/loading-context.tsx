'use client';

import { useReducer, createContext, ReactNode } from 'react';

interface LoadingState {
  httpRequestsCount: number;
}

type LoadingAction =
  | { type: 'INCREASE_HTTP_REQUEST_COUNT' }
  | { type: 'DECREASE_HTTP_REQUEST_COUNT' };

const initialState: LoadingState = { httpRequestsCount: 0 };

const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
  switch (action.type) {
    case 'INCREASE_HTTP_REQUEST_COUNT':
      return { ...state, httpRequestsCount: state.httpRequestsCount + 1 };
    case 'DECREASE_HTTP_REQUEST_COUNT':
      return { ...state, httpRequestsCount: state.httpRequestsCount - 1 };
    default:
      return state;
  }
};

interface LoadingContextProps {
  state: LoadingState;
  dispatch: React.Dispatch<LoadingAction>;
}

export const LoadingContext = createContext<LoadingContextProps>(null!);

export default function LoadingContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  return <LoadingContext.Provider value={{ state, dispatch }}>{children}</LoadingContext.Provider>;
}
