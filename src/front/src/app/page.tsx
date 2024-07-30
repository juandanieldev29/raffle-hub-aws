import { headers } from 'next/headers';

import RaffleList from '@/components/pages/raffle';
import { INITIAL_PAGE, INITIAL_PAGE_SIZE } from '@/utils/constants';

export default async function Home() {
  const res = await fetch(
    `https://api.raffle-hub.net/raffle?page=${INITIAL_PAGE}&pageSize=${INITIAL_PAGE_SIZE}`,
    {
      headers: headers(),
      cache: 'no-store',
    },
  );
  const rafflesPaginated = await res.json();

  return (
    <main className="mt-8 text-slate-700 dark:text-slate-200">
      <RaffleList
        rafflesPaginated={{
          raffles: rafflesPaginated,
          metadata: { count: rafflesPaginated.length },
        }}
      />
    </main>
  );
}
