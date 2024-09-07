import { headers } from 'next/headers';

import RaffleList from '@/components/pages/raffle';
import { INITIAL_LIMIT } from '@/utils/constants';
import { RafflesPaginationResult } from '@/types/pagination';

export default async function Home() {
  try {
    const res = await fetch(`https://api.raffle-hub.net/raffle?limit=${INITIAL_LIMIT}`, {
      headers: headers(),
      cache: 'no-store',
    });
    const rafflesPaginated: RafflesPaginationResult = await res.json();

    return (
      <main className="margin-top margin-bottom">
        <RaffleList rafflesPaginated={rafflesPaginated} />
      </main>
    );
  } catch (err: any) {
    <p>An error happened {err.message}</p>;
  }
}
