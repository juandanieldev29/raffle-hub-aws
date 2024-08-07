'use client';

import { useContext } from 'react';
import { LoadingContext } from '@/contexts/loading-context';

const Spinner = () => {
  const { state } = useContext(LoadingContext);
  if (state.httpRequestsCount <= 0) return null;

  return (
    <div className="spinner">
      <div className="spinner-border" role="status" />
    </div>
  );
};

export default Spinner;
