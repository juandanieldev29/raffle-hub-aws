'use client';

import { useContext, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';

export default function Spinner() {
  const { state, dispatch } = useContext(LoadingContext);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
    const handleStop = () => dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    handleStop();

    return () => {
      handleStart();
    };
  }, [pathname, searchParams]);

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
