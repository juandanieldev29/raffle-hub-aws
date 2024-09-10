import { cookies } from 'next/headers';
import { fetchAuthSession } from 'aws-amplify/auth/server';

import RaffleOwned from '@/components/pages/raffle/owned';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import { INITIAL_LIMIT } from '@/utils/constants';
import { AdminRafflesPaginationResult } from '@/types/pagination';

export default async function OwnedRaffle() {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });

  let rafflesPaginated: AdminRafflesPaginationResult = {
    raffles: [],
    lastEvaluatedKey: null,
  };

  if (session.tokens?.idToken) {
    const res = await fetch(`https://api.raffle-hub.net/raffle/owned?limit=${INITIAL_LIMIT}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.tokens.idToken}`,
      },
      cache: 'no-store',
    });
    rafflesPaginated = await res.json();
  }

  return (
    <main className="margin-top margin-bottom">
      <RaffleOwned rafflesPaginated={rafflesPaginated} />
    </main>
  );
}
