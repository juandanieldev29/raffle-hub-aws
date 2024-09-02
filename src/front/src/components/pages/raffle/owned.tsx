'use client';

import { useContext, useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { toast } from 'react-toastify';

import RaffleAdminCard from '@/components/raffle/raffle-admin-card';
import { IRaffle } from '@/types/raffle';
import { RafflesPaginationResult } from '@/types/pagination';
import { INITIAL_LIMIT } from '@/utils/constants';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';
import { AuthSession } from 'aws-amplify/auth';

interface RaffleOwnedProps {
  rafflesPaginated: RafflesPaginationResult;
}

export default function RaffleOwned({ rafflesPaginated }: RaffleOwnedProps) {
  const { dispatch } = useContext(LoadingContext);
  const [limit] = useState(INITIAL_LIMIT);
  const [exclusiveStartKey, setExclusiveStartKey] = useState(rafflesPaginated.lastEvaluatedKey);
  const [raffles, setRaffles] = useState<Array<IRaffle>>(rafflesPaginated.raffles);
  const [paginationHistory, setPaginationHistory] = useState<
    Array<RafflesPaginationResult['lastEvaluatedKey']>
  >([]);
  const [session, setSession] = useState<AuthSession | null>(null);

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
    urlSearchParams = prepareURLParams(urlSearchParams, 'exclusiveStartKey', exclusiveStartKey?.id);
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const res = await fetch(
        `https://api.raffle-hub.net/raffle/owned?${urlSearchParams.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.tokens?.idToken}`,
          },
          credentials: 'same-origin',
          cache: 'no-store',
        },
      );
      const { raffles, lastEvaluatedKey }: RafflesPaginationResult = await res.json();
      if (raffles.length) {
        setExclusiveStartKey(lastEvaluatedKey);
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
    fetchRaffles(exclusiveStartKey);
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

  const retrieveAndSetSession = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const session = await fetchAuthSession();
      setSession(session);
    } catch (err) {
      toast.error('No se pudo obtener la sesión del usuario', {
        position: 'top-center',
        theme: 'colored',
      });
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  useEffect(() => {
    setPaginationHistory([rafflesPaginated.lastEvaluatedKey]);
  }, [rafflesPaginated.lastEvaluatedKey]);

  useEffect(() => {
    retrieveAndSetSession();
  }, []);

  return (
    <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
      <h1 className="width margin-bottom text-4xl md:text-5xl">Administración</h1>
      {raffles.map((raffle) => {
        return <RaffleAdminCard key={raffle.id} raffle={raffle} />;
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
          disabled={exclusiveStartKey === null}
          onClick={fetchNextPageRaffles}
          title="Next page"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </Authenticator>
  );
}
