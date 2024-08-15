'use client';

import { useContext, useState, useEffect } from 'react';
import RaffleCard from '@/components/raffle/raffle-card';
import { IRaffle } from '@/types/raffle';
import { RafflesPaginationResult } from '@/types/pagination';

import { INITIAL_LIMIT } from '@/utils/constants';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';

interface RaffleListProps {
  rafflesPaginated: RafflesPaginationResult;
}

export default function RaffleIndex({ rafflesPaginated }: RaffleListProps) {
  const { dispatch } = useContext(LoadingContext);
  const [limit] = useState(INITIAL_LIMIT);
  const [previousExclusiveStartKey, setPreviousExclusiveStartKey] =
    useState<RafflesPaginationResult['lastEvaluatedKey']>(null);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(rafflesPaginated.lastEvaluatedKey);
  const [raffles, setRaffles] = useState<Array<IRaffle>>(rafflesPaginated.raffles);
  const [displayPaginationControls, setDisplayPaginationControls] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const prepareURLParams = (
    urlSearchParams: URLSearchParams,
    key: string,
    value: string | number | null | undefined,
  ) => {
    const newURLSearchParams = urlSearchParams;
    if (value === undefined || value === null || value === '') return newURLSearchParams;
    newURLSearchParams.set(key, value.toString());
    return newURLSearchParams;
  };

  const fetchRaffles = async (exclusiveStartKey: RafflesPaginationResult['lastEvaluatedKey']) => {
    const goBackToInitialPage = shouldGoBackToInitialPage();
    let urlSearchParams = new URLSearchParams();
    urlSearchParams = prepareURLParams(urlSearchParams, 'limit', limit);
    urlSearchParams = prepareURLParams(
      urlSearchParams,
      'exclusiveStartKey',
      goBackToInitialPage ? null : exclusiveStartKey?.id,
    );

    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const res = await fetch(`https://api.raffle-hub.net/raffle?${urlSearchParams.toString()}`, {
        cache: 'no-store',
      });
      const { raffles, lastEvaluatedKey }: RafflesPaginationResult = await res.json();
      if (raffles.length) {
        setPreviousExclusiveStartKey(exclusiveStartKey);
        setExclusiveStartKey(lastEvaluatedKey);
        setRaffles(raffles);
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const shouldGoBackToInitialPage = () => {
    return currentPage <= 2;
  };

  const fetchNextPageRaffles = async () => {
    fetchRaffles(exclusiveStartKey);
    setCurrentPage(currentPage + 1);
  };

  const fetchPreviousPageRaffles = async () => {
    fetchRaffles(previousExclusiveStartKey);
    setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setDisplayPaginationControls(Boolean(exclusiveStartKey) || Boolean(previousExclusiveStartKey));
  }, [exclusiveStartKey, previousExclusiveStartKey]);

  return (
    <>
      {raffles.map((raffle) => {
        return (
          <RaffleCard
            key={raffle.id}
            raffle={raffle}
            includeLinkToDetails
            disableAnimations={false}
          />
        );
      })}
      {displayPaginationControls && (
        <>
          <button
            className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 enabled:hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed"
            // disabled={previousExclusiveStartKey === null}
            onClick={fetchPreviousPageRaffles}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed"
            disabled={exclusiveStartKey === null}
            onClick={fetchNextPageRaffles}
          >
            <span className="sr-only">Next</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fillRule="evenodd"
                d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </>
      )}
    </>
  );
}
