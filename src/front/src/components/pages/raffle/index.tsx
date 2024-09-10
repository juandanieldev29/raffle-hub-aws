'use client';

import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(rafflesPaginated.lastEvaluatedKey);
  const [raffles, setRaffles] = useState<Array<IRaffle>>(rafflesPaginated.raffles);
  const [paginationHistory, setPaginationHistory] = useState<
    Array<RafflesPaginationResult['lastEvaluatedKey']>
  >([]);

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

  const fetchRaffles = async (
    exclusiveStartKey: RafflesPaginationResult['lastEvaluatedKey'],
    previousPage = false,
  ) => {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams = prepareURLParams(urlSearchParams, 'limit', limit);
    urlSearchParams = prepareURLParams(
      urlSearchParams,
      'exclusiveStartKeyOwnerId',
      exclusiveStartKey?.ownerId,
    );
    urlSearchParams = prepareURLParams(
      urlSearchParams,
      'exclusiveStartKeyId',
      exclusiveStartKey?.id,
    );
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const res = await fetch(`https://api.raffle-hub.net/raffle?${urlSearchParams.toString()}`, {
        cache: 'no-store',
      });
      const { raffles, lastEvaluatedKey }: RafflesPaginationResult = await res.json();
      if (raffles.length) {
        setLastEvaluatedKey(lastEvaluatedKey);
        setRaffles(raffles);
      }
      if (!previousPage) {
        setPaginationHistory([...paginationHistory, lastEvaluatedKey]);
      }
    } catch (err) {
      toast.error('Ha ocurrido un error', {
        position: 'top-center',
        theme: 'colored',
      });
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const fetchFirstPageRaffles = async () => {
    let history = [...paginationHistory];
    const firstItemHistory = history.at(0);
    if (firstItemHistory) {
      setPaginationHistory([firstItemHistory]);
    }
    fetchRaffles(null, true);
  };

  const fetchNextPageRaffles = async () => {
    fetchRaffles(lastEvaluatedKey);
  };

  const getPreviousPaginationHistory = (): RafflesPaginationResult['lastEvaluatedKey'] | null => {
    let history = [...paginationHistory];
    if (history.length <= 1) {
      history = [];
      setPaginationHistory(history);
      return null;
    }
    const previousExclusiveStartKey = history.pop();
    setPaginationHistory(history);
    return previousExclusiveStartKey ?? null;
  };

  const fetchPreviousPageRaffles = async () => {
    const previousExclusiveStartKey = getPreviousPaginationHistory();
    fetchRaffles(previousExclusiveStartKey, true);
  };

  useEffect(() => {
    setPaginationHistory([rafflesPaginated.lastEvaluatedKey]);
  }, [rafflesPaginated.lastEvaluatedKey]);

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
      <div className="flex justify-center">
        <button
          className="button-padding primary-button-colors disabled:cursor-not-allowed disabled:opacity-20 ring-1 ring-inset ring-gray-300"
          disabled={Boolean(paginationHistory.length <= 1)}
          onClick={fetchFirstPageRaffles}
          title="First page"
        >
          <i className="fa-solid fa-angles-left"></i>
        </button>
        <button
          className="button-padding primary-button-colors disabled:cursor-not-allowed disabled:opacity-20 ring-1 ring-inset ring-gray-300"
          disabled={Boolean(paginationHistory.length <= 1)}
          onClick={fetchPreviousPageRaffles}
          title="Previous page"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          className="button-padding primary-button-colors disabled:cursor-not-allowed disabled:opacity-20 ring-1 ring-inset ring-gray-300"
          disabled={lastEvaluatedKey === null}
          onClick={fetchNextPageRaffles}
          title="Next page"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </>
  );
}
