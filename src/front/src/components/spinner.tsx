'use client';

import { useContext } from 'react';
import { LoadingContext } from '@/contexts/loading-context';

export default function Spinner() {
  const { state } = useContext(LoadingContext);

  if (state.httpRequestsCount <= 0) return null;

  return (
    <div className="flex justify-center items-center fixed top-0 left-0 w-full h-full z-50 bg-black/50">
      <div
        className="w-12 h-12 border-4 rounded-full border-black/50 border-t-blue-600 animate-spin"
        role="status"
      />
    </div>
  );
}
