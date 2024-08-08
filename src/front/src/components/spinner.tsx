'use client';

import { useContext } from 'react';
import { LoadingContext } from '@/contexts/loading-context';

export default function Spinner() {
  const { state } = useContext(LoadingContext);
  if (state.httpRequestsCount <= 0) return null;

  return (
    <div className="spinner">
      <div className="spinner-border" role="status" />
    </div>
  );
}
